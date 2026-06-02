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
                generationConfig: { 
                    responseMimeType: "application/json",
                    responseModalities: ["TEXT"] // 強制安全純文字模式
                }
            })
        });

        if (response.status === 429) {
            if (i === retries - 1) throw new Error('伺服器忙碌中 (429)，請稍後再試');
            await new Promise(r => setTimeout(r, 1000 * (i + 1)));
            continue;
        }
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return parseJsonCandidateText(ensureCandidateText(data));
    }
}

// 獲取單字聯想特訓
export async function fetchVocabAIContext(vocabText, definition) {
    const locale = getLocaleMeta();
    const targetLang = `${locale.name} (${locale.inLocal})`;
    
    const prompt = `You are a TOEIC master coach. Analyze the word "${vocabText}" (Definition: ${definition}).
    Generate 3 distinct items based on this word.
    Output STRICT JSON ONLY matching this format:
    {
      "situations": [
        {
          "title": "Short Business Situation Title (e.g., Shipping Delay)",
          "passage": "A 2-3 sentence realistic TOEIC-style business passage utilizing the word naturally.",
          "translation": "Accurate professional translation into ${targetLang}."
        }
      ]
    }
    Generate exactly 3 items. Do not include markdown code blocks outside JSON.`;

    return fetchJsonFromPrompt(TEXT_MODEL, prompt);
}

// 獲取單字解析與例句
export async function fetchVocabExplanation(word) {
    const locale = getLocaleMeta();
    const targetLang = `${locale.name} (${locale.inLocal})`;

    const prompt = `You are a TOEIC vocabulary dictionary. Analyze the word/phrase: "${word}".
    Provide the part of speech, accurate definition in ${targetLang}, a high-quality TOEIC-style example sentence, and its translation.
    Output STRICT JSON ONLY matching this format:
    {
      "partOfSpeech": "n. / v. / adj. / adv. / ph.",
      "definition": "Definition in ${targetLang}",
      "example": "TOEIC-style example sentence.",
      "exampleTranslation": "Translation of example in ${targetLang}"
    }`;

    return fetchJsonFromPrompt(TEXT_MODEL, prompt);
}

// 獲取綜合測驗與練習題解析
export async function fetchQuestionExplanation(qData, userAnswer, isCorrect) {
    const locale = getLocaleMeta();
    const targetLang = `${locale.name} (${locale.inLocal})`;

    const prompt = `You are an expert TOEIC tutor. Explain this question to a student who wants a high score.
    Question details:
    - Passage/Context: ${qData.passage || 'None'}
    - Question: ${qData.question}
    - Options: ${JSON.stringify(qData.options)}
    - Correct Answer: ${qData.answerKey}
    - User selected: ${userAnswer} (Is Correct: ${isCorrect})

    Provide a concise breakdown explaining why the correct answer is right, why the other major distractors are wrong, and key vocabulary/grammar points.
    Output STRICT JSON ONLY matching this format:
    {
      "analysis": "Grammar/context analysis in ${targetLang}.",
      "distractors": "Explanation of wrong options in ${targetLang}.",
      "keyPoints": ["Point 1 in ${targetLang}", "Point 2 in ${targetLang}"]
    }`;

    return fetchJsonFromPrompt(TEXT_MODEL, prompt);
}

// 獲取主題關鍵字
export async function fetchTopicKeywords(topic) {
    const locale = getLocaleMeta();
    const targetLang = `${locale.name} (${locale.inLocal})`;

    const prompt = `You are a TOEIC vocabulary planner. Generate 8 highly relevant core business vocabulary words or phrases related to the topic: "${topic}".
    Output STRICT JSON ONLY matching this format:
    {
      "keywords": [
        { "word": "word1", "def": "definition in ${targetLang}" },
        { "word": "word2", "def": "definition in ${targetLang}" }
      ]
    }
    Generate exactly 8 keywords. No markdown format blocks outside JSON.`;

    return fetchJsonFromPrompt(TEXT_MODEL, prompt);
}

// 產出 5, 6, 7 閱讀特訓題目
export async function fetchAIPart567(part, score) {
    const locale = getLocaleMeta();
    const targetLang = `${locale.name} (${locale.inLocal})`;

    let prompt = `You are an expert TOEIC tutor. Generate a practice set for TOEIC Part ${part} targeting a score of ${score} (500-900).\\n`;

    if (part === '5') {
        prompt += `Generate exactly 5 Incomplete Sentences questions.\\n`;
    } else if (part === '6') {
        prompt += `Generate 1 Text Completion passage (Email/Memo/Notice) with exactly 4 questions. Use placeholders like [1], [2], [3], [4] in the passage.\\n`;
    } else if (part === '7') {
        prompt += `Generate 1 Reading Comprehension single passage with 3-4 questions.\\n`;
    }

    prompt += `Output STRICT JSON ONLY matching this format:
    {
      "passage": "Full passage text here with <br> for newlines. Leave empty string for Part 5.",
      "questions": [
        {
          "question": "Question text here. For Part 6, use 'Choose the best answer for blank [1].'",
          "options": [
            {"key": "A", "text": "option A text"},
            {"key": "B", "text": "option B text"},
            {"key": "C", "text": "option C text"},
            {"key": "D", "text": "option D text"}
          ],
          "answerKey": "A",
          "explanation": "Brief explanation in ${targetLang}."
        }
      ]
    }`;

    return fetchJsonFromPrompt(TEXT_MODEL, prompt);
}