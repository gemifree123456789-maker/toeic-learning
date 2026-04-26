// assets/js/render.js
// Article rendering, toggle visibility, and word modal.

import { state, ICONS, VOICE_OPTIONS } from './state.js';
import { DB } from './db.js';
import { speakText } from './utils.js';
import { addLongPressListener, toggleWordSaved } from './vocab.js';
import { t } from './i18n.js';

export function renderContent(data, voiceName) {
    const metaEl = document.getElementById('articleMeta');
    metaEl.innerHTML = '';
    if (voiceName) {
        const opt = VOICE_OPTIONS.find(v => v.name === voiceName);
        metaEl.innerHTML = `<span class="voice-badge">${ICONS.speaker} ${opt ? t(opt.labelKey) : voiceName}</span>`;
    }

    const container = document.getElementById('articleContainer');
    container.innerHTML = '';
    state.segmentMetadata = [];
    const segments = data.segments || [{ en: data.article, zh: data.translation }];
    
    let totalChars = 0;
    segments.forEach(seg => { totalChars += (seg.en || "").length; });
    let acc = 0;

    segments.forEach((seg) => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'segment-row';
        const enDiv = document.createElement('div');
        enDiv.className = 'segment-en';

        const textSpan = document.createElement('span');
        textSpan.className = 'en-text';
        const words = (seg.en || "").split(/(\s+)/);
        words.forEach(f => {
            if (!/[a-zA-Z0-9]/.test(f)) { textSpan.appendChild(document.createTextNode(f)); return; }
            const clean = f.replace(/[^a-zA-Z0-9']/g, '');
            const span = document.createElement('span');
            span.innerText = f;
            span.className = 'word-interactive';
            addLongPressListener(span, clean);
            textSpan.appendChild(span);
        });
        enDiv.appendChild(textSpan);
        
        const zhDiv = document.createElement('div');
        zhDiv.className = 'segment-zh hidden';
        zhDiv.innerText = seg.zh || "";
        
        rowDiv.appendChild(enDiv);
        rowDiv.appendChild(zhDiv);
        container.appendChild(rowDiv);
        
        state.segmentMetadata.push({ element: enDiv, startPct: acc/totalChars, endPct: (acc+(seg.en||"").length)/totalChars });
        acc += (seg.en || "").length;
    });

    const vocabList = document.getElementById('vocabList');
    vocabList.innerHTML = '';
    (data.vocabulary || []).forEach(v => {
        const card = document.createElement('div');
        card.className = 'vocab-card';
        card.innerHTML = `
            <div class="vocab-card-header"><strong>${v.word}</strong> <span class="pos-tag">${v.pos}</span></div>
            <div class="vocab-card-def">${v.def || ""}</div>
            <div class="vocab-card-ex">${v.ex || ""}</div>
        `;
        card.onclick = () => showWordModal(v.word);
        vocabList.appendChild(card);
    });
}

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
        wmDef.textContent = info.def || "";
        wmExText.textContent = info.ex || "";
        wmExZh.textContent = info.ex_zh || "";
        wmExZh.classList.toggle('hidden', !info.ex_zh);

        // 🌟 修正點：動態補回衍生字與同反義字 UI
        const existingExtra = modal.querySelector('.wm-extra-container');
        if (existingExtra) existingExtra.remove();

        const extraDiv = document.createElement('div');
        extraDiv.className = 'wm-extra-container';
        let html = '';
        if (info.derivatives?.length) {
            html += `<div class="wm-section-title">衍生字</div>` + 
                    info.derivatives.map(d => `<div class="wm-extra-item">${d.word} (${d.pos}) ${d.zh}</div>`).join('');
        }
        if (info.synonyms?.length) {
            html += `<div class="wm-section-title">同義字</div><div class="wm-tags">${info.synonyms.join(', ')}</div>`;
        }
        extraDiv.innerHTML = html;
        wmActionArea.parentNode.insertBefore(extraDiv, wmActionArea);

        const isSaved = await DB.isWordSaved(wordStr);
        wmActionArea.innerHTML = `<button class="wm-btn ${isSaved?'secondary':''}">${isSaved?t('btnRemoveVocab'):t('btnAddVocab')}</button>`;
        wmActionArea.querySelector('button').onclick = async () => {
            await toggleWordSaved(wordStr, info);
            showWordModal(wordStr);
        };
    } catch (e) { wmDef.textContent = "Error."; }
}

export function updateEnglishVisibility() {
    document.querySelectorAll('.segment-en').forEach(el => el.classList.toggle('en-hidden', !state.showEnglish));
}