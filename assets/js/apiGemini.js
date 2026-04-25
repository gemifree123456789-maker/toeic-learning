// Gemini API calls: text generation, TTS, exam generation, and explanations.

import { state, TEXT_MODEL, TTS_MODEL } from './state.js';
import { DB } from './db.js';
import { getLocaleMeta } from './i18n.js';

function ensureCandidateText(data) {
    if (data?.error) throw new Error(data.error.message || 'Gemini API error');
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Gemini 回傳內容為空');
    return text;
}

function parseJsonCandidateText(rawText) {
    const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
}

// 帶有快速退避的高階自動重試機制
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

export async function fetchGeminiTTS(text, voiceName) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${TTS_MODEL}:generateContent?key=${state.apiKey}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text }] }], generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } } } } })
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

// 🌟 新增：AI 仿真特訓 Part 5/6/7 生成函數
// 逐參數解釋：
// - part: 數字，代表測驗部分 (5, 6, 7)
// - score: 數字，代表多益難度 (500~900)
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

    const prompt = `You are a TOEIC expert. Create ${part === 5 ? '10' : '8'} questions for Part ${part}.
        Difficulty level: TOEIC ${score}.
        Output strictly in JSON format. For Part 6 and 7, use "txt" for the passage content.
        
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