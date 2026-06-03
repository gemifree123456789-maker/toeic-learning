// Audio player bar: play/pause, speed control, progress, segment highlighting.

import { state, ICONS } from './state.js';

const audioEl = document.getElementById('mainAudio');
const playerBar = document.getElementById('playerBar');
const playBtn = document.getElementById('btnPlayPause');
const progressBar = document.getElementById('progressBar');
const progressContainer = document.getElementById('progressContainer');
const btnSpeed = document.getElementById('btnSpeed');

const speeds = [1.0, 0.75, 0.5, 0.25];
let speedIndex = 0;

export { audioEl, playBtn };

export function setPlayerLoading(isLoading) {
    playBtn.disabled = isLoading;
    btnSpeed.disabled = isLoading;
    progressContainer.style.pointerEvents = isLoading ? 'none' : 'auto';
    if (isLoading) {
        playBtn.innerHTML = ICONS.play;
        btnSpeed.innerText = '載入中';
    } else {
        btnSpeed.innerText = state.playbackSpeed === 1.0 ? '1.0x' : state.playbackSpeed + 'x';
    }
    document.dispatchEvent(new CustomEvent('player-loading-changed'));
}

function writeString(v, o, s) {
    for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i));
}

function pcmToWav(pcm, sr) {
    const b = new ArrayBuffer(44 + pcm.length);
    const v = new DataView(b);
    writeString(v, 0, 'RIFF');
    v.setUint32(4, 36 + pcm.length, true);
    writeString(v, 8, 'WAVE');
    writeString(v, 12, 'fmt ');
    v.setUint32(16, 16, true);
    v.setUint16(20, 1, true);
    v.setUint16(22, 1, true);
    v.setUint32(24, sr, true);
    v.setUint32(28, sr * 2, true);
    v.setUint16(32, 2, true);
    v.setUint16(34, 16, true);
    writeString(v, 36, 'data');
    v.setUint32(40, pcm.length, true);
    new Uint8Array(b, 44).set(pcm);
    return new Blob([b], { type: 'audio/wav' });
}

export function clearActiveSegmentState() {
    if (state.activeSegmentIndex >= 0 && state.segmentMetadata[state.activeSegmentIndex]) {
        state.segmentMetadata[state.activeSegmentIndex].element.classList.remove('active');
    }
    state.activeSegmentIndex = -1;
}

// 本機免費 Web Speech 朗讀引擎
export function playTextWithTTS(text, langCode = 'en-US', onEndCallback = null) {
    if (!('speechSynthesis' in window)) {
        console.error("Browser does not support Speech Synthesis");
        if (onEndCallback) onEndCallback();
        return;
    }
    window.speechSynthesis.cancel();
    
    const cleanText = text.replace(/<[^>]*>?/gm, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = langCode;
    utterance.rate = state.playbackSpeed || 1.0;
    utterance.pitch = 1.0;
    
    utterance.onend = () => { if (onEndCallback) onEndCallback(); };
    utterance.onerror = (e) => { 
        console.error("TTS Error:", e);
        if (onEndCallback) onEndCallback(); 
    };
    
    window.speechSynthesis.speak(utterance);
}

// iOS 語音解鎖機制：必須在按鈕點擊事件的最開頭呼叫
export function unlockAudioOnIOS() {
    if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance('');
        window.speechSynthesis.speak(u);
    }
}

export function stopAudio() {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
    if (audioEl) audioEl.pause();
    if (playBtn) playBtn.innerHTML = ICONS.play;
    if (progressBar) progressBar.style.width = '0%';
    state.playUntilPct = null;
    state.playUntilSegmentIndex = null;
}

export function setupAudio(base64) {
    if (!base64) return;
    setPlayerLoading(true);
    clearPlayUntilState();
    clearActiveSegmentState();
    state.audioReady = false;
    audioEl.pause();
    progressBar.style.width = '0%';

    // 【終極防護】：改用字串長度精準判斷是否為純文字。
    // PCM 轉出來的 Base64 長度動輒數萬起跳，而英文句子不可能大於 15000 字元。
    // 這徹底解決了單字 (如 "apple") 被誤認為 Base64 導致 atob 崩潰的 Invalid string length 錯誤。
    const isText = base64.length < 15000;

    if (isText) {
        setPlayerLoading(false);
        state.audioReady = true;
        playTextWithTTS(base64, 'en-US');
        
        setTimeout(() => {
            const event = new Event('loadedmetadata');
            audioEl.dispatchEvent(event);
        }, 100);
        return;
    }

    try {
        const bc = atob(base64);
        const bn = new Array(bc.length);
        for (let i = 0; i < bc.length; i++) bn[i] = bc.charCodeAt(i);
        const wavBlob = pcmToWav(new Uint8Array(bn), 24000);
        if (state.audioBlobUrl) URL.revokeObjectURL(state.audioBlobUrl);
        state.audioBlobUrl = URL.createObjectURL(wavBlob);
        audioEl.src = state.audioBlobUrl;
        audioEl.playbackRate = state.playbackSpeed;

        const markAudioReady = () => {
            state.audioReady = true;
            setPlayerLoading(false);
        };

        if (audioEl.readyState >= 1 && audioEl.duration && !Number.isNaN(audioEl.duration)) {
            markAudioReady();
        } else {
            audioEl.addEventListener('loadedmetadata', markAudioReady, { once: true });
            audioEl.addEventListener('error', () => {
                state.audioReady = false;
                setPlayerLoading(false);
            }, { once: true });
        }
    } catch (e) {
        console.error("解碼 Base64 失敗，強制轉為文字朗讀:", e);
        setPlayerLoading(false);
        playTextWithTTS(base64, 'en-US');
    }
}

export async function ensureAudioReady(timeoutMs = 8000) {
    if (state.audioReady) return true;
    
    return new Promise((resolve) => {
        let done = false;
        const finish = (ok) => {
            if (done) return;
            done = true;
            audioEl.removeEventListener('loadedmetadata', onReady);
            resolve(ok);
        };
        const onReady = () => {
            state.audioReady = true;
            finish(!!audioEl.duration && !Number.isNaN(audioEl.duration));
        };
        audioEl.addEventListener('loadedmetadata', onReady, { once: true });
        setTimeout(() => {
            finish(state.audioReady && !!audioEl.duration && !Number.isNaN(audioEl.duration));
        }, timeoutMs);
    });
}

/* Event bindings */
btnSpeed.onclick = () => {
    speedIndex = (speedIndex + 1) % speeds.length;
    const s = speeds[speedIndex];
    state.playbackSpeed = s;
    audioEl.playbackRate = s;
    btnSpeed.innerText = s === 1.0 ? '1.0x' : s + 'x';
};

playBtn.onclick = () => {
    state.playUntilPct = null;
    state.playUntilSegmentIndex = null;
    
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
        if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
            playBtn.innerHTML = ICONS.pause;
        } else {
            window.speechSynthesis.pause();
            playBtn.innerHTML = ICONS.play;
        }
        return;
    }
    
    if (audioEl.paused) { 
        audioEl.play(); 
        playBtn.innerHTML = ICONS.pause; 
    } else { 
        audioEl.pause(); 
        playBtn.innerHTML = ICONS.play; 
    }
};

function clearPlayUntilState() {
    state.playUntilPct = null;
    state.playUntilSegmentIndex = null;
}

function seekFromClientX(clientX) {
    const d = audioEl.duration;
    if (!d || Number.isNaN(d)) return;
    const r = progressContainer.getBoundingClientRect();
    const raw = (clientX - r.left) / r.width;
    const p = Math.max(0, Math.min(1, raw));
    audioEl.currentTime = p * d;
}

let isDraggingProgress = false;
progressContainer.onpointerdown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    isDraggingProgress = true;
    progressContainer.classList.add('dragging');
    if (progressContainer.setPointerCapture) progressContainer.setPointerCapture(e.pointerId);
    clearPlayUntilState();
    seekFromClientX(e.clientX);
};

progressContainer.onpointermove = (e) => {
    if (!isDraggingProgress) return;
    e.preventDefault();
    seekFromClientX(e.clientX);
};

function endProgressDrag(e) {
    if (!isDraggingProgress) return;
    isDraggingProgress = false;
    progressContainer.classList.remove('dragging');
    if (e && progressContainer.releasePointerCapture) {
        try { progressContainer.releasePointerCapture(e.pointerId); } catch (_) {}
    }
    if (e) seekFromClientX(e.clientX);
}

progressContainer.onpointerup = endProgressDrag;
progressContainer.onpointercancel = endProgressDrag;

state.activeSegmentIndex = -1;

export function updateActiveSegment(p) {
    if (!state.segmentMetadata || state.segmentMetadata.length === 0) return;

    if (state.playUntilPct !== null && p >= state.playUntilPct) {
        const d = audioEl.duration;
        if (d && !Number.isNaN(d)) {
            const safeTime = Math.max(0, (state.playUntilPct * d) - 0.01);
            audioEl.currentTime = safeTime;
        }
        audioEl.pause();
        playBtn.innerHTML = ICONS.play;
        if (state.playUntilSegmentIndex !== null && state.playUntilSegmentIndex >= 0 && state.segmentMetadata[state.playUntilSegmentIndex]) {
            if (state.activeSegmentIndex >= 0 && state.activeSegmentIndex !== state.playUntilSegmentIndex && state.segmentMetadata[state.activeSegmentIndex]) {
                state.segmentMetadata[state.activeSegmentIndex].element.classList.remove('active');
            }
            state.segmentMetadata[state.playUntilSegmentIndex].element.classList.add('active');
            state.activeSegmentIndex = state.playUntilSegmentIndex;
        }
        state.playUntilPct = null;
        state.playUntilSegmentIndex = null;
        return;
    }

    let idx = -1;
    for (let i = 0; i < state.segmentMetadata.length; i++) {
        const s = state.segmentMetadata[i];
        if (p >= s.startPct && p < s.endPct) { idx = i; break; }
    }
    if (idx !== state.activeSegmentIndex) {
        if (state.activeSegmentIndex >= 0 && state.segmentMetadata[state.activeSegmentIndex])
            state.segmentMetadata[state.activeSegmentIndex].element.classList.remove('active');
        if (idx >= 0 && state.segmentMetadata[idx])
            state.segmentMetadata[idx].element.classList.add('active');
        state.activeSegmentIndex = idx;
    }
}

audioEl.ontimeupdate = () => {
    const d = audioEl.duration;
    if (!d || Number.isNaN(d)) return;
    const p = audioEl.currentTime / d;
    progressBar.style.width = `${p * 100}%`;
    updateActiveSegment(p);
};

audioEl.onended = () => {
    playBtn.innerHTML = ICONS.play;
    progressBar.style.width = '0%';
    state.playUntilPct = null;
    state.playUntilSegmentIndex = null;
    if (state.activeSegmentIndex >= 0 && state.segmentMetadata[state.activeSegmentIndex])
        state.segmentMetadata[state.activeSegmentIndex].element.classList.remove('active');
    state.activeSegmentIndex = -1;
};