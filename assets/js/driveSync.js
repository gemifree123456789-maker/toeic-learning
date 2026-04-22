// Google Drive & GAS dual-track sync engine

import { DB } from './db.js';
import { t } from './i18n.js';
import { MistakesDB, SecretsDB } from './specialTraining.js'; 

let _callbacks = { renderHistory: null, loadLastSession: null, renderVocabTab: null };

export const DriveSync = {
    GAS_URL: 'https://script.google.com/macros/s/AKfycbwuHbB3hvzuEqSps2Aj0baEMTgY_32p7mqr4-_vg7v0HWljWDvrLl78-_5pMtDAHDes/exec',

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

    async backupNow() {
        if (!this.isLoggedIn()) { alert(t('driveLoginRequired')); return; }
        
        const btn = document.getElementById('btnBackupNow');
        if (btn) { btn.disabled = true; btn.textContent = '☁️ 雙軌打包備份中...'; }
        
        try {
            const vocabWords = await DB.getSavedWords();
            const mistakes = await MistakesDB.getAll(); 
            const secrets = await SecretsDB.getAll(); 
            const dailyGoals = await DB.getDailyGoals();
            const dailyProgress = await DB.getDailyProgress();
            const generalHistory = await DB.getHistory();

            const safeHistory = generalHistory.map(h => {
                try {
                    const copy = JSON.parse(JSON.stringify(h));
                    delete copy.audio;
                    delete copy.audioBase64;
                    delete copy.audioData;
                    if (copy.examSnapshot && copy.examSnapshot.listeningAudioByQuestion) {
                        copy.examSnapshot.listeningAudioByQuestion = {};
                    }
                    return copy;
                } catch(e) { return h; }
            });

            const payload = {
                action: "backup",
                vocab: vocabWords,
                mistakes: mistakes,
                secrets: secrets, 
                dailyTasks: { goals: dailyGoals, progress: dailyProgress },
                history: safeHistory
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
                alert(`✅ 雲端備份成功！\n已上傳：\n單字 ${vocabWords.length} 個\n錯題 ${mistakes.length} 題\n秘笈 ${secrets.length} 條\n紀錄 ${safeHistory.length} 筆。`);
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
        
        if (!confirm('⚠️ 警告：還原將會完全覆蓋本機目前的「單字本」、「錯題本」、「學習紀錄」與「今日任務進度」。\n確定要還原嗎？')) return;

        const btn = document.getElementById('btnRestore');
        if (btn) { btn.disabled = true; btn.textContent = '☁️ 雙軌還原下載中...'; }
        
        try {
            const res = await fetch(this.GAS_URL + '?action=sync_all');
            const data = await res.json();

            let vCount = 0, mCount = 0, sCount = 0, hCount = 0;

            if (data.vocab && data.vocab.length > 0) {
                const existing = await DB.getSavedWords();
                for (const w of existing) await DB.deleteSavedWord(w.id); 
                for (const w of data.vocab) { await DB.addSavedWord(w); vCount++; }
            }

            if (data.mistakes && data.mistakes.length > 0) {
                await MistakesDB.clearAll(); 
                await MistakesDB.saveBatch(data.mistakes);
                mCount = data.mistakes.length;
            }

            if (data.secrets && data.secrets.length > 0) {
                await SecretsDB.clearAll(); 
                await SecretsDB.saveBatch(data.secrets);
                sCount = data.secrets.length;
            }

            if (data.dailyTasks) {
                if (data.dailyTasks.goals) await DB.setDailyGoals(data.dailyTasks.goals);
                if (data.dailyTasks.progress) await DB.setSetting('daily_progress', data.dailyTasks.progress);
            }

            if (data.history && data.history.length > 0) {
                await DB.clearHistory();
                for (const h of data.history) { await DB.addHistory(h); hCount++; }
            }

            alert(`✅ 雲端還原成功！\n成功載入 ${vCount} 個單字、${mCount} 題錯題、${sCount} 條秘笈與 ${hCount} 筆學習紀錄。\n系統即將重新整理。`);
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
            
            const nameEl = document.getElementById('cloudUserName');
            const emailEl = document.getElementById('cloudUserEmail');
            const avatarEl = document.getElementById('cloudAvatar');
            const syncEl = document.getElementById('cloudLastSync');
            
            if (nameEl) nameEl.textContent = name;
            if (emailEl) emailEl.textContent = email;
            if (avatarEl) avatarEl.textContent = (name || 'G')[0].toUpperCase();
            
            if (syncEl) {
                const lastSync = await DB.getSetting('cloud_last_sync');
                syncEl.textContent = lastSync ? t('driveLastSync', { value: lastSync }) : t('driveNotSynced');
            }

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