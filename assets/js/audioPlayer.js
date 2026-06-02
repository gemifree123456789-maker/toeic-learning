// Audio player bar: play/pause, speed control, progress, segment highlighting.

const audioEl = document.getElementById('mainAudio');
const playerBar = document.getElementById('playerBar');
const playBtn = document.getElementById('btnPlayPause');
const progressBar = document.getElementById('progressBar');
const progressContainer = document.getElementById('progressContainer');
const btnSpeed = document.getElementById('btnSpeed');

const speeds = [1.0, 0.75, 0.5, 0.25];
let speedIndex = 0;

function setPlayerLoading(isLoading) {
    playBtn.disabled = isLoading;
    btnSpeed.disabled = isLoading;
    progressContainer.style.pointerEvents = isLoading ? 'none' : 'auto';
    if (isLoading) {
        playBtn.innerHTML = window.ICONS.play; // 註解：改用全域 window.ICONS
        btnSpeed.innerText = '載入中';
    } else {
        btnSpeed.innerText = window.state.playbackSpeed === 1.0 ? '1.0x' : window.state.playbackSpeed + 'x';
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

function clearActiveSegmentState() {
    if (window.state.activeSegmentIndex >= 0 && window.state.segmentMetadata[window.state.activeSegmentIndex]) {
        window.state.segmentMetadata[window.state.activeSegmentIndex].element.classList.remove('active');
    }
    window.state.activeSegmentIndex = -1;
}

function playTextWithTTS(text, langCode = 'en-US', onEndCallback = null) {
    if (!('speechSynthesis' in window)) {
        if (onEndCallback) onEndCallback();
        return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    utterance.rate = window.state.playbackSpeed || 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => { if (onEndCallback) onEndCallback(); };
    utterance.onerror = () => { if (onEndCallback) onEndCallback(); };
    window.speechSynthesis.speak(utterance);
}

function stopAudio() {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
    if (audioEl) {
        audioEl.pause();
    }
    if (playBtn) playBtn.innerHTML = window.ICONS.play;
    if (progressBar) progressBar.style.width = '0%';
    window.state.playUntilPct = null;
    window.state.playUntilSegmentIndex = null;
}

function setupAudio(base64) {
    if (!base64) return;
    setPlayerLoading(true);
    clearPlayUntilState();
    clearActiveSegmentState();
    window.state.audioReady = false;
    audioEl.pause();
    progressBar.style.width = '0%';

    if (!base64.startsWith('UklGR') && base64.length < 1000) {
        setPlayerLoading(false);
        window.state.audioReady = true;
        playTextWithTTS(base64, 'en-US');
        return;
    }

    const bc = atob(base64), bn = new Array(bc.length);
    for (let i = 0; i < bc.length; i++) bn[i] = bc.charCodeAt(i);
    const wavBlob = pcmToWav(new Uint8Array(bn), 24000);
    if (window.state.audioBlobUrl) URL.revokeObjectURL(window.state.audioBlobUrl);
    window.state.audioBlobUrl = URL.createObjectURL(wavBlob);
    audioEl.src = window.state.audioBlobUrl;
    audioEl.playbackRate = window.state.playbackSpeed;

    const markAudioReady = () => {
        window.state.audioReady = true;
        setPlayerLoading(false);
    };

    if (audioEl.readyState >= 1 && audioEl.duration && !Number.isNaN(audioEl.duration)) {
        markAudioReady();
    } else {
        audioEl.addEventListener('loadedmetadata', markAudioReady, { once: true });
        audioEl.addEventListener('error', () => {
            window.state.audioReady = false;
            setPlayerLoading(false);
        }, { once: true });
    }
}

async function ensureAudioReady(timeoutMs = 8000) {
    if (window.state.audioReady && audioEl.duration && !Number.isNaN(audioEl.duration)) return true;
    return new Promise((resolve) => {
        let done = false;
        const finish = (ok) => {
            if (done) return;
            done = true;
            audioEl.removeEventListener('loadedmetadata', onReady);
            resolve(ok);
        };
        const onReady = () => {
            window.state.audioReady = true;
            finish(!!audioEl.duration && !Number.isNaN(audioEl.duration));
        };
        audioEl.addEventListener('loadedmetadata', onReady, { once: true });
        setTimeout(() => {
            finish(window.state.audioReady && !!audioEl.duration && !Number.isNaN(audioEl.duration));
        }, timeoutMs);
    });
}

/* Event bindings */
btnSpeed.onclick = () => {
    speedIndex = (speedIndex + 1) % speeds.length;
    const s = speeds[speedIndex];
    window.state.playbackSpeed = s;
    audioEl.playbackRate = s;
    btnSpeed.innerText = s === 1.0 ? '1.0x' : s + 'x';
};

playBtn.onclick = () => {
    window.state.playUntilPct = null;
    window.state.playUntilSegmentIndex = null;
    if (audioEl.paused) { audioEl.play(); playBtn.innerHTML = window.ICONS.pause; }
    else { audioEl.pause(); playBtn.innerHTML = window.ICONS.play; }
};

function clearPlayUntilState() {
    window.state.playUntilPct = null;
    window.state.playUntilSegmentIndex = null;
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

window.state.activeSegmentIndex = -1;

function updateActiveSegment(p) {
    if (!window.state.segmentMetadata || window.state.segmentMetadata.length === 0) return;

    if (window.state.playUntilPct !== null && p >= window.state.playUntilPct) {
        const d = audioEl.duration;
        if (d && !Number.isNaN(d)) {
            const safeTime = Math.max(0, (window.state.playUntilPct * d) - 0.01);
            audioEl.currentTime = safeTime;
        }
        audioEl.pause();
        playBtn.innerHTML = window.ICONS.play;
        if (window.state.playUntilSegmentIndex !== null && window.state.playUntilSegmentIndex >= 0 && window.state.segmentMetadata[window.state.playUntilSegmentIndex]) {
            if (window.state.activeSegmentIndex >= 0 && window.state.activeSegmentIndex !== window.state.playUntilSegmentIndex && window.state.segmentMetadata[window.state.activeSegmentIndex]) {
                window.state.segmentMetadata[window.state.activeSegmentIndex].element.classList.remove('active');
            }
            window.state.segmentMetadata[window.state.playUntilSegmentIndex].element.classList.add('active');
            window.state.activeSegmentIndex = window.state.playUntilSegmentIndex;
        }
        window.state.playUntilPct = null;
        window.state.playUntilSegmentIndex = null;
        return;
    }

    let idx = -1;
    for (let i = 0; i < window.state.segmentMetadata.length; i++) {
        const s = window.state.segmentMetadata[i];
        if (p >= s.startPct && p < s.endPct) { idx = i; break; }
    }
    if (idx !== window.state.activeSegmentIndex) {
        if (window.state.activeSegmentIndex >= 0 && window.state.segmentMetadata[window.state.activeSegmentIndex])
            window.state.segmentMetadata[window.state.activeSegmentIndex].element.classList.remove('active');
        if (idx >= 0 && window.state.segmentMetadata[idx])
            window.state.segmentMetadata[idx].element.classList.add('active');
        window.state.activeSegmentIndex = idx;
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
    playBtn.innerHTML = window.ICONS.play;
    progressBar.style.width = '0%';
    window.state.playUntilPct = null;
    window.state.playUntilSegmentIndex = null;
    if (window.state.activeSegmentIndex >= 0 && window.state.segmentMetadata[window.state.activeSegmentIndex])
        window.state.segmentMetadata[window.state.activeSegmentIndex].element.classList.remove('active');
    window.state.activeSegmentIndex = -1;
};

// 🌟 全域無縫掛載宣告
window.setupAudio = setupAudio;
window.ensureAudioReady = ensureAudioReady;
window.playTextWithTTS = playTextWithTTS;
window.stopAudio = stopAudio;
window.updateActiveSegment = updateActiveSegment;
window.clearActiveSegmentState = clearActiveSegmentState;
window.audioEl = audioEl;
window.playBtn = playBtn;