import { state } from './state.js';

// 🌟 1. 獨立的錯題本資料庫 (MistakesDB)
export const MistakesDB = {
    async open() {
        return new Promise((resolve, reject) => {
            const req = indexedDB.open('ToeicMistakesDB', 1);
            req.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('mistakes')) {
                    db.createObjectStore('mistakes', { keyPath: 'id' });
                }
            };
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    },
    async save(question) {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('mistakes', 'readwrite');
            tx.objectStore('mistakes').put(question);
            tx.oncomplete = () => resolve(true);
            tx.onerror = () => reject(tx.error);
        });
    }
};

const stState = { active: false, questions: [], currentQ: 0, answered: false };

// 🌟 2. 介面切換邏輯 (配合原生 CSS 框架)
document.addEventListener('DOMContentLoaded', () => {
    const tabSpecial = document.getElementById('tabSpecial');
    const practicePanels = document.querySelectorAll('.practice-mode-panel');
    const practiceModeBtns = document.querySelectorAll('.practice-mode-btn');
    
    const specialConfigArea = document.getElementById('practicePanelSpecial');
    const btnStartSpecial = document.getElementById('btnStartSpecial');
    const btnCloseSpecial = document.getElementById('btnCloseSpecial');

    // 攔截原生切換邏輯
    if (tabSpecial) {
        tabSpecial.addEventListener('click', (e) => {
            // 清除其他按鈕 active 狀態
            practiceModeBtns.forEach(btn => btn.classList.remove('active'));
            tabSpecial.classList.add('active');
            
            // 隱藏所有面板，只顯示 special 面板
            practicePanels.forEach(panel => panel.classList.add('hidden'));
            if(specialConfigArea) specialConfigArea.classList.remove('hidden');
        });
    }

    if (btnStartSpecial) {
        btnStartSpecial.addEventListener('click', async () => {
            const checkedBoxes = Array.from(specialConfigArea.querySelectorAll('input[type="checkbox"]:checked'));
            if (checkedBoxes.length === 0) return alert('請至少選擇一個文法主題！');
            const topics = checkedBoxes.map(cb => cb.value);

            btnStartSpecial.disabled = true;
            btnStartSpecial.innerHTML = '✨ 題目即時生成中 (約 5-10 秒)...';

            try {
                await startTraining(topics);
            } catch (e) {
                alert('生成失敗，請重試：' + e.message);
            } finally {
                btnStartSpecial.disabled = false;
                btnStartSpecial.innerHTML = '🚀 開始 10 題專項特訓';
            }
        });
    }

    if (btnCloseSpecial) {
        btnCloseSpecial.addEventListener('click', () => {
            if (confirm('確定要退出特訓嗎？目前進度將不會保存。')) {
                document.getElementById('specialQuizOverlay').classList.add('hidden');
            }
        });
    }
});

// 🌟 3. 呼叫 Gemini 即時出題引擎 (抓真兇專用版：鎖定單一模型顯現真實錯誤)
async function startTraining(topics) {
    if (!state.apiKey) throw new Error('請先設定 API Key');

    const prompt = `你是一位專業的 TOEIC 滿分出題老師。
請根據以下文法主題：【${topics.join('、')}】，出 10 題高質量的 TOEIC 單選題。考點必須在這些主題中隨機混搭。

請務必以「純 JSON 陣列」格式回傳，絕對不要有 markdown 標記 (如 \`\`\`json)，也不要有任何問候語或額外文字。
格式必須完全符合以下結構：
[
  {
    "id": "q_12345",
    "topic": "該題的文法主題",
    "en": "完整的英文題目，空格請用 ___ 表示",
    "zh": "題目的完整中文翻譯",
    "options": [
      {"en": "選項A的英文", "zh": "選項A的中文", "isCorrect": true},
      {"en": "選項B", "zh": "選項B的中文", "isCorrect": false},
      {"en": "選項C", "zh": "選項C的中文", "isCorrect": false},
      {"en": "選項D", "zh": "選項D的中文", "isCorrect": false}
    ],
    "explanation": "詳細的中文解析，說明為什麼選這個答案，以及其他選項錯在哪裡。"
  }
]
注意：必須剛好 10 題，每個題目 4 個選項，且只有 1 個 isCorrect 是 true。`;

    // 🌟 核心修改：只鎖定這顆官方目前最主力推薦的 Flash 模型
    const model = 'gemini-1.5-flash';
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${state.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7 }
        })
    });

    const data = await response.json();

    // 💡 如果被拒絕，直接把 Google 伺服器的「真實客製化錯誤訊息」印在畫面上
    if (!response.ok) {
        throw new Error(`[真兇抓到了] API 拒絕請求 (${model}): ${data.error?.message || '未知錯誤'}`);
    }

    if (!data.candidates || data.candidates.length === 0) {
        if (data.promptFeedback && data.promptFeedback.blockReason) {
            throw new Error(`被安全審查阻擋：${data.promptFeedback.blockReason}`);
        }
        throw new Error('API 成功連線，但回傳空白。');
    }

    let rawText = data.candidates[0].content.parts[0].text.trim();
    rawText = rawText.replace(/^```json/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();

    let questions;
    try {
        questions = JSON.parse(rawText);
    } catch (e) {
        console.error("AI 原始回傳內容導致解析失敗:", rawText);
        throw new Error('AI 回傳的題目格式有些微錯誤 (少括號等)，請再按一次開始按鈕！');
    }

    questions.forEach(q => q.id = 'sp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5));

    stState.questions = questions;
    stState.currentQ = 0;
    stState.active = true;

    document.getElementById('specialQuizOverlay').classList.remove('hidden');
    renderQuestion();
}

// 🌟 4. 高互動測驗渲染引擎 (套用原生 srs-option 樣式)
function renderQuestion() {
    const q = stState.questions[stState.currentQ];
    stState.answered = false;

    document.getElementById('specialProgressText').textContent = `${stState.currentQ + 1} / ${stState.questions.length}`;
    document.getElementById('specialTopicBadge').textContent = q.topic;

    const qArea = document.getElementById('specialQuestionArea');
    const oArea = document.getElementById('specialOptionsArea');

    qArea.innerHTML = `
        <div style="font-size: 18px; color: #1f2937; font-weight: 500; line-height: 1.6; margin-bottom: 12px;">
            ${q.en.replace('___', '<span style="display:inline-block; width: 60px; border-bottom: 2px solid #9ca3af; margin: 0 4px;"></span>')}
        </div>
        <div id="spQuestionZh" class="hidden" style="font-size: 14px; color: #6b7280; border-top: 1px dashed #e5e7eb; padding-top: 12px;">${q.zh}</div>
    `;
    oArea.innerHTML = '';

    const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);

    shuffledOptions.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'srs-option'; 
        btn.innerHTML = `<span style="font-size: 16px; display:block;">${opt.en}</span>`;
        
        btn.onclick = () => {
            if (stState.answered) return;
            handleAnswer(btn, opt.isCorrect, shuffledOptions, q);
        };
        oArea.appendChild(btn);
    });
}

function handleAnswer(selectedBtn, isCorrect, optionsData, questionObj) {
    stState.answered = true;
    const oArea = document.getElementById('specialOptionsArea');
    
    document.getElementById('spQuestionZh').classList.remove('hidden');

    Array.from(oArea.children).forEach((btn, index) => {
        const opt = optionsData[index];
        btn.classList.add('disabled');
        btn.style.pointerEvents = 'none'; 
        
        if (opt.isCorrect) {
            btn.classList.add('correct');
        } else if (btn === selectedBtn && !opt.isCorrect) {
            btn.classList.add('wrong');
        }
        btn.innerHTML += `<span style="font-size:13px; font-weight:normal; margin-top:4px; display:block; opacity:0.8;">— ${opt.zh}</span>`;
    });

    const explanationDiv = document.createElement('div');
    explanationDiv.style.cssText = 'margin-top: 16px; background: #eff6ff; padding: 16px; border-radius: 12px; border: 1px solid #bfdbfe;';
    explanationDiv.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
            <span style="font-weight: bold; color: #1e40af;">💡 深入解析</span>
            <button id="btnPinMistake" style="display: flex; items-center; gap: 4px; background: #fff; border: 1px solid #bfdbfe; padding: 4px 10px; border-radius: 8px; font-size: 13px; font-weight: bold; color: #4b5563; cursor: pointer; transition: all 0.2s;">
                <span style="opacity: 0.3; font-size:16px;" id="pinIcon">📌</span> <span id="pinText">收錄錯題</span>
            </button>
        </div>
        <div style="font-size: 14px; color: #1e3a8a; line-height: 1.6;">${questionObj.explanation}</div>
    `;
    oArea.appendChild(explanationDiv);

    const btnPinMistake = document.getElementById('btnPinMistake');
    let isPinned = false;
    btnPinMistake.onclick = async () => {
        isPinned = !isPinned;
        document.getElementById('pinIcon').style.opacity = isPinned ? '1' : '0.3';
        document.getElementById('pinText').textContent = isPinned ? '已收錄' : '收錄錯題';
        btnPinMistake.style.background = isPinned ? '#fef9c3' : '#fff';
        btnPinMistake.style.borderColor = isPinned ? '#fde047' : '#bfdbfe';
        btnPinMistake.style.color = isPinned ? '#854d0e' : '#4b5563';
        
        if (isPinned) {
            questionObj.savedAt = Date.now();
            await MistakesDB.save(questionObj);
        }
    };

    // 🚨 智慧防呆：答錯自動收錄
    if (!isCorrect) btnPinMistake.click(); 

    const nextBtn = document.createElement('button');
    nextBtn.className = 'srs-done-btn';
    nextBtn.style.marginTop = '24px';
    nextBtn.textContent = '下一題 ➔';
    nextBtn.onclick = () => {
        stState.currentQ++;
        if (stState.currentQ >= stState.questions.length) showResults();
        else renderQuestion();
    };
    oArea.appendChild(nextBtn);
}

function showResults() {
    const qArea = document.getElementById('specialQuestionArea');
    const oArea = document.getElementById('specialOptionsArea');
    
    document.getElementById('specialProgressText').textContent = '完成';
    document.getElementById('specialTopicBadge').textContent = '結算';

    qArea.innerHTML = `
        <div style="text-align: center; padding: 32px 0;">
            <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
            <h2 style="font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 8px;">特訓完成！</h2>
            <p style="color: #6b7280; line-height: 1.5;">所有的錯題與您手動 📌 釘選的題目，<br>都已安全收錄在您的專屬錯題本中。</p>
        </div>
    `;
    
    oArea.innerHTML = '';
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'srs-done-btn';
    closeBtn.textContent = '結束特訓，返回首頁';
    closeBtn.onclick = () => {
        document.getElementById('specialQuizOverlay').classList.add('hidden');
    };
    oArea.appendChild(closeBtn);
}