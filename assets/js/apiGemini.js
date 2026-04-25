// Gemini API calls: text generation, TTS, exam generation, and explanations.

import { state, TEXT_MODEL, TTS_MODEL } from './state.js';
import { DB } from './db.js';
import { getLocaleMeta } from './i18n.js';

// 逐參數解釋：ensureCandidateText(data)
// - data: API 回傳的原始 JSON 物件
// 功能：確認 AI 有回傳文字，若無則拋出明確錯誤。
function ensureCandidateText(data) {
    if (data?.error) throw new Error(data.error.message || 'Gemini API error');
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Gemini 回傳內容為空');
    return text;
}

// 🌟 本次大升級：暴力 JSON 提取器
// 逐參數解釋：parseJsonCandidateText(rawText)
// - rawText: AI 回傳的純文字字串 (可能夾雜廢話)
// 功能：去除標記後嘗試解析；若失敗，則強行尋找 [ ] 或 { } 包裹的區塊來強制解析，徹底解決 SyntaxError。
function parseJsonCandidateText(rawText) {
    // 1. 忽略大小寫，清除常見的 markdown 標記
    let cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    try {
        // 2. 正常嘗試解析
        return JSON.parse(cleaned);
    } catch (err) {
        // 3. 遇到廢話導致解析失敗，啟動暴力提取模式
        const arrayStart = cleaned.indexOf('[');
        const arrayEnd = cleaned.lastIndexOf(']');
        const objStart = cleaned.indexOf('{');
        const objEnd = cleaned.lastIndexOf('}');
        
        try {
            // 判斷是陣列還是物件，並切出對應的字串範圍再次解析
            if (arrayStart !== -1 && arrayEnd !== -1 && (objStart === -1 || arrayStart < objStart)) {
                return JSON.parse(cleaned.substring(arrayStart, arrayEnd + 1));
            } else if (objStart !== -1 && objEnd !== -1) {
                return JSON.parse(cleaned.substring(objStart, objEnd + 1));
            }
        } catch (extractErr) {
            console.error("暴力提取失敗。API 原始內容:", rawText);
            throw new Error("AI 產生的題目格式異常，請再試一次！");
        }
        
        console.error("完全找不到 JSON。API 原始內容:", rawText);
        throw new Error("無法從 AI 回傳內容中讀取題目，請重試！");
    }
}

// 帶有快速退避的高階自動重試機制
// 逐參數解釋：fetchJsonFromPrompt(model, prompt, retries)
// - model: 使用的 Gemini 模型名稱
// - prompt: 發送給 AI 的提示詞
// - retries: 遇到 429 (請求頻繁) 時的重試次數，預設 2 次
async function fetchJsonFromPrompt(model, prompt, retries = 2) {
    for (let i = 0; i < retries; i++) {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${state.apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            })
        });

        if (response.status === 429) {
            if (i === retries - 1) throw new Error("API 請求太頻繁(429)，請稍候再試。");
            await new Promise(r => setTimeout(r, 2000 * (i + 1)));
            continue;
        }

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || "API 請求失敗");
        return parseJsonCandidateText(ensureCandidateText(data));
    }
}

// 產生閱讀文章
export async function fetchGeminiText(targetScore, customTopic = "") {
    const { targetLang } = getLocaleMeta();
    const prompt = `You are a professional TOEIC teacher.
        Generate a business-related article or dialogue for a student aiming for a TOEIC score of ${targetScore}.
        Topic: ${customTopic || 'random business scenario'}
        Output STRICT JSON:
        {
          "title": "Short Title",
          "article": "Full English Text",
          "translation": "Full Chinese Text (${targetLang})",
          "segments": [
            {"en": "Sentence 1", "zh": "Sentence 1 translation"}
          ],
          "vocabulary": [
            {"word": "word", "pos": "n.", "ipa": "/.../", "definition": "Chinese Definition", "example": "English example sentence", "example_zh": "Chinese example translation"}
          ],
          "phrases": [
             {"phrase": "phrase", "definition": "meaning", "example": "English example"}
          ]
        }`;
    return await fetchJsonFromPrompt(TEXT_MODEL, prompt);
}

// 產生模擬考試
export async function fetchExamQuestions(targetScore) {
    const prompt = `You are a professional TOEIC test maker. 
        Create a mini-mock exam for target score ${targetScore}.
        Output STRICT JSON:
        {
          "listening": [
            {"id":"l1", "question":"Transcript text", "options":["A","B","C","D"], "answer":"A"}
          ],
          "reading": [
            {"id":"r1", "passage":"Passage text", "questions":[{"id":"rq1", "question":"Q text", "options":["A","B","C","D"], "answer":"B"}]}
          ],
          "vocabulary": [
            {"id":"v1", "question":"Sentence with _______.", "options":["A","B","C","D"], "answer":"C"}
          ],
          "grammar": [
            {"id":"g1", "question":"Sentence with _______.", "options":["A","B","C","D"], "answer":"D"}
          ]
        }`;
    return await fetchJsonFromPrompt(TEXT_MODEL, prompt);
}

// 產生錯題解析
export async function fetchExamWrongAnswerExplanations(payload) {
    const { targetLang } = getLocaleMeta();
    const prompt = `You are a TOEIC teacher. Explain each wrong answer one by one.
        Output STRICT JSON:
        {
          "items":[
            {
              "id":"question id",
              "whyWrong":"Why the selected answer is wrong (${targetLang})",
              "keyPoint":"Key point for the correct answer (${targetLang})",
              "trap":"Common trap (${targetLang})"
            }
          ]
        }
        Wrong-answer payload:
        ${JSON.stringify(payload)}
    `;
    const result = await fetchJsonFromPrompt(TEXT_MODEL, prompt);
    return Array.isArray(result?.items) ? result.items : [];
}

// 產生音檔
export async function fetchGeminiTTS(text, voiceName) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${TTS_MODEL}:generateContent?key=${state.apiKey}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text }] }], generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } } } })
    });
    
    if (response.status === 429) {
        throw new Error("語音功能請求太頻繁，請稍等幾秒後再點擊播放。");
    }

    const data = await response.json();
    if (!response.ok || data?.error) {
        const message = data?.error?.message || 'TTS failed';
        const error = new Error(message);
        error.code = data?.error?.code || response.status;
        throw error;
    }
    return data.candidates[0].content.parts[0].inlineData.data;
}

// 🌟 升級版：AI 仿真特訓 Part 5/6/7 生成函數
// 逐參數解釋：fetchAIPartQuestions(part, score)
// - part: 數字，代表測驗部分 (5, 6, 7)
// - score: 數字，代表多益難度 (500~900)
// 功能：發送嚴格指令要求 AI 產出相容於 classicTraining.js 的 JSON 格式。
export async function fetchAIPartQuestions(part, score) {
    const { targetLang } = getLocaleMeta();
    let specificRule = "";
    
    if (part === 5) {
        specificRule = "Generate 10 single-sentence multiple-choice questions focusing on grammar and vocabulary.";
    } else if (part === 6) {
        specificRule = "Generate 2 short passages (email/memo/notice). Each passage must have 4 blanks with questions. Total 8 questions.";
    } else if (part === 7) {
        specificRule = "Generate 2 articles (advertisement/article/letter). Each article must have 4 reading comprehension questions. Total 8 questions.";
    }

    // 🌟 關鍵防禦指令：強制要求 ONLY 輸出 JSON，不准帶有任何其他文字
    const prompt = `You are a TOEIC expert. Create ${part === 5 ? '10' : '8'} questions for Part ${part}.
        Difficulty level: TOEIC ${score}.
        CRITICAL INSTRUCTION: Output ONLY a valid JSON array. Do NOT include any markdown formatting, do NOT wrap in \`\`\`json, and do NOT include any conversational text. For Part 6 and 7, use "txt" for the passage content.
        
        JSON Structure for Part 5:
        [
          {"q":"..._______...", "opts":["A","B","C","D"], "ans":0, "exp":"Explanation in ${targetLang}", "trans":"Full translation in ${targetLang}", "zh":"Brief logic"}
        ]
        
        JSON Structure for Part 6/7:
        [
          {
            "txt": "Full Passage Content",
            "qs": [
               {"q":"Question text or (101).", "opts":["A","B","C","D"], "ans":1, "exp":"Explanation", "trans":"Q Translation", "zh":"Detailed logic"}
            ]
          }
        ]
        
        Rules: ${specificRule} Ensure logic traps match the ${score} level.`;

    return await fetchJsonFromPrompt(TEXT_MODEL, prompt);
}