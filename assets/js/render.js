// Article rendering, translation/English toggle, vocab cards, phrase cards.

import { state, ICONS, VOICE_OPTIONS } from './state.js';
import { DB } from './db.js';
import { speakText } from './utils.js';
import { addLongPressListener, toggleWordSaved } from './vocab.js';
import { audioEl, playBtn, ensureAudioReady } from './audioPlayer.js';
import { t } from './i18n.js';

export function renderContent(data, voiceName) {
    const metaEl = document.getElementById('articleMeta');
    metaEl.innerHTML = '';
    if (voiceName) {
        const opt = VOICE_OPTIONS.find(v => v.name === voiceName);
        const voiceText = opt
            ? `${t(opt.labelKey)} · ${t(opt.descKey)}`
            : voiceName;
        metaEl.innerHTML = `<span class=\"voice-badge\">${ICONS.speaker} ${voiceText}</span>`;
    }

    const container = document.getElementById('articleContainer');
    container.innerHTML = '';
    state.segmentMetadata = [];
    const segments = data.segments || [{ en: data.article, zh: data.translation }];
    let totalChars = 0;
    segments.forEach(seg => { totalChars += seg.en.length; });
    let acc = 0;

    segments.forEach((seg, segIndex) => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'segment-row';

        const enDiv = document.createElement('div');
        enDiv.className = 'segment-en';

        const startIdx = acc;
        acc += seg.en.length;
        const endIdx = acc;
        state.segmentMetadata.push({ start: startIdx, end: endIdx });

        const words = seg.en.split(/(\s+)/);
        words.forEach(token => {
            if (/\w+/.test(token)) {
                const span = document.createElement('span');
                span.className = 'word';
                span.textContent = token;
                addLongPressListener(span, token.replace(/[.,!?;:\"()]/g, ''));
                enDiv.appendChild(span);
            } else {
                enDiv.appendChild(document.createTextNode(token));
            }
        });

        const zhDiv = document.createElement('div');
        zhDiv.className = 'segment-zh hidden';
        zhDiv.textContent = seg.zh;

        rowDiv.appendChild(enDiv);
        rowDiv.appendChild(zhDiv);
        container.appendChild(rowDiv);
    });

    const vocabList = document.getElementById('vocabList');
    vocabList.innerHTML = '';
    // 🌟 修正點：將 w.meaning 改為 w.def，w.example 改為 w.ex
    if (data.vocabulary && data.vocabulary.length > 0) {
        data.vocabulary.forEach(w => {
            const card = document.createElement('div');
            card.className = 'vocab-card';
            card.innerHTML = `
                <div class="vocab-card-header">
                    <strong>${w.word}</strong>
                    <span class="pos-tag">${w.pos}</span>
                </div>
                <div class="vocab-card-def">${w.def || w.meaning || ''}</div>
                <div class="vocab-card-ex">${w.ex || w.example || ''}</div>
            `;
            card.onclick = () => showWordModal(w.word);
            vocabList.appendChild(card);
        });
    }

    const phraseContainer = document.getElementById('phraseList');
    const phraseTitle = document.getElementById('phraseSectionTitle');
    phraseContainer.innerHTML = '';
    if (data.phrases && data.phrases.length > 0) {
        phraseTitle.textContent = t('sectionPhrases');
        data.phrases.forEach(p => {
            phraseContainer.innerHTML += `<div class="phrase-item"><span class="phrase-en">${p.en}</span> <span class="phrase-zh">${p.zh}</span></div>`;
        });
    } else if (data.grammar && data.grammar.length > 0) {
        phraseTitle.textContent = t('sectionGrammar');
        data.grammar.forEach(g => { phraseContainer.innerHTML += `<div class=\"grammar-item\"><span class=\"grammar-bullet\">•</span><span>${g}</span></div>`; });
    }

    state.showTranslation = false;
    state.showEnglish = true;
    updateToggleButtons();
    updateTranslationVisibility();
    updateEnglishVisibility();
}

// 🌟 修正點：彈窗顯示邏輯同步更新 Key 名稱
export async function showWordModal(wordStr) {
    const modal = document.getElementById('wordModal');
    const wmWord = document.getElementById('wmWord');
    const wmPos = document.getElementById('wmPos');
    const wmIpa = document.getElementById('wmIpa');
    const wmDef = document.getElementById('wmDef');
    const wmExText = document.getElementById('wmExText');
    const wmExZh = document.getElementById('wmExZh');
    const wmActionArea = document.getElementById('wmActionArea');

    wmWord.textContent = wordStr;
    wmPos.textContent = '';
    wmIpa.textContent = '';
    wmDef.textContent = t('loading');
    wmExText.textContent = '';
    wmExZh.textContent = '';
    wmExZh.classList.add('hidden');
    wmActionArea.innerHTML = '';

    modal.classList.add('active');

    try {
        const info = await import('./apiGemini.js').then(m => m.fetchWordDetails(wordStr));
        wmPos.textContent = info.pos || '';
        wmIpa.textContent = info.ipa || '';
        // 🌟 手術式修正：優先讀取 def，若無則降級讀取 meaning (容錯處理)
        wmDef.textContent = info.def || info.meaning || '';
        wmExText.textContent = info.ex || info.example || '';
        wmExZh.textContent = info.ex_zh || '';
        wmExZh.classList.remove('hidden');

        const isSaved = await DB.isWordSaved(wordStr);
        const saveBtn = document.createElement('button');
        saveBtn.className = 'wm-btn' + (isSaved ? ' secondary' : '');
        saveBtn.textContent = isSaved ? t('btnRemoveVocab') : t('btnAddVocab');
        saveBtn.onclick = async () => {
            await toggleWordSaved(wordStr, info);
            showWordModal(wordStr);
        };
        wmActionArea.appendChild(saveBtn);
    } catch (err) {
        wmDef.textContent = 'Error loading details.';
    }
}

export function toggleTranslation() {
    state.showTranslation = !state.showTranslation;
    updateToggleButtons();
    updateTranslationVisibility();
}

export function toggleEnglish() {
    state.showEnglish = !state.showEnglish;
    updateToggleButtons();
    updateEnglishVisibility();
}

export function updateToggleButtons() {
    const e = document.getElementById('btnToggleEn');
    const z = document.getElementById('btnToggleZh');
    if (!e || !z) return;
    e.textContent = state.showEnglish ? t('btnHideEnglish') : t('btnShowEnglish');
    e.classList.toggle('active-toggle', !state.showEnglish);
    z.textContent = state.showTranslation ? t('btnHideTranslation') : t('btnShowTranslation');
    z.classList.toggle('active-toggle', state.showTranslation);
}

export function updateTranslationVisibility() {
    document.querySelectorAll('.segment-zh').forEach(el => el.classList.toggle('hidden', !state.showTranslation));
}

export function updateEnglishVisibility() {
    document.querySelectorAll('.segment-en').forEach(el => el.classList.toggle('en-hidden', !state.showEnglish));
}