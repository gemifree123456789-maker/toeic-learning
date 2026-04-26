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
        const voiceText = opt ? `${t(opt.labelKey)} · ${t(opt.descKey)}` : voiceName;
        metaEl.innerHTML = `<span class="voice-badge">${ICONS.speaker} ${voiceText}</span>`;
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
        const startPct = acc / totalChars;
        const endPct = (acc + seg.en.length) / totalChars;

        const textSpan = document.createElement('span');
        textSpan.className = 'en-text';
        const words = seg.en.split(/(\s+)/);
        words.forEach(fragment => {
            if (!/[a-zA-Z0-9]/.test(fragment)) { textSpan.appendChild(document.createTextNode(fragment)); return; }
            const cleanWord = fragment.replace(/[^a-zA-Z0-9']/g, '');
            const wordSpan = document.createElement('span');
            wordSpan.innerText = fragment;
            wordSpan.className = 'word-interactive';
            addLongPressListener(wordSpan, cleanWord);
            textSpan.appendChild(wordSpan);
        });
        enDiv.appendChild(textSpan);
        state.segmentMetadata.push({ element: enDiv, startPct, endPct });
        acc += seg.en.length;

        const zhDiv = document.createElement('div');
        zhDiv.className = 'segment-zh hidden';
        zhDiv.innerText = seg.zh;
        rowDiv.appendChild(enDiv);
        rowDiv.appendChild(zhDiv);
        container.appendChild(rowDiv);
    });

    const vocabContainer = document.getElementById('vocabList');
    vocabContainer.innerHTML = '';
    (data.vocabulary || []).forEach(v => {
        const card = document.createElement('div');
        card.className = 'vocab-card';
        card.innerHTML = `
            <div class="vocab-card-header"><strong>${v.word}</strong> <span class="pos-tag">${v.pos}</span></div>
            <div class="vocab-card-def">${v.def || v.meaning || ''}</div>
            <div class="vocab-card-ex">${v.ex || v.example || ''}</div>
        `;
        card.onclick = () => showWordModal(v.word);
        vocabContainer.appendChild(card);
    });
}

// 🌟 最終修正：完整顯示衍生字、同義字、反義字
export async function showWordModal(wordStr) {
    const modal = document.getElementById('wordModal');
    const wmDef = document.getElementById('wmDef');
    const wmExText = document.getElementById('wmExText');
    const wmExZh = document.getElementById('wmExZh');
    const wmActionArea = document.getElementById('wmActionArea');

    document.getElementById('wmWord').textContent = wordStr;
    wmDef.textContent = t('loading');
    modal.classList.add('active');

    try {
        const info = await import('./apiGemini.js').then(m => m.fetchWordDetails(wordStr));
        wmDef.textContent = info.def || info.meaning || '';
        wmExText.textContent = info.ex || info.example || '';
        wmExZh.textContent = info.ex_zh || '';
        wmExZh.classList.toggle('hidden', !info.ex_zh);

        let extraHtml = '';
        if (info.derivatives && info.derivatives.length > 0) {
            extraHtml += `<div class="wm-extra"><strong>衍生字：</strong>` + info.derivatives.map(d => `<span>${d.word}(${d.pos})</span>`).join(', ') + `</div>`;
        }
        if (info.synonyms && info.synonyms.length > 0) {
            extraHtml += `<div class="wm-extra"><strong>同義字：</strong>${info.synonyms.join(', ')}</div>`;
        }
        
        const extraContainer = document.createElement('div');
        extraContainer.innerHTML = extraHtml;
        wmActionArea.innerHTML = '';
        wmActionArea.parentNode.insertBefore(extraContainer, wmActionArea);
        
        const isSaved = await DB.isWordSaved(wordStr);
        const saveBtn = document.createElement('button');
        saveBtn.className = 'wm-btn' + (isSaved ? ' secondary' : '');
        saveBtn.textContent = isSaved ? t('btnRemoveVocab') : t('btnAddVocab');
        saveBtn.onclick = async () => { await toggleWordSaved(wordStr, info); showWordModal(wordStr); };
        wmActionArea.appendChild(saveBtn);
    } catch (err) { wmDef.textContent = 'Error.'; }
}

export function updateEnglishVisibility() {
    document.querySelectorAll('.segment-en').forEach(el => el.classList.toggle('en-hidden', !state.showEnglish));
}