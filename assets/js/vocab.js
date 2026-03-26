// Word modal (long-press lookup), save-to-vocab, renderVocabTab.

import { state, ICONS, SRS_INTERVALS, SRS_MIN_WORDS, SRS_MAX_WORDS, getNextReviewTime } from './state.js';
import { DB } from './db.js';
import { fetchWordDetails, validateWordWithLanguageTool } from './apiGemini.js';
import { speakText } from './utils.js';
import { t } from './i18n.js';

let _startSrsReview = null;
let _vocabSubtab = 'notebook';
let _lookupResult = null;

const GAS_URL = "https://script.google.com/macros/s/AKfycbyphrZPFIgVmEKmUMWhoZ2fbpHBuwRl00izZ6U4TnUoZulOpa27LBosZA8EYF8VvJkm/exec";

/* =========================================
   同步至 Google Sheets 的背景發送函數
   ========================================= */
async function syncToGoogleSheet(item) {
    const payload = {
        action: "add",
        data: {
            id: item.id || Date.now(),
            word: item.en || item.word || "",
            kk: item.ipa || "",
            pos: item.pos || "",
            cat: item.cat || item.category || "Other",
            zh: item.zh || item.def || "",
            exEn: item.ex || "",
            exZh: item.ex_zh || "",
            col: item.col || "",
            phrase: item.phrase || "",
            deriv: item.deriv || ""
        }
    };
    try { fetch(GAS_URL, { method: 'POST', body: JSON.stringify(payload) }); } catch(err) {}
}

/* =========================================
   🚀 新增：全資料覆寫同步至 Google Sheets
   ========================================= */
async function syncFullUpdateToCloud(item) {
    const payload = {
        action: "update_all",
        data: {
            id: item.id,
            word: item.en,
            kk: item.ipa,
            pos: item.pos,
            cat: item.cat,
            zh: item.zh,
            exEn: item.ex,
            exZh: item.ex_zh,
            deriv: item.deriv
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
            if (saved) vocabItem = { word: saved.en, pos: saved.pos, ipa: saved.ipa, category: saved.cat, def: saved.zh, ex: saved.ex, ex_zh: saved.ex_zh, derivatives: saved.deriv || '' };
        }

        document.getElementById('wmWord').innerText = word;
        document.getElementById('btnWordAudio').onclick = () => speakText(word);
        actionArea.innerHTML = '';

        let oldDeriv = document.getElementById('wmDeriv');
        if (oldDeriv) oldDeriv.remove();

        if (vocabItem) {
            await backfillSavedWordExample(word, vocabItem);
            document.getElementById('wmPos').innerText = vocabItem.pos || '';
            document.getElementById('wmIpa').innerText = vocabItem.ipa || '';
            
            let oldCat = document.getElementById('wmCat');
            if (oldCat) oldCat.remove();
            if (vocabItem.category || vocabItem.cat) {
                document.querySelector('.wm-meta').insertAdjacentHTML('beforeend', `<span id="wmCat" style="display:inline-block; background:#eaf4ff; color:#007aff; padding:2px 8px; border-radius:6px; font-size:12px; margin-left:8px; font-weight:600;">${vocabItem.category || vocabItem.cat}</span>`);
            }

            document.getElementById('wmDef').innerText = vocabItem.def || '';
            
            const derivText = vocabItem.derivatives || vocabItem.deriv;
            if (derivText && derivText.trim() !== '') {
                document.getElementById('wmDef').insertAdjacentHTML('afterend', `<div id="wmDeriv" style="font-size:13px; color:#4b5563; background:#f3f4f6; padding:8px; border-radius:6px; margin-top:8px; margin-bottom:8px; line-height:1.5;">💡 <b>衍生字：</b><br>${derivText}</div>`);
            }

            if (vocabItem.ex) {
                document.getElementById('wmExText').innerText = vocabItem.ex;
                document.getElementById('wmExSpeakBtn').onclick = () => speakText(vocabItem.ex);
                document.getElementById('wmEx').classList.remove('hidden');
            } else {
                document.getElementById('wmEx').classList.add('hidden');
            }
            const exZhEl = document.getElementById('wmExZh');
            if (vocabItem.ex_zh) { exZhEl.textContent = vocabItem.ex_zh; exZhEl.classList.remove('hidden'); }
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
                    
                    if (info.derivatives && info.derivatives.trim() !== '') {
                        document.getElementById('wmDef').insertAdjacentHTML('afterend', `<div id="wmDeriv" style="font-size:13px; color:#4b5563; background:#f3f4f6; padding:8px; border-radius:6px; margin-top:8px; margin-bottom:8px; line-height:1.5;">💡 <b>衍生字：</b><br>${info.derivatives}</div>`);
                    }

                    document.getElementById('wmExText').innerText = info.ex;
                    document.getElementById('wmExSpeakBtn').onclick = () => speakText(info.ex);
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

export function normalizeWordId(word) {
    return String(word || '').trim().toLowerCase();
}

function normalizeLookupWord(word) {
    return String(word || '').trim();
}

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
    const normalizedEn = normalizeWordId(vocabItem.word || word);
    return {
        id: normalizeWordId(vocabItem.word || word),
        en: normalizedEn,
        zh: vocabItem.def || '',
        pos: vocabItem.pos || '',
        ipa: vocabItem.ipa || '',
        cat: vocabItem.category || vocabItem.cat || 'Other',
        ex: vocabItem.ex || '',
        ex_zh: vocabItem.ex_zh || '',
        col: vocabItem.col || '',
        phrase: vocabItem.phrase || '',
        deriv: vocabItem.derivatives || vocabItem.deriv || '',
        createdAt: Date.now(),
        nextReview: getNextReviewTime(0),
        level: 0
    };
}

async function backfillSavedWordExample(word, vocabItem = {}) {
    const existingSaved = await DB.getSavedWord(normalizeWordId(word));
    if (!existingSaved || !vocabItem.ex || existingSaved.ex) return;
    existingSaved.ex = vocabItem.ex;
    existingSaved.ex_zh = vocabItem.ex_zh || '';
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
    
    const derivText = item.derivatives || item.deriv;
    const derivHtml = (derivText && derivText.trim() !== '') 
        ? `<div style="font-size:13px; color:#4b5563; background:#f3f4f6; padding:8px; border-radius:6px; margin-top:8px; line-height:1.5;">💡 <b>衍生字：</b><br>${derivText}</div>` 
        : '';

    card.innerHTML = `
        <div class="saved-word-top">
            <span class="saved-word-en">${item.word || ''}</span>
            <button class="saved-word-speak" data-action="speak-word">${ICONS.speaker}</button>
        </div>
        <div class="vocab-lookup-meta">
            ${item.pos ? `<span class="vocab-pos">${item.pos}</span>` : ''}
            ${item.ipa ? `<span class="vocab-ipa">${item.ipa}</span>` : ''}
            ${item.category ? `<span style="display:inline-block; background:#eaf4ff; color:#007aff; padding:2px 8px; border-radius:6px; font-size:12px; margin-left:8px; font-weight:600;">${item.category}</span>` : ''}
        </div>
        <div class="saved-word-zh">${item.def || ''}</div>
        ${derivHtml}
        ${item.ex ? `<div class="vocab-lookup-ex">${item.ex} <button class="mini-speaker" data-action="speak-ex">${ICONS.speaker}</button></div>` : ''}
        ${item.ex_zh ? `<div class="vocab-ex-zh">${item.ex_zh}</div>` : ''}
        <div id="vocabLookupActionArea" class="wm-actions" style="margin-top:10px;"></div>
    `;
    card.querySelector('[data-action="speak-word"]')?.addEventListener('click', () => speakText(item.word || ''));
    card.querySelector('[data-action="speak-ex"]')?.addEventListener('click', () => speakText(item.ex || ''));
    resultEl.innerHTML = '';
    resultEl.appendChild(card);
    renderSaveButton(card.querySelector('#vocabLookupActionArea'), item.word, item, {
        onToggle: async () => {
            await renderVocabTab();
        }
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
    if (!state.apiKey) {
        alert(t('alertSetApiKeyFirst'));
        return;
    }
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
            derivatives: info.derivatives || ''
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
    if (event.target && event.target.id === 'posFilterSelect') {
        renderVocabTab();
    }
});

// 🚀 真・全自動清洗機 (平行運算多線程版 + 反向回寫)
document.addEventListener('click', async (event) => {
    const btn = event.target.closest('#btnBatchUpgradeDeriv');
    if (btn) {
        if (btn.disabled) return;
        
        let words = await DB.getSavedWords();
        // 過濾出缺少衍生字，或是缺少音標的單字
        let targets = words.filter(w => !w.deriv || w.deriv.trim() === '' || !w.ipa || w.ipa.trim() === '');
        
        if (targets.length === 0) {
            alert('🎉 太棒了！您的字典格式非常完美，不需再清洗！');
            return;
        }

        // 預估時間改為除以 10 (因為一次處理 10 個)
        const minutes = Math.ceil((targets.length * 3 / 10) / 60);
        const confirmMsg = `發現 ${targets.length} 個格式不完整的舊單字。\n\n系統將啟動「真・平行運算」機制，每次同時處理 10 個單字！\n完成後將自動覆寫至您的 Google 試算表。\n預計約需 ${minutes > 0 ? minutes : 1} 分鐘。\n\n確定要開始極速升級嗎？`;
        if (!confirm(confirmMsg)) return;

        btn.disabled = true;
        let successCount = 0;

        // 核心參數：每次同時處理的數量
        const BATCH_SIZE = 10;

        // 迴圈改為「批次跳躍」
        for (let i = 0; i < targets.length; i += BATCH_SIZE) {
            // 切割出這一批要處理的 10 個單字
            const batch = targets.slice(i, i + BATCH_SIZE);
            const currentEnd = Math.min(i + BATCH_SIZE, targets.length);
            btn.innerHTML = `🚀 平行清洗中 (${currentEnd}/${targets.length})...`;
            
            // 使用 Promise.all 讓這 10 個單字「同時」發送給 AI
            await Promise.all(batch.map(async (w) => {
                try {
                    await DB.setWord(w.en, null);
                    const info = await fetchWordDetails(w.en);
                    
                    w.pos = info.pos || w.pos;
                    w.ipa = info.ipa || w.ipa;
                    w.cat = info.category || w.cat;
                    w.zh = info.def || w.zh;
                    w.ex = info.ex || w.ex;
                    w.ex_zh = info.ex_zh || w.ex_zh;
                    w.deriv = info.derivatives || w.deriv || '';
                    
                    await DB.addSavedWord(w);
                    syncFullUpdateToCloud(w); // 背景發送給 GAS
                    
                    successCount++;
                } catch (e) {
                    console.error('單字升級失敗:', w.en, e);
                }
            }));

            // 批次與批次之間，稍作 0.3 秒休息，避免瀏覽器網路塞車
            await new Promise(resolve => setTimeout(resolve, 300));
        }

        alert(`✅ 平行清洗完成！成功標準化並回寫了 ${successCount} 個單字。`);
        btn.innerHTML = `🚀 升級舊單字`;
        btn.disabled = false;
        renderVocabTab();
    }
});

/* ====== Vocabulary Tab (摺疊展開升級版) ====== */
export async function renderVocabTab() {
    let words = await DB.getSavedWords();
    
    for (let w of words) {
        if (w.level == null || w.level === undefined || isNaN(w.level)) {
            w.level = 0;
            w.nextReview = w.nextReview || Date.now();
            await DB.addSavedWord(w);
        }
    }

    const filterSelect = document.getElementById('posFilterSelect');
    const filterValue = filterSelect ? filterSelect.value : 'all';

    const dueWords = words.filter(w => w.nextReview <= Date.now());
    const entryEl = document.getElementById('srsReviewEntry');
    entryEl.innerHTML = '';

    if (words.length < SRS_MIN_WORDS) {
        entryEl.innerHTML = `<div class="review-entry-card disabled"><h3>${t('vocabSrsTitle')}</h3><p>${t('vocabSrsNeedMinimum', { min: SRS_MIN_WORDS, current: words.length })}</p></div>`;
    } else if (dueWords.length < SRS_MIN_WORDS) {
        const nextDue = words.filter(w => w.nextReview > Date.now()).sort((a, b) => a.nextReview - b.nextReview);
        const nextDate = nextDue.length > 0 ? new Date(nextDue[0].nextReview).toLocaleDateString() : '—';
        entryEl.innerHTML = `<div class="review-entry-card disabled"><h3>${t('vocabSrsTitle')}</h3><p>${t('vocabSrsDueInsufficient', { min: SRS_MIN_WORDS, current: dueWords.length })}<br>${t('vocabNextReviewLabel', { date: nextDate })}</p></div>`;
    } else {
        const reviewCount = Math.min(dueWords.length, SRS_MAX_WORDS);
        const card = document.createElement('button');
        card.className = 'review-entry-card';
        card.innerHTML = `<h3>${t('vocabSrsStartTitle')}</h3><p>${t('vocabSrsStartDesc', { dueCount: dueWords.length, reviewCount })}</p>`;
        card.onclick = () => { if (_startSrsReview) _startSrsReview(dueWords, words); };
        entryEl.appendChild(card);
    }

    const lv5Words = words.filter(w => w.level >= SRS_INTERVALS.length - 1);
    if (lv5Words.length > 0) {
        const clearBtn = document.createElement('button');
        clearBtn.className = 'review-entry-card';
        clearBtn.style.background = 'var(--success)';
        clearBtn.innerHTML = `<h3>${t('vocabClearMasteredTitle')}</h3><p>${t('vocabClearMasteredDesc', { count: lv5Words.length })}</p>`;
        clearBtn.onclick = async () => {
            if (!confirm(t('vocabClearMasteredConfirm', { count: lv5Words.length }))) return;
            for (const w of lv5Words) {
                await removeWordFromNotebook(w.id);
            }
            renderVocabTab();
        };
        entryEl.appendChild(clearBtn);
    }

    const listEl = document.getElementById('savedWordsList');
    listEl.innerHTML = '';
    
    let displayWords = words;
    if (filterValue !== 'all') {
        displayWords = words.filter(w => {
            const rawPos = String(w.pos || '').toLowerCase();
            if (filterValue === 'other') {
                return !['n.', 'v.', 'adj.', 'adv.', 'prep.', 'conj.'].some(p => rawPos.includes(p));
            }
            return rawPos.includes(filterValue + '.') || rawPos === filterValue || rawPos.includes(filterValue + ',');
        });
    }

    document.getElementById('vocabCount').textContent = t('vocabCountLabel', { count: displayWords.length });

    if (displayWords.length === 0) {
        const emptyMsg = filterValue === 'all' ? t('vocabEmpty') : '沒有找到符合此詞性的單字';
        listEl.innerHTML = `<p style="text-align:center; color:var(--text-sub); padding: 30px 0;">${emptyMsg}<br><span style="font-size:13px;">${filterValue === 'all' ? t('vocabEmptyHint') : '請試著切換其他分類或加入新單字'}</span></p>`;
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
        const displayEn = normalizeWordId(w.en);

        const derivHtml = (w.deriv && w.deriv.trim() !== '') ? `<div style="font-size:12px; color:#4b5563; background:#f3f4f6; padding:6px; border-radius:4px; margin-bottom:8px; line-height:1.4;">💡 <b>衍生字：</b><br>${w.deriv}</div>` : '';
        const exHtml = w.ex ? `<div style="font-size:13px; color:#374151; margin-bottom:4px; font-style:italic;">${w.ex}</div>` : '';
        const exZhHtml = w.ex_zh ? `<div style="font-size:12px; color:#6b7280;">${w.ex_zh}</div>` : '';
        
        const hasExtraInfo = derivHtml || exHtml || exZhHtml;
        
        const expandedArea = hasExtraInfo 
            ? `<div class="vocab-card-expanded" style="display:none; margin-top: 10px; padding-top: 10px; border-top: 1px dashed #e5e7eb; width: 100%;">
                 ${derivHtml}${exHtml}${exZhHtml}
               </div>` 
            : '';

        card.innerHTML = `
            <div class="saved-word-info" style="width: 100%;">
                <div class="saved-word-top">
                    <span class="saved-word-en">${displayEn}</span>
                    ${w.pos ? `<span class="vocab-pos">${w.pos}</span>` : ''}
                    <span class="srs-badge srs-badge-${w.level}">Lv.${w.level}</span>
                </div>
                <div class="saved-word-zh">${w.zh}</div>
                <div class="saved-word-next">${isOverdue ? '⏰ ' : ''}${t('vocabNextReviewLabel', { date: dateStr })}</div>
                ${expandedArea}
            </div>
            <div class="saved-word-actions">
                <button class="saved-word-speak">${ICONS.speaker}</button>
                <button class="saved-word-delete">${ICONS.close}</button>
            </div>
        `;

        card.querySelector('.saved-word-speak').onclick = (e) => {
            e.stopPropagation(); 
            speakText(displayEn);
        };

        card.querySelector('.saved-word-delete').onclick = async (e) => {
            e.stopPropagation(); 
            if (confirm(t('vocabDeleteConfirm', { word: displayEn }))) {
                await removeWordFromNotebook(w.id);
                renderVocabTab();
            }
        };

        if (hasExtraInfo) {
            card.onclick = () => {
                const expArea = card.querySelector('.vocab-card-expanded');
                if (expArea) {
                    expArea.style.display = expArea.style.display === 'none' ? 'block' : 'none';
                }
            };
        }

        addLongPressListener(card.querySelector('.saved-word-info'), displayEn);
        listEl.appendChild(card);
    });
    
    renderVocabSubtab();
    if (_vocabSubtab === 'lookup') renderLookupResultCard();
}