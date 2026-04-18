// Google Drive & GAS dual-track sync engine

import { DB } from './db.js';
import { t } from './i18n.js';

let _callbacks = { renderHistory: null, loadLastSession: null, renderVocabTab: null };

export const DriveSync = {
    // 🌟 保持你原本的 GAS 網址
    GAS_URL: 'https://script.google.com/macros/s/AKfycbyphrZPFIgVmEKmUMWhoZ2fbpHBuwRl00izZ6U4TnUoZulOpa27LBosZA8EYF8VvJkm/exec',

    CLIENT_ID: '1033261498121-dp49gq696fh65rg0o6m32j1gine1ac4l.apps.googleusercontent.com',
    SCOPES: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
    tokenClient: null,
    accessToken: null,
    _pendingLoginResolve: null,

    setCallbacks(cbs) {
        _callbacks = { ..._callbacks, ...cbs };
    },

    init() {
        if (typeof google === 'undefined' || !google.accounts) return;
        this.tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: this.CLIENT_ID,
            scope: this.SCOPES,
            callback: (resp) => {
                if (resp.error) {
                    console.error('GIS auth error:', resp);
                    if (this._pendingLoginResolve) this._pendingLoginResolve(false);
                    this._pendingLoginResolve = null;
                    return;
                }
                this.accessToken = resp.access_token;
                const expiresAt = Date.now() + (resp.expires_in || 3600) * 1000;
                DB.setSetting('gis_access_token', resp.access_token);
                DB.setSetting('gis_token_expires_at', expiresAt);
                this._fetchUserInfo();
                this.updateUI();
                if (this._pendingLoginResolve) this._pendingLoginResolve(true);
                this._pendingLoginResolve = null;
            },
        });
    },

    async login() {
        if (!this.tokenClient) {
            this.init();
            if (!this.tokenClient) { alert(t('driveGisNotLoaded')); return false; }
        }
        const ok = await new Promise((resolve) => {
            this._pendingLoginResolve = resolve;
            this.tokenClient.requestAccessToken({ prompt: 'consent' });
        });
        return ok;
    },

    async silentLogin() {
        try {
            const cached = await DB.getSetting('gis_access_token');
            const expiresAt = await DB.getSetting('gis_token_expires_at');
            if (cached && expiresAt && Date.now() < expiresAt) {
                this.accessToken = cached;
                this.updateUI();
                return true;
            }
        } catch (e) { /* ignore cache read errors */ }
        if (!this.tokenClient) {
            this.init();
            if (!this.tokenClient) return false;
        }
        return new Promise((resolve) => {
            this._pendingLoginResolve = resolve;
            this.tokenClient.requestAccessToken({ prompt: '' });
        });
    },

    async logout() {
        if (this.accessToken) {
            google.accounts.oauth2.revoke(this.accessToken);
        }
        this.accessToken = null;
        await DB.setSetting('cloud_sync_enabled', false);
        await DB.setSetting('cloud_user_email', null);
        await DB.setSetting('cloud_user_name', null);
        await DB.setSetting('gis_access_token', null);
        await DB.setSetting('gis_token_expires_at', null);
        this.updateUI();
    },

    isLoggedIn() { return !!this.accessToken; },

    async _fetchUserInfo() {
        try {
            const resp = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${this.accessToken}` }
            });
            const info = await resp.json();
            await DB.setSetting('cloud_user_email', info.email || '');
            await DB.setSetting('cloud_user_name', info.name || info.email || '');
            await DB.setSetting('cloud_sync_enabled', true);
            this.updateUI();
        } catch (e) { console.warn('Failed to fetch user info:', e); }
    },

    // --- 🌟 核心修復：升級 DB 版本號為 2，並加入完整的升級與防呆機制 ---
    async _getMistakesFromDB() {
        return new Promise((resolve) => {
            const req = indexedDB.open('ToeicMistakesDB', 2);
            req.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('mistakes')) {
                    db.createObjectStore('mistakes', { keyPath: 'id' });
                }
            };
            req.onsuccess = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('mistakes')) return resolve([]);
                try {
                    const tx = db.transaction('mistakes', 'readonly');
                    const reqAll = tx.objectStore('mistakes').getAll();
                    reqAll.onsuccess = () => resolve(reqAll.result);
                    reqAll.onerror = () => resolve([]);
                } catch (err) {
                    resolve([]);
                }
            };
            req.onerror = () => resolve([]);
        });
    },

    async _saveMistakeToDB(mistake) {
        return new Promise((resolve) => {
            const req = indexedDB.open('ToeicMistakesDB', 2);
            req.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('mistakes')) {
                    db.createObjectStore('mistakes', { keyPath: 'id' });
                }
            };
            req.onsuccess = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('mistakes')) return resolve();
                try {
                    const tx = db.transaction('mistakes', 'readwrite');
                    tx.objectStore('mistakes').put(mistake);
                    tx.oncomplete = () => resolve();
                    tx.onerror = () => resolve();
                } catch (err) { resolve(); }
            };
            req.onerror = () => resolve();
        });
    },

    async _clearMistakesDB() {
        return new Promise((resolve) => {
            const req = indexedDB.open('ToeicMistakesDB', 2);
            req.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('mistakes')) {
                    db.createObjectStore('mistakes', { keyPath: 'id' });
                }
            };
            req.onsuccess = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('mistakes')) return resolve();
                try {
                    const tx = db.transaction('mistakes', 'readwrite');
                    tx.objectStore('mistakes').clear();
                    tx.oncomplete = () => resolve();
                    tx.onerror = () => resolve();
                } catch (err) { resolve(); }
            };
            req.onerror = () => resolve();
        });
    },
    // ------------------------------------------

    async backupNow() {
        if (!this.isLoggedIn()) { alert(t('driveLoginRequired')); return; }
        
        const btn = document.getElementById('btnBackupNow');
        if (btn) { btn.disabled = true; btn.textContent = '☁️ 雙軌打包備份中...'; }
        
        try {
            const vocabWords = await DB.getSavedWords();
            const mistakes = await this._getMistakesFromDB();

            const payload = {
                action: "backup",
                vocab: vocabWords,
                mistakes: mistakes
            };

            const res = await fetch(this.GAS_URL, {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            const result = await res.json();
            
            if (result.status === 'success') {
                const now = new Date().toLocaleString();
                await DB.setSetting('cloud_last_sync', now);
                this.updateUI();
                alert(`✅ 雲端備份成功！\n共備份了 ${vocabWords.length} 個單字，以及 ${mistakes.length} 題精華錯題。`);
            } else {
                throw new Error('伺服器回傳錯誤狀態');
            }
        } catch (e) {
            alert('備份失敗，請檢查網路或試算表設定：' + e.message);
        } finally {
            if (btn) { btn.textContent = t('cloudBackupNowBtn'); btn.disabled = false; }
        }
    },

    async restore() {
        if (!this.isLoggedIn()) { alert(t('driveLoginRequired')); return; }
        
        if (!confirm('⚠️ 警告：還原將會完全覆蓋本機目前的「單字本」與「錯題本」進度。\n確定要還原嗎？')) return;

        const btn = document.getElementById('btnRestore');
        if (btn) { btn.disabled = true; btn.textContent = '☁️ 雙軌還原下載中...'; }
        
        try {
            const res = await fetch(this.GAS_URL + '?action=sync_all');
            const data = await res.json();

            let vCount = 0;
            let mCount = 0;

            if (data.vocab && data.vocab.length > 0) {
                const existing = await DB.getSavedWords();
                for (const w of existing) await DB.deleteSavedWord(w.id); 
                for (const w of data.vocab) { await DB.addSavedWord(w); vCount++; }
            }

            if (data.mistakes && data.mistakes.length > 0) {
                await this._clearMistakesDB(); 
                for (const m of data.mistakes) { await this._saveMistakeToDB(m); mCount++; }
            }

            alert(`✅ 雲端還原成功！\n成功載入 ${vCount} 個單字，與 ${mCount} 題錯題。\n為了確保資料正確載入，系統即將為您重新整理網頁。`);
            location.reload(); 
        } catch (e) {
            alert('還原失敗，請檢查網路或 API 狀態：' + e.message);
        } finally {
            if (btn) { btn.textContent = t('cloudRestoreBtn'); btn.disabled = false; }
        }
    },

    async updateUI() {
        const loggedIn = this.isLoggedIn();
        const authArea = document.getElementById('cloudAuthArea');
        const userArea = document.getElementById('cloudUserArea');
        if (!authArea || !userArea) return;
        const actionsEl = userArea.querySelector('.cloud-actions');

        if (loggedIn) {
            authArea.classList.add('hidden');
            userArea.classList.remove('hidden');
            const email = await DB.getSetting('cloud_user_email') || '';
            const name = await DB.getSetting('cloud_user_name') || email;
            document.getElementById('cloudUserName').textContent = name;
            document.getElementById('cloudUserEmail').textContent = email;
            document.getElementById('cloudAvatar').textContent = (name || 'G')[0].toUpperCase();
            const lastSync = await DB.getSetting('cloud_last_sync');
            document.getElementById('cloudLastSync').textContent = lastSync
                ? t('driveLastSync', { value: lastSync })
                : t('driveNotSynced');
            actionsEl.innerHTML = `
                <button class="cloud-action-btn primary" id="btnBackupNow" onclick="DriveSync.backupNow()">${t('cloudBackupNowBtn')}</button>
                <button class="cloud-action-btn" id="btnRestore" onclick="DriveSync.restore()">${t('cloudRestoreBtn')}</button>
                <button class="cloud-action-btn danger" id="btnCloudLogout" onclick="DriveSync.logout()">${t('cloudLogoutBtn')}</button>`;
        } else {
            authArea.classList.remove('hidden');
            userArea.classList.add('hidden');
        }
    }
};

window.DriveSync = DriveSync;