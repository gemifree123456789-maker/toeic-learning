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
                const repairedJson = jsonStr.replace(/\\"/g, "'");
                return JSON.parse(repairedJson);
            } catch (innerErr) {
                console.error("JSON 深度解析失敗:", rawText);
                throw new Error("AI 格式解析失敗，請重新嘗試。");
            }
        }
        throw new Error("找不到有效的 JSON 數據");
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
    const prompt = `You are a TOEIC tutor. Target: ${score}. Generate JSON for a short passage. Lang: ${targetLang}. 
    Structure: {"article":"..","translation":"..","vocabulary":[{"word":"..","pos":"..","def":"..","ex":"..","ex_zh":".."}],"segments":[{"en":"..","zh":".."}]}`;
    return fetchJsonFromPrompt(TEXT_MODEL, prompt);
}

export async function fetchWordDetails(word, forceFetch = false) {
    if (!forceFetch) {
        const cached = await DB.getWord(word);
        if (cached) return cached;
    }
    const locale = getLocaleMeta();
    const targetLang = `${locale.name} (${locale.inLocal})`;
    
    // 🌟 最終修正：完整包含衍生字與同反義字，並固定 def/ex 欄位
    const prompt = `Explain "${word}" for TOEIC student. Use ${targetLang}. 
        Output STRICT JSON format:
        {
          "word": "${word}",
          "pos": "part of speech",
          "ipa": "IPA",
          "category": "Business/Travel/etc",
          "def": "Brief definition",
          "ex": "Example sentence",
          "ex_zh": "Example translation",
          "derivatives": [{"word":"..","pos":"..","zh":".."}],
          "synonyms": [".."],
          "antonyms": [".."]
        }`;
    const result = await fetchJsonFromPrompt(TEXT_MODEL, prompt);
    await DB.setWord(word, result);
    return result;
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
    const prompt = `You are a professional TOEIC test maker. Level: ${score} points. Task: Part ${part}.\n- txt/q/opts MUST BE 100% ENGLISH. No Chinese.\n- exp/trans MUST BE IN ${targetLang}.\n- Output ONLY valid JSON: ${structureInstruction}`;
    return await fetchJsonFromPrompt(TEXT_MODEL, prompt);
}