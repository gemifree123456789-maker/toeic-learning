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

// 帶有快速退避的高階自動重試機制 (已切除 15 秒延遲)
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
            if (i === retries - 1) {
                throw new Error("HTTP_429"); // 快速拋出錯誤代碼給外層處理
            }
            // 極短暫退避：只等 2 秒就重試，不再傻等 15 秒
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
    const topicLine = customTopic
        ? `about "${customTopic}" suitable for this level.`
        : `about one random TOEIC-friendly scenario from this range: office communication, meetings, email updates, travel arrangements, customer service, logistics and shipping, human resources, marketing campaigns, product launches, scheduling conflicts, workplace problem-solving, announcements, and professional daily-life errands.`;
    
    const prompt = `
        You are a strict TOEIC tutor. Target Score: ${score}.
        Task: Generate a SHORT reading comprehension passage (approx 60-80 words, 30 seconds reading time) ${topicLine}
        Output JSON strictly:
        {
            "segments": [{"en": "Sentence 1 English", "zh": "Sentence 1 ${targetLang} translation"}],
            "vocabulary": [{"word": "word", "pos": "v.", "ipa": "/ipa/", "category": "Business/Legal/Finance/Marketing/HR/Tech/Travel/Life/Other", "def": "${targetLang} definition", "ex": "English example sentence ONLY (No translation, No special symbols)", "ex_zh": "${targetLang} translation of the example sentence"}],
            "phrases": [{"phrase": "phrase from passage", "meaning": "${targetLang} meaning", "explanation": "Brief ${targetLang} explanation", "example": "English example sentence", "example_zh": "${targetLang} translation of the example sentence"}]
        }
        For "phrases": pick 2-3 commonly used phrases from the passage. Return ONLY raw JSON.
    `;
    return fetchJsonFromPrompt(TEXT_MODEL, prompt);
}

// 替換這整個函數，加入 forceFetch 參數以安全繞過舊資料
export async function fetchWordDetails(word, forceFetch = false) {
    if (!forceFetch) {
        const cached = await DB.getWord(word);
        if (cached) return cached;
    }
    const locale = getLocaleMeta();
    const targetLang = `${locale.name} (${locale.inLocal})`;
    
    const prompt = `Explain the word "${word}" for a TOEIC student. Keep it concise like a vocabulary card. Output JSON strictly: {"word":"${word}","pos":"part of speech (e.g. n./v./adj.)","ipa":"IPA symbol","category":"Business/Legal/Finance/Marketing/HR/Tech/Travel/Life/Other","def":"Brief ${targetLang} definition (one short phrase)","ex":"One simple short English example sentence.","ex_zh":"${targetLang} translation of the example sentence","derivatives":"Comma-separated list of word family derivatives with their POS and brief ${targetLang} meaning, e.g. official (adj. 官方的), officially (adv. 官方地). If none, leave empty string."}`;
    
    const result = await fetchJsonFromPrompt(TEXT_MODEL, prompt);
    await DB.setWord(word, result);
    return result;
}

export async function validateWordWithLanguageTool(word) {
    const query = String(word || '').trim();
    if (!query) {
        return { ok: false, reason: 'empty', message: 'Empty word' };
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
        const body = new URLSearchParams();
        body.set('text', query);
        body.set('language', 'en-US');
        const response = await fetch('https://api.languagetool.org/v2/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body.toString(),
            signal: controller.signal
        });
        if (!response.ok) {
            return { ok: false, reason: 'service_unavailable', message: `LanguageTool HTTP ${response.status}` };
        }
        const data = await response.json();
        const matches = Array.isArray(data?.matches) ? data.matches : [];
        const typoMatches = matches.filter((item) => {
            const ruleId = String(item?.rule?.id || '').toUpperCase();
            return ruleId.includes('MORFOLOGIK')
                || ruleId.includes('SPELL')
                || ruleId.includes('TYP')
                || ruleId.includes('MISSPELL');
        });
        if (!typoMatches.length) return { ok: true, reason: 'ok', suggestions: [] };
        const suggestions = [];
        typoMatches.forEach((item) => {
            const replacements = Array.isArray(item?.replacements) ? item.replacements : [];
            replacements.forEach((rep) => {
                const v = String(rep?.value || '').trim();
                if (!v) return;
                if (!suggestions.includes(v)) suggestions.push(v);
            });
        });
        return { ok: false, reason: 'spelling', suggestions: suggestions.slice(0, 5) };
    } catch (error) {
        const message = error?.name === 'AbortError'
            ? 'LanguageTool timeout'
            : (error?.message || 'LanguageTool request failed');
        return { ok: false, reason: 'service_unavailable', message };
    } finally {
        clearTimeout(timeoutId);
    }
}

function normalizeExamQuestion(category, item, idx) {
    const rawOptions = Array.isArray(item.options) ? item.options.slice(0, 4) : [];
    const options = rawOptions.map((option, optionIndex) => {
        const fallbackKey = ['A', 'B', 'C', 'D'][optionIndex] || `O${optionIndex + 1}`;
        if (typeof option === 'object' && option !== null) {
            return {
                key: String(option.key || fallbackKey).trim().toUpperCase(),
                text: String(option.text || option.label || option.value || fallbackKey).trim()
            };
        }
        const text = String(option || '').trim();
        const parsed = text.match(/^([A-D])[\s.)\-:]+(.+)$/i);
        if (parsed) {
            return { key: parsed[1].toUpperCase(), text: parsed[2].trim() };
        }
        if (/^[A-D]$/i.test(text)) {
            return { key: text.toUpperCase(), text: text.toUpperCase() };
        }
        return { key: fallbackKey, text: text || fallbackKey };
    });
    const providedAnswerKey = String(item.answerKey || '').trim().toUpperCase();
    const legacyAnswer = String(item.answer || '').trim();
    const matchedByKey = options.find((opt) => opt.key === providedAnswerKey);
    const matchedLegacyKey = options.find((opt) => opt.key === legacyAnswer.toUpperCase());
    const matchedByText = options.find((opt) => opt.text === legacyAnswer);
    const answerKey = matchedByKey?.key || matchedLegacyKey?.key || matchedByText?.key || options[0]?.key || 'A';
    const answerText = options.find((opt) => opt.key === answerKey)?.text || '';
    return {
        id: item.id || `${category}-${idx + 1}`,
        category,
        question: item.question || '',
        passage: item.passage || '',
        options,
        answerKey,
        answerText,
        answer: item.answer || answerKey,
        audioText: item.audioText || '',
        explanationSeed: item.explanationSeed || ''
    };
}

function normalizeExamOutput(raw) {
    const listening = (Array.isArray(raw?.listening) ? raw.listening : [])
        .slice(0, 3)
        .map((item, idx) => normalizeExamQuestion('listening', item, idx));

    const vocab = (Array.isArray(raw?.vocabulary) ? raw.vocabulary : [])
        .slice(0, 3)
        .map((item, idx) => normalizeExamQuestion('vocabulary', item, idx));

    const grammar = (Array.isArray(raw?.grammar) ? raw.grammar : [])
        .slice(0, 3)
        .map((item, idx) => normalizeExamQuestion('grammar', item, idx));

    let readingQuestions = [];
    if (Array.isArray(raw?.reading) && raw.reading.length) {
        readingQuestions = raw.reading.map((q, idx) => ({
            ...q,
            id: q.id || `reading-${idx + 1}`,
            passage: q.passage || ''
        }));
    } else if (Array.isArray(raw?.readingQuestions) && raw?.readingPassage) {
        readingQuestions = raw.readingQuestions.map((q, idx) => ({
            ...q,
            passage: raw.readingPassage,
            id: q.id || `reading-${idx + 1}`
        }));
    }
    const reading = readingQuestions.slice(0, 3).map((item, idx) => normalizeExamQuestion('reading', item, idx));

    return { listening, reading, vocabulary: vocab, grammar };
}

export async function fetchExamQuestions(score) {
    const locale = getLocaleMeta();
    const targetLang = `${locale.name} (${locale.inLocal})`;
    const prompt = `
        You are a TOEIC mock exam generator.
        Target score: ${score}.
        Output STRICT JSON only with this shape:
        {
          "listening": [{"id":"L1","question":"...","audioText":"text to speak","options":[{"key":"A","text":"..."},{"key":"B","text":"..."},{"key":"C","text":"..."},{"key":"D","text":"..."}],"answerKey":"A","explanationSeed":"..."}],
          "reading": [{"id":"R1","passage":"...","question":"...","options":[{"key":"A","text":"..."},{"key":"B","text":"..."},{"key":"C","text":"..."},{"key":"D","text":"..."}],"answerKey":"A","explanationSeed":"..."}],
          "vocabulary": [{"id":"V1","question":"...","options":[{"key":"A","text":"..."},{"key":"B","text":"..."},{"key":"C","text":"..."},{"key":"D","text":"..."}],"answerKey":"A","explanationSeed":"..."}],
          "grammar": [{"id":"G1","question":"...","options":[{"key":"A","text":"..."},{"key":"B","text":"..."},{"key":"C","text":"..."},{"key":"D","text":"..."}],"answerKey":"A","explanationSeed":"..."}]
        }
        Rules:
        - listening must have exactly 3 questions.
        - reading must have exactly 3 items.
        - Each reading item must include its own complete "passage" and one related question.
        - Do not reuse the same reading passage for all 3 items.
        - vocabulary must have exactly 3 questions.
        - grammar must have exactly 3 questions.
        - Questions should match target score difficulty.
        - options must contain meaningful English option text, not only letters.
        - answerKey must be exactly one option key from options.
        - Use ${targetLang} for explanations if needed, but question can be English.
        - Return raw JSON only.
    `;
    const raw = await fetchJsonFromPrompt(TEXT_MODEL, prompt);
    return normalizeExamOutput(raw);
}

export async function fetchExamWrongAnswerExplanations(payload) {
    const locale = getLocaleMeta();
    const targetLang = `${locale.name} (${locale.inLocal})`;
    const prompt = `
        You are a TOEIC teacher. Explain each wrong answer one by one.
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