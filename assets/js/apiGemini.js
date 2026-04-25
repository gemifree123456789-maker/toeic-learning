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

// 🌟 強化版：暴力 JSON 提取器 (解決 Part 5 引號崩潰問題)
function parseJsonCandidateText(rawText) {
    let cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    cleaned = cleaned.replace(/\n/g, ' ').replace(/\r/g, '');

    try {
        return JSON.parse(cleaned);
    } catch (err) {
        const arrayStart = cleaned.indexOf('[');
        const arrayEnd = cleaned.lastIndexOf(']');
        const objStart = cleaned.indexOf('{');
        const objEnd = cleaned.lastIndexOf('}');
        
        let jsonStr = "";
        if (arrayStart !== -1 && arrayEnd !== -1 && (objStart === -1 || arrayStart < objStart)) {
            jsonStr = cleaned.substring(arrayStart, arrayEnd + 1);
        } else if (objStart !== -1 && objEnd !== -1) {
            jsonStr = cleaned.substring(objStart, objEnd + 1);
        }

        if (jsonStr) {
            try {
                const repairedJson = jsonStr.replace(/\\"/g, "'");
                return JSON.parse(repairedJson);
            } catch (innerErr) {
                console.error("暴力提取失敗:", rawText);
                throw new Error("AI 格式解析失敗，請再試一次。");
            }
        }
        throw new Error("完全找不到 JSON 數據");
    }
}

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
            if (i === retries - 1) throw new Error("HTTP_429");
            await new Promise(resolve => setTimeout(resolve, 2000));
            continue;
        }

        const data = await response.json();
        return parseJsonCandidateText(ensureCandidateText(data));
    }
}

export async function fetchGeminiText(score, customTopic) {
    const locale = getLocaleMeta();
    const targetLang = `${locale.name} (${locale.inLocal})`;
    const topicLine = customTopic ? `about "${customTopic}"` : `random TOEIC scenario`;
    const prompt = `You are a TOEIC tutor. Target: ${score}. Generate JSON for a short passage. Lang: ${targetLang}.`;
    return fetchJsonFromPrompt(TEXT_MODEL, prompt);
}

export async function fetchWordDetails(word, forceFetch = false) {
    if (!forceFetch) {
        const cached = await DB.getWord(word);
        if (cached) return cached;
    }
    const locale = getLocaleMeta();
    const targetLang = `${locale.name} (${locale.inLocal})`;
    const prompt = `Explain "${word}" for TOEIC card. Use ${targetLang}. Output JSON.`;
    const result = await fetchJsonFromPrompt(TEXT_MODEL, prompt);
    await DB.setWord(word, result);
    return result;
}

export async function validateWordWithLanguageTool(word) {
    const query = String(word || '').trim();
    if (!query) return { ok: false };
    try {
        const body = new URLSearchParams();
        body.set('text', query);
        body.set('language', 'en-US');
        const response = await fetch('https://api.languagetool.org/v2/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body.toString()
        });
        const data = await response.json();
        return { ok: data.matches.length === 0 };
    } catch (e) { return { ok: false }; }
}

function normalizeExamQuestion(category, item, idx) {
    const rawOptions = Array.isArray(item.options) ? item.options.slice(0, 4) : [];
    const options = rawOptions.map((option, oIdx) => ({
        key: ['A', 'B', 'C', 'D'][oIdx],
        text: typeof option === 'object' ? (option.text || "") : String(option)
    }));
    return {
        id: item.id || `${category}-${idx + 1}`,
        category, question: item.question || '', passage: item.passage || '',
        options, answerKey: String(item.answerKey || 'A').toUpperCase()
    };
}

function normalizeExamOutput(raw) {
    return {
        listening: (raw.listening || []).map((it, i) => normalizeExamQuestion('listening', it, i)),
        reading: (raw.reading || []).map((it, i) => normalizeExamQuestion('reading', it, i)),
        vocabulary: (raw.vocabulary || []).map((it, i) => normalizeExamQuestion('vocabulary', it, i)),
        grammar: (raw.grammar || []).map((it, i) => normalizeExamQuestion('grammar', it, i))
    };
}

export async function fetchExamQuestions(score) {
    const locale = getLocaleMeta();
    const prompt = `TOEIC mock exam. Target: ${score}. JSON format. 3 questions per part. Use ${locale.name}.`;
    const raw = await fetchJsonFromPrompt(TEXT_MODEL, prompt);
    return normalizeExamOutput(raw);
}

export async function fetchExamWrongAnswerExplanations(payload) {
    const locale = getLocaleMeta();
    const prompt = `TOEIC teacher. Explain wrong answers from: ${JSON.stringify(payload)}. Use ${locale.name}. JSON format.`;
    const result = await fetchJsonFromPrompt(TEXT_MODEL, prompt);
    return result.items || [];
}

// 🌟 修正後的函數：確保括號與邏輯完整
export async function fetchGeminiTTS(text, voiceName) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${TTS_MODEL}:generateContent?key=${state.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text }] }],
            generationConfig: {
                responseModalities: ["AUDIO"],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voiceName }
                    }
                }
            }
        })
    });
    
    if (response.status === 429) {
        throw new Error("語音功能請求太頻繁，請稍等。");
    }

    const data = await response.json();
    if (!response.ok || data?.error) {
        throw new Error(data?.error?.message || 'TTS failed');
    }
    return data.candidates[0].content.parts[0].inlineData.data;
}

// 🌟 AI 仿真特訓題目生成
export async function fetchAIPartQuestions(part, score) {
    const locale = getLocaleMeta();
    const targetLang = `${locale.name} (${locale.inLocal})`;
    let rule = part === 5 ? "10 single-sentence questions." : "2 passages with 4 questions each.";
    
    const prompt = `You are a TOEIC examiner. Target Score: ${score}. Part: ${part}. ${rule}
        Output ONLY a valid JSON array. For Part 6/7, use "txt" for passage.
        IMPORTANT: For "exp", use single quotes 'word' for emphasis, NOT escaped double quotes.
        Part 5 Format: [{"q":"..._______...","opts":["A","B","C","D"],"ans":0,"exp":"解析","trans":"翻譯"}]
        Part 6/7 Format: [{"txt":"文章","qs":[{"q":"題","opts":["A","B","C","D"],"ans":1,"exp":"解析","trans":"翻"}]}]
        Strict Rules: Ensure level ${score}. Lang: ${targetLang}.`;

    return await fetchJsonFromPrompt(TEXT_MODEL, prompt);
}