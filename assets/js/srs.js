// SRS (Spaced Repetition System) review: quiz generation, scoring, level updates.

import { ICONS, SRS_INTERVALS, SRS_MAX_WORDS, getNextReviewTime } from './state.js';
import { DB } from './db.js';
import { shuffleArray } from './utils.js';
import { t } from './i18n.js';

let _onFinish = null;
export function setOnFinish(fn) { _onFinish = fn; }

const srsState = { active: false, words: [], allWords: [], questions: [], currentQ: 0, results: {}, answered: false };

function formatDerivText(text) {
    let tStr = String(text || '').trim();
    if (!tStr) return '';
    tStr = tStr.replace(/<br\s*\/?>/gi, '\n');
    if (tStr.includes('\n')) return tStr;
    return tStr.replace(/\), ?/g, ')\n');
}

function normalizeW(w) {
    if (!w) return w;
    return {
        ...w,
        en: w.en || w.word || 'Unknown',
        zh: w.zh || w.def || '(無中文)',
        ipa: w.ipa || w.kk || '',
        pos: w.pos || '',
        cat: w.cat || w.category || '',
        ex: w.ex || w.exEn || '',
        ex_zh: w.ex_zh || w.exZh || '',
        deriv: w.deriv || w.derivatives || ''
    };
}

function getRandomToeicVoice() {
    const voices = speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;
    const jokeVoices = ['albert', 'bad news', 'bahh', 'bells', 'boing', 'bubbles', 'cellos', 'deranged', 'good news', 'hysterical', 'junior', 'pipe organ', 'princess', 'trinoids', 'whisper', 'zarvox', 'fred', 'ralph', 'superstar', 'jester', 'organ', 'kathy', 'novelty'];
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

function toLowerWord(word) { return String(word || '').trim().toLowerCase(); }

function getDistractorWords(correctWord, allWords) {
    return shuffleArray(allWords.filter(w => w.id !== correctWord.id)).slice(0, 2);
}

export function startSrsReview(dueWords, allWords) {
    const normDue = dueWords.map(normalizeW);
    const normAll = allWords.map(normalizeW);
    
    // 🌟 核心升級 1：不再純隨機盲抽。先依照 nextReview (欠最久的) 排序，再切出前 N 個來複習！
    const sortedDue = normDue.sort((a, b) => a.nextReview - b.nextReview);
    // 切出最需要救火的前 10 個字，然後再把它們的順序打亂，增加測驗的新鮮感
    const selected = shuffleArray(sortedDue.slice(0, SRS_MAX_WORDS));
    
    let questions = [];
    selected.forEach(w => {
        questions.push({ word: w, type: 'en2zh' });
        questions.push({ word: w, type: 'zh2en' });
        questions.push({ word: w, type: Math.random() < 0.5 ? 'listen' : 'listen3' });
    });
    questions = shuffleArray(questions);

    srsState.active = true;
    srsState.words = selected;
    srsState.allWords = normAll;
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

function attachSrsPinListener(word) {
    const pinBtn = document.getElementById('srsPinBtn');
    if (pinBtn) {
        pinBtn.onclick = async (e) => {
            e.stopPropagation();
            word.pinned = !word.pinned;
            pinBtn.style.opacity = word.pinned ? '1' : '0.2';
            await DB.addSavedWord(word);
        };
    }
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
    const pinOpacity = word.pinned ? '1' : '0.2';

    if (q.type === 'en2zh') {
        qArea.innerHTML = `<div class="srs-question-hint">${t('srsHintEnToZh')}</div>
        <div class="srs-question-word">
            ${enLower} <button class="mini-speaker" onclick="playRandomAccent('${safeEn}')">${ICONS.speaker}</button>
            <span id="srsPinBtn" style="cursor:pointer; opacity:${pinOpacity}; margin-left:8px; font-size:24px; transition: opacity 0.2s;" title="特別挑選">📌</span>
        </div>`;
        attachSrsPinListener(word);
        setTimeout(() => playRandomAccent(enLower), 300);
        
        const optsData = shuffleArray([word, ...getDistractorWords(word, srsState.allWords)]);
        optsData.forEach(w => { 
            const b = document.createElement('button'); b.className = 'srs-option'; 
            b.innerHTML = `<span style="font-size:16px;">${w.zh}</span>`; 
            const posStr = w.pos ? ` (${w.pos})` : '';
            b.dataset.reveal = `${toLowerWord(w.en)}${posStr}`; 
            b.dataset.isCorrect = (w.id === word.id) ? "true" : "false";
            b.dataset.wordId = w.id; b.dataset.en = toLowerWord(w.en);
            b.onclick = () => { if (!srsState.answered) handleSrsAnswer(b, w.id === word.id, q.type); }; oArea.appendChild(b); 
        });
    } else if (q.type === 'zh2en') {
        qArea.innerHTML = `<div class="srs-question-hint">${t('srsHintZhToEn')}</div>
        <div class="srs-question-word">
            ${word.zh}
            <span id="srsPinBtn" style="cursor:pointer; opacity:${pinOpacity}; margin-left:8px; font-size:24px; transition: opacity 0.2s;" title="特別挑選">📌</span>
        </div>`;
        attachSrsPinListener(word);
        
        const optsData = shuffleArray([word, ...getDistractorWords(word, srsState.allWords)]);
        optsData.forEach(w => { 
            const b = document.createElement('button'); b.className = 'srs-option'; 
            b.innerHTML = `<span style="font-size:16px;">${toLowerWord(w.en)}</span>`; 
            const posStr = w.pos ? ` (${w.pos})` : '';
            b.dataset.reveal = `${w.zh}${posStr}`; 
            b.dataset.isCorrect = (w.id === word.id) ? "true" : "false";
            b.dataset.wordId = w.id; b.dataset.en = toLowerWord(w.en);
            b.onclick = () => { if (!srsState.answered) handleSrsAnswer(b, w.id === word.id, q.type); }; oArea.appendChild(b); 
        });
    } else if (q.type === 'listen') {
        qArea.innerHTML = `<div class="srs-question-hint">${t('srsHintListenToZh')}</div>
        <div style="display:flex; justify-content:center; align-items:center; gap:16px;">
            <button class="srs-listen-btn" id="srsListenBtn" style="margin:0;">${ICONS.speaker}</button>
            <span id="srsPinBtn" style="cursor:pointer; opacity:${pinOpacity}; font-size:28px; transition: opacity 0.2s;" title="特別挑選">📌</span>
        </div>
        <div class="srs-reveal-word hidden" id="srsRevealWord"></div>`;
        attachSrsPinListener(word);
        document.getElementById('srsListenBtn').onclick = () => playRandomAccent(enLower);
        setTimeout(() => playRandomAccent(enLower), 300);
        
        const optsData = shuffleArray([word, ...getDistractorWords(word, srsState.allWords)]);
        optsData.forEach(w => { 
            const b = document.createElement('button'); b.className = 'srs-option'; 
            b.innerHTML = `<span style="font-size:16px;">${w.zh}</span>`; 
            const posStr = w.pos ? ` (${w.pos})` : '';
            b.dataset.reveal = `${toLowerWord(w.en)}${posStr}`; 
            b.dataset.isCorrect = (w.id === word.id) ? "true" : "false";
            b.dataset.wordId = w.id; b.dataset.en = toLowerWord(w.en);
            b.onclick = () => { if (!srsState.answered) handleSrsAnswer(b, w.id === word.id, q.type); }; oArea.appendChild(b); 
        });
    } else if (q.type === 'listen3') {
        const optsData = shuffleArray([word, ...getDistractorWords(word, srsState.allWords)]);
        const labels = ['A', 'B', 'C'];

        qArea.innerHTML = `<div class="srs-question-hint">${t('srsHintListenToEn')}</div>
        <div class="srs-question-word" style="display:flex; justify-content:center; align-items:center;">
            ${word.zh}
            <span id="srsPinBtn" style="cursor:pointer; opacity:${pinOpacity}; margin-left:12px; font-size:24px; transition: opacity 0.2s;" title="特別挑選">📌</span>
        </div>
        <div class="srs-reveal-word hidden" id="srsRevealWord"></div>
        <div class="srs-listen3-container">${optsData.map((c, i) => `<div class="srs-listen3-item"><button class="srs-listen3-btn" data-label="${labels[i]}" data-word="${c.en.replace(/"/g, '&quot;')}">${ICONS.speaker}</button><div class="srs-listen3-label">${labels[i]}</div></div>`).join('')}</div>`;
        attachSrsPinListener(word);

        qArea.querySelectorAll('.srs-listen3-btn').forEach(btn => {
            btn.onclick = () => playRandomAccent(btn.dataset.word);
        });

        async function autoPlaySequence() {
            for (const c of optsData) {
                await playRandomAccentPromise(c.en);
                await new Promise(r => setTimeout(r, 400));
            }
        }
        setTimeout(() => autoPlaySequence(), 400);

        oArea.innerHTML = '';
        labels.forEach((label, i) => {
            const w = optsData[i];
            const b = document.createElement('button'); b.className = 'srs-option'; 
            b.innerHTML = `<span style="font-size:16px;">${label}</span>`; 
            const posStr = w.pos ? ` (${w.pos})` : '';
            b.dataset.reveal = `${toLowerWord(w.en)}${posStr} - ${w.zh}`; 
            b.dataset.isCorrect = (w.id === word.id) ? "true" : "false";
            b.dataset.wordId = w.id; b.dataset.en = toLowerWord(w.en);
            b.onclick = () => { if (!srsState.answered) handleSrsAnswer(b, w.id === word.id, q.type); }; oArea.appendChild(b);
        });
    }
}

function handleSrsAnswer(btnEl, isCorrect, type) {
    if (srsState.answered) return;
    srsState.answered = true;
    
    const word = srsState.questions[srsState.currentQ].word;
    const resultType = (type === 'listen3') ? 'listen' : type;
    srsState.results[word.id][resultType] = isCorrect;

    document.querySelectorAll('.srs-option').forEach(async b => {
        b.classList.add('disabled');
        b.style.pointerEvents = 'auto'; 
        b.style.cursor = 'default';
        
        if (b.dataset.isCorrect === "true") b.classList.add('correct');
        
        let textContent = b.innerHTML; 
        if (b.dataset.reveal) {
            textContent += `<span style="font-size:14px; font-weight:normal; margin-left:8px; opacity:0.8;">— ${b.dataset.reveal}</span>`;
        }

        const optWord = await DB.getSavedWord(b.dataset.wordId);
        const pinOpacity = optWord?.pinned ? '1' : '0.2';
        
        const actionsHtml = `
            <div style="margin-left: auto; display: flex; align-items: center; gap: 16px; padding-left: 12px;">
                <span class="opt-speak-btn" data-en="${b.dataset.en}" style="cursor: pointer; font-size: 20px; color: #4b5563;" title="播放發音">${ICONS.speaker}</span>
                <span class="opt-pin-btn" data-id="${b.dataset.wordId}" style="cursor: pointer; font-size: 22px; opacity: ${pinOpacity}; transition: opacity 0.2s;" title="特別挑選">📌</span>
            </div>
        `;

        b.style.display = 'flex';
        b.style.alignItems = 'center';
        b.style.justifyContent = 'space-between'; 
        b.style.textAlign = 'left';

        b.innerHTML = `<div style="display:flex; align-items:center; flex-wrap:wrap; flex:1;">${textContent}</div>` + actionsHtml;

        const speakBtn = b.querySelector('.opt-speak-btn');
        if (speakBtn) {
            speakBtn.onclick = (e) => { e.stopPropagation(); playRandomAccent(b.dataset.en); };
        }

        const pinBtn = b.querySelector('.opt-pin-btn');
        if (pinBtn) {
            pinBtn.onclick = async (e) => {
                e.stopPropagation();
                if (optWord) {
                    optWord.pinned = !optWord.pinned;
                    pinBtn.style.opacity = optWord.pinned ? '1' : '0.2';
                    await DB.addSavedWord(optWord);
                }
            };
        }
    });

    if (!isCorrect) btnEl.classList.add('wrong');

    const revealEl = document.getElementById('srsRevealWord');
    if ((type === 'listen' || type === 'listen3') && revealEl) {
        revealEl.textContent = toLowerWord(word.en);
        revealEl.classList.remove('hidden');
    }

    playRandomAccent(toLowerWord(word.en));

    const nextBtn = document.createElement('button');
    nextBtn.className = 'srs-done-btn'; 
    nextBtn.style.marginTop = '24px';
    nextBtn.textContent = '下一題 ➔';
    nextBtn.onclick = () => {
        srsState.currentQ++;
        if (srsState.currentQ >= srsState.questions.length) showSrsResults(); 
        else renderSrsQuestion();
    };
    
    document.getElementById('srsOptionsArea').appendChild(nextBtn);
}

async function showSrsResults() {
    const qArea = document.getElementById('srsQuestionArea');
    const oArea = document.getElementById('srsOptionsArea');
    document.getElementById('srsProgressText').textContent = t('srsDone');
    document.getElementById('srsPhaseBadge').textContent = t('srsResult');
    let totalCorrect = 0;
    const wordResults = [];
    
    for (const word of srsState.words) {
        let freshWord = await DB.getSavedWord(word.id) || word;
        freshWord = normalizeW(freshWord);

        const r = srsState.results[word.id];
        // 計算這三個題型(en2zh, zh2en, listen)對了幾題，範圍是 0 ~ 3
        const cc = [r.en2zh, r.zh2en, r.listen].filter(Boolean).length;
        totalCorrect += cc;
        
        let newLevel = freshWord.level;
        
        // 🌟 核心升級 2：人性化寬容計分制 (Graduated Scoring)
        if (cc === 3) {
            // 完美掌握：升 1 級
            newLevel = Math.min(freshWord.level + 1, SRS_INTERVALS.length - 1);
        } else if (cc === 2) {
            // 稍微不熟：等級不變 (維持現狀，不會遭受被降級的打擊)
            newLevel = freshWord.level;
        } else {
            // 錯了 2 題以上 (忘了)：降 1 級重新加強
            newLevel = Math.max(freshWord.level - 1, 0);
        }
        
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
        else { txt = `Lv.${wr.oldLevel} (維持)`; } // 如果維持原等級，UI 上給予明確的回饋

        const item = document.createElement('div');
        item.className = 'srs-result-item';
        item.style.cssText = 'display: block; width: 100%; box-sizing: border-box; background: #fff; border-radius: 12px; padding: 16px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); position: relative;';

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
        const pinOpacity = freshWord.pinned ? '1' : '0.2';

        item.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                <div class="saved-word-top" style="margin-bottom: 0; display:flex; align-items:center; flex-wrap:wrap;">
                    <span class="saved-word-en" style="font-size: 1.15rem; font-weight: 700; color: #111827;">${displayEn}</span>
                    <button class="mini-speaker srs-speaker-btn" data-speak="${displayEn}" style="margin-left: 8px; margin-right: 8px; font-size: 1.1rem; color: #4b5563; background: none; border: none; cursor: pointer;">${ICONS.speaker}</button>
                    ${posText ? `<span class="vocab-pos">${posText}</span>` : ''}
                </div>
                
                <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 6px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span class="srs-result-pin" style="cursor:pointer; opacity:${pinOpacity}; font-size:20px; transition: opacity 0.2s;" title="特別挑選">📌</span>
                        <div class="srs-result-status ${cls}" style="font-size: 13px; font-weight: 600;">${wr.cc}/3 ${txt}</div>
                    </div>
                    <button class="srs-star-btn" data-id="${freshWord.id}" style="background:none; border:1px solid #d1d5db; color:#4b5563; border-radius:12px; padding:2px 8px; font-size:11px; cursor:pointer; display:flex; align-items:center; gap:4px; transition: all 0.2s; white-space: nowrap;">⭐ 標記不熟</button>
                </div>
            </div>

            <div class="vocab-lookup-meta" style="margin-bottom: 12px; display: flex; align-items: center; flex-wrap: wrap; gap: 8px;">
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
            
            <div style="font-size: 12px; color: #8b5cf6; font-weight: 500; padding-top: 10px; border-top: 1px dashed #e5e7eb;">
                <span>⏰ 下次複習：<span class="srs-next-date">${wr.nextDate}</span></span>
            </div>
        `;

        const pinBtn = item.querySelector('.srs-result-pin');
        pinBtn.onclick = async (e) => {
            e.stopPropagation();
            freshWord.pinned = !freshWord.pinned;
            pinBtn.style.opacity = freshWord.pinned ? '1' : '0.2';
            await DB.addSavedWord(freshWord);
        };

        const starBtn = item.querySelector('.srs-star-btn');
        starBtn.onclick = async () => {
            const resetLevel = 0;
            const resetNext = getNextReviewTime(resetLevel); 
            await DB.updateWordSRS(freshWord.id, resetLevel, resetNext);
            starBtn.innerHTML = '🌟 已降級'; starBtn.style.background = '#fef3c7'; starBtn.style.borderColor = '#fbbf24'; starBtn.style.color = '#b45309'; starBtn.disabled = true;
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
    
    // 🌟 在這裡呼叫渲染，然後關閉彈窗
    doneBtn.onclick = () => {
        finishSrsReview();
    };
    oArea.appendChild(doneBtn);
}

// 🌟 將 finishSrsReview 獨立出來，方便外部（如 vocab.js 裡的 onFinish 閉包）知道何時該重新載入列表
export function finishSrsReview() {
    document.getElementById('srsOverlay').classList.add('hidden');
    if (_onFinish) _onFinish();
}