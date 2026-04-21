import { state } from './state.js';

let activeMistakeFilters = new Set();

// 🌟 將資料庫大腦統一集中在這裡，讓 driveSync 也能共用，徹底消除版本衝突！
export const MistakesDB = {
    async open() {
        return new Promise((resolve, reject) => {
            const req = indexedDB.open('ToeicMistakesDB', 1); // 保持你原本完美的版本 1
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
    },
    async getAll() {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('mistakes', 'readonly');
            const req = tx.objectStore('mistakes').getAll();
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    },
    async delete(id) {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('mistakes', 'readwrite');
            tx.objectStore('mistakes').delete(id);
            tx.oncomplete = () => resolve(true);
            tx.onerror = () => reject(tx.error);
        });
    },
    // 新增給雲端還原使用的清空功能
    async clearAll() {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('mistakes', 'readwrite');
            tx.objectStore('mistakes').clear();
            tx.oncomplete = () => resolve(true);
            tx.onerror = () => reject(tx.error);
        });
    }
};

const stState = { active: false, questions: [], currentQ: 0, answered: false };

function normalizeTopic(rawTopic) {
    if (!rawTopic) return '其他';
    const t = String(rawTopic).toLowerCase();
    
    if (t.includes('代名詞')) return '代名詞';
    if (t.includes('時態') || t.includes('現在') || t.includes('過去') || t.includes('未來') || t.includes('完成') || t.includes('進行')) return '時態';
    if (t.includes('詞性') || t.includes('名詞') || t.includes('動詞') || t.includes('形容詞') || t.includes('副詞')) return '詞性判斷';
    if (t.includes('介系詞') || t.includes('介詞')) return '介系詞';
    if (t.includes('單複數') || t.includes('可數')) return '單複數';
    if (t.includes('比較級') || t.includes('最高級')) return '比較級';
    if (t.includes('假設')) return '假設語氣';
    
    return rawTopic; 
}

function buildExplanationHtml(explanation) {
    if (typeof explanation === 'string') {
        return `<div style="font-size: 14px; color: #1e3a8a; line-height: 1.6;">${explanation}</div>`;
    }
    let html = `<div style="font-size: 14px; color: #1e3a8a; line-height: 1.6; margin-bottom: 8px;">${explanation.core || ''}</div>`;
    if (explanation.skills) {
        html += `<div style="margin-top: 10px; padding: 10px; background: #dcfce7; border-left: 4px solid #22c55e; border-radius: 4px 8px 8px 4px; font-size: 13.5px; color: #166534; box-shadow: 0 1px 2px rgba(0,0,0,0.02);"><strong style="font-size: 14px; display:block; margin-bottom:4px;">🎯 答題技巧：</strong>${explanation.skills}</div>`;
    }
    if (explanation.warnings) {
        html += `<div style="margin-top: 10px; padding: 10px; background: #fef9c3; border-left: 4px solid #eab308; border-radius: 4px 8px 8px 4px; font-size: 13.5px; color: #854d0e; box-shadow: 0 1px 2px rgba(0,0,0,0.02);"><strong style="font-size: 14px; display:block; margin-bottom:4px;">⚠️ 注意事項：</strong>${explanation.warnings}</div>`;
    }
    return html;
}

// 🌟 拔除 DOMContentLoaded 外殼，讓按鈕事件在載入時直接綁定，解決按了沒反應的問題！
const tabSpecial = document.getElementById('tabSpecial');
const practicePanels = document.querySelectorAll('.practice-mode-panel');
const practiceModeBtns = document.querySelectorAll('.practice-mode-btn');

const specialConfigArea = document.getElementById('practicePanelSpecial');
const btnStartSpecial = document.getElementById('btnStartSpecial');
const btnCloseSpecial = document.getElementById('btnCloseSpecial');

if (tabSpecial) {
    tabSpecial.addEventListener('click', (e) => {
        practiceModeBtns.forEach(btn => btn.classList.remove('active'));
        tabSpecial.classList.add('active');
        practicePanels.forEach(panel => panel.classList.add('hidden'));
        if(specialConfigArea) specialConfigArea.classList.remove('hidden');
    });
}

if (btnStartSpecial) {
    btnStartSpecial.addEventListener('click', async () => {
        const checkedBoxes = Array.from(specialConfigArea.querySelectorAll('input[type="checkbox"]:checked'));
        if (checkedBoxes.length === 0) return alert('請至少選擇一個文法主題！');
        const topics = checkedBoxes.map(cb => cb.value);

        const difficultySelect = document.getElementById('specialDifficultySelect');
        const difficulty = difficultySelect ? difficultySelect.value : '國中程度 (使用最簡單的單字)';

        btnStartSpecial.disabled = true;
        btnStartSpecial.innerHTML = '✨ 題目即時生成中 (約 5-10 秒)...';

        try {
            await startTraining(topics, difficulty);
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

const btnHistoryGeneral = document.querySelector('[data-history-subtab="general"]');
const btnHistoryMistakes = document.querySelector('[data-history-subtab="mistakes"]');
const panelHistoryGeneral = document.getElementById('historyMainPanel');
const panelHistoryMistakes = document.getElementById('historyMistakesPanel');
const tabHistoryBtn = document.querySelector('button[data-tab="history"]'); 

function switchHistorySubtab(tab) {
    if(tab === 'general') {
        btnHistoryGeneral.classList.add('active');
        btnHistoryMistakes.classList.remove('active');
        panelHistoryGeneral.classList.remove('hidden');
        panelHistoryMistakes.classList.add('hidden');
    } else {
        btnHistoryMistakes.classList.add('active');
        btnHistoryGeneral.classList.remove('active');
        panelHistoryMistakes.classList.remove('hidden');
        panelHistoryGeneral.classList.add('hidden');
        renderMistakesList(); 
    }
}

if (btnHistoryGeneral) btnHistoryGeneral.onclick = () => switchHistorySubtab('general');
if (btnHistoryMistakes) btnHistoryMistakes.onclick = () => switchHistorySubtab('mistakes');

if (tabHistoryBtn) {
    tabHistoryBtn.addEventListener('click', () => {
        if (panelHistoryMistakes && !panelHistoryMistakes.classList.contains('hidden')) {
            renderMistakesList();
        }
    });
}

const filterBtns = document.querySelectorAll('.mistake-filter-btn');
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const topic = btn.dataset.topic;
        if (topic === 'all') {
            activeMistakeFilters.clear();
        } else {
            if (activeMistakeFilters.has(topic)) activeMistakeFilters.delete(topic);
            else activeMistakeFilters.add(topic);
        }

        filterBtns.forEach(b => {
            const t = b.dataset.topic;
            const isActive = (t === 'all' && activeMistakeFilters.size === 0) || activeMistakeFilters.has(t);
            
            if (isActive) {
                b.style.background = '#e0e7ff'; b.style.borderColor = '#818cf8'; b.style.color = '#4338ca'; b.style.fontWeight = 'bold';
            } else {
                b.style.background = '#fff'; b.style.borderColor = '#e5e7eb'; b.style.color = '#4b5563'; b.style.fontWeight = '500';
            }
        });
        renderMistakesList();
    });
});

const btnPrintPDF = document.getElementById('btnPrintPDF');
if (btnPrintPDF) {
    btnPrintPDF.addEventListener('click', () => {
        document.body.classList.add('print-mistakes-mode');
        window.print();
        setTimeout(() => document.body.classList.remove('print-mistakes-mode'), 500);
    });
}

const btnPrintSecrets = document.getElementById('btnPrintSecrets');
if (btnPrintSecrets) {
    btnPrintSecrets.addEventListener('click', () => {
        document.body.classList.add('print-secrets-mode');
        window.print();
        setTimeout(() => document.body.classList.remove('print-secrets-mode'), 500);
    });
}

const btnGenerateSecrets = document.getElementById('btnGenerateSecrets');
const grammarSecretsModal = document.getElementById('grammarSecretsModal');
const btnCloseSecrets = document.getElementById('btnCloseSecrets');

if (btnGenerateSecrets) {
    btnGenerateSecrets.addEventListener('click', async () => {
        const allMistakes = await MistakesDB.getAll();
        if (allMistakes.length === 0) return alert('您的錯題本目前是空的，快去挑戰特訓收集文法精華吧！');

        const secretsByTopic = {};
        let hasNewFormat = false;

        allMistakes.forEach(q => {
            let exp = q.explanation;
            
            // 🌟 極限防呆：把雲端壓縮的字串解開
            if (typeof exp === 'string') {
                try { exp = JSON.parse(exp); } catch(err) {}
            }
            if (!exp || typeof exp !== 'object') return;
            
            hasNewFormat = true;
            const topic = normalizeTopic(q.topic);
            if (!secretsByTopic[topic]) secretsByTopic[topic] = { skills: new Set(), warnings: new Set() };
            
            // 🌟 極限防呆：防止 AI 吐出陣列導致 trim() 崩潰
            if (exp.skills) {
                const sStr = typeof exp.skills === 'string' ? exp.skills : JSON.stringify(exp.skills);
                if (sStr && sStr.trim() !== '[]' && sStr.trim() !== '{}') secretsByTopic[topic].skills.add(sStr.trim());
            }
            if (exp.warnings) {
                const wStr = typeof exp.warnings === 'string' ? exp.warnings : JSON.stringify(exp.warnings);
                if (wStr && wStr.trim() !== '[]' && wStr.trim() !== '{}') secretsByTopic[topic].warnings.add(wStr.trim());
            }
        });

        const contentEl = document.getElementById('grammarSecretsContent');
        contentEl.innerHTML = '';

        if (!hasNewFormat) {
            contentEl.innerHTML = '<div style="text-align: center; color: #6b7280; padding: 40px 20px;">目前錯題本中的題目皆為舊版解析格式。<br>請多做幾次新版特訓，系統就會自動為您整理出這份秘笈囉！</div>';
        } else {
            let addedAny = false;
            for (const [topic, data] of Object.entries(secretsByTopic)) {
                if (data.skills.size === 0 && data.warnings.size === 0) continue;
                addedAny = true;
                
                let topicHtml = `
                    <div style="margin-bottom: 24px; background: #fff; border: 2px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                        <div style="background: #eef2ff; color: #3730a3; padding: 12px 20px; font-weight: 800; font-size: 16px; border-bottom: 2px solid #c7d2fe; display: flex; align-items: center; gap: 8px;">
                            🏷️ ${topic}
                        </div>
                        <div style="padding: 20px;">
                `;

                if (data.skills.size > 0) {
                    topicHtml += `<div style="margin-bottom: 16px;"><h4 style="color: #166534; margin: 0 0 12px 0; font-size: 15px; display: flex; align-items: center; gap: 6px;"><span>🎯</span> 核心答題技巧</h4><ol style="margin: 0; padding-left: 24px; color: #15803d; font-size: 14.5px; line-height: 1.7; font-weight: 500; list-style-type: decimal;">`;
                    data.skills.forEach(skill => { topicHtml += `<li style="margin-bottom: 8px; padding-left: 4px;">${skill}</li>`; });
                    topicHtml += `</ol></div>`;
                }

                if (data.warnings.size > 0) {
                    topicHtml += `<div><h4 style="color: #854d0e; margin: 0 0 12px 0; font-size: 15px; display: flex; align-items: center; gap: 6px;"><span>⚠️</span> 易混淆陷阱與注意</h4><ol style="margin: 0; padding-left: 24px; color: #a16207; font-size: 14.5px; line-height: 1.7; font-weight: 500; list-style-type: decimal;">`;
                    data.warnings.forEach(warning => { topicHtml += `<li style="margin-bottom: 8px; padding-left: 4px;">${warning}</li>`; });
                    topicHtml += `</ol></div>`;
                }

                topicHtml += `</div></div>`;
                contentEl.innerHTML += topicHtml;
            }
            if (!addedAny) contentEl.innerHTML = '<div style="text-align: center; color: #6b7280; padding: 40px 20px;">目前錯題本中暫無可供整理的技巧與陷阱。</div>';
        }
        
        grammarSecretsModal.style.display = 'flex';
        grammarSecretsModal.classList.remove('hidden');
    });
}

if (btnCloseSecrets) {
    btnCloseSecrets.addEventListener('click', () => {
        grammarSecretsModal.style.display = '';
        grammarSecretsModal.classList.add('hidden');
    });
}

const printStyle = document.createElement('style');
printStyle.textContent = `
    @media print {
        body.print-mistakes-mode * { visibility: hidden; }
        body.print-mistakes-mode #historyMistakesPanel, body.print-mistakes-mode #historyMistakesPanel * { visibility: visible; }
        body.print-mistakes-mode #historyMistakesPanel { position: absolute; left: 0; top: 0; width: 100%; }
        body.print-mistakes-mode header, body.print-mistakes-mode .tab-bar, body.print-mistakes-mode .vocab-tab-header, body.print-mistakes-mode .vocab-subtab-switch, body.print-mistakes-mode #mistakesFilterArea, body.print-mistakes-mode #btnPrintPDF, body.print-mistakes-mode #btnGenerateSecrets, body.print-mistakes-mode .delete-mistake-btn { display: none !important; }
        body.print-mistakes-mode #historyMistakesPanel > p { display: none !important; }
        body.print-mistakes-mode .mistake-card { break-inside: avoid; page-break-inside: avoid; border: 1px solid #ccc !important; box-shadow: none !important; margin-bottom: 20px !important; }

        body.print-secrets-mode * { visibility: hidden; }
        body.print-secrets-mode #grammarSecretsModal, body.print-secrets-mode #grammarSecretsModal * { visibility: visible; }
        body.print-secrets-mode #grammarSecretsModal { position: absolute; left: 0; top: 0; width: 100%; background: white !important; }
        body.print-secrets-mode .srs-close-btn, body.print-secrets-mode #btnPrintSecrets { display: none !important; }
        body.print-secrets-mode .srs-content { box-shadow: none !important; overflow: visible !important; max-height: none !important; }
    }
`;
document.head.appendChild(printStyle);

export async function renderMistakesList() {
    const listEl = document.getElementById('mistakesList');
    if (!listEl) return;
    
    listEl.innerHTML = '<p style="text-align:center; padding:20px; color:#9ca3af;">載入中...</p>';
    
    let allMistakes = [];
    try {
        allMistakes = await MistakesDB.getAll();
    } catch(e) {
        console.error("載入錯題失敗", e);
    }
    
    let displayMistakes = allMistakes;
    if (activeMistakeFilters.size > 0) {
        displayMistakes = allMistakes.filter(q => {
            const normalized = normalizeTopic(q.topic);
            return activeMistakeFilters.has(normalized);
        });
    }
    
    if (displayMistakes.length === 0) {
        const msg = activeMistakeFilters.size > 0 ? '沒有找到符合該分類的錯題' : '尚無錯題紀錄<br><span style="font-size:12px;">在專項特訓中答錯或釘選的題目會出現在這裡</span>';
        listEl.innerHTML = `<div style="text-align:center; padding:40px 20px; color:#9ca3af; background:#f9fafb; border-radius:12px; margin-top:20px;">${msg}</div>`;
        return;
    }

    displayMistakes.sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));

    listEl.innerHTML = '';
    displayMistakes.forEach(q => {
        const card = document.createElement('div');
        card.className = 'mistake-card';
        card.style.cssText = 'background: #fff; border-radius: 12px; padding: 16px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;';
        
        let optsHtml = q.options.map(opt => `
            <div style="font-size: 14px; margin-bottom: 6px; color: ${opt.isCorrect ? '#166534' : '#4b5563'}; background: ${opt.isCorrect ? '#dcfce7' : '#f3f4f6'}; padding: 8px 12px; border-radius: 8px; border: 1px solid ${opt.isCorrect ? '#bbf7d0' : '#e5e7eb'};">
                <span style="font-weight: 500;">${opt.en}</span> <span style="font-size: 12px; opacity: 0.8; margin-left: 4px;">— ${opt.zh}</span>
                ${opt.isCorrect ? '<span style="float:right;">✅</span>' : ''}
            </div>
        `).join('');

        let expObj = q.explanation;
        if (typeof expObj === 'string') {
            try { expObj = JSON.parse(expObj); } catch(e) {}
        }
        const expHtml = buildExplanationHtml(expObj);
        
        const displayTopic = normalizeTopic(q.topic);

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                <span style="background: #e0e7ff; color: #3b82f6; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: bold;">${displayTopic}</span>
                <button class="delete-mistake-btn" data-id="${q.id}" style="background: #fee2e2; border: none; color: #ef4444; width: 28px; height: 28px; border-radius: 50%; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;" title="移除此題">✕</button>
            </div>
            <div style="font-size: 16px; font-weight: 500; color: #1f2937; margin-bottom: 8px; line-height: 1.5;">${q.en.replace('___', '_____')}</div>
            <div style="font-size: 13px; color: #6b7280; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px dashed #e5e7eb;">${q.zh}</div>
            <div style="margin-bottom: 16px;">${optsHtml}</div>
            <div style="background: #f8fafc; border: 1px solid #bfdbfe; padding: 12px; border-radius: 8px;">
                <div style="font-size: 12px; font-weight: bold; color: #1e40af; margin-bottom: 4px;">💡 深入解析</div>
                ${expHtml}
            </div>
        `;

        card.querySelector('.delete-mistake-btn').onclick = async () => {
            if (confirm('確定要從錯題本移除這題嗎？')) {
                await MistakesDB.delete(q.id);
                renderMistakesList(); 
            }
        };

        listEl.appendChild(card);
    });
}

async function getBestModel(apiKey) {
    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        if (!res.ok) return 'models/gemini-1.5-flash';
        
        const data = await res.json();
        if (data.models) {
            const validModels = data.models
                .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent"))
                .map(m => m.name); 
            
            const preferred = ["models/gemini-1.5-flash", "models/gemini-1.5-pro", "models/gemini-1.0-pro", "models/gemini-pro"];
            for (const p of preferred) {
                if (validModels.includes(p)) return p;
            }
            if (validModels.length > 0) return validModels[0];
        }
    } catch (e) {
        console.warn("無法取得模型清單", e);
    }
    return 'models/gemini-1.5-flash';
}

async function startTraining(topics, difficulty) {
    if (!state.apiKey) throw new Error('請先設定 API Key');

    const prompt = `你是一位專業的 TOEIC 滿分出題老師。
請根據以下文法主題：【${topics.join('、')}】，出 10 題高質量的 TOEIC 單選題。考點必須在這些主題中隨機混搭。

⚠️ 極度重要難度限制：必須符合「${difficulty}」的程度要求。請嚴格根據此難度標準來控制單字難度、句式長度與情境複雜度。例如若為國中難度，嚴禁使用商業單字；若為 800 分難度，請盡量使用長難句與陷阱題。

請務必以「純 JSON 陣列」格式回傳，絕對不要有 markdown 標記 (如 \`\`\`json)，也不要有任何問候語或額外文字。
格式必須完全符合以下結構：
[
  {
    "id": "q_12345",
    "topic": "必須嚴格填寫該題所屬的主題名稱，只能從【${topics.join('、')}】中挑選一個完全一樣的字眼，絕對不能自己發明分類（例如不能寫'簡單現在式'，只能寫'時態'）！",
    "en": "完整的英文題目，空格請用 ___ 表示",
    "zh": "題目的完整中文翻譯",
    "options": [
      {"en": "正確選項", "zh": "正確選項的中文", "isCorrect": true},
      {"en": "錯誤選項1", "zh": "錯誤選項1的中文", "isCorrect": false},
      {"en": "錯誤選項2", "zh": "錯誤選項2的中文", "isCorrect": false},
      {"en": "錯誤選項3", "zh": "錯誤選項3的中文", "isCorrect": false}
    ],
    "explanation": {
      "core": "詳細的中文解析。⚠️解釋時請直接引用「英文單字」本身，絕對不要使用「選項A、B、C、D」等字眼，因前端系統會打亂選項順序。",
      "skills": "一句話總結核心答題技巧（例如：'看到 last night 就選過去式'），請盡量精煉、標準化，方便系統歸納。",
      "warnings": "一句話總結易混淆陷阱或注意事項（例如：'注意 do 的第三人稱單數是 does'），請精煉、標準化。"
    }
  }
]
注意：必須剛好 10 題，每個題目 4 個選項，且只有 1 個 isCorrect 是 true。`;

    const bestModelName = await getBestModel(state.apiKey);

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${bestModelName}:generateContent?key=${state.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7 }
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(`Google API 拒絕請求 (${bestModelName}): ${data.error?.message || '未知錯誤'}`);
    }

    if (!data.candidates || data.candidates.length === 0) {
        throw new Error('API 成功連線，但回傳空白。');
    }

    let rawText = data.candidates[0].content.parts[0].text.trim();
    rawText = rawText.replace(/^```json/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();

    let questions;
    try {
        questions = JSON.parse(rawText);
    } catch (e) {
        throw new Error('AI 回傳的題目格式有些微錯誤 (少括號等)，請再按一次開始按鈕！');
    }

    questions.forEach(q => q.id = 'sp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5));

    stState.questions = questions;
    stState.currentQ = 0;
    stState.active = true;

    document.getElementById('specialQuizOverlay').classList.remove('hidden');
    renderQuestion();
}

function renderQuestion() {
    const q = stState.questions[stState.currentQ];
    stState.answered = false;

    document.getElementById('specialProgressText').textContent = `${stState.currentQ + 1} / ${stState.questions.length}`;
    document.getElementById('specialTopicBadge').textContent = normalizeTopic(q.topic);

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

    const expHtml = buildExplanationHtml(questionObj.explanation);

    const explanationDiv = document.createElement('div');
    explanationDiv.style.cssText = 'margin-top: 16px; background: #eff6ff; padding: 16px; border-radius: 12px; border: 1px solid #bfdbfe;';
    explanationDiv.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
            <span style="font-weight: bold; color: #1e40af;">💡 深入解析</span>
            <button id="btnPinMistake" style="display: flex; items-center; gap: 4px; background: #fff; border: 1px solid #bfdbfe; padding: 4px 10px; border-radius: 8px; font-size: 13px; font-weight: bold; color: #4b5563; cursor: pointer; transition: all 0.2s;">
                <span style="opacity: 0.3; font-size:16px;" id="pinIcon">📌</span> <span id="pinText">收錄錯題</span>
            </button>
        </div>
        ${expHtml}
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

async function showResults() {
    const qArea = document.getElementById('specialQuestionArea');
    const oArea = document.getElementById('specialOptionsArea');
    
    document.getElementById('specialProgressText').textContent = '完成';
    document.getElementById('specialTopicBadge').textContent = '結算';

    if (window.DB) {
        try {
            await window.DB.addDailyProgress('special', 1);
        } catch (e) {
            console.error("Failed to add special progress", e);
        }
    }

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