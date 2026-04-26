// assets/js/main.js
import { state, VOICE_NAMES } from './state.js';
import { DB } from './db.js';
import { fetchGeminiText } from './apiGemini.js';
import { renderContent } from './render.js';
import { applyTranslations, t } from './i18n.js';

/* 逐步拆解：初始化邏輯 */
async function initApp() {
    await DB.init();
    const key = await DB.getSetting('gemini_api_key');
    if (key) state.apiKey = key;
    applyTranslations();
    document.documentElement.classList.remove('app-booting');
}

/* 逐參數解釋：切換分頁 */
window.switchTab = function(tabName) {
    document.querySelectorAll('.container').forEach(c => c.classList.add('hidden'));
    document.getElementById('tab' + tabName.charAt(0).toUpperCase() + tabName.slice(1)).classList.remove('hidden');
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tabName));
};

/* 🌟 核心修正：文章生成事件監聽器 */
const btnGenerate = document.getElementById('btnGenerate');
if (btnGenerate) {
    btnGenerate.onclick = async () => {
        if (!state.apiKey) return alert("請先設定 API Key");
        btnGenerate.disabled = true;
        btnGenerate.innerText = "生成中...";
        try {
            const topic = document.getElementById('customTopic').value;
            const data = await fetchGeminiText(state.targetScore, topic);
            renderContent(data, 'Kore');
            switchTab('learn');
        } catch (e) {
            alert("生成失敗: " + e.message);
        } finally {
            btnGenerate.disabled = false;
            btnGenerate.innerText = "開始學習";
        }
    };
}

/* 🌟 核心修正：口說與考試按鈕對齊 */
const btnSpeaking = document.getElementById('btnStartSpeaking');
if (btnSpeaking) {
    btnSpeaking.onclick = () => {
        alert("口說模式啟動中...");
        // 此處對接 speakingLive.js 的 startSpeakingSession()
    };
}

const btnExam = document.getElementById('btnStartExam');
if (btnExam) {
    btnExam.onclick = () => {
        alert("考試模式啟動中...");
        // 此處對接 exam.js 的邏輯
    };
}

// 滑桿即時顯示數字
const slider = document.getElementById('aiDifficultySlider');
const valDisp = document.getElementById('difficultyValue');
if (slider && valDisp) {
    slider.oninput = (e) => {
        valDisp.textContent = e.target.value;
        state.targetScore = parseInt(e.target.value);
    };
}

initApp();