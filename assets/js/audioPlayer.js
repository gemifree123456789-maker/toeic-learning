// Audio player bar: Refactored to Web Speech API (FREE Tier) with iOS support.

import { state, ICONS } from './state.js';

const playerBar = document.getElementById('playerBar');
const playBtn = document.getElementById('btnPlayPause');
const progressBar = document.getElementById('progressBar');
const progressContainer = document.getElementById('progressContainer');
const btnSpeed = document.getElementById('btnSpeed');

// 支援的語速設定
const speeds = [1.0, 0.75, 0.5, 1.25];
let speedIndex = 0;
let currentUtterance = null;
let textToSpeak = "";
let isSpeakingActive = false;

export function setPlayerLoading(isLoading) {
    if (!playBtn || !btnSpeed) return;
    playBtn.disabled = isLoading;
    btnSpeed.disabled = isLoading;
    if (progressContainer) progressContainer.style.pointerEvents = isLoading ? 'none' : 'auto';
    if (isLoading) {
        playBtn.innerHTML = ICONS.play;
        btnSpeed.innerText = '載入中';
    } else {
        btnSpeed.innerText = state.playbackSpeed === 1.0 ? '1.0x' : state.playbackSpeed + 'x';
    }
    document.dispatchEvent(new CustomEvent('player-loading-changed'));
}

// 核心整合接口：用來播放純文字並進行多國語音合成
export function playTextWithTTS(text, langCode = 'en-US', onEndCallback = null) {
    if (!('speechSynthesis' in window)) {
        console.error("當前瀏覽器不支持 Web Speech 語音合成。");
        if (onEndCallback) onEndCallback();
        return;
    }

    // 停止當前所有語音
    window.speechSynthesis.cancel();
    textToSpeak = text;
    isSpeakingActive = true;

    if (playBtn) playBtn.innerHTML = ICONS.pause;
    if (playerBar) playerBar.classList.add('visible');

    currentUtterance = new SpeechSynthesisUtterance(text);
    currentUtterance.lang = langCode;
    currentUtterance.rate = state.playbackSpeed || 1.0;
    currentUtterance.pitch = 1.0;

    // 模擬進度條（因原生 TTS 無即時百分比，此處做簡單平滑模擬）
    if (progressBar) progressBar.style.width = '0%';
    let startSim = Date.now();
    // 預估說完所需時間 (一般一分鐘 150 字)
    let estimatedDuration = (text.split(' ').length / 150) * 60 * 1000 / currentUtterance.rate;
    if (estimatedDuration < 2000) estimatedDuration = 2000;

    const progressInterval = setInterval(() => {
        if (!isSpeakingActive) {
            clearInterval(progressInterval);
            return;
        }
        let elapsed = Date.now() - startSim;
        let pct = Math.min((elapsed / estimatedDuration) * 100, 95); // 最高卡在 95% 等待真正結束
        if (progressBar) progressBar.style.width = `${pct}%`;
    }, 100);

    currentUtterance.onend = () => {
        isSpeakingActive = false;
        clearInterval(progressInterval);
        if (progressBar) progressBar.style.width = '100%';
        if (playBtn) playBtn.innerHTML = ICONS.play;
        setTimeout(() => { if (progressBar) progressBar.style.width = '0%'; }, 500);
        if (onEndCallback) onEndCallback();
    };

    currentUtterance.onerror = (e) => {
        isSpeakingActive = false;
        clearInterval(progressInterval);
        if (playBtn) playBtn.innerHTML = ICONS.play;
        console.error("TTS 發音失敗:", e);
        if (onEndCallback) onEndCallback();
    };

    window.speechSynthesis.speak(currentUtterance);
}

// 停止播放
export function stopAudio() {
    isSpeakingActive = false;
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
    if (playBtn) playBtn.innerHTML = ICONS.play;
    if (progressBar) progressBar.style.width = '0%';
}

// iOS/iPad 設備專用：點擊預熱解鎖防靜音機制
export function unlockAudioOnIOS() {
    if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance('');
        window.speechSynthesis.speak(u);
        console.log("iOS 瀏覽器音訊環境激活完畢");
    }
}

// 監聽控制列按鈕事件
if (playBtn) {
    playBtn.onclick = () => {
        if (isSpeakingActive) {
            // 原生 TTS 暫停
            window.speechSynthesis.pause();
            isSpeakingActive = false;
            playBtn.innerHTML = ICONS.play;
        } else if (textToSpeak) {
            if (window.speechSynthesis.paused) {
                window.speechSynthesis.resume();
                isSpeakingActive = true;
                playBtn.innerHTML = ICONS.pause;
            } else {
                // 重新發聲
                const lang = state.speakingState?.finalTopic ? 'en-US' : 'zh-TW';
                playTextWithTTS(textToSpeak, lang);
            }
        }
    };
}

if (btnSpeed) {
    btnSpeed.onclick = () => {
        speedIndex = (speedIndex + 1) % speeds.length;
        state.playbackSpeed = speeds[speedIndex];
        btnSpeed.innerText = state.playbackSpeed + 'x';
        
        // 如果正在播放，即時套用語速變更
        if (isSpeakingActive && textToSpeak) {
            const lang = state.speakingState?.finalTopic ? 'en-US' : 'zh-TW';
            playTextWithTTS(textToSpeak, lang);
        }
    };
}

// 保留空函數以避免其他引用檔案 (如段落點擊功能) 拋出未定義錯誤
export function playSegment(index) { console.log("段落跳轉播放:", index); }
export function updateActiveSegment(pct) {}