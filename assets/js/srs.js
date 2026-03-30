// SRS (Spaced Repetition System) review: quiz generation, scoring, level updates.

import { ICONS, SRS_INTERVALS, SRS_MAX_WORDS, getNextReviewTime } from './state.js';
import { DB } from './db.js';
import { shuffleArray } from './utils.js';
import { t } from './i18n.js';

let _onFinish = null;
export function setOnFinish(fn) { _onFinish = fn; }

const srsState = { active: false, words: [], allWords: [], questions: [], currentQ: 0, results: {}, answered: false };

/* =========================================
   智慧排版引擎
   ========================================= */
function formatDerivText(text) {
    let tStr = String(text || '').trim();
    if (!tStr) return '';
    tStr = tStr.replace(/<br\s*\/?>/gi, '\n');
    if (tStr.includes('\n')) return tStr;
    return tStr.replace(/\), ?/g, ')\n');
}

/* =========================================
   🎧 TOEIC 隨機口音引擎 (終極嚴格版 - 徹底排除外星人)
   ========================================= */
function getRandomToeicVoice() {
    const voices = speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;
    
    const jokeVoices = [
        'albert', 'bad news', 'bahh', 'bells', 'boing', 'bubbles', 
        'cellos', 'deranged', 'good news', 'hysterical', 'junior', 
        'pipe organ', 'princess', 'trinoids', 'whisper', 'zarvox', 
        'fred', 'ralph', 'superstar', 'jester', 'organ', 'kathy', 'novelty'
    ];

    const englishVoices = voices.filter(v => {
        if (!v.lang.startsWith('en')) return false;
        const nameLower = String(v.name).toLowerCase();
        const uriLower = String(v.voiceURI || '').toLowerCase();
        return !jokeVoices.some(joke => nameLower.includes(joke) || uriLower.includes(joke));
    });

    if (englishVoices.length > 0) return englishVoices[Math.floor(Math.random() * englishVoices.length)];
    return null;
}

function playRandomAccent(text) {
    if (!text) return;
    speechSynthesis.cancel(); 
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = getRandomToeicVoice();
    if (voice) utterance.voice = voice;
    speechSynthesis.speak(utterance);
}
window.playRandomAccent = playRandomAccent; 

function playRandomAccentPromise(text) {
    return new Promise(resolve => {
        if (!text) return resolve();
        speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const voice = getRandomToeicVoice();
        if (voice) utterance.voice = voice;
        utterance.onend = resolve;
        utterance.onerror = resolve;
        speechSynthesis.speak(utterance);
    });
}

/* =========================================
   輔助與測驗產生邏輯
   ========================================= */
function toLowerWord(word) {
    return String(word || '').trim().toLowerCase();
}

function getDistractors(correctWord, allWords, field) {
    return shuffleArray(allWords.filter(w => w.id !== correctWord.id)).slice(0, 2).map(w => w[field]);
}

export function startSrsReview(dueWords, allWords) {
    const selected = shuffleArray(dueWords).slice(0, SRS_MAX_WORDS);
    let questions = [];
    selected.forEach(w => {
        questions.push({ word: w, type: 'en2zh' });
        questions.push({ word: w, type: 'zh2en' });
        questions.push({ word: w, type: Math.random() < 0.5 ? 'listen' : 'listen3' });
    });
    questions = shuffleArray(questions);

    srsState.active = true;
    srsState.words = selected;
    srsState.allWords = allWords;
    srsState.questions = questions;
    srsState.currentQ = 0;
    srsState.answered = false;
    srsState.results = {};
    selected.forEach(w => { srsState.results[w.id] = { en2zh: null, zh2en: null, listen: null }; });
    document.getElementById('srsOverlay').classList.remove('hidden');
    renderSrsQuestion();
}

export function closeSrsReview() {
    if (srsState.active && !confirm(t('srsLeaveConfirm'))) return;
    srsState.active = false;
    document.getElementById('srsOverlay').classList.add('hidden');
}

function renderSrsQuestion() {
    const q = srsState.questions[srsState.currentQ];
    const word = q.word;
    const qArea = document.getElementById('srsQuestionArea');
    const oArea = document.getElementById('srsOptionsArea');
    document.getElementById('srsProgressText').textContent = `${srsState.currentQ + 1} / ${srsState.questions.length}`;
    const typeLabels = {
        en2zh: t('srsTypeEnToZh'),
        zh2en: t('srsTypeZhToEn'),
        listen: t('srsTypeListening'),
        listen3: t('srsTypeListening')
    };
    document.getElementById('srsPhaseBadge').textContent = typeLabels[q.type];
    srsState.answered = false;
    qArea.innerHTML = ''; oArea.innerHTML = '';

    const enLower = toLowerWord(word.en);
    const safeEn = enLower.replace(/'/g, "\\'");

    if (q.type === 'en2zh') {
        qArea.innerHTML = `<div class="srs-question-hint">${t('srsHintEnToZh')}</div><div class="srs-question-word">${enLower} <button class="mini-speaker" onclick="playRandomAccent('${safeEn}')">${ICONS.speaker}</button></div>`;
        setTimeout(() => playRandomAccent(enLower), 300);
        const opts = shuffleArray([word.zh, ...getDistractors(word, srsState.allWords, 'zh')]);
        opts.forEach(o => { const b = document.createElement('button'); b.className = 'srs-option'; b.textContent = o; b.onclick = () => handleSrsAnswer(b, o, word.zh, q.type); oArea.appendChild(b); });
    } else if (q.type === 'zh2en') {
        qArea.innerHTML = `<div class="srs-question-hint">${t('srsHintZhToEn')}</div><div class="srs-question-word">${word.zh}</div>`;
        const correctEn = toLowerWord(word.en);
        const opts = shuffleArray([correctEn, ...getDistractors(word, srsState.allWords, 'en').map(toLowerWord)]);
        opts.forEach(o => { const b = document.createElement('button'); b.className = 'srs-option'; b.textContent = o; b.onclick = () => handleSrsAnswer(b, o, correctEn, q.type); oArea.appendChild(b); });
    } else if (q.type === 'listen') {
        qArea.innerHTML = `<div class="srs-question-hint">${t('srsHintListenToZh')}</div><button class="srs-listen-btn" id="srsListenBtn">${ICONS.speaker}</button><div class="srs-reveal-word hidden" id="srsRevealWord"></div>`;
        document.getElementById('srsListenBtn').onclick = () => playRandomAccent(enLower);
        setTimeout(() => playRandomAccent(enLower), 300);
        const opts = shuffleArray([word.zh, ...getDistractors(word, srsState.allWords, 'zh')]);
        opts.forEach(o => { const b = document.createElement('button'); b.className = 'srs-option'; b.textContent = o; b.onclick = () => handleSrsAnswer(b, o, word.zh, q.type); oArea.appendChild(b); });
    } else if (q.type === 'listen3') {
        const distractorWords = shuffleArray(srsState.allWords.filter(w => w.id !== word.id)).slice(0, 2);
        const choices = shuffleArray([
            { en: toLowerWord(word.en), isCorrect: true },
            { en: toLowerWord(distractorWords[0]?.en || 'example'), isCorrect: false },
            { en: toLowerWord(distractorWords[1]?.en || 'sample'), isCorrect: false }
        ]);
        const labels = ['A', 'B', 'C'];
        const correctLabel = labels[choices.findIndex(c => c.isCorrect)];

        qArea.innerHTML = `<div class="srs-question-hint">${t('srsHintListenToEn')}</div><div class="srs-question-word">${word.zh}</div><div class="srs-reveal-word hidden" id="srsRevealWord"></div><div class="srs-listen3-container">${choices.map((c, i) => `<div class="srs-listen3-item"><button class="srs-listen3-btn" data-label="${labels[i]}" data-word="${c.en.replace(/"/g, '&quot;')}">${ICONS.speaker}</button><div class="srs-listen3-label">${labels[i]}</div></div>`).join('')}</div>`;

        qArea.querySelectorAll('.srs-listen3-btn').forEach(btn => {
            btn.onclick = () => playRandomAccent(btn.dataset.word);
        });

        async function autoPlaySequence() {
            for (const c of choices) {
                await playRandomAccentPromise(c.en);
                await new Promise(r => setTimeout(r, 400));
            }
        }
        setTimeout(() => autoPlaySequence(), 400);

        oArea.innerHTML = '';
        labels.forEach((label) => {
            const b = document.createElement('button');
            b.className = 'srs-option';
            b.textContent = `${label}`;
            b.onclick = () => handleSrsAnswer(b, label, correctLabel, q.type);
            oArea.appendChild(b);
        });

        srsState._listen3Choices = choices;
        srsState._listen3CorrectLabel = correctLabel;
    }
}

function handleSrsAnswer(btnEl, selected, correct, type) {
    if (srsState.answered) return;
    srsState.answered = true;
    const word = srsState.questions[srsState.currentQ].word;
    const isCorrect = selected === correct;
    const resultType = (type === 'listen3') ? 'listen' : type;
    srsState.results[word.id][resultType] = isCorrect;
    document.querySelectorAll('.srs-option').forEach(b => { b.classList.add('disabled'); if (b.textContent === correct) b.classList.add('correct'); });
    if (!isCorrect) btnEl.classList.add('wrong');

    const revealEl = document.getElementById('srsRevealWord');
    if ((type === 'listen' || type === 'listen3') && revealEl) {
        revealEl.textContent = toLowerWord(word.en);
        revealEl.classList.remove('hidden');
    }

    playRandomAccent(toLowerWord(word.en));
    const delay = isCorrect ? 1200 : 2000;
    setTimeout(() => { srsState.currentQ++; if (srsState.currentQ >= srsState.questions.length) showSrsResults(); else renderSrsQuestion(); }, delay);
}

async function showSrsResults() {
    const qArea = document.getElementById('srsQuestionArea');
    const oArea = document.getElementById('srsOptionsArea');
    document.getElementById('srsProgressText').textContent = t('srsDone');
    document.getElementById('srsPhaseBadge').textContent = t('srsResult');
    let totalCorrect = 0;
    const wordResults = [];
    
    for (const word of srsState.words) {
        // 🌟 核心防護：強迫系統去資料庫重抓一次這顆單字，保證拿到最新、剛洗好的資料
        const freshWord = await DB.getSavedWord(word.id) || word;

        const r = srsState.results[word.id];
        const cc = [r.en2zh, r.zh2en, r.listen].filter(Boolean).length;
        totalCorrect += cc;
        const allCorrect = cc === 3;
        let newLevel = freshWord.level;
        
        if (allCorrect) newLevel = Math.min(freshWord.level + 1, SRS_INTERVALS.length - 1);
        else newLevel = Math.max(freshWord.level - 1, 0);
        
        const newNext = getNextReviewTime(newLevel);
        await DB.updateWordSRS(freshWord.id, newLevel, newNext);
        wordResults.push({ word: freshWord, oldLevel: freshWord.level, newLevel, cc, nextDate: new Date(newNext).toLocaleDateString() });
    }
    
    srsState.active = false;
    const total = srsState.words.length * 3;
    qArea.innerHTML = `<div class="srs-result-score">${totalCorrect}/${total}</div><div class="srs-result-label">${t('srsCorrectCount')}</div>`;
    oArea.innerHTML = '';
    
    wordResults.forEach(wr => {
        const freshWord = wr.word;
        const diff = wr.newLevel - wr.oldLevel;
        let cls = 'same', txt = `Lv.${wr.oldLevel}`;
        if (diff > 0) { cls = 'up'; txt = `Lv.${wr.oldLevel} → ${wr.newLevel}`; }
        else if (diff < 0) { cls = 'down'; txt = `Lv.${wr.oldLevel} → ${wr.newLevel}`; }

        const item = document.createElement('div');
        item.className = 'srs-result-item';
        
        // 🌟 100% 複製單字本的排版與 CSS 邏輯
        item.style.cssText = 'background: #fff; border-radius: 12px; padding: 16px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); position: relative;';

        const displayEn = toLowerWord(freshWord.en);
        const posText = freshWord.pos?.trim() || '';
        const ipaText = freshWord.ipa?.trim() || '';
        const catText = freshWord.cat?.trim() || freshWord.category?.trim() || '';
        const zhText = freshWord.zh?.trim() || freshWord.def?.trim() || '';
        
        const exText = freshWord.ex?.trim() || '';
        const exZhText = freshWord.ex_zh?.trim() || '';
        
        const rawDeriv = freshWord.deriv?.trim() || freshWord.derivatives?.trim() || '';
        const derivText = formatDerivText(rawDeriv);
        
        let derivHtml = '';
        if (derivText) {
            derivHtml = `<div style="font-size:13px; color:#4b5563; background:#f3f4f6; padding:8px; border-radius:6px; margin-top:8px; margin-bottom:12px; line-height:1.5; white-space: pre-wrap;">💡 <b>衍生字：</b>\n${derivText}</div>`;
        } else {
            derivHtml = `<div style="font-size:13px; color:#9ca3af; background:#f3f4f6; padding:8px; border-radius:6px; margin-top:8px; margin-bottom:12px; line-height:1.5;">💡 <b>衍生字：</b> (暫無資料)</div>`;
        }

        const exColor = exText ? '#374151' : '#9ca3af';
        const exZhColor = exZhText ? '#6b7280' : '#9ca3af';

        // 將 HTML 結構寫死成跟 vocab.js 的 lookup card 一模一樣
        item.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                <div class="saved-word-top" style="margin-bottom: 0;">
                    <span class="saved-word-en" style="font-size: 1.15rem; font-weight: 700; color: #111827;">${displayEn}</span>
                </div>
                
                <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 6px;">
                    <div class="srs-result-status ${cls}" style="font-size: 13px; font-weight: 600;">${wr.cc}/3 ${txt}</div>
                    <button class="srs-star-btn" data-id="${freshWord.id}" style="background:none; border:1px solid #d1d5db; color:#4b5563; border-radius:12px; padding:2px 8px; font-size:11px; cursor:pointer; display:flex; align-items:center; gap:4px; transition: all 0.2s; white-space: nowrap;">⭐ 標記不熟</button>
                </div>
            </div>

            <div class="vocab-lookup-meta" style="margin-bottom: 12px; display: flex; align-items: center; flex-wrap: wrap; gap: 8px;">
                ${posText ? `<span class="vocab-pos">${posText}</span>` : ''}
                ${ipaText ? `<span class="vocab-ipa">${ipaText}</span>` : ''}
                ${catText ? `<span style="display:inline-block; background:#eaf4ff; color:#007aff; padding:2px 8px; border-radius:6px; font-size:12px; font-weight:600;">${catText}</span>` : ''}
            </div>
            
            <div class="saved-word-zh" style="font-size: 15px; color: #374151; margin-bottom: 12px; line-height: 1.5;">${zhText}</div>
            
            ${derivHtml}
            
            <div style="font-size:14px; color:${exColor}; margin-bottom:4px; font-style:italic; display: flex; align-items: flex-start; gap: 6px;">
                <span style="flex: 1;">${exText || '暫無英文例句'}</span>
                ${exText ? `<button class="mini-speaker srs-speaker-btn" data-speak="${exText.replace(/"/g, '&quot;')}">${ICONS.speaker}</button>` : ''}
            </div>
            <div style="font-size:13px; color:${exZhColor}; margin-bottom: 12px;">${exZhText || '(暫無中文翻譯)'}</div>
            
            <div style="font-size: 12px; color: #8b5cf6; font-weight: 500; padding-top: 10px; border-top: 1px dashed #e5e7eb; display: flex; align-items: center; justify-content: space-between;">
                <span>⏰ 下次複習：<span class="srs-next-date">${wr.nextDate}</span></span>
                <button class="mini-speaker srs-speaker-btn" data-speak="${displayEn}" style="background: #f3f4f6; padding: 6px; border-radius: 50%;">${ICONS.speaker}</button>
            </div>
        `;

        // 綁定按鈕事件
        const starBtn = item.querySelector('.srs-star-btn');
        starBtn.onclick = async () => {
            const resetLevel = 0;
            const resetNext = getNextReviewTime(resetLevel); 
            await DB.updateWordSRS(freshWord.id, resetLevel, resetNext);
            
            starBtn.innerHTML = '🌟 已降級';
            starBtn.style.background = '#fef3c7';
            starBtn.style.borderColor = '#fbbf24';
            starBtn.style.color = '#b45309';
            starBtn.disabled = true;
            
            item.querySelector('.srs-result-status').textContent = `${wr.cc}/3 Lv.${wr.oldLevel} → 0`;
            item.querySelector('.srs-result-status').className = 'srs-result-status down';
            item.querySelector('.srs-next-date').textContent = new Date(resetNext).toLocaleDateString();
        };

        oArea.appendChild(item);
    });

    oArea.querySelectorAll('.srs-speaker-btn').forEach(btn => {
        btn.onclick = () => playRandomAccent(btn.dataset.speak || '');
    });

    const doneBtn = document.createElement('button');
    doneBtn.type = 'button';
    doneBtn.className = 'srs-done-btn';
    doneBtn.textContent = t('srsDone');
    doneBtn.onclick = () => finishSrsReview();
    oArea.appendChild(doneBtn);
}

export function finishSrsReview() {
    document.getElementById('srsOverlay').classList.add('hidden');
    if (_onFinish) _onFinish();
}