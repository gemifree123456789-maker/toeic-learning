// Generic utility functions: array helpers, text-to-speech wrappers.

export function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export function toLowerWord(word) {
    return String(word || '').trim().toLowerCase();
}

function getRandomToeicVoice() {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;
    
    const jokeVoices = ['albert', 'bad news', 'bahh', 'bells', 'boing', 'bubbles', 'cellos', 'deranged', 'good news', 'hysterical', 'junior', 'pipe organ', 'princess', 'trinoids', 'whisper', 'zarvox', 'fred', 'ralph', 'superstar', 'jester', 'organ', 'kathy', 'novelty'];
    
    const englishVoices = voices.filter(v => {
        if (!v.lang.startsWith('en')) return false;
        const nameLower = String(v.name).toLowerCase();
        const uriLower = String(v.voiceURI || '').toLowerCase();
        return !jokeVoices.some(joke => nameLower.includes(joke) || uriLower.includes(joke));
    });
    
    if (englishVoices.length > 0) {
        return englishVoices[Math.floor(Math.random() * englishVoices.length)];
    }
    return null;
}

// 確保全域共用的發音函數使用免費的 TTS
export function speakText(text, lang = 'en-US') {
    if (!text || !('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel();
    // 移除 HTML 標籤
    const cleanText = text.replace(/<[^>]*>?/gm, '');
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang;
    
    // 如果是英文，試著給一個好聽的口音
    if (lang.startsWith('en')) {
        const voice = getRandomToeicVoice();
        if (voice) utterance.voice = voice;
    }
    
    // 語速稍微放慢適合學習
    utterance.rate = 0.9;
    
    window.speechSynthesis.speak(utterance);
}