// Live speaking session over Gemini native audio model (SDK mode).

import { GoogleGenAI, Modality } from 'https://esm.run/@google/genai';
import { LIVE_AUDIO_MODEL, state } from './state.js';
import { t } from './i18n.js';
import { playTextWithTTS, stopAudio } from './audioPlayer.js';

const INPUT_MIME = 'audio/pcm;rate=16000';
const MEDIA_RESOLUTION_LOW = 'MEDIA_RESOLUTION_LOW'; // ~66-70 tokens/image

let liveSession = null;
let mediaStream = null;
let audioCtx = null;
let sourceNode = null;
let workletNode = null;
let scriptNode = null;
let silentGainNode = null;
let outputCtx = null;
let nextPlayTime = 0;
let destroyed = false;
let isMicTransmissionAllowed = true; // 註解：控制發音期間是否將麥克風資料流送往伺服器

// 註解：用來累加伺服器打字機文字片段的全局快取字串
let accumulativeTextBuffer = "";

const listeners = {
    status: null,
    log: null,
    connected: null
};

const SPEAKING_LEVELS = ['beginner', 'intermediate', 'advanced'];

function getSpeakingLevelByScore(score) {
    const numericScore = Number(score) || 700;
    if (numericScore <= 600) return 'beginner';
    if (numericScore === 700) return 'intermediate';
    return 'advanced';
}

function getSpeakingLevelConfig(level, score) {
    const resolvedLevel = SPEAKING_LEVELS.includes(level) ? level : getSpeakingLevelByScore(score);
    if (resolvedLevel === 'beginner') {
        return {
            labelKey: 'speakingLevelBeginner',
            promptLevel: 'beginner',
            policy: 'Use mostly CEFR A1-A2 level English. Keep sentence length around 6-12 words. Prefer present tense and familiar daily vocabulary. Offer either-or choices when the learner hesitates.',
            domains: 'Use easy everyday and basic workplace contexts: daily routines, shopping, transportation, travel check-ins, simple scheduling, and short office requests.',
            opening: 'Start with a friendly greeting, add one short self-introduction, then ask one warm-up question that is easy to answer in one sentence.'
        };
    }
    if (resolvedLevel === 'intermediate') {
        return {
            labelKey: 'speakingLevelIntermediate',
            promptLevel: 'intermediate',
            policy: 'Use CEFR B1-B2 level English. Encourage reasons, comparisons, and short examples. Introduce one upgraded phrase every 2 turns and keep a natural pace.',
            domains: 'Focus on practical business communication: meetings, status updates, customer service replies, schedule changes, and team coordination.',
            opening: 'Start with a natural greeting, briefly set a business-like context, and ask one open warm-up question that invites a reason.'
        };
    }
    return {
        labelKey: 'speakingLevelAdvanced',
        promptLevel: 'advanced',
        policy: 'Use upper B2-C1 level English. Ask for precise wording, trade-off analysis, and persuasive framing. Challenge assumptions with realistic scenario pivots when appropriate.',
        domains: 'Allow broad advanced domains including academic topics, business strategy, negotiations, incident handling, specialist professional situations, and daily-life edge cases.',
        opening: 'Start with a polished greeting, establish a realistic scenario, and ask one thought-provoking question that requires explanation and judgment.'
    };
}

function emitStatus(text) {
    if (listeners.status) listeners.status(text);
}

function emitLog(role, text) {
    if (listeners.log) listeners.log(role, text);
}

function emitConnected(isConnected) {
    if (listeners.connected) listeners.connected(isConnected);
}

function toBase64FromInt16(samples) {
    const bytes = new Uint8Array(samples.buffer);
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, i + chunkSize);
        binary += String.fromCharCode(...chunk);
    }
    return btoa(binary);
}

function downsampleTo16k(float32Array, inputSampleRate) {
    if (inputSampleRate === 16000) return float32Array;
    const ratio = inputSampleRate / 16000;
    const newLength = Math.round(float32Array.length / ratio);
    const result = new Float32Array(newLength);
    let offsetResult = 0;
    let offsetBuffer = 0;
    while (offsetResult < result.length) {
        const nextOffsetBuffer = Math.round((offsetResult + 1) * ratio);
        let accum = 0;
        let count = 0;
        for (let i = offsetBuffer; i < nextOffsetBuffer && i < float32Array.length; i++) {
            accum += float32Array[i];
            count += 1;
        }
        result[offsetResult] = count ? accum / count : 0;
        offsetResult += 1;
        offsetBuffer = nextOffsetBuffer;
    }
    return result;
}

function floatToInt16(floatArray) {
    const out = new Int16Array(floatArray.length);
    for (let i = 0; i < floatArray.length; i++) {
        const s = Math.max(-1, Math.min(1, floatArray[i]));
        out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return out;
}

function decodeBase64Pcm16(base64) {
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
    return new Int16Array(bytes.buffer);
}

function playPcm16Chunk(base64Data, sampleRate = 24000) {
    if (!outputCtx) outputCtx = new AudioContext();
    const pcm16 = decodeBase64Pcm16(base64Data);
    const audioBuffer = outputCtx.createBuffer(1, pcm16.length, sampleRate);
    const channel = audioBuffer.getChannelData(0);
    for (let i = 0; i < pcm16.length; i++) channel[i] = pcm16[i] / 32768;
    const src = outputCtx.createBufferSource();
    src.buffer = audioBuffer;
    src.connect(outputCtx.destination);
    const now = outputCtx.currentTime;
    if (nextPlayTime < now) nextPlayTime = now;
    src.start(nextPlayTime);
    nextPlayTime += audioBuffer.duration;
}

async function connectLive(topic, score = 700, level = '') {
    emitStatus(t('speakingConnecting'));
    const ai = new GoogleGenAI({ apiKey: state.apiKey });
    const levelConfig = getSpeakingLevelConfig(level, score);
    const levelLabel = t(levelConfig.labelKey);
    const config = {
        // 核心改造點：變更 responseModalities 為 Modality.TEXT，全面終結音訊 Token 計費
        responseModalities: [Modality.TEXT],
        mediaResolution: MEDIA_RESOLUTION_LOW,
        systemInstruction: `You are a TOEIC live speaking coach in an interactive conversation.
Learner level: ${levelConfig.promptLevel}. Topic: "${topic}".

Conversation behavior:
- Keep each assistant turn natural and not overly short, usually 2-4 sentences.
- Ask exactly one follow-up question per turn.
- Sound like a real conversation partner, not a textbook.
- Every 3-4 learner turns, provide one brief improvement tip.
- If the learner makes a clear error, give one short inline correction, then continue naturally.
- Output strictly plain text formats. Never attempt to stream binary audio bytes.

Level policy:
${levelConfig.policy}

Domain scope:
${levelConfig.domains}`
    };

    liveSession = await ai.live.connect({
        model: LIVE_AUDIO_MODEL,
        config,
        callbacks: {
            onopen: () => {
                state.speakingState.isConnected = true;
                emitConnected(true);
                emitLog('system', t('speakingTopicLevelLog', { topic, level: levelLabel }));
                emitStatus(t('speakingConnectedPreparingMic'));
            },
            onmessage: (message) => {
                if (destroyed) return;
                if (message?.serverContent?.interrupted) {
                    nextPlayTime = outputCtx ? outputCtx.currentTime : 0;
                    // 註解：若使用者中斷 AI，同步停止前端語音合成器朗讀
                    stopAudio();
                }
                const parts = message?.serverContent?.modelTurn?.parts || [];
                
                // 註解：攔截打字機純文字流，將分散的字串流拼裝至全域快取緩衝器
                for (const part of parts) {
                    if (typeof part?.text === 'string' && part.text.trim()) {
                        state.speakingState.isResponding = true;
                        emitStatus(t('speakingAiResponding'));
                        accumulativeTextBuffer += part.text;
                    }
                }

                // 註解：當收悉 turnComplete 訊號，代表 AI 整句話完成，正式交付前端發音
                if (message?.serverContent?.turnComplete) {
                    state.speakingState.isResponding = false;
                    const finalPhraseText = accumulativeTextBuffer.trim();
                    accumulativeTextBuffer = ""; // 清空緩衝器

                    if (finalPhraseText) {
                        emitLog('ai', finalPhraseText); // 將完整文字渲染至對話框
                        
                        // 註解：暫停向 WebSockets 端點傳送麥克風音訊，防範音響發音回授
                        isMicTransmissionAllowed = false;

                        // 註解：調用完全免費的本地端發音引擎播放英文
                        playTextWithTTS(finalPhraseText, 'en-US', () => {
                            // 註解：發音完畢後，釋放麥克風，重新接受使用者口說回答
                            isMicTransmissionAllowed = true;
                            emitStatus(t('speakingWaitingUser'));
                        });
                    } else {
                        emitStatus(t('speakingWaitingUser'));
                    }
                }
            },
            onerror: (e) => {
                emitStatus(t('speakingConnectionError', { message: e?.message || 'unknown' }));
            },
            onclose: (e) => {
                state.speakingState.isConnected = false;
                state.speakingState.isRecording = false;
                emitConnected(false);
                emitStatus(t('speakingStoppedReason', { reason: e?.reason || 'closed' }));
            }
        }
    });

    emitStatus(t('speakingAiOpening'));
    state.speakingState.isResponding = true;
    liveSession.sendClientContent({
        turns: [{
            role: 'user',
            parts: [{
                text: `Start the conversation about "${topic}".
Learner level is ${levelConfig.promptLevel}.
${levelConfig.opening}
Keep your first response warm, useful, and specific instead of too brief.`
            }]
        }],
        turnComplete: true
    });
}

function sendRealtimePcm(floatChunk) {
    if (!liveSession || destroyed || !isMicTransmissionAllowed) return; // 註解：防回授期間直接阻斷數據傳輸
    const downsampled = downsampleTo16k(floatChunk, audioCtx.sampleRate);
    const pcm16 = floatToInt16(downsampled);
    liveSession.sendRealtimeInput({
        audio: {
            data: toBase64FromInt16(pcm16),
            mimeType: INPUT_MIME
        }
    });
}

async function setupMicWithWorklet() {
    await audioCtx.audioWorklet.addModule('./assets/js/mic-processor.js');
    sourceNode = audioCtx.createMediaStreamSource(mediaStream);
    workletNode = new AudioWorkletNode(audioCtx, 'mic-processor', {
        numberOfInputs: 1,
        numberOfOutputs: 1,
        channelCount: 1
    });
    silentGainNode = audioCtx.createGain();
    silentGainNode.gain.value = 0;
    workletNode.port.onmessage = (event) => {
        if (!event?.data) return;
        sendRealtimePcm(event.data);
    };
    sourceNode.connect(workletNode);
    workletNode.connect(silentGainNode);
    silentGainNode.connect(audioCtx.destination);
}

function setupMicWithScriptProcessorFallback() {
    sourceNode = audioCtx.createMediaStreamSource(mediaStream);
    scriptNode = audioCtx.createScriptProcessor(4096, 1, 1);
    scriptNode.onaudioprocess = (event) => {
        sendRealtimePcm(event.inputBuffer.getChannelData(0));
    };
    silentGainNode = audioCtx.createGain();
    silentGainNode.gain.value = 0;
    sourceNode.connect(scriptNode);
    scriptNode.connect(silentGainNode);
    silentGainNode.connect(audioCtx.destination);
}

async function setupMicStream() {
    mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
        }
    });
    audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') await audioCtx.resume();
    try {
        await setupMicWithWorklet();
        emitLog('system', t('speakingAudioWorkletEnabled'));
    } catch (error) {
        console.warn('AudioWorklet unavailable, fallback ScriptProcessorNode', error);
        setupMicWithScriptProcessorFallback();
        emitLog('system', t('speakingAudioWorkletFallback'));
    }
    state.speakingState.isRecording = true;
    emitStatus(t('speakingInProgress'));
}

export async function startSpeakingSession(input, callbacks = {}) {
    const topic = typeof input === 'string' ? input : String(input?.topic || '').trim();
    const score = typeof input === 'object' && input !== null ? Number(input.score) || 700 : 700;
    const level = typeof input === 'object' && input !== null ? String(input.level || '').trim() : '';
    if (!state.apiKey) throw new Error(t('alertSetApiKeyFirst'));
    if (!topic) throw new Error(t('alertSelectTopicFirst'));
    if (liveSession || mediaStream) await stopSpeakingSession();

    listeners.status = callbacks.onStatus || null;
    listeners.log = callbacks.onLog || null;
    listeners.connected = callbacks.onConnected || null;
    destroyed = false;
    state.speakingState.finalTopic = topic;
    state.speakingState.isResponding = false;
    isMicTransmissionAllowed = true; // 註解：初始化允許傳輸
    accumulativeTextBuffer = ""; // 初始化緩衝區

    await connectLive(topic, score, level);
    await setupMicStream();
    emitLog('system', t('speakingSessionStarted'));
}

export async function stopSpeakingSession() {
    destroyed = true;
    stopAudio(); // 註解：中斷口說會話時，同步將前端可能正在朗讀的 TTS 掐斷
    if (workletNode) {
        workletNode.port.onmessage = null;
        workletNode.disconnect();
        workletNode = null;
    }
    if (scriptNode) {
        scriptNode.disconnect();
        scriptNode.onaudioprocess = null;
        scriptNode = null;
    }
    if (sourceNode) {
        sourceNode.disconnect();
        sourceNode = null;
    }
    if (silentGainNode) {
        silentGainNode.disconnect();
        silentGainNode = null;
    }
    if (audioCtx) {
        await audioCtx.close();
        audioCtx = null;
    }
    if (mediaStream) {
        mediaStream.getTracks().forEach(t => t.stop());
        mediaStream = null;
    }
    if (liveSession) {
        liveSession.close();
        liveSession = null;
    }
    state.speakingState.isConnected = false;
    state.speakingState.isRecording = false;
    state.speakingState.isResponding = false;
    isMicTransmissionAllowed = true;
    accumulativeTextBuffer = "";
    emitConnected(false);
}