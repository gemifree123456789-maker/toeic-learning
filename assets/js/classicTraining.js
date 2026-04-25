import { state } from './state.js';
import { MistakesDB } from './specialTraining.js';

// --- 狀態管理物件 ---
const ctState = { 
    active: false, 
    part: 5, 
    questions: [], 
    currentQ: 0, 
    answered: false 
};

// --- 取得題庫函數 ---
function getQuestionPool(part) {
    let pool = [];
    try {
        if (part === 5) {
            if (typeof Q_P5_ALL !== 'undefined') pool = Q_P5_ALL;
            else if (typeof Q_P5_T01 !== 'undefined') pool = Q_P5_T01;
        } else if (part === 6) {
            if (typeof Q_P6_ALL !== 'undefined') pool = Q_P6_ALL;
            else if (typeof Q_P6_T01 !== 'undefined') pool = Q_P6_T01;
        } else if (part === 7) {
            if (typeof Q_P7_ALL !== 'undefined') pool = Q_P7_ALL;
            else if (typeof Q_P7_T01 !== 'undefined') pool = Q_P7_T01;
        }
    } catch (e) {
        console.error("Error accessing static questions:", e);
    }
    return pool;
}

// --- 模組初始化函數 ---
export function initClassicTraining() {
    const btn5 = document.getElementById('btnStartPart5');
    const btn6 = document.getElementById('btnStartPart6');
    const btn7 = document.getElementById('btnStartPart7');
    const btnClose = document.getElementById('btnCloseClassic');

    if (btn5) btn5.onclick = (e) => { e.preventDefault(); startClassicTraining(5); };
    if (btn6) btn6.onclick = (e) => { e.preventDefault(); startClassicTraining(6); };
    if (btn7) btn7.onclick = (e) => { e.preventDefault(); startClassicTraining(7); };

    if (btnClose) {
        btnClose.onclick = (e) => {
            e.preventDefault();
            if (confirm('確定要退出測驗嗎？目前進度將不會保存。')) {
                document.getElementById('classicQuizOverlay').classList.add('hidden');
            }
        };
    }
}

// --- 啟動測驗與資料轉譯函數 ---
function startClassicTraining(part) {
    const pool = getQuestionPool(part);
    if (!pool || pool.length === 0) {
        alert(`找不到 Part ${part} 的題庫資料！請確認 questions.js 檔案內容是否正確載入。`);
        return;
    }

    let flatPool = [];
    pool.forEach(item => {
        if (item.qs && Array.isArray(item.qs)) {
            item.qs.forEach(subQ => {
                flatPool.push({ ...subQ, article: item.article || item.passage || '' });
            });
        } else {
            flatPool.push(item);
        }
    });

    flatPool.sort(() => Math.random() - 0.5);
    
    const selected = flatPool.slice(0, 10).map((raw, idx) => {
        const options = (raw.opts || []).map((optText, oIdx) => ({
            key: String.fromCharCode(65 + oIdx),
            en: optText,
            isCorrect: oIdx === raw.ans
        }));

        return {
            id: `classic_p${part}_${Date.now()}_${idx}`,
            topic: `Part ${part} 經典題庫`,
            article: raw.article || raw.passage || '',
            en: raw.q || '',
            zh: raw.trans || '',
            options: options,
            explanation: {
                core: raw.exp || '無詳細解析',
                skills: raw.zh || ''
            }
        };
    });

    ctState.questions = selected;
    ctState.currentQ = 0;
    ctState.part = part;
    ctState.active = true;

    document.getElementById('classicQuizOverlay').classList.remove('hidden');
    renderClassicQuestion();
}

// --- 渲染考題介面函數 ---
function renderClassicQuestion() {
    const q = ctState.questions[ctState.currentQ];
    ctState.answered = false;

    document.getElementById('classicProgressText').textContent = `${ctState.currentQ + 1} / ${ctState.questions.length}`;
    document.getElementById('classicTopicBadge').textContent = `Part ${ctState.part} 測驗`;

    const qArea = document.getElementById('classicQuestionArea');
    const oArea = document.getElementById('classicOptionsArea');

    let qHtml = '';
    if (q.article) {
        qHtml += `<div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin-bottom: 15px; font-size: 14px; color: #334155; line-height: 1.6; white-space: pre-wrap; max-height: 250px; overflow-y: auto; border: 1px solid #cbd5e1;">${q.article}</div>`;
    }
    qHtml += `<div style="font-size: 18px; color: #1f2937; font-weight: 500; line-height: 1.6; margin-bottom: 12px;">${q.en.replace(/-------/g, '_______')}</div>`;
    
    if (q.zh) {
        qHtml += `<div id="classicQuestionZh" class="hidden" style="font-size: 14px; color: #6b7280; border-top: 1px dashed #e5e7eb; padding-top: 12px;">${q.zh}</div>`;
    }
    
    qArea.innerHTML = qHtml;
    oArea.innerHTML = '';

    q.options.forEach((opt) => {
        const btn = document.createElement('button');
        btn.className = 'srs-option';
        btn.innerHTML = `<span style="font-size: 16px; display:block;">( ${opt.key} ) ${opt.en}</span>`;
        
        btn.onclick = () => {
            if (ctState.answered) return;
            handleClassicAnswer(btn, opt.isCorrect, q.options, q);
        };
        oArea.appendChild(btn);
    });
}

// --- 答題判定與解析函數 ---
function handleClassicAnswer(selectedBtn, isCorrect, optionsData, questionObj) {
    ctState.answered = true;
    const oArea = document.getElementById('classicOptionsArea');
    
    const zhEl = document.getElementById('classicQuestionZh');
    if(zhEl) zhEl.classList.remove('hidden');

    Array.from(oArea.children).forEach((btn, index) => {
        const opt = optionsData[index];
        btn.classList.add('disabled');
        btn.style.pointerEvents = 'none';
        
        if (opt.isCorrect) {
            btn.classList.add('correct');
        } else if (btn === selectedBtn && !opt.isCorrect) {
            btn.classList.add('wrong');
        }
    });

    const expDiv = document.createElement('div');
    expDiv.style.cssText = 'margin-top: 16px; background: #eff6ff; padding: 16px; border-radius: 12px; border: 1px solid #bfdbfe;';
    
    let expHtml = `<div style="font-size: 14px; color: #1e3a8a; line-height: 1.6; margin-bottom: 8px;"><strong>原文解析：</strong>${questionObj.explanation.core}</div>`;
    if (questionObj.explanation.skills) {
        expHtml += `<div style="margin-top: 10px; font-size: 13.5px; color: #475569;"><strong>中文翻譯：</strong>${questionObj.explanation.skills}</div>`;
    }

    expDiv.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
            <span style="font-weight: bold; color: #1e40af;">💡 深入解析</span>
            <button id="btnPinClassicMistake" style="display: flex; align-items: center; gap: 4px; background: #fff; border: 1px solid #bfdbfe; padding: 4px 10px; border-radius: 8px; font-size: 13px; font-weight: bold; color: #4b5563; cursor: pointer;">
                <span style="opacity: 0.3; font-size:16px;" id="classicPinIcon">📌</span> <span id="classicPinText">收錄錯題</span>
            </button>
        </div>
        ${expHtml}
    `;
    oArea.appendChild(expDiv);

    const btnPin = document.getElementById('btnPinClassicMistake');
    let isPinned = false;
    btnPin.onclick = async () => {
        isPinned = !isPinned;
        document.getElementById('classicPinIcon').style.opacity = isPinned ? '1' : '0.3';
        document.getElementById('classicPinText').textContent = isPinned ? '已收錄' : '收錄錯題';
        btnPin.style.background = isPinned ? '#fef9c3' : '#fff';
        btnPin.style.borderColor = isPinned ? '#fde047' : '#bfdbfe';
        btnPin.style.color = isPinned ? '#854d0e' : '#4b5563';
        
        if (isPinned) {
            const mistakePayload = {
                id: questionObj.id,
                topic: questionObj.topic,
                en: questionObj.article ? `[閱讀測驗]\n${questionObj.en}` : questionObj.en,
                zh: questionObj.zh || '經典題庫',
                options: questionObj.options,
                explanation: questionObj.explanation,
                savedAt: Date.now()
            };
            await MistakesDB.save(mistakePayload);
        }
    };

    if (!isCorrect) btnPin.click();

    const nextBtn = document.createElement('button');
    nextBtn.className = 'srs-done-btn';
    nextBtn.style.marginTop = '24px';
    nextBtn.textContent = '下一題 ➔';
    nextBtn.onclick = () => {
        ctState.currentQ++;
        if (ctState.currentQ >= ctState.questions.length) showClassicResults();
        else renderClassicQuestion();
    };
    oArea.appendChild(nextBtn);
}

// --- 結算與紀錄函數 ---
async function showClassicResults() {
    const qArea = document.getElementById('classicQuestionArea');
    const oArea = document.getElementById('classicOptionsArea');
    
    document.getElementById('classicProgressText').textContent = '完成';
    
    if (window.DB) {
        try {
            await window.DB.addDailyProgress('special', 1);
        } catch (e) {
            console.error("Failed to add daily progress", e);
        }
    }

    qArea.innerHTML = `
        <div style="text-align: center; padding: 32px 0;">
            <div style="font-size: 48px; margin-bottom: 16px;">📚</div>
            <h2 style="font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 8px;">經典題庫測驗完成！</h2>
            <p style="color: #6b7280; line-height: 1.5;">答錯或釘選的題目已為您收錄至【特訓錯題本】</p>
        </div>
    `;
    oArea.innerHTML = '';
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'srs-done-btn';
    closeBtn.textContent = '結束測驗，返回首頁';
    closeBtn.onclick = () => {
        document.getElementById('classicQuizOverlay').classList.add('hidden');
    };
    oArea.appendChild(closeBtn);
}