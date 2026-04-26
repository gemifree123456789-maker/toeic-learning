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
                // 修復常見的 JSON 格式錯誤
                const repairedJson = jsonStr.replace(/,(\s*[\]}])/g, '$1');
                return JSON.parse(repairedJson);
            } catch (extractErr) {
                console.error("JSON 提取失敗:", rawText);
                throw new Error('無法解析 AI 回傳的格式');
            }
        }
        throw err;
    }
}

async function fetchJsonFromPrompt(model, prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${state.apiKey}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await response.json();
    const text = ensureCandidateText(data);
    return parseJsonCandidateText(text);
}

// 🌟 鐵粉化修正：明確指定 JSON 欄位名稱為 def、ex 與 ex_zh
export async function fetchWordDetails(word, forceFetch = false) {
    if (!forceFetch) {
        const cached = await DB.getWord(word);
        if (cached) return cached;
    }
    const locale = getLocaleMeta();
    const targetLang = `${locale.name} (${locale.inLocal})`;
    
    // 嚴格規定欄位：def (定義), ex (例句), ex_zh (例句翻譯)
    const prompt = `Explain the word "${word}" for a TOEIC student. 
        Output STRICT JSON format:
        {
          "word": "${word}",
          "pos": "part of speech",
          "ipa": "IPA symbol",
          "category": "Business/Travel/etc",
          "def": "Brief ${targetLang} definition",
          "ex": "One short English example sentence",
          "ex_zh": "${targetLang} translation of the example sentence"
        }`;
    
    const result = await fetchJsonFromPrompt(TEXT_MODEL, prompt);
    await DB.setWord(word, result);
    return result;
}

export async function fetchTranslation(text) {
    const locale = getLocaleMeta();
    const targetLang = `${locale.name} (${locale.inLocal})`;
    const prompt = `Translate the following TOEIC-related English text into ${targetLang}. 
        Return ONLY the translation text.
        Text: "${text}"`;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${TEXT_MODEL}:generateContent?key=${state.apiKey}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await response.json();
    return ensureCandidateText(data);
}

export async function generateTTS(text, voiceName) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${TTS_MODEL}:predict?key=${state.apiKey}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            instances: [{ content: text }],
            parameters: {
                ttsConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voiceName }
                    }
                }
            }
        })
    });
    const data = await response.json();
    return data.candidates[0].content.parts[0].inlineData.data;
}

export async function fetchAIPartQuestions(part, score) {
    const locale = getLocaleMeta();
    const targetLang = `${locale.name} (${locale.inLocal})`;
    
    let structureInstruction = "";
    if (part === 5) {
        structureInstruction = `[{\"q\":\"[ENGLISH SENTENCE WITH _______]\",\"opts\":[\"[ENGLISH OPTION A]\",\"[ENGLISH OPTION B]\",\"[ENGLISH OPTION C]\",\"[ENGLISH OPTION D]\"],\"ans\":0,\"exp\":\"[${targetLang} EXPLANATION]\",\"trans\":\"[${targetLang} TRANSLATION]\"}]`;
    } else {
        structureInstruction = `[{\"txt\":\"[ENGLISH PASSAGE]\",\"qs\":[{\"q\":\"[ENGLISH QUESTION]\",\"opts\":[\"[ENGLISH OPTION A]\",\"...\"],\"ans\":1,\"exp\":\"[${targetLang}解析]\",\"trans\":\"[${targetLang}翻譯]\"}]}]`;
    }

    const prompt = `You are a professional TOEIC test maker. Level: ${score} points.\n    TASK: Generate Part ${part} questions.\n    \n    [CRITICAL LANGUAGE RULES]\n    - \"txt\", \"q\", \"opts\" MUST BE 100% ENGLISH. No Chinese allowed in these fields.\n    - \"exp\" and \"trans\" MUST BE IN ${targetLang}.\n    \n    [FORMAT]\n    Output ONLY a valid JSON array matching this structure: ${structureInstruction}`;
    
    return await fetchJsonFromPrompt(TEXT_MODEL, prompt);
}