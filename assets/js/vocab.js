// Word modal (click/select lookup), save-to-vocab, renderVocabTab.

import { state, ICONS, SRS_INTERVALS, SRS_MIN_WORDS, SRS_MAX_WORDS, getNextReviewTime } from './state.js';
import { DB } from './db.js';
import { fetchWordDetails, validateWordWithLanguageTool } from './apiGemini.js';
import { speakText } from './utils.js';
import { t } from './i18n.js';

let _startSrsReview = null;
let _vocabSubtab = 'notebook';
let _lookupResult = null;
let _filterLv0 = false; 
let _filterPinned = false; 

// 🌟 核心升級：加入全域的清洗狀態開關，用來控制暫停
let _isUpgrading = false; 

const GAS_URL = "https://script.google.com/macros/s/AKfycbyphrZPFIgVmEKmUMWhoZ2fbpHBuwRl00izZ6U4TnUoZulOpa27LBosZA8EYF8VvJkm/exec";

function getRandomToeicVoice() {
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;
    
    const jokeVoices = ['albert', 'bad news', 'bahh', 'bells', 'boing', 'bubbles', 'cellos', 'deranged', 'good news', 'hysterical', 'junior', 'pipe organ', 'princess', 'trinoids', 'whisper', 'zarvox', 'fred', 'ralph', 'superstar', 'jester', 'organ', 'kathy', 'novelty'];
    
    const englishVoices = voices.filter(v => {
        if (!v.lang.startsWith('en')) return false;
        const nameLower = String(v.name).toLowerCase();
        const uriLower = String(v.voiceURI || '').toLowerCase();
        return !jokeVoices.some(joke => nameLower.includes(joke) || uriLower.includes(joke));
    });
    
    if (englishVoices.length > 0) {
        return englishVoices[Math.floor(Math.random() * englishVoices.length)];
    }
    return null;
}

function playRobustEnglishSound(text) {
    if (!text) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = getRandomToeicVoice();
    
    if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang; 
    } else {
        utterance.lang = 'en-US';
    }
    
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
}

function formatDerivText(text) {
    let tStr = String(text || '').trim();
    if (!tStr) return '';
    if (tStr.includes('\n')) return tStr;
    return tStr.replace(/\), ?/g, ')\n');
}

function formatRelWordsHtml(synonyms, antonyms) {
    const synStr = String(synonyms || '').trim();
    const antStr = String(antonyms || '').trim();
    if (!synStr && !antStr) return '';

    let html = `<div style="margin-bottom:12px; display:flex; flex-wrap:wrap; gap:6px; align-items:center;">
                    <span style="font-size:12px; color:#4b5563; font-weight:bold; margin-right:4px;">🔗 同反義字：</span>`;
    
    if (synStr) {
        const synList = synStr.split(',').map(s => s.trim()).filter(s => s);
        synList.forEach(s => {
            html += `<span style="background-color: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 12px; font-size: 11.5px; font-weight: 500; border: 1px solid #bbf7d0;">= ${s}</span>`;
        });
    }

    if (antStr) {
        const antList = antStr.split(',').map(a => a.trim()).filter(a => a);
        antList.forEach(a => {
            html += `<span style="background-color: #fee2e2; color: #991b1b; padding: 2px 8px; border-radius: 12px; font-size: 11.5px; font-weight: 500; border: 1px solid #fecaca;">↔ ${a}</span>`;
        });
    }

    html += `</div>`;
    return html;
}

async function syncToGoogleSheet(item) {
    const payload = {
        action: "add",
        data: {
            id: item.id || Date.now(),
            word: item.en || item.word || "",
            kk: item.ipa || item.kk || "",
            pos: item.pos || "",
            cat: item.cat || item.category || "Other",
            zh: item.zh || item.def || "",
            exEn: item.ex || item.exEn || "",
            exZh: item.ex_zh || item.exZh || "",
            col: item.col || "",
            phrase: item.phrase || "",
            deriv: item.deriv || item.derivatives || "",
            syn: item.synonyms || item.syn || "",
            ant: item.antonyms || item.ant || ""
        }
    };
    try { fetch(GAS_URL, { method: 'POST', body: JSON.stringify(payload) }); } catch(err) {}
}

async function syncFullUpdateToCloud(item) {
    const payload = {
        action: "update_all",
        data: {
            id: item.id,
            word: item.en || item.word,
            kk: item.ipa || item.kk,
            pos: item.pos,
            cat: item.cat || item.category,
            zh: item.zh || item.def,
            exEn: item.ex || item.exEn,
            exZh: item.ex_zh || item.exZh,
            deriv: item.deriv || item.derivatives,
            syn: item.synonyms || item.syn,
            ant: item.antonyms || item.ant
        }
    };
    try { fetch(GAS_URL, { method: 'POST', body: JSON.stringify(payload) }); } catch(err) {}
}

export function setSrsTrigger(fn) { _startSrsReview = fn; }
export function setVocabSubtab(tab) {
    _vocabSubtab = tab === 'lookup' ? 'lookup' : 'notebook';
    renderVocabSubtab();
    if (_vocabSubtab === 'lookup') renderLookupResultCard();
}

export function addLongPressListener(element, wordText) {
    let pressTimer;
    const start = (e) => {
        if (e.type === 'mousedown' && e.button !== 0) return;
        element.classList.add('word-pressing');
        pressTimer = setTimeout(() => {
            element.classList.remove('word-pressing');
            element.classList.add('word-highlighted');
            if (state.highlightedElement && state.highlightedElement !== element)
                state.highlightedElement.classList.remove('word-highlighted');
            state.highlightedElement = element;
            showWordModal(wordText);
        }, 600); 
    };
    const cancel = () => { clearTimeout(pressTimer); element.classList.remove('word-pressing'); };
    
    element.addEventListener('touchstart', start, { passive: true });
    element.addEventListener('touchend', cancel);
    element.addEventListener('touchmove', cancel);
    element.addEventListener('mousedown', start);
    element.addEventListener('mouseup', cancel);
    element.addEventListener('mouseleave', cancel);
    element.oncontextmenu = (e) => { e.preventDefault(); return false; };
}

function showWordModal(word) {
    const modal = document.getElementById('wordModal');
    modal.style.zIndex = '9999999'; 
    const actionArea = document.getElementById('wmActionArea');
    
    (async () => {
        let vocabItem = null;
        if (state.currentData && state.currentData.vocabulary)
            vocabItem = state.currentData.vocabulary.find(v => v.word.toLowerCase() === word.toLowerCase());
        if (vocabItem) {
            DB.setWord(word, vocabItem);
        } else {
            vocabItem = await DB.getWord(word);
        }
        if (!vocabItem) {
            const saved = await DB.getSavedWord(normalizeWordId(word));
            if (saved) vocabItem = { word: saved.en || saved.word, pos: saved.pos, ipa: saved.ipa || saved.kk, category: saved.cat, def: saved.zh || saved.def, ex: saved.ex || saved.exEn, ex_zh: saved.ex_zh || saved.exZh, derivatives: saved.deriv || saved.derivatives || '', synonyms: saved.synonyms || saved.syn || '', antonyms: saved.antonyms || saved.ant || '' };
        }

        document.getElementById('wmWord').innerText = word;
        document.getElementById('btnWordAudio').onclick = () => playRobustEnglishSound(word);
        actionArea.innerHTML = '';

        let oldDeriv = document.getElementById('wmDeriv');
        if (oldDeriv) oldDeriv.remove();
        let oldRel = document.getElementById('wmRelWords');
        if (oldRel) oldRel.remove();

        if (vocabItem) {
            await backfillSavedWordExample(word, vocabItem);
            document.getElementById('wmPos').innerText = vocabItem.pos || '';
            document.getElementById('wmIpa').innerText = vocabItem.ipa || vocabItem.kk || '';
            
            let oldCat = document.getElementById('wmCat');
            if (oldCat) oldCat.remove();
            if (vocabItem.category || vocabItem.cat) {
                document.querySelector('.wm-meta').insertAdjacentHTML('beforeend', `<span id="wmCat" style="display:inline-block; background:#eaf4ff; color:#007aff; padding:2px 8px; border-radius:6px; font-size:12px; margin-left:8px; font-weight:600;">${vocabItem.category || vocabItem.cat}</span>`);
            }

            document.getElementById('wmDef').innerText = vocabItem.def || vocabItem.zh || '';
            
            const relHtml = formatRelWordsHtml(vocabItem.synonyms || vocabItem.syn, vocabItem.antonyms || vocabItem.ant);
            if (relHtml) {
                document.getElementById('wmDef').insertAdjacentHTML('afterend', `<div id="wmRelWords" style="margin-top:8px;">${relHtml}</div>`);
            }

            const derivText = formatDerivText(vocabItem.derivatives || vocabItem.deriv);
            if (derivText) {
                document.getElementById('wmDef').insertAdjacentHTML('afterend', `<div id="wmDeriv" style="font-size:13px; color:#4b5563; background:#f3f4f6; padding:8px; border-radius:6px; margin-top:8px; margin-bottom:8px; line-height:1.5; white-space: pre-wrap;">💡 <b>衍生字：</b>\n${derivText}</div>`);
            }

            if (vocabItem.ex || vocabItem.exEn) {
                document.getElementById('wmExText').innerText = vocabItem.ex || vocabItem.exEn;
                document.getElementById('wmExSpeakBtn').onclick = () => playRobustEnglishSound(vocabItem.ex || vocabItem.exEn);
                document.getElementById('wmEx').classList.remove('hidden');
            } else {
                document.getElementById('wmEx').classList.add('hidden');
            }
            const exZhEl = document.getElementById('wmExZh');
            if (vocabItem.ex_zh || vocabItem.exZh) { exZhEl.textContent = vocabItem.ex_zh || vocabItem.exZh; exZhEl.classList.remove('hidden'); }
            else { exZhEl.classList.add('hidden'); }
            await renderSaveButton(actionArea, word, vocabItem);
        } else {
            document.getElementById('wmPos').innerText = '';
            document.getElementById('wmIpa').innerText = '';
            let oldCat = document.getElementById('wmCat');
            if (oldCat) oldCat.remove();
            document.getElementById('wmDef').innerText = t('vocabNoDetails');
            document.getElementById('wmEx').classList.add('hidden');
            document.getElementById('wmExZh').classList.add('hidden');
            
            const genBtn = document.createElement('button');
            genBtn.className = 'wm-btn';
            genBtn.style.marginTop = '0';
            genBtn.style.background = 'var(--accent)';
            genBtn.innerHTML = `${ICONS.sparkle} ${t('vocabAiAnalyzeWord')}`;
            genBtn.onclick = async () => {
                genBtn.disabled = true; genBtn.innerText = t('loadingGenerating');
                try {
                    const info = await fetchWordDetails(word);
                    document.getElementById('wmPos').innerText = info.pos;
                    document.getElementById('wmIpa').innerText = info.ipa;
                    
                    if (info.category) {
                        document.querySelector('.wm-meta').insertAdjacentHTML('beforeend', `<span id="wmCat" style="display:inline-block; background:#eaf4ff; color:#007aff; padding:2px 8px; border-radius:6px; font-size:12px; margin-left:8px; font-weight:600;">${info.category}</span>`);
                    }

                    document.getElementById('wmDef').innerText = info.def;
                    
                    const newRelHtml = formatRelWordsHtml(info.synonyms, info.antonyms);
                    if (newRelHtml) {
                        document.getElementById('wmDef').insertAdjacentHTML('afterend', `<div id="wmRelWords" style="margin-top:8px;">${newRelHtml}</div>`);
                    }

                    const derivGenText = formatDerivText(info.derivatives);
                    if (derivGenText) {
                        document.getElementById('wmDef').insertAdjacentHTML('afterend', `<div id="wmDeriv" style="font-size:13px; color:#4b5563; background:#f3f4f6; padding:8px; border-radius:6px; margin-top:8px; margin-bottom:8px; line-height:1.5; white-space: pre-wrap;">💡 <b>衍生字：</b>\n${derivGenText}</div>`);
                    }

                    document.getElementById('wmExText').innerText = info.ex;
                    document.getElementById('wmExSpeakBtn').onclick = () => playRobustEnglishSound(info.ex);
                    document.getElementById('wmEx').classList.remove('hidden');
                    const exZhEl = document.getElementById('wmExZh');
                    if (info.ex_zh) { exZhEl.textContent = info.ex_zh; exZhEl.classList.remove('hidden'); }
                    else { exZhEl.classList.add('hidden'); }
                    await backfillSavedWordExample(word, info);
                    genBtn.remove();
                    await renderSaveButton(actionArea, word, info);
                } catch (e) { genBtn.innerText = t('vocabGenerateFailedRetry'); genBtn.disabled = false; alert(e.message); }
            };
            actionArea.appendChild(genBtn);
        }
        modal.classList.add('active');
    })();
}

export function normalizeWordId(word) { return String(word || '').trim().toLowerCase(); }
function normalizeLookupWord(word) { return String(word || '').trim(); }

function validateLookupWordInput(rawWord) {
    const word = normalizeLookupWord(rawWord);
    if (!word) return { ok: false, reason: 'required' };
    if (word.length < 2 || word.length > 32) return { ok: false, reason: 'invalid_length' };
    return { ok: true, word: word.toLowerCase() };
}

function renderLookupMessage(message) {
    const resultEl = document.getElementById('vocabLookupResult');
    if (!resultEl) return;
    resultEl.innerHTML = `<div class="vocab-lookup-empty">${message}</div>`;
}

export function buildSavedWordPayload(word, vocabItem = {}) {
    const normalizedEn = normalizeWordId(vocabItem.en || vocabItem.word || word);
    return {
        id: normalizeWordId(vocabItem.word || word),
        en: normalizedEn,
        zh: vocabItem.def || vocabItem.zh || '',
        pos: vocabItem.pos || '',
        ipa: vocabItem.ipa || vocabItem.kk || '',
        cat: vocabItem.category || vocabItem.cat || 'Other',
        ex: vocabItem.ex || vocabItem.exEn || '',
        ex_zh: vocabItem.ex_zh || vocabItem.exZh || '',
        col: vocabItem.col || '',
        phrase: vocabItem.phrase || '',
        deriv: vocabItem.derivatives || vocabItem.deriv || '',
        synonyms: vocabItem.synonyms || vocabItem.syn || '',
        antonyms: vocabItem.antonyms || vocabItem.ant || '',
        createdAt: Date.now(),
        nextReview: getNextReviewTime(0),
        level: 0,
        pinned: false
    };
}

async function backfillSavedWordExample(word, vocabItem = {}) {
    const existingSaved = await DB.getSavedWord(normalizeWordId(word));
    if (!existingSaved || !(vocabItem.ex || vocabItem.exEn) || (existingSaved.ex || existingSaved.exEn)) return;
    existingSaved.ex = vocabItem.ex || vocabItem.exEn;
    existingSaved.ex_zh = vocabItem.ex_zh || vocabItem.exZh || '';
    await DB.addSavedWord(existingSaved);
}

export async function saveWordToNotebook(word, vocabItem) {
    const payload = buildSavedWordPayload(word, vocabItem);
    await DB.addSavedWord(payload);
    syncVocabCardBookmark(word, true);
    syncToGoogleSheet(payload);
}

export async function removeWordFromNotebook(word) {
    await DB.deleteSavedWord(normalizeWordId(word));
    syncVocabCardBookmark(word, false);
}

export async function toggleWordSaved(word, vocabItem) {
    const existing = await DB.getSavedWord(normalizeWordId(word));
    if (existing) {
        await removeWordFromNotebook(word);
        return false;
    }
    await saveWordToNotebook(word, vocabItem);
    return true;
}

async function renderSaveButton(container, word, vocabItem, options = {}) {
    const { onToggle = null } = options;
    const existing = await DB.getSavedWord(normalizeWordId(word));
    const btn = document.createElement('button');
    const setSaved = () => { btn.className = 'wm-btn saved-btn'; btn.innerHTML = `${ICONS.bookmarkFill} ${t('vocabSaved')}`; };
    const setUnsaved = () => { btn.className = 'wm-btn save-btn'; btn.innerHTML = `${ICONS.bookmark} ${t('vocabSaveToNotebook')}`; };
    if (existing) setSaved(); else setUnsaved();
    btn.onclick = async () => {
        const saved = await toggleWordSaved(word, vocabItem);
        if (saved) setSaved();
        else setUnsaved();
        if (typeof onToggle === 'function') await onToggle(saved);
    };
    container.appendChild(btn);
}

export function syncVocabCardBookmark(wordId, isSaved) {
    document.querySelectorAll('#vocabList .vocab-card').forEach(card => {
        const wordEl = card.querySelector('.vocab-word');
        if (wordEl && wordEl.textContent.toLowerCase() === wordId.toLowerCase()) {
            const btn = card.querySelector('.vocab-save-btn');
            if (btn) {
                if (isSaved) { btn.innerHTML = ICONS.bookmarkFill; btn.classList.add('saved'); }
                else { btn.innerHTML = ICONS.bookmark; btn.classList.remove('saved'); }
            }
        }
    });
}

export function closeModal() {
    document.getElementById('wordModal').classList.remove('active');
    if (state.highlightedElement) { state.highlightedElement.classList.remove('word-highlighted'); state.highlightedElement = null; }
}

function renderVocabSubtab() {
    const notebookPanel = document.getElementById('vocabNotebookPanel');
    const lookupPanel = document.getElementById('vocabLookupPanel');
    if (!notebookPanel || !lookupPanel) return;
    notebookPanel.classList.toggle('hidden', _vocabSubtab !== 'notebook');
    lookupPanel.classList.toggle('hidden', _vocabSubtab !== 'lookup');
    document.querySelectorAll('#vocabSubtabSwitch .vocab-subtab-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.vocabSubtab === _vocabSubtab);
    });
}

function renderLookupResultCard() {
    const resultEl = document.getElementById('vocabLookupResult');
    if (!resultEl) return;
    if (!_lookupResult) {
        resultEl.innerHTML = `<div class="vocab-lookup-empty">${t('vocabLookupEmpty')}</div>`;
        return;
    }
    const item = _lookupResult;
    const card = document.createElement('div');
    card.className = 'vocab-lookup-result-card';
    
    const relHtml = formatRelWordsHtml(item.synonyms || item.syn, item.antonyms || item.ant);

    const derivText = formatDerivText(item.derivatives || item.deriv);
    const derivHtml = derivText 
        ? `<div style="font-size:13px; color:#4b5563; background:#f3f4f6; padding:8px; border-radius:6px; margin-top:8px; line-height:1.5; white-space: pre-wrap;">💡 <b>衍生字：</b>\n${derivText}</div>` 
        : '';

    card.innerHTML = `
        <div class="saved-word-top">
            <span class="saved-word-en">${item.word || item.en || ''}</span>
            <button class="saved-word-speak" data-action="speak-word">${ICONS.speaker}</button>
        </div>
        <div class="vocab-lookup-meta">
            ${item.pos ? `<span class="vocab-pos">${item.pos}</span>` : ''}
            ${item.ipa ? `<span class="vocab-ipa">${item.ipa}</span>` : ''}
            ${item.category ? `<span style="display:inline-block; background:#eaf4ff; color:#007aff; padding:2px 8px; border-radius:6px; font-size:12px; margin-left:8px; font-weight:600;">${item.category}</span>` : ''}
        </div>
        <div class="saved-word-zh">${item.def || item.zh || ''}</div>
        ${relHtml}
        ${derivHtml}
        ${item.ex ? `<div class="vocab-lookup-ex">${item.ex} <button class="mini-speaker" data-action="speak-ex">${ICONS.speaker}</button></div>` : ''}
        ${item.ex_zh ? `<div class="vocab-ex-zh">${item.ex_zh}</div>` : ''}
        <div id="vocabLookupActionArea" class="wm-actions" style="margin-top:10px;"></div>
    `;
    card.querySelector('[data-action="speak-word"]')?.addEventListener('click', () => playRobustEnglishSound(item.word || item.en || ''));
    card.querySelector('[data-action="speak-ex"]')?.addEventListener('click', () => playRobustEnglishSound(item.ex || ''));
    resultEl.innerHTML = '';
    resultEl.appendChild(card);
    renderSaveButton(card.querySelector('#vocabLookupActionArea'), item.word || item.en, item, {
        onToggle: async () => { await renderVocabTab(); }
    }).then(() => {});
}

export async function handleLookupSearch() {
    const inputEl = document.getElementById('vocabLookupInput');
    const lookupBtn = document.getElementById('btnVocabLookup');
    if (!inputEl) return;
    const localValidation = validateLookupWordInput(inputEl.value);
    if (!localValidation.ok) {
        _lookupResult = null;
        if (localValidation.reason === 'required') renderLookupMessage(t('vocabLookupInputRequired'));
        else if (localValidation.reason === 'single_word_only') renderLookupMessage(t('vocabLookupSingleWordOnly'));
        else if (localValidation.reason === 'digits_not_allowed') renderLookupMessage(t('vocabLookupNoDigits'));
        else if (localValidation.reason === 'invalid_length') renderLookupMessage(t('vocabLookupLengthInvalid'));
        else renderLookupMessage(t('vocabLookupCharsInvalid'));
        return;
    }
    if (!state.apiKey) { alert(t('alertSetApiKeyFirst')); return; }
    if (lookupBtn?.disabled) return;
    if (lookupBtn) lookupBtn.disabled = true;
    try {
        const query = localValidation.word;
        renderLookupMessage(t('vocabLookupValidating'));
        const lt = await validateWordWithLanguageTool(query);
        if (!lt.ok) {
            _lookupResult = null;
            if (lt.reason === 'spelling') {
                const suggestions = (lt.suggestions || []).slice(0, 3).join(', ');
                renderLookupMessage(t('vocabLookupSpellingInvalid', { suggestions: suggestions || '-' }));
            } else {
                renderLookupMessage(t('vocabLookupValidationServiceError'));
            }
            return;
        }
        renderLookupMessage(t('loadingGenerating'));
        const info = await fetchWordDetails(query);
        
        _lookupResult = {
            word: info.word || query,
            pos: info.pos || '',
            ipa: info.ipa || '',
            category: info.category || 'Other',
            def: info.def || '',
            ex: info.ex || '',
            ex_zh: info.ex_zh || '',
            derivatives: info.derivatives || '',
            synonyms: info.synonyms || '',
            antonyms: info.antonyms || ''
        };
        await backfillSavedWordExample(_lookupResult.word, _lookupResult);
        await renderVocabTab();
    } catch (error) {
        console.error(error);
        renderLookupMessage(t('vocabLookupFailed', { message: error.message }));
    } finally {
        if (lookupBtn) lookupBtn.disabled = false;
    }
}

document.addEventListener('change', (event) => {
    if (event.target && event.target.id === 'posFilterSelect') { renderVocabTab(); }
});

// 🌟 全自動清洗機 (極速防斷線與暫停版)
document.addEventListener('click', async (event) => {
    const btn = event.target.closest('#btnBatchUpgradeDeriv');
    if (btn) {
        // 如果正在執行中，再次點擊就是「要求暫停」
        if (_isUpgrading) {
            _isUpgrading = false;
            btn.innerHTML = `🛑 正在中斷...`;
            btn.disabled = true;
            return;
        }

        if (btn.disabled) return;
        let words = await DB.getSavedWords();
        
        // 🌟 核心修復 1：嚴格判斷「屬性是否存在(typeof === 'undefined')」，
        // 這樣就算 AI 找不到同義字回傳空字串("")，下次也不會被當作沒洗過而重洗！
        let targets = words.filter(w => typeof w.synonyms === 'undefined' && typeof w.syn === 'undefined');
        
        if (targets.length === 0) {
            alert('🎉 太棒了！您的字典格式非常完美，不需再清洗！'); return;
        }

        const confirmMsg = `發現 ${targets.length} 個尚未升級微標籤的舊單字。\n\n⚠️ 系統已啟動「極速清洗模式」：\n1. 過程中隨時可以再點擊按鈕「暫停」。\n2. 為了避免 1400 多字導致 Google 斷線，系統【不會自動備份】。\n\n確定要開始嗎？`;
        if (!confirm(confirmMsg)) return;

        _isUpgrading = true;
        btn.disabled = false; // 保持按鈕可點擊，用來觸發暫停
        let successCount = 0;

        for (let i = 0; i < targets.length; i++) {
            // 每次迴圈檢查使用者是否按下了暫停
            if (!_isUpgrading) {
                alert(`🛑 已手動暫停清洗！\n本次成功升級了 ${successCount} 個單字。\n下次按升級會直接從進度接續。\n\n⚠️ 請務必前往「紀錄」頁面點擊【立即備份】！`);
                break;
            }

            const w = targets[i];
            btn.innerHTML = `⏳ 清洗中 (${i + 1}/${targets.length}) - 點擊可暫停`;
            
            try {
                const targetWord = w.en || w.word;
                const info = await fetchWordDetails(targetWord, true);
                
                w.en = targetWord; 
                w.pos = info.pos || w.pos || '-';
                w.ipa = info.ipa || w.ipa || w.kk || '(查無音標)';
                w.cat = info.category || w.cat || 'Other';
                w.zh = info.def || w.zh || w.def || '-';
                w.ex = info.ex || w.ex || w.exEn || '';
                w.ex_zh = info.ex_zh || w.ex_zh || w.exZh || '';
                w.deriv = info.derivatives || w.deriv || w.derivatives || ''; 
                
                // 🌟 確保這兩個屬性一定會被建立，即使是空字串，下次就不會再被抓去洗
                w.synonyms = info.synonyms || '';
                w.antonyms = info.antonyms || '';
                
                // 🌟 核心修復 2：只存本機，切斷 Google 試算表連續 POST 以防斷線
                await DB.addSavedWord(w);
                
                successCount++;
                await new Promise(resolve => setTimeout(resolve, 300));

            } catch (e) {
                if (e.message === "HTTP_429" || String(e).includes("429") || String(e).includes("quota")) {
                    console.warn(`觸發 API 限速，啟動 15 秒冷卻...`);
                    btn.innerHTML = `⏳ API 冷卻中 (15s)...`;
                    await new Promise(resolve => setTimeout(resolve, 15000)); 
                    i--; 
                } else {
                    console.error('遇到毒瘤單字，強制蓋章逃脫:', w.en || w.word, e);
                    w.deriv = w.deriv || w.derivatives || '';
                    w.ipa = w.ipa || w.kk || '(查無音標)';
                    w.synonyms = ''; // 強制蓋章為已處理
                    w.antonyms = '';
                    await DB.addSavedWord(w);
                }
            }
        }
        
        // 如果是自然跑完（不是被手動暫停的）
        if (_isUpgrading) {
            _isUpgrading = false;
            alert(`✅ 清洗任務徹底結束！\n共升級了 ${successCount} 個單字。\n\n⚠️ 請立刻前往「紀錄」頁面點擊【立即備份】將進度存上雲端！`);
        }
        
        btn.innerHTML = `🚀 升級舊單字`;
        btn.disabled = false;
        renderVocabTab();
    }
});

export async function refreshSrsBanner(allWords) {
    const entryEl = document.getElementById('srsReviewEntry');
    if (!entryEl) return;
    
    const dueWords = allWords.filter(w => w.nextReview <= Date.now());
    entryEl.innerHTML = '';

    if (allWords.length < SRS_MIN_WORDS) {
        entryEl.innerHTML = `<div class="review-entry-card disabled"><h3>${t('vocabSrsTitle')}</h3><p>${t('vocabSrsNeedMinimum', { min: SRS_MIN_WORDS, current: allWords.length })}</p></div>`;
    } else if (dueWords.length < SRS_MIN_WORDS) {
        const nextDue = allWords.filter(w => w.nextReview > Date.now()).sort((a, b) => a.nextReview - b.nextReview);
        const nextDate = nextDue.length > 0 ? new Date(nextDue[0].nextReview).toLocaleDateString() : '—';
        entryEl.innerHTML = `<div class="review-entry-card disabled"><h3>${t('vocabSrsTitle')}</h3><p>${t('vocabSrsDueInsufficient', { min: SRS_MIN_WORDS, current: dueWords.length })}<br>${t('vocabNextReviewLabel', { date: nextDate })}</p></div>`;
    } else {
        const reviewCount = Math.min(dueWords.length, SRS_MAX_WORDS);
        const card = document.createElement('button');
        card.className = 'review-entry-card';
        card.innerHTML = `<h3>${t('vocabSrsStartTitle')}</h3><p>${t('vocabSrsStartDesc', { dueCount: dueWords.length, reviewCount })}</p>`;
        card.onclick = () => { if (_startSrsReview) _startSrsReview(dueWords, allWords); };
        entryEl.appendChild(card);
    }

    const lv5Words = allWords.filter(w => w.level >= SRS_INTERVALS.length - 1);
    if (lv5Words.length > 0) {
        const clearBtn = document.createElement('button');
        clearBtn.className = 'review-entry-card';
        clearBtn.style.background = 'var(--success)';
        clearBtn.innerHTML = `<h3>${t('vocabClearMasteredTitle')}</h3><p>${t('vocabClearMasteredDesc', { count: lv5Words.length })}</p>`;
        clearBtn.onclick = async () => {
            if (!confirm(t('vocabClearMasteredConfirm', { count: lv5Words.length }))) return;
            for (const w of lv5Words) { await removeWordFromNotebook(w.id); }
            renderVocabTab();
        };
        entryEl.appendChild(clearBtn);
    }
}

/* ====== Vocabulary Tab ====== */
export async function renderVocabTab() {
    let words = await DB.getSavedWords();
    for (let w of words) {
        if (w.level == null || w.level === undefined || isNaN(w.level)) {
            w.level = 0; w.nextReview = w.nextReview || Date.now(); await DB.addSavedWord(w);
        }
    }

    const filterSelect = document.getElementById('posFilterSelect');
    const filterValue = filterSelect ? filterSelect.value : 'all';

    if (filterSelect && !document.getElementById('btnFilterLv0')) {
        const btnLv0 = document.createElement('button');
        btnLv0.id = 'btnFilterLv0';
        btnLv0.innerHTML = '⭐ 待加強';
        btnLv0.style.cssText = 'background: #fff; border: 1px solid #e5e7eb; border-radius: 6px; padding: 4px 10px; font-size: 13px; color: #4b5563; cursor: pointer; margin-right: 8px; font-weight: 500; transition: all 0.2s; height: 32px; display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box;';
        btnLv0.onclick = () => { _filterLv0 = !_filterLv0; renderVocabTab(); };
        
        const btnPinned = document.createElement('button');
        btnPinned.id = 'btnFilterPinned';
        btnPinned.innerHTML = '📌 挑選';
        btnPinned.style.cssText = 'background: #fff; border: 1px solid #e5e7eb; border-radius: 6px; padding: 4px 10px; font-size: 13px; color: #4b5563; cursor: pointer; margin-right: 8px; font-weight: 500; transition: all 0.2s; height: 32px; display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box;';
        btnPinned.onclick = () => { _filterPinned = !_filterPinned; renderVocabTab(); };
        
        filterSelect.parentNode.insertBefore(btnLv0, filterSelect);
        filterSelect.parentNode.insertBefore(btnPinned, filterSelect);
        filterSelect.parentNode.style.display = 'flex';
        filterSelect.parentNode.style.alignItems = 'center';
        filterSelect.parentNode.style.marginBottom = '20px';
    }

    const btnFilterLv0 = document.getElementById('btnFilterLv0');
    if (btnFilterLv0) {
        if (_filterLv0) { btnFilterLv0.style.background = '#fef3c7'; btnFilterLv0.style.borderColor = '#fbbf24'; btnFilterLv0.style.color = '#b45309'; } 
        else { btnFilterLv0.style.background = '#fff'; btnFilterLv0.style.borderColor = '#e5e7eb'; btnFilterLv0.style.color = '#4b5563'; }
    }
    const btnFilterPinned = document.getElementById('btnFilterPinned');
    if (btnFilterPinned) {
        if (_filterPinned) { btnFilterPinned.style.background = '#e0e7ff'; btnFilterPinned.style.borderColor = '#3b82f6'; btnFilterPinned.style.color = '#1d4ed8'; } 
        else { btnFilterPinned.style.background = '#fff'; btnFilterPinned.style.borderColor = '#e5e7eb'; btnFilterPinned.style.color = '#4b5563'; }
    }

    refreshSrsBanner(words);

    const listEl = document.getElementById('savedWordsList');
    listEl.innerHTML = '';
    
    let displayWords = words;
    if (_filterLv0) displayWords = displayWords.filter(w => w.level === 0);
    if (_filterPinned) displayWords = displayWords.filter(w => w.pinned);
    if (filterValue !== 'all') {
        displayWords = displayWords.filter(w => {
            const rawPos = String(w.pos || '').toLowerCase();
            if (filterValue === 'other') return !['n.', 'v.', 'adj.', 'adv.', 'prep.', 'conj.'].some(p => rawPos.includes(p));
            return rawPos.includes(filterValue + '.') || rawPos === filterValue || rawPos.includes(filterValue + ',');
        });
    }

    document.getElementById('vocabCount').textContent = t('vocabCountLabel', { count: displayWords.length });

    if (displayWords.length === 0) {
        let emptyMsg = t('vocabEmpty');
        if (filterValue !== 'all' || _filterLv0 || _filterPinned) emptyMsg = '沒有找到符合條件的單字';
        listEl.innerHTML = `<p style="text-align:center; color:var(--text-sub); padding: 30px 0;">${emptyMsg}<br><span style="font-size:13px;">請試著切換其他分類或取消篩選條件</span></p>`;
        renderVocabSubtab();
        if (_vocabSubtab === 'lookup') renderLookupResultCard();
        return;
    }

    displayWords.sort((a, b) => a.level - b.level || a.nextReview - b.nextReview).forEach(w => {
        const card = document.createElement('div'); 
        card.className = 'saved-word-card';
        card.style.cursor = 'pointer'; 

        const isOverdue = w.nextReview <= Date.now();
        const dateStr = isOverdue ? t('vocabReadyForReview') : new Date(w.nextReview).toLocaleDateString();
        
        const displayEn = normalizeWordId(w.en || w.word || 'Unknown');
        const displayZh = w.zh || w.def || '';
        const displayPos = w.pos || '';

        const star1 = w.level >= 1 ? '★' : '☆';
        const star2 = w.level >= 2 ? '★' : '☆';
        const star3 = w.level >= 3 ? '★' : '☆';
        const pinOpacity = w.pinned ? '1' : '0.2'; 

        const relHtml = formatRelWordsHtml(w.synonyms || w.syn, w.antonyms || w.ant);

        const derivText = formatDerivText(w.deriv || w.derivatives);
        const derivHtml = derivText ? `<div style="font-size:12px; color:#4b5563; background:#f3f4f6; padding:6px; border-radius:4px; margin-bottom:8px; line-height:1.4; white-space: pre-wrap;">💡 <b>衍生字：</b>\n${derivText}</div>` : '';
        
        const rawEx = w.ex || w.exEn || '';
        const rawExZh = w.ex_zh || w.exZh || '';
        const exHtml = rawEx ? `<div style="font-size:13px; color:#374151; margin-bottom:4px; font-style:italic;">${rawEx}</div>` : '';
        const exZhHtml = rawExZh ? `<div style="font-size:12px; color:#6b7280;">${rawExZh}</div>` : '';
        
        const hasExtraInfo = relHtml || derivHtml || exHtml || exZhHtml;
        const expandedArea = hasExtraInfo 
            ? `<div class="vocab-card-expanded" style="display:none; margin-top: 10px; padding-top: 10px; border-top: 1px dashed #e5e7eb; width: 100%;">
                 ${relHtml}${derivHtml}${exHtml}${exZhHtml}
               </div>` 
            : '';

        card.innerHTML = `
            <div class="saved-word-info" style="width: 100%;">
                <div class="saved-word-top" style="display: flex; align-items: center; flex-wrap: wrap;">
                    <span class="saved-word-en">${displayEn}</span>
                    ${displayPos ? `<span class="vocab-pos">${displayPos}</span>` : ''}
                    <span class="vocab-pin" style="cursor:pointer; opacity:${pinOpacity}; margin-left:12px; font-size:18px; transition: opacity 0.2s;" title="特別挑選">📌</span>
                    <span class="vocab-stars" data-id="${w.id}" style="color: #fbbf24; font-size: 18px; margin-left: auto; cursor: pointer; user-select: none; letter-spacing: 2px;">
                        <span data-target="1" style="transition: color 0.2s;">${star1}</span><span data-target="2" style="transition: color 0.2s;">${star2}</span><span data-target="3" style="transition: color 0.2s;">${star3}</span>
                    </span>
                </div>
                <div class="saved-word-zh">${displayZh}</div>
                <div class="saved-word-next">${isOverdue ? '⏰ ' : ''}${t('vocabNextReviewLabel', { date: dateStr })}</div>
                ${expandedArea}
            </div>
            <div class="saved-word-actions">
                <button class="saved-word-speak">${ICONS.speaker}</button>
                <button class="saved-word-delete">${ICONS.close}</button>
            </div>
        `;

        card.querySelector('.vocab-pin').onclick = async (e) => {
            e.stopPropagation();
            w.pinned = !w.pinned;
            await DB.addSavedWord(w);
            card.querySelector('.vocab-pin').style.opacity = w.pinned ? '1' : '0.2';
        };

        const starsContainer = card.querySelector('.vocab-stars');
        starsContainer.querySelectorAll('span').forEach(starEl => {
            starEl.onclick = async (e) => {
                e.stopPropagation(); 
                let targetLevel = parseInt(starEl.dataset.target);
                if (w.level === targetLevel) targetLevel = 0;
                
                w.level = targetLevel;
                w.nextReview = getNextReviewTime(targetLevel);
                await DB.addSavedWord(w); 
                
                starsContainer.querySelectorAll('span').forEach(s => {
                    s.textContent = parseInt(s.dataset.target) <= w.level ? '★' : '☆';
                });

                const isOverdueNow = w.nextReview <= Date.now();
                const newDateStr = isOverdueNow ? t('vocabReadyForReview') : new Date(w.nextReview).toLocaleDateString();
                const nextEl = card.querySelector('.saved-word-next');
                if(nextEl) nextEl.textContent = `${isOverdueNow ? '⏰ ' : ''}${t('vocabNextReviewLabel', { date: newDateStr })}`;

                const updatedWords = await DB.getSavedWords();
                refreshSrsBanner(updatedWords); 
            };
        });

        card.querySelector('.saved-word-speak').onclick = (e) => { e.stopPropagation(); playRobustEnglishSound(displayEn); };
        card.querySelector('.saved-word-delete').onclick = async (e) => {
            e.stopPropagation(); 
            if (confirm(t('vocabDeleteConfirm', { word: displayEn }))) { await removeWordFromNotebook(w.id); renderVocabTab(); }
        };

        if (hasExtraInfo) {
            card.onclick = (e) => {
                if (window.getSelection && window.getSelection().toString().trim().length > 0) return;
                const expArea = card.querySelector('.vocab-card-expanded');
                if (expArea) expArea.style.display = expArea.style.display === 'none' ? 'block' : 'none';
            };
        }

        addLongPressListener(card.querySelector('.saved-word-en'), displayEn);
        listEl.appendChild(card);
    });
    
    renderVocabSubtab();
    if (_vocabSubtab === 'lookup') renderLookupResultCard();
}

let aiFloatingBtn = document.getElementById('global-ai-lookup-btn');
if (!aiFloatingBtn) {
    aiFloatingBtn = document.createElement('button');
    aiFloatingBtn.id = 'global-ai-lookup-btn';
    aiFloatingBtn.innerHTML = '✨ AI 即時解析<div style="position: absolute; bottom: -5px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid #4f46e5;"></div>';
    
    aiFloatingBtn.style.cssText = `
        position: absolute;
        z-index: 9999999;
        display: none;
        background: linear-gradient(135deg, #6366f1, #4f46e5);
        color: white;
        border: none;
        padding: 8px 14px;
        border-radius: 10px;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(79, 70, 229, 0.4);
        transform: translate(-50%, -100%);
        margin-top: -12px;
        white-space: nowrap;
        font-family: inherit;
    `;
    document.body.appendChild(aiFloatingBtn);
}

document.addEventListener('mouseup', handleGlobalSelection);
document.addEventListener('touchend', handleGlobalSelection);

document.addEventListener('mousedown', (e) => {
    if (e.target.id !== 'global-ai-lookup-btn') {
        aiFloatingBtn.style.display = 'none';
    }
});

function handleGlobalSelection(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.target.id === 'global-ai-lookup-btn' || e.target.closest('#global-ai-lookup-btn')) return;

    setTimeout(() => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) {
            aiFloatingBtn.style.display = 'none';
            return;
        }
        
        const selectedText = selection.toString().trim();
        const wordRegex = /^[a-zA-Z\-']{2,35}$/;
        
        if (wordRegex.test(selectedText)) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            
            const top = rect.top + window.scrollY;
            const left = rect.left + window.scrollX + (rect.width / 2);
            
            aiFloatingBtn.style.display = 'block';
            aiFloatingBtn.style.top = `${top}px`;
            aiFloatingBtn.style.left = `${left}px`;
            
            aiFloatingBtn.onclick = (event) => {
                event.preventDefault();
                event.stopPropagation();
                aiFloatingBtn.style.display = 'none'; 
                showWordModal(selectedText.toLowerCase()); 
                selection.removeAllRanges(); 
            };
        } else {
            aiFloatingBtn.style.display = 'none';
        }
    }, 150);
}