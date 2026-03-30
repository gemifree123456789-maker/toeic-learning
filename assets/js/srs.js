// SRS (Spaced Repetition System) review: quiz generation, scoring, level updates.

import { ICONS, SRS_INTERVALS, SRS_MAX_WORDS, getNextReviewTime } from './state.js';
import { DB } from './db.js';
import { shuffleArray } from './utils.js';
import { t } from './i18n.js';

let _onFinish = null;
export function setOnFinish(fn) { _onFinish = fn; }

const srsState = { active: false, words: [], allWords: [], questions: [], currentQ: 0, results: {}, answered: false };

/* =========================================
   智慧排版引擎：處理衍生字的換行與逗號
   ========================================= */
function formatDerivText(text) {
    let tStr = String(text || '').trim();
    if (!tStr) return '';
    if (tStr.includes('\n')) return tStr;
    return tStr.replace(/\), ?/g, ')\n');
}

/* =========================================
   🎧 TOEIC 隨機口音引擎 (支援美、英、澳、加等口音 - 排除搞怪音)
   ========================================= */
function getRandomToeicVoice() {
    const voices = speechSynthesis.getVoices();
    
    // 蘋果 iOS/macOS 內建的搞怪/特效語音黑名單
    const jokeVoices = [
        'Albert', 'Bad News', 'Bahh', 'Bells', 'Boing', 'Bubbles', 
        'Cellos', 'Deranged', 'Good News', 'Hysterical', 'Junior', 
        'Pipe Organ', 'Princess', 'Trinoids', 'Whisper', 'Zarvox', 
        'Fred', 'Ralph', 'Superstar'
    ];

    // 過濾出英文系國家口音，且「不包含」在黑名單中的正常人類語音
    const englishVoices = voices.filter(v => {
        const isEnglish = v.lang.startsWith('en');
        const isJoke = jokeVoices.some(joke => v.name.includes(joke));
        return isEnglish && !isJoke;
    });

    if (englishVoices.length > 0) {
        // 亂數抽取一個正常口音
        return englishVoices[Math.floor(Math.random() * englishVoices.length)];
    }
    return null;
}

function playRandomAccent(text) {
    if (!text) return;
    speechSynthesis.cancel(); // 停止目前正在播放的語音
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = getRandomToeicVoice();
    if (voice) utterance.voice = voice;
    speechSynthesis.speak(utterance);
}
// 綁定到全域供 HTML onclick 點擊事件呼叫
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
        const r = srsState.results[word.id];
        const cc = [r.en2zh, r.zh2en, r.listen].filter(Boolean).length;
        totalCorrect += cc;
        const allCorrect = cc === 3;
        let newLevel = word.level;
        if (allCorrect) newLevel = Math.min(word.level + 1, SRS_INTERVALS.length - 1);
        else newLevel = Math.max(word.level - 1, 0);
        const newNext = getNextReviewTime(newLevel);
        await DB.updateWordSRS(word.id, newLevel, newNext);
        wordResults.push({ word, oldLevel: word.level, newLevel, cc, nextDate: new Date(newNext).toLocaleDateString() });
    }
    
    srsState.active = false;
    const total = srsState.words.length * 3;
    qArea.innerHTML = `<div class="srs-result-score">${totalCorrect}/${total}</div><div class="srs-result-label">${t('srsCorrectCount')}</div>`;
    oArea.innerHTML = '';
    
    wordResults.forEach(wr => {
        const diff = wr.newLevel - wr.oldLevel;
        let cls = 'same', txt = `Lv.${wr.oldLevel}`;
        if (diff > 0) { cls = 'up'; txt = `Lv.${wr.oldLevel} → ${wr.newLevel}`; }
        else if (diff < 0) { cls = 'down'; txt = `Lv.${wr.oldLevel} → ${wr.newLevel}`; }

        const item = document.createElement('div');
        item.className = 'srs-result-item';

        const main = document.createElement('div');
        main.className = 'srs-result-main';

        const wordRow = document.createElement('div');
        wordRow.className = 'srs-result-word-row';

        const wordEl = document.createElement('div');
        wordEl.className = 'srs-result-word';
        wordEl.textContent = toLowerWord(wr.word.en);

        const posText = wr.word.pos?.trim();
        const posEl = document.createElement('span');
        posEl.className = 'vocab-pos';
        posEl.textContent = posText || '';

        const ipaText = wr.word.ipa?.trim();
        const ipaEl = document.createElement('span');
        ipaEl.className = 'vocab-ipa';
        ipaEl.textContent = ipaText || '';

        const speakBtn = document.createElement('button');
        speakBtn.type = 'button';
        speakBtn.className = 'mini-speaker srs-result-speaker';
        speakBtn.innerHTML = ICONS.speaker;
        speakBtn.dataset.speak = toLowerWord(wr.word.en);

        const meta = document.createElement('small');
        meta.className = 'srs-result-meta';
        meta.innerHTML = `${wr.word.zh} <span class="review-date-meta">· ${t('srsNextReview', { date: wr.nextDate })}</span>`;

        const exRow = document.createElement('div');
        exRow.className = 'srs-result-ex-row';
        const exText = wr.word.ex?.trim() || '';
        
        const ex = document.createElement('div');
        ex.className = 'srs-result-ex';
        ex.textContent = exText || '暫無英文例句';
        if (!exText) ex.style.color = '#9ca3af'; 
        exRow.appendChild(ex);

        if (exText) {
            const exSpeakBtn = document.createElement('button');
            exSpeakBtn.type = 'button';
            exSpeakBtn.className = 'mini-speaker srs-result-speaker srs-result-ex-speaker';
            exSpeakBtn.innerHTML = ICONS.speaker;
            exSpeakBtn.dataset.speak = exText;
            exRow.appendChild(exSpeakBtn);
        }

        const exZhText = wr.word.ex_zh?.trim() || '';
        const exZh = document.createElement('div');
        exZh.className = 'srs-result-ex-zh';
        exZh.textContent = exZhText || '(暫無中文翻譯)';
        if (!exZhText) exZh.style.color = '#9ca3af';

        const derivText = formatDerivText(wr.word.deriv || wr.word.derivatives);
        const derivDiv = document.createElement('div');
        if (derivText) {
            derivDiv.style.cssText = 'font-size:12px; color:#4b5563; background:#f3f4f6; padding:6px; border-radius:4px; margin-top:8px; line-height:1.4; white-space: pre-wrap;';
            derivDiv.innerHTML = `💡 <b>衍生字：</b>\n${derivText}`;
        }

        wordRow.appendChild(wordEl);
        if (posText) wordRow.appendChild(posEl);
        if (ipaText) wordRow.appendChild(ipaEl);
        wordRow.appendChild(speakBtn);
        
        main.appendChild(wordRow);
        main.appendChild(meta);
        main.appendChild(exRow); 
        main.appendChild(exZh);  
        if (derivText) main.appendChild(derivDiv);

        const statusArea = document.createElement('div');
        statusArea.style.display = 'flex';
        statusArea.style.flexDirection = 'column';
        statusArea.style.alignItems = 'flex-end';
        statusArea.style.gap = '8px';

        const status = document.createElement('div');
        status.className = `srs-result-status ${cls}`;
        status.textContent = `${wr.cc}/3 ${txt}`;

        const starBtn = document.createElement('button');
        starBtn.innerHTML = '⭐ 標記不熟';
        starBtn.style.cssText = 'background:none; border:1px solid #d1d5db; color:#4b5563; border-radius:12px; padding:2px 8px; font-size:11px; cursor:pointer; display:flex; align-items:center; gap:4px; transition: all 0.2s; white-space: nowrap;';
        
        starBtn.onclick = async () => {
            const resetLevel = 0;
            const resetNext = getNextReviewTime(resetLevel); 
            
            await DB.updateWordSRS(wr.word.id, resetLevel, resetNext);
            
            starBtn.innerHTML = '🌟 已降級';
            starBtn.style.background = '#fef3c7';
            starBtn.style.borderColor = '#fbbf24';
            starBtn.style.color = '#b45309';
            starBtn.disabled = true;
            status.textContent = `${wr.cc}/3 Lv.${wr.oldLevel} → 0`;
            status.className = 'srs-result-status down';
            meta.innerHTML = `${wr.word.zh} <span class="review-date-meta">· ${t('srsNextReview', { date: new Date(resetNext).toLocaleDateString() })}</span>`;
        };

        statusArea.appendChild(status);
        statusArea.appendChild(starBtn);

        item.appendChild(main);
        item.appendChild(statusArea);
        oArea.appendChild(item);
    });

    oArea.querySelectorAll('.srs-result-speaker').forEach(btn => {
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