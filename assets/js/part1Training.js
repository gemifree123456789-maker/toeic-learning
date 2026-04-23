import { state } from './state.js';
import { MistakesDB, SecretsDB } from './specialTraining.js';

// 狀態管理物件
const p1State = { active: false, questions: [], currentQ: 0, answered: false, currentAudio: null };

// 自動偵測並回傳當前可用的最強模型名稱
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

// 負責綁定 index.html 中 Part 1 面板的「開始」與「關閉」按鈕事件。
export function initPart1Training() {
    const btnStartPart1 = document.getElementById('btnStartPart1');
    const btnClosePart1 = document.getElementById('btnClosePart1');

    if (btnStartPart1) {
        btnStartPart1.addEventListener('click', async (e) => {
            e.preventDefault();
            // 從 state.targetScore 抓取使用者選擇的難度 (500~800)
            const difficulty = state.targetScore || 600;

            btnStartPart1.disabled = true;
            btnStartPart1.innerHTML = '✨ 題目與圖片即時生成中 (約 10-15 秒)...';

            try {
                await startPart1Training(difficulty);
            } catch (err) {
                alert('生成失敗，請重試：' + err.message);
            } finally {
                btnStartPart1.disabled = false;
                btnStartPart1.innerHTML = '🚀 開始 6 題 Part 1 特訓';
            }
        });
    }

    if (btnClosePart1) {
        btnClosePart1.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('確定要退出聽力特訓嗎？目前進度將不會保存。')) {
                document.getElementById('part1QuizOverlay').classList.add('hidden');
                if (p1State.currentAudio) p1State.currentAudio.pause();
            }
        });
    }
}

// 出題邏輯
async function startPart1Training(difficulty) {
    if (!state.apiKey) throw new Error('請先設定 API Key');

    const prompt = `你是一位專業的 TOEIC 滿分出題老師。
請出一套 6 題的 TOEIC Part 1 照片描述 (Photographs) 模擬題。
難度要求：多益 ${difficulty} 分程度。

【Part 1 命題規則】
1. 必須包含「人物動作照」(約4題) 與「物品/風景靜態照」(約2題)。
2. 必須佈下多益常見陷阱：相似音/多義字(Sound-alike)、看圖說故事(過度推論)、"is being V-p.p."(無人卻用被動進行式)等陷阱。

【輸出格式】純 JSON 陣列，絕對不要包含 markdown 標記 (如 \`\`\`json)。
[
  {
    "id": "p1_123",
    "topic": "Part 1 聽力",
    "imagePrompt": "用來生成圖片的『極度詳細全英文描述』(例如: A highly detailed photo of a young man in a suit typing on a laptop in a bright modern office.)",
    "imageTranslation": "這張照片的中文描述",
    "options": [
      {"key": "A", "en": "完整的英文選項 (例如: The man is typing on a keyboard.)", "zh": "中文翻譯", "isCorrect": true},
      {"key": "B", "en": "...", "zh": "...", "isCorrect": false},
      {"key": "C", "en": "...", "zh": "...", "isCorrect": false},
      {"key": "D", "en": "...", "zh": "...", "isCorrect": false}
    ],
    "explanation": {
      "core": "解析為何此選項正確，並指出其他選項犯了什麼陷阱(例如相似音、過度推論等)。",
      "skills": "一句話總結此題的聽力判斷技巧。",
      "warnings": "一句話總結此題的易混淆陷阱。"
    }
  }
]
注意：必須剛好 6 題，每個題目 4 個選項(A, B, C, D)，且只有 1 個 isCorrect 是 true。`;

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
    if (!response.ok) throw new Error(data.error?.message || '未知錯誤');
    if (!data.candidates || data.candidates.length === 0) throw new Error('API 回傳空白。');

    let rawText = data.candidates[0].content.parts[0].text.trim();
    rawText = rawText.replace(/^```json/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();

    let questions;
    try {
        questions = JSON.parse(rawText);
    } catch (e) {
        throw new Error('AI 回傳格式錯誤，請重試！');
    }

    questions.forEach(q => q.id = 'sp_p1_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5));

    p1State.questions = questions;
    p1State.currentQ = 0;
    p1State.active = true;

    document.getElementById('part1QuizOverlay').classList.remove('hidden');
    renderPart1Question();
}

// 渲染題目與圖片
function renderPart1Question() {
    const q = p1State.questions[p1State.currentQ];
    p1State.answered = false;
    
    // 如果有前一題的音檔，先暫停並清空
    if (p1State.currentAudio) {
        p1State.currentAudio.pause();
        p1State.currentAudio = null;
    }

    document.getElementById('part1ProgressText').textContent = `${p1State.currentQ + 1} / ${p1State.questions.length}`;
    
    const imgEl = document.getElementById('part1Image');
    const statusEl = document.getElementById('part1ImageStatus');
    imgEl.style.display = 'none';
    statusEl.style.display = 'block';
    statusEl.textContent = '載入圖片中... (AI 繪圖約需 3-5 秒)';
    
    const imgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(q.imagePrompt)}?width=600&height=400&nologo=true&seed=${Math.floor(Math.random()*1000)}`;
    imgEl.onload = () => {
        statusEl.style.display = 'none';
        imgEl.style.display = 'block';
    };
    imgEl.onerror = () => {
        statusEl.textContent = '圖片載入失敗，請憑想像作答😅';
    };
    imgEl.src = imgUrl;

    const oArea = document.getElementById('part1OptionsArea');
    oArea.innerHTML = '';
    
    q.options.forEach((opt) => {
        const btn = document.createElement('button');
        btn.className = 'srs-option';
        btn.innerHTML = `<span style="font-size: 18px; font-weight: bold;">( ${opt.key} )</span><span class="opt-text hidden" style="font-size: 15px; margin-left: 12px;">${opt.en}</span>`;
        
        btn.onclick = () => {
            if (p1State.answered) return;
            handlePart1Answer(btn, opt.isCorrect, q.options, q);
        };
        oArea.appendChild(btn);
    });

    const audioBtn = document.getElementById('btnPlayPart1Audio');
    const audioText = document.getElementById('part1AudioBtnText');
    audioBtn.disabled = false;
    audioText.textContent = '播放音檔 (A, B, C, D)';
    
    // 🌟 終極修復：語音播放邏輯 (Magic Bytes 自動偵測格式)
    audioBtn.onclick = async () => {
        if (p1State.currentAudio) {
            p1State.currentAudio.currentTime = 0; // 重頭播放
            p1State.currentAudio.play().catch(e => console.error('重播失敗', e));
            return;
        }
        
        audioBtn.disabled = true;
        audioText.textContent = '語音生成中...';
        
        try {
            // 將四個選項合併成一句話傳給 TTS 朗讀
            const textToSpeak = q.options.map(o => `${o.key}. ${o.en}`).join('. ');
            const { fetchGeminiTTS } = await import('./apiGemini.js');
            const voiceName = state.lastUsedVoice || 'Kore';
            
            // 向 Gemini 索取 Base64 音檔資料
            const base64 = await fetchGeminiTTS(textToSpeak, voiceName);
            
            // 🌟 透過 Base64 開頭的 Magic Bytes 來精準判斷音檔格式！
            let mimeType = 'audio/mp3'; // 預設值
            if (base64.startsWith('UklGR')) mimeType = 'audio/wav';
            else if (base64.startsWith('OggS')) mimeType = 'audio/ogg';
            else if (base64.startsWith('fLaC')) mimeType = 'audio/flac';
            else if (base64.startsWith('//NEx') || base64.startsWith('SUQz')) mimeType = 'audio/mp3';
            else if (base64.startsWith('AAAA')) mimeType = 'audio/mp4';
            
            // 組合出最正確的 Data URI
            const audioUrl = `data:${mimeType};base64,${base64}`;
            
            const audio = new Audio(audioUrl);
            p1State.currentAudio = audio;
            await audio.play();
            
            audioText.textContent = '重播音檔';
        } catch (e) {
            console.error('語音載入錯誤：', e);
            alert('語音載入失敗：' + e.message);
            audioText.textContent = '播放失敗';
        } finally {
            audioBtn.disabled = false;
        }
    };
}

// 處理答題結果
function handlePart1Answer(selectedBtn, isCorrect, optionsData, questionObj) {
    p1State.answered = true;
    const oArea = document.getElementById('part1OptionsArea');
    
    if (p1State.currentAudio) p1State.currentAudio.pause();

    Array.from(oArea.children).forEach((btn, index) => {
        const opt = optionsData[index];
        btn.classList.add('disabled');
        btn.style.pointerEvents = 'none';
        btn.querySelector('.opt-text').classList.remove('hidden'); 
        
        if (opt.isCorrect) {
            btn.classList.add('correct');
        } else if (btn === selectedBtn && !opt.isCorrect) {
            btn.classList.add('wrong');
        }
        btn.innerHTML += `<span style="font-size:13px; font-weight:normal; margin-top:6px; display:block; opacity:0.8;">— ${opt.zh}</span>`;
    });

    const expDiv = document.createElement('div');
    expDiv.style.cssText = 'margin-top: 16px; background: #eff6ff; padding: 16px; border-radius: 12px; border: 1px solid #bfdbfe;';
    
    let expHtml = `<div style="font-size: 14px; color: #1e3a8a; line-height: 1.6; margin-bottom: 8px;">${questionObj.explanation.core}</div>`;
    if (questionObj.explanation.skills) expHtml += `<div style="margin-top: 10px; padding: 10px; background: #dcfce7; border-left: 4px solid #22c55e; border-radius: 4px; font-size: 13.5px; color: #166534;"><strong>🎯 聽力技巧：</strong>${questionObj.explanation.skills}</div>`;
    if (questionObj.explanation.warnings) expHtml += `<div style="margin-top: 10px; padding: 10px; background: #fef9c3; border-left: 4px solid #eab308; border-radius: 4px; font-size: 13.5px; color: #854d0e;"><strong>⚠️ 避開陷阱：</strong>${questionObj.explanation.warnings}</div>`;

    expDiv.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
            <span style="font-weight: bold; color: #1e40af;">💡 深入解析 (${questionObj.imageTranslation})</span>
            <button id="btnPinPart1Mistake" style="display: flex; align-items: center; gap: 4px; background: #fff; border: 1px solid #bfdbfe; padding: 4px 10px; border-radius: 8px; font-size: 13px; font-weight: bold; color: #4b5563; cursor: pointer;">
                <span style="opacity: 0.3; font-size:16px;" id="p1PinIcon">📌</span> <span id="p1PinText">收錄錯題</span>
            </button>
        </div>
        ${expHtml}
    `;
    oArea.appendChild(expDiv);

    questionObj.savedAt = Date.now();
    SecretsDB.save(questionObj).catch(e => console.log(e));

    const btnPin = document.getElementById('btnPinPart1Mistake');
    let isPinned = false;
    btnPin.onclick = async () => {
        isPinned = !isPinned;
        document.getElementById('p1PinIcon').style.opacity = isPinned ? '1' : '0.3';
        document.getElementById('p1PinText').textContent = isPinned ? '已收錄' : '收錄錯題';
        btnPin.style.background = isPinned ? '#fef9c3' : '#fff';
        btnPin.style.borderColor = isPinned ? '#fde047' : '#bfdbfe';
        btnPin.style.color = isPinned ? '#854d0e' : '#4b5563';
        
        if (isPinned) {
            questionObj.savedAt = Date.now();
            await MistakesDB.save(questionObj);
        }
    };

    if (!isCorrect) btnPin.click();

    const nextBtn = document.createElement('button');
    nextBtn.className = 'srs-done-btn';
    nextBtn.style.marginTop = '24px';
    nextBtn.textContent = '下一題 ➔';
    nextBtn.onclick = () => {
        p1State.currentQ++;
        if (p1State.currentQ >= p1State.questions.length) showPart1Results();
        else renderPart1Question();
    };
    oArea.appendChild(nextBtn);
}

async function showPart1Results() {
    const qArea = document.getElementById('part1QuestionArea');
    const oArea = document.getElementById('part1OptionsArea');
    
    document.getElementById('part1ProgressText').textContent = '完成';
    
    if (window.DB) {
        try {
            await window.DB.addDailyProgress('special', 1);
        } catch (e) {
            console.error("Failed to add special progress", e);
        }
    }

    qArea.innerHTML = `
        <div style="text-align: center; padding: 32px 0;">
            <div style="font-size: 48px; margin-bottom: 16px;">🎧</div>
            <h2 style="font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 8px;">Part 1 聽力特訓完成！</h2>
            <p style="color: #6b7280; line-height: 1.5;">聽力陷阱精華已自動收錄至【專屬文法秘笈】<br>答錯的題目已收錄至【特訓錯題本】</p>
        </div>
    `;
    oArea.innerHTML = '';
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'srs-done-btn';
    closeBtn.textContent = '結束特訓，返回首頁';
    closeBtn.onclick = () => {
        document.getElementById('part1QuizOverlay').classList.add('hidden');
    };
    oArea.appendChild(closeBtn);
}