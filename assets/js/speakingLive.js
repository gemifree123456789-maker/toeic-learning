// Live speaking session over Gemini API (Refactored to Pure TEXT WebSockets + Client TTS)

import { GoogleGenAI, Modality } from 'https://esm.run/@google/genai';
import { LIVE_AUDIO_MODEL, state } from './state.js';
import { t } from './i18n.js';
import { playTextWithTTS, stopAudio } from './audioPlayer.js';

const INPUT_MIME = 'audio/pcm;rate=16000';
const MEDIA_RESOLUTION_LOW = 'MEDIA_RESOLUTION_LOW';

let liveSession = null;
let mediaStream = null;
let audioCtx = null;
let sourceNode = null;
let workletNode = null;
let scriptNode = null;
let silentGainNode = null;
let destroyed = false;

// 累積當前 AI 說話的文字，用於說完後一次性集體發音
let aiResponseTextAccumulator = ""; 

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
            policy: 'Use mostly CEFR A1-A2 level English. Keep responses under 2 sentences.'
        };
    }
    if (resolvedLevel === 'advanced') {
        return {
            labelKey: 'speakingLevelAdvanced',
            promptLevel: 'advanced',
            policy: 'Use CEFR B2-C1 level business English. Challenge the user with realistic follow-up questions.'
        };
    }
    return {
        labelKey: 'speakingLevelIntermediate',
        promptLevel: 'intermediate',
        policy: 'Use standard TOEIC business English (CEFR B1). Keep answers concise and strictly interactive.'
    };
}

function emitStatus(status) {
    state.speakingState.isConnected = (status === 'connected');
    if (listeners.status) listeners.status(status);
    document.dispatchEvent(new CustomEvent('speaking-status-changed', { detail: status }));
}

function emitLog(type, message) {
    if (listeners.log) listeners.log({ type, message, timestamp: new Date() });
}

async function connectLive(topic, score, level) {
    if (!state.apiKey) throw new Error(t('alertConfigKeyFirst'));
    emitStatus('connecting');
    emitLog('system', '正在初始化與 Gemini 伺服器的免費安全連線...');

    const ai = new GoogleGenAI({ apiKey: state.apiKey });
    const lvlConfig = getSpeakingLevelConfig(level, score);

    const systemInstruction = `You are an oral examiner for the TOEIC Speaking Test. 
    The conversation topic is: "${topic}".
    Target Student Level: ${lvlConfig.promptLevel}.
    Roleplay Guidelines:
    - ${lvlConfig.policy}
    - Act naturally, ask relevant business or workplace questions.
    - Respond strictly in text formats.`;

    try {
        liveSession = await ai.clients.createWebSocketSession({
            model: LIVE_AUDIO_MODEL,
            config: {
                generationConfig: {
                    // 強制設定為純文字模式，終結即時音訊串流的高昂收費
                    responseModalities: [Modality.TEXT] 
                },
                systemInstruction: {
                    parts: [{ text: systemInstruction }]
                }
            }
        });

        state.speakingState.isConnected = true;
        emitStatus('connected');
        if (listeners.connected) listeners.connected();

        // 監聽伺服器傳回的訊息
        liveSession.on('message', async (message) => {
            if (destroyed) return;
            
            // 處理 AI 回傳的文字片段 (Server Content Delta)
            if (message.serverContent?.modelTurn?.parts) {
                for (const part of message.serverContent.modelTurn.parts) {
                    if (part.text) {
                        state.speakingState.isResponding = true;
                        aiResponseTextAccumulator += part.text;
                        // 即時將打字機文字丟給外部日誌或畫面渲染
                        emitLog('ai-delta', part.text); 
                    }
                }
            }

            // 當 AI 當前這一句話完全講完時 (turnComplete === true)
            if (message.serverContent?.turnComplete) {
                state.speakingState.isResponding = false;
                const completeSentence = aiResponseTextAccumulator.trim();
                aiResponseTextAccumulator = ""; // 清空累加器

                if (completeSentence) {
                    emitLog('ai', completeSentence); // 渲染完整對話對話框
                    
                    // 暫停麥克風資料傳送，避免音響播出來的發音被自己的麥克風回授錄進去
                    toggleMicTransmission(false);

                    // 呼叫全新的免費 Web Speech 朗讀引擎播放 AI 的話
                    playTextWithTTS(completeSentence, 'en-US', () => {
                        // 語音播放完畢後，重新解鎖麥克風接收，等待使用者回答
                        toggleMicTransmission(true);
                        emitLog('system', 'AI 發音完畢，請開始回答...');
                    });
                }
            }
        });

        liveSession.on('close', (event) => {
            console.log('WebSocket 斷開:', event);
            emitStatus('disconnected');
        });

        liveSession.on('error', (error) => {
            console.error('WebSocket 錯誤:', error);
            emitLog('error', '連線異常，請重試');
        });

    } catch (err) {
        emitStatus('disconnected');
        throw err;
    }
}

// 用於控制音訊串流是否往伺服器送
let isMicTransmitting = true;
function toggleMicTransmission(active) {
    isMicTransmitting = active;
}

async function setupMicStream() {
    try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
            audio: {
                channelCount: 1,
                sampleRate: 16000,
                echoCancellation: true,
                noiseSuppression: true
            }
        });

        audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
        sourceNode = audioCtx.createMediaStreamSource(mediaStream);

        // 建立錄音處理節點
        scriptNode = audioCtx.createScriptProcessor(2048, 1, 1);
        scriptNode.onaudioprocess = (e) => {
            if (destroyed || !liveSession || !isMicTransmitting) return;

            const inputData = e.inputBuffer.getChannelData(0);
            // 將 Float32 轉為 16-bit PCM (Gemini 要求格式)
            const pcmBuffer = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
                pcmBuffer[i] = Math.min(1, Math.max(-1, inputData[i])) * 0x7FFF;
            }

            // 透過 WebSocket 將使用者聲音直接送出
            const base64Audio = btoa(String.fromCharCode(...new Uint8Array(pcmBuffer.buffer)));
            liveSession.send({
                realtimeInput: {
                    mediaChunks: [{
                        mimeType: INPUT_MIME,
                        data: base64Audio
                    }]
                }
            });
        };

        sourceNode.connect(scriptNode);
        // 必須引流至 destination 否則部分瀏覽器會將 scriptNode 自動休眠
        silentGainNode = audioCtx.createGain();
        silentGainNode.gain.value = 0;
        scriptNode.connect(silentGainNode);
        silentGainNode.connect(audioCtx.destination);

        isMicTransmitting = true;

    } catch (err) {
        console.error('麥克風存取失敗:', err);
        emitLog('error', '無法啟動麥克風，請檢查權限設定。');
        throw err;
    }
}

export async function startSpeakingSession(topic, score, level, callbacks = {}) {
    if (!state.apiKey) throw new Error(t('alertConfigKeyFirst'));
    if (!topic) throw new Error(t('alertSelectTopicFirst'));
    if (liveSession || mediaStream) await stopSpeakingSession();

    listeners.status = callbacks.onStatus || null;
    listeners.log = callbacks.onLog || null;
    listeners.connected = callbacks.onConnected || null;
    destroyed = false;
    state.speakingState.finalTopic = topic;
    state.speakingState.isResponding = false;
    aiResponseTextAccumulator = "";

    await connectLive(topic, score, level);
    await setupMicStream();
    emitLog('system', t('speakingSessionStarted'));
}

export async function stopSpeakingSession() {
    destroyed = true;
    stopAudio(); // 確保停止當前的 TTS 朗讀
    
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
        try { await audioCtx.close(); } catch(e){}
        audioCtx = null;
    }
    if (mediaStream) {
        mediaStream.getTracks().forEach(t => t.stop());
        mediaStream = null;
    }
    if (liveSession) {
        try { liveSession.close(); } catch(e){}
        liveSession = null;
    }
    state.speakingState.isConnected = false;
    state.speakingState.isResponding = false;
    aiResponseTextAccumulator = "";
    emitStatus('disconnected');
}