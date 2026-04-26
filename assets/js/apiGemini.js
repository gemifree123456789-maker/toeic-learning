// assets/js/apiGemini.js
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
                return JSON.parse(jsonStr);
            } catch (innerErr) {
                console.error("JSON Parse Fail:", rawText);
                throw new Error("AI 格式解析失敗");
            }
        }
        throw err;
    }
}

async function fetchJsonFromPrompt(model, prompt) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${state.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        })
    });
    const data = await response.json();
    return parseJsonCandidateText(ensureCandidateText(data));
}

export async function fetchGeminiText(score, customTopic) {
    const locale = getLocaleMeta();
    const targetLang = `${locale.name} (${locale.inLocal})`;
    const prompt = `You are a TOEIC tutor. Level: ${score}. Topic: ${customTopic || 'Daily'}. 
    Output JSON ONLY:
    {
      "article": "Full passage",
      "translation": "Translation",
      "vocabulary": [{"word":"..","pos":"..","def":"..","ex":"..","ex_zh":".."}],
      "segments": [{"en":"Sentence","zh":"翻譯"}]
    }`;
    return fetchJsonFromPrompt(TEXT_MODEL, prompt);
}

export async function fetchWordDetails(word, forceFetch = false) {
    if (!forceFetch) {
        const cached = await DB.getWord(word);
        if (cached) return cached;
    }
    const locale = getLocaleMeta();
    const targetLang = `${locale.name} (${locale.inLocal})`;
    const prompt = `Explain "${word}" for TOEIC in ${targetLang}. 
    Output JSON ONLY:
    {
      "word": "${word}",
      "pos": "part of speech",
      "ipa": "IPA",
      "def": "Definition",
      "ex": "English example",
      "ex_zh": "Translation",
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
    let structure = part === 5 
        ? `[{"q":"..","opts":[".."],"ans":0,"exp":"..","trans":".."}]`
        : `[{"txt":"..","qs":[{"q":"..","opts":[".."],"ans":0,"exp":"..","trans":".."}]}]`;
    const prompt = `TOEIC Part ${part}, score ${score}. Lang: ${targetLang}. JSON: ${structure}`;
    return fetchJsonFromPrompt(TEXT_MODEL, prompt);
}