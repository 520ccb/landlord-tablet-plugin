/* ===== 住户管理插件 v1.0（适配房东模拟器） ===== */
    (function() {
        (function () {
            'use strict';
            var VAR_PREFIX = 'cm_';
            var V_COMPANY = VAR_PREFIX + 'company_name';
            var V_BALANCE = VAR_PREFIX + 'balance';
            var V_WALLPAPER = VAR_PREFIX + 'wallpaper';
            var V_WORKS = VAR_PREFIX + 'works';
            var V_TWEETS = VAR_PREFIX + 'tweets';
            var V_TASKS = VAR_PREFIX + 'tasks';
            var HOST_ID = 'company-manager-host';
            var FAB_ID = 'cm-fab';
            var PANEL_ID = 'cm-panel';
            var INIT_FLAG = 'company-manager-initialized';
            var hostEl = null, shadow = null, panelEl = null, fabEl = null;
            var activeDoc = null;
            var currentTab = 'home';
            var currentWorkCat = 'cosplay';
            var currentTweetChan = 'shortvideo';
            var state = { companyName: '落日与海湾', balance: 50000, wallpaper: '', works: [], tweets: [], tasks: [] };
            var PRESET_WALLPAPERS = [
                'https://aka.doubaocdn.com/s/ioNek7XBN8','https://aka.doubaocdn.com/s/yo3oXmO5UV','https://aka.doubaocdn.com/s/sSJ9pW0nS0','https://aka.doubaocdn.com/s/3uVzCGinte','https://aka.doubaocdn.com/s/HoaQBjCYzJ',
                'https://aka.doubaocdn.com/s/UsUU3a4Jgy','https://aka.doubaocdn.com/s/YWQVvDpALZ','https://aka.doubaocdn.com/s/La5SK9zEds','https://aka.doubaocdn.com/s/F3SzXiG91y','https://aka.doubaocdn.com/s/bStsmWjsj3',
                'https://aka.doubaocdn.com/s/1Q9Om7Omj4','https://aka.doubaocdn.com/s/EJCnoSbko8','https://aka.doubaocdn.com/s/sb4RNtXRtV','https://aka.doubaocdn.com/s/kvU1UepPcQ','https://aka.doubaocdn.com/s/IepBqGontX',
                'https://aka.doubaocdn.com/s/9ojaGIVTmM','https://aka.doubaocdn.com/s/ZjMK8aqV2j','https://aka.doubaocdn.com/s/bEvmRDmUDP','https://aka.doubaocdn.com/s/XdhH3MB7Bb','https://aka.doubaocdn.com/s/qRjUS4KU1J',
                'https://aka.doubaocdn.com/s/pNdDbrw050','https://aka.doubaocdn.com/s/q6meAPdcd8','https://aka.doubaocdn.com/s/nlceo3YEVg','https://aka.doubaocdn.com/s/5fTVbVpJlS','https://aka.doubaocdn.com/s/JNmGpksI1G',
                'https://aka.doubaocdn.com/s/a5fhnsSz4W','https://aka.doubaocdn.com/s/5pUVMdhzzc','https://aka.doubaocdn.com/s/Yi69Qgywji','https://aka.doubaocdn.com/s/6jY48EssnP','https://aka.doubaocdn.com/s/pW8vFSkkF4',
                'https://aka.doubaocdn.com/s/DtcUviddHC','https://aka.doubaocdn.com/s/QViei7duCZ','https://aka.doubaocdn.com/s/7JZMycdUb4','https://aka.doubaocdn.com/s/FzEIT8pdHO','https://aka.doubaocdn.com/s/aiIxtUdRk9',
                'https://aka.doubaocdn.com/s/AYCcSGDLvZ','https://aka.doubaocdn.com/s/KdIq4lKOqa','https://aka.doubaocdn.com/s/zhYUjRhvWE','https://aka.doubaocdn.com/s/pjfJ5HguCu','https://aka.doubaocdn.com/s/X6eECrmUUG',
                'https://aka.doubaocdn.com/s/iOUULQLrHr','https://aka.doubaocdn.com/s/4gvdGEJPPO','https://aka.doubaocdn.com/s/hhXNVB4bba','https://aka.doubaocdn.com/s/TcMnVkfGx4','https://aka.doubaocdn.com/s/QAl9ObEv23',
                'https://aka.doubaocdn.com/s/u7OHzYvOkF','https://aka.doubaocdn.com/s/WRhhwlAuSk','https://aka.doubaocdn.com/s/V3Zpdk9SHM','https://aka.doubaocdn.com/s/HCJMZgjtOp','https://aka.doubaocdn.com/s/oLtluMxwXT'
            ];
            function getAllDocs() {
                var docs = [], seen = {};
                function tryAdd(doc) { if (!doc || !doc.body) return; var key = doc.URL || (doc.location && doc.location.href) || String(Math.random()); if (seen[key]) return; seen[key] = true; docs.push(doc); }
                tryAdd(document);
                try { tryAdd(window.parent.document); } catch (e) {}
                try { tryAdd(window.top.document); } catch (e) {}
                try { var iframes = document.querySelectorAll('iframe'); for (var i = 0; i < iframes.length; i++) { try { tryAdd(iframes[i].contentDocument); } catch (e) {} } } catch (e) {}
                return docs;
            }
            function getAllWindows() {
                var wins = [], seen = {};
                function tryAdd(w) { if (!w) return; try { var key = w.location.href; if (seen[key]) return; seen[key] = true; wins.push(w); } catch (e) { wins.push(w); } }
                tryAdd(window); try { tryAdd(window.parent); } catch (e) {} try { tryAdd(window.top); } catch (e) {}
                return wins;
            }
            function detectActiveDoc() {
                var docs = getAllDocs();
                for (var i = 0; i < docs.length; i++) { var d = docs[i]; try { if (d.getElementById('send_textarea') || d.querySelector('#send_but') || d.querySelector('textarea[placeholder*="发送"]') || d.querySelector('textarea[id*="send"]')) return d; } catch (e) {} }
                for (var j = 0; j < docs.length; j++) { try { if (docs[j].querySelector('[id^="improved-phone-shadow-host-"]') || docs[j].querySelector('.phone-container')) return docs[j]; } catch (e) {} }
                return docs[0] || document;
            }
            function exposeGlobals(fn) {
                var names = ['openCM', 'cmOpen', 'openCompanyManager', 'toggleCompanyManager', 'showCompanyManager', 'openTenantManager', 'toggleTenantManager'];
                var wins = getAllWindows();
                for (var i = 0; i < wins.length; i++) { for (var j = 0; j < names.length; j++) { try { wins[i][names[j]] = fn; } catch (e) {} } try { wins[i].tenantManager = { open: fn, toggle: fn, show: fn }; } catch (e) {} }
            }
            function getVarFn(name) {
                if (typeof window[name] === 'function') return window[name];
                try { if (window.tavern_helper && typeof window.tavern_helper[name] === 'function') return window.tavern_helper[name]; } catch (e) {}
                try { if (window.TavernHelper && typeof window.TavernHelper[name] === 'function') return window.TavernHelper[name]; } catch (e) {}
                return null;
            }
            function loadVar(key, def) { try { var fn = getVarFn('getVariables'); if (fn) { var v = fn({ type: 'character' }); if (v && key in v) return v[key]; } } catch (e) {} return def; }
            function saveVar(key, val) { try { var fn = getVarFn('insertOrAssignVariables'); if (fn) { var o = {}; o[key] = val; fn(o, { type: 'character' }); return true; } } catch (e) {} return false; }
            function loadAll() {
                state.companyName = loadVar(V_COMPANY, '落日与海湾');
                state.balance = loadVar(V_BALANCE, 50000);
                state.wallpaper = loadVar(V_WALLPAPER, '');
                state.works = loadVar(V_WORKS, []);
                state.tweets = loadVar(V_TWEETS, []);
                state.tasks = loadVar(V_TASKS, []);
                if (!Array.isArray(state.works)) state.works = [];
                if (!Array.isArray(state.tweets)) state.tweets = [];
                if (!Array.isArray(state.tasks)) state.tasks = [];
            }
            function showToast(msg, isErr) { try { if (typeof toastr !== 'undefined' && toastr) { isErr ? toastr.error(msg) : toastr.success(msg); return; } } catch (e) {} console.log('[CM]' + (isErr ? ' [ERR] ' : ' ') + msg); }
            function uid() { return Date.now().toString(36) + Math.random().toString(36).substr(2, 5); }
            function fmtMoney(n) { return '¥' + Number(n || 0).toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }); }
            function fmtDate(ts) { if (!ts) return ''; var d = new Date(ts); return (d.getMonth() + 1) + '/' + d.getDate() + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }
            function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; }
            function fileToDataUrl(file, maxDim, quality) {
                return new Promise(function (resolve, reject) {
                    if (!file || !file.type || file.type.indexOf('image/') !== 0) { reject(new Error('请选择图片文件')); return; }
                    if (file.type === 'image/gif') { var r = new FileReader(); r.onload = function () { resolve(String(r.result || '')); }; r.onerror = function () { reject(new Error('读取失败')); }; r.readAsDataURL(file); return; }
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        var orig = String(e.target && e.target.result || '');
                        var img = new Image();
                        img.onload = function () {
                            try {
                                var w = img.naturalWidth || img.width, h = img.naturalHeight || img.height, sc = 1;
                                if (maxDim && (w > maxDim || h > maxDim)) sc = Math.min(maxDim / w, maxDim / h);
                                var cv = document.createElement('canvas'); cv.width = Math.max(1, Math.round(w * sc)); cv.height = Math.max(1, Math.round(h * sc));
                                var c = cv.getContext('2d'); if (!c) { resolve(orig); return; }
                                c.drawImage(img, 0, 0, cv.width, cv.height);
                                resolve(cv.toDataURL('image/jpeg', quality || 0.85));
                            } catch (err) { resolve(orig); }
                        };
                        img.onerror = function () { reject(new Error('图片加载失败')); }; img.src = orig;
                    };
                    reader.onerror = function () { reject(new Error('读取文件失败')); }; reader.readAsDataURL(file);
                });
            }
            function pickFile(multiple, cb) {
                var doc = activeDoc || document;
                var input = doc.createElement('input');
                input.type = 'file'; input.accept = 'image/*'; input.multiple = !!multiple;
                input.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0;z-index:999999;';
                input.addEventListener('change', function (e) { var f = e.target && e.target.files; if (!f || !f.length) return; try { cb(Array.prototype.slice.call(f)); } catch (err) { showToast('处理文件出错', true); } });
                doc.body.appendChild(input);
                setTimeout(function () { try { input.click(); } catch (e) {} }, 10);
                setTimeout(function () { if (input.parentNode) input.parentNode.removeChild(input); }, 120000);
            }
            function sendToChat(text) {
                try {
                    var doc = activeDoc || document; var win = doc.defaultView || window;
                    var ta = doc.getElementById('send_textarea') || doc.querySelector('#send_textarea') || doc.querySelector('textarea[placeholder*="发送"]') || doc.querySelector('textarea[id*="send"]');
                    if (ta) {
                        var proto = ta.tagName === 'TEXTAREA' ? win.HTMLTextAreaElement : win.HTMLInputElement;
                        try { var setter = Object.getOwnPropertyDescriptor(proto.prototype, 'value').set; if (setter) setter.call(ta, text); else ta.value = text; } catch (e) { ta.value = text; }
                        ta.dispatchEvent(new win.Event('input', { bubbles: true })); ta.dispatchEvent(new win.Event('change', { bubbles: true })); ta.focus();
                        setTimeout(function () { var sendBtn = doc.getElementById('send_but') || doc.querySelector('#send_but') || doc.querySelector('button[id*="send"]'); if (sendBtn) { try { sendBtn.click(); } catch (e) {} } }, 200);
                        return true;
                    }
                } catch (e) {} return false;
            }
            var CM_CSS = [
                '#cm-fab{position:fixed;right:16px;bottom:160px;width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;display:flex;align-items:center;justify-content:center;font-size:24px;cursor:pointer;z-index:2147483647;box-shadow:0 4px 20px rgba(102,126,234,0.5);transition:transform .2s,box-shadow .2s;user-select:none;border:2px solid rgba(255,255,255,0.3);}',
                '#cm-fab:active{transform:scale(0.95);}',
                '@keyframes cmPulse{0%{box-shadow:0 4px 20px rgba(102,126,234,0.5);}50%{box-shadow:0 4px 30px rgba(102,126,234,0.8),0 0 0 6px rgba(102,126,234,0.15);}100%{box-shadow:0 4px 20px rgba(102,126,234,0.5);}}',
                '#cm-fab{animation:cmPulse 2.5s ease-in-out infinite;}',
                '#cm-panel{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(0.9);width:360px;height:640px;background:#fff;border-radius:28px;overflow:hidden;z-index:2147483646;display:none;flex-direction:column;pointer-events:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;}',
                '#cm-panel.cm-show{display:flex;animation:cmPop .25s ease forwards;}',
                '@keyframes cmPop{from{opacity:0;transform:translate(-50%,-50%) scale(0.85);}to{opacity:1;transform:translate(-50%,-50%) scale(1);}}',
                '.cm-header{flex-shrink:0;padding:14px 16px 10px;display:flex;align-items:center;gap:10px;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;}',
                '.cm-header-title{flex:1;font-size:16px;font-weight:600;cursor:pointer;}',
                '.cm-header-title input{background:rgba(255,255,255,0.2);border:none;color:#fff;font-size:15px;font-weight:600;padding:4px 8px;border-radius:6px;width:100%;box-sizing:border-box;outline:none;}',
                '.cm-header-balance{font-size:13px;background:rgba(255,255,255,0.2);padding:4px 10px;border-radius:12px;white-space:nowrap;}',
                '.cm-header-btn{width:30px;height:30px;border-radius:50%;border:none;background:rgba(255,255,255,0.2);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;}',
                '.cm-body{flex:1;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;position:relative;}',
                '.cm-body::-webkit-scrollbar{width:4px;}',
                '.cm-body::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.15);border-radius:2px;}',
                '.cm-nav{flex-shrink:0;display:flex;border-top:1px solid #eee;background:#fff;padding:6px 0 8px;}',
                '.cm-nav-item{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:4px 0;cursor:pointer;color:#999;font-size:10px;transition:color .2s;}',
                '.cm-nav-item i{font-size:18px;}',
                '.cm-nav-item.cm-active{color:#667eea;}',
                '.cm-page{display:none;padding:12px;}',
                '.cm-page.cm-active{display:block;}',
                '.cm-home-hero{position:relative;border-radius:16px;overflow:hidden;margin-bottom:14px;height:160px;background:linear-gradient(135deg,#667eea,#764ba2);background-size:cover;background-position:center;}',
                '.cm-home-hero-overlay{position:absolute;inset:0;background:linear-gradient(180deg,transparent 40%,rgba(0,0,0,0.5));display:flex;flex-direction:column;justify-content:flex-end;padding:14px;}',
                '.cm-home-hero-name{color:#fff;font-size:20px;font-weight:700;text-shadow:0 2px 8px rgba(0,0,0,0.5);}',
                '.cm-home-hero-sub{color:rgba(255,255,255,0.85);font-size:12px;margin-top:2px;}',
                '.cm-home-wp-btn{position:absolute;top:10px;right:10px;width:32px;height:32px;border-radius:50%;background:rgba(0,0,0,0.4);color:#fff;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:13px;backdrop-filter:blur(4px);z-index:5;}',
                '.cm-stat-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;}',
                '.cm-stat-card{background:#f7f8fc;border-radius:12px;padding:12px;text-align:center;}',
                '.cm-stat-val{font-size:18px;font-weight:700;color:#333;}',
                '.cm-stat-label{font-size:11px;color:#999;margin-top:2px;}',
                '.cm-quick-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}',
                '.cm-quick-card{background:#fff;border:1px solid #eee;border-radius:12px;padding:14px;cursor:pointer;transition:all .2s;display:flex;flex-direction:column;align-items:center;gap:6px;}',
                '.cm-quick-card:hover{border-color:#667eea;box-shadow:0 2px 10px rgba(102,126,234,0.15);transform:translateY(-1px);}',
                '.cm-quick-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;color:#fff;}',
                '.cm-quick-label{font-size:13px;color:#333;font-weight:500;}',
                '.cm-tabs{display:flex;gap:6px;margin-bottom:12px;overflow-x:auto;padding-bottom:4px;flex-shrink:0;}',
                '.cm-tab{padding:6px 14px;border-radius:16px;background:#f0f2f5;color:#666;font-size:12px;cursor:pointer;white-space:nowrap;transition:all .2s;border:none;}',
                '.cm-tab.cm-active{background:#667eea;color:#fff;}',
                '.cm-work-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}',
                '.cm-work-card{border-radius:12px;overflow:hidden;background:#fff;border:1px solid #eee;cursor:pointer;transition:all .2s;}',
                '.cm-work-card:hover{box-shadow:0 4px 12px rgba(0,0,0,0.1);transform:translateY(-1px);}',
                '.cm-work-cover{width:100%;aspect-ratio:3/4;background:linear-gradient(135deg,#e0e7ff,#c7d2fe);display:flex;align-items:center;justify-content:center;font-size:32px;position:relative;}',
                '.cm-work-cover img{width:100%;height:100%;object-fit:cover;}',
                '.cm-work-badge{position:absolute;top:6px;left:6px;background:rgba(0,0,0,0.6);color:#fff;font-size:10px;padding:2px 6px;border-radius:8px;}',
                '.cm-work-info{padding:8px 10px;}',
                '.cm-work-title{font-size:13px;font-weight:600;color:#333;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
                '.cm-work-meta{display:flex;justify-content:space-between;margin-top:4px;font-size:11px;color:#999;}',
                '.cm-work-revenue{color:#e67e22;font-weight:600;}',
                '.cm-empty{text-align:center;padding:40px 20px;color:#bbb;font-size:13px;}',
                '.cm-empty i{font-size:36px;margin-bottom:10px;display:block;opacity:0.5;}',
                '.cm-modal{position:absolute;inset:0;background:rgba(0,0,0,0.5);z-index:100;display:flex;align-items:flex-end;justify-content:center;pointer-events:auto;}',
                '.cm-modal-content{background:#fff;width:100%;max-height:85%;border-radius:20px 20px 0 0;overflow:hidden;display:flex;flex-direction:column;animation:cmSlideUp .3s ease;}',
                '.cm-wp-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:12px;overflow-y:auto;flex:1;}',
                '.cm-wp-thumb{width:100%;aspect-ratio:9/16;object-fit:cover;border-radius:8px;cursor:pointer;transition:transform .15s,box-shadow .15s;border:2px solid transparent;}',
                '.cm-wp-thumb:hover{transform:scale(1.03);box-shadow:0 2px 10px rgba(0,0,0,0.2);}',
                '.cm-wp-thumb.active{border-color:#667eea;box-shadow:0 0 0 2px rgba(102,126,234,0.3);}',
                '.cm-wp-info{text-align:center;padding:8px;font-size:12px;color:#999;flex-shrink:0;border-top:1px solid #eee;}',
                '@keyframes cmSlideUp{from{transform:translateY(100%);}to{transform:translateY(0);}}',
                '.cm-modal-header{display:flex;align-items:center;padding:14px 16px;border-bottom:1px solid #eee;flex-shrink:0;}',
                '.cm-modal-title{flex:1;font-size:15px;font-weight:600;color:#333;}',
                '.cm-modal-close{width:28px;height:28px;border-radius:50%;border:none;background:#f0f2f5;color:#666;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;}',
                '.cm-modal-body{flex:1;overflow-y:auto;padding:16px;}',
                '.cm-modal-cover{width:100%;aspect-ratio:16/9;border-radius:12px;background:linear-gradient(135deg,#e0e7ff,#c7d2fe);margin-bottom:14px;overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:48px;}',
                '.cm-modal-cover img{width:100%;height:100%;object-fit:cover;}',
                '.cm-modal-desc{font-size:13px;color:#555;line-height:1.7;margin-bottom:14px;white-space:pre-wrap;}',
                '.cm-modal-stats{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:14px;}',
                '.cm-modal-stat{background:#f7f8fc;border-radius:8px;padding:10px;text-align:center;}',
                '.cm-modal-stat-val{font-size:15px;font-weight:700;color:#333;}',
                '.cm-modal-stat-label{font-size:10px;color:#999;margin-top:2px;}',
                '.cm-modal-actions{display:flex;gap:8px;padding:12px 16px;border-top:1px solid #eee;flex-shrink:0;}',
                '.cm-btn{flex:1;padding:10px;border:none;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;transition:opacity .2s;}',
                '.cm-btn:active{opacity:0.8;}',
                '.cm-btn-primary{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;}',
                '.cm-btn-secondary{background:#f0f2f5;color:#333;}',
                '.cm-btn-danger{background:#fee2e2;color:#dc2626;}',
                '.cm-tweet{background:#fff;border-bottom:1px solid #f0f0f0;padding:12px 14px;}',
                '.cm-tweet-head{display:flex;align-items:center;gap:8px;margin-bottom:8px;}',
                '.cm-tweet-avatar{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#667eea,#764ba2);display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;font-weight:600;flex-shrink:0;}',
                '.cm-tweet-user{font-size:13px;font-weight:600;color:#333;}',
                '.cm-tweet-time{font-size:11px;color:#999;}',
                '.cm-tweet-content{font-size:13px;color:#333;line-height:1.6;margin-bottom:8px;white-space:pre-wrap;}',
                '.cm-tweet-img{width:100%;border-radius:10px;max-height:240px;object-fit:cover;margin-bottom:8px;}',
                '.cm-tweet-actions{display:flex;gap:20px;color:#999;font-size:12px;}',
                '.cm-tweet-action{display:flex;align-items:center;gap:4px;cursor:pointer;}',
                '.cm-tweet-action:hover{color:#667eea;}',
                '.cm-task-card{background:#fff;border:1px solid #eee;border-radius:12px;padding:14px;margin-bottom:10px;}',
                '.cm-task-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;}',
                '.cm-task-req{font-size:13px;color:#333;line-height:1.6;white-space:pre-wrap;}',
                '.cm-task-reward{font-size:15px;font-weight:700;color:#e67e22;white-space:nowrap;}',
                '.cm-task-meta{display:flex;justify-content:space-between;font-size:11px;color:#999;margin-top:8px;}',
                '.cm-task-status{padding:2px 8px;border-radius:8px;font-size:10px;font-weight:600;}',
                '.cm-task-status.open{background:#dbeafe;color:#2563eb;}',
                '.cm-task-status.done{background:#dcfce7;color:#16a34a;}',
                '.cm-task-status.saved{background:#fef3c7;color:#d97706;}',
                '.cm-form-group{margin-bottom:14px;}',
                '.cm-form-label{display:block;font-size:12px;color:#666;margin-bottom:6px;font-weight:500;}',
                '.cm-form-input,.cm-form-textarea{width:100%;padding:10px 12px;border:1px solid #e0e0e0;border-radius:10px;font-size:13px;box-sizing:border-box;outline:none;transition:border-color .2s;font-family:inherit;}',
                '.cm-form-input:focus,.cm-form-textarea:focus{border-color:#667eea;}',
                '.cm-form-textarea{resize:vertical;min-height:80px;}',
                '.cm-submission{background:#f7f8fc;border-radius:10px;padding:10px 12px;margin-bottom:8px;}',
                '.cm-submission-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;}',
                '.cm-submission-author{font-size:12px;font-weight:600;color:#333;}',
                '.cm-submission-content{font-size:12px;color:#666;line-height:1.5;white-space:pre-wrap;}',
                '.cm-submission-actions{display:flex;gap:6px;margin-top:8px;}',
                '.cm-submission-actions .cm-btn{padding:6px 10px;font-size:11px;flex:none;}',
                '#cm-toolbar-btn{position:fixed;left:50%;transform:translateX(-50%);bottom:8px;z-index:2147483647;padding:5px 14px;border-radius:16px;border:none;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;font-size:12px;font-weight:600;cursor:pointer;box-shadow:0 2px 10px rgba(102,126,234,0.4);display:flex;align-items:center;gap:4px;}',
                '#cm-toolbar-btn:active{transform:translateX(-50%) scale(0.95);}'
            ].join('\n');
            function injectStyle(target) { var doc = activeDoc || document; var s = doc.createElement('style'); s.textContent = CM_CSS; (target || doc.head || doc.documentElement).appendChild(s); }
            function createFab() {
                var doc = activeDoc || document;
                if (doc.getElementById(FAB_ID)) return;
                var fab = doc.createElement('div'); fab.id = FAB_ID; fab.innerHTML = '<i class="fas fa-home"></i>'; fab.title = '住户管理 (Ctrl+Shift+C)'; fab.setAttribute('data-cm-fab', '1');
                try { doc.body.appendChild(fab); } catch (e) { try { doc.documentElement.appendChild(fab); } catch (e2) { return; } }
                fabEl = fab;
                var isDragging = false, startX, startY, origX, origY, moved = false;
                fab.addEventListener('mousedown', function (e) { isDragging = true; moved = false; startX = e.clientX; startY = e.clientY; var rect = fab.getBoundingClientRect(); origX = rect.left; origY = rect.top; fab.classList.add('cm-dragging'); e.preventDefault(); });
                doc.addEventListener('mousemove', function (e) { if (!isDragging) return; var dx = e.clientX - startX, dy = e.clientY - startY; if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true; fab.style.left = (origX + dx) + 'px'; fab.style.top = (origY + dy) + 'px'; fab.style.right = 'auto'; fab.style.bottom = 'auto'; });
                doc.addEventListener('mouseup', function () { if (!isDragging) return; isDragging = false; fab.classList.remove('cm-dragging'); if (!moved) togglePanel(); });
                fab.addEventListener('touchstart', function (e) { var t = e.touches[0]; isDragging = true; moved = false; startX = t.clientX; startY = t.clientY; var rect = fab.getBoundingClientRect(); origX = rect.left; origY = rect.top; }, { passive: true });
                fab.addEventListener('touchmove', function (e) { if (!isDragging) return; var t = e.touches[0]; var dx = t.clientX - startX, dy = t.clientY - startY; if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true; fab.style.left = (origX + dx) + 'px'; fab.style.top = (origY + dy) + 'px'; fab.style.right = 'auto'; fab.style.bottom = 'auto'; }, { passive: true });
                fab.addEventListener('touchend', function () { if (!isDragging) return; isDragging = false; if (!moved) togglePanel(); });
            }
            function createPanel() {
                var doc = activeDoc || document;
                if (doc.getElementById(HOST_ID)) { hostEl = doc.getElementById(HOST_ID); shadow = hostEl.shadowRoot; return; }
                var host = doc.createElement('div'); host.id = HOST_ID; host.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483645;'; doc.body.appendChild(host);
                hostEl = host; shadow = host.attachShadow({ mode: 'open' });
                var fa = doc.createElement('link'); fa.rel = 'stylesheet'; fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'; shadow.appendChild(fa);
                var styleEl = doc.createElement('style'); styleEl.textContent = CM_CSS; shadow.appendChild(styleEl);
                var panel = doc.createElement('div'); panel.id = PANEL_ID; panel.style.pointerEvents = 'auto';
                panel.innerHTML = '<div class="cm-header"><div class="cm-header-title" id="cm-title">落日与海湾</div><div class="cm-header-balance" id="cm-balance">¥0</div><button class="cm-header-btn" id="cm-close" title="关闭"><i class="fas fa-times"></i></button></div><div class="cm-body" id="cm-body"></div><div class="cm-nav"><div class="cm-nav-item cm-active" data-tab="home"><i class="fas fa-home"></i><span>首页</span></div><div class="cm-nav-item" data-tab="works"><i class="fas fa-door-open"></i><span>房源</span></div><div class="cm-nav-item" data-tab="twitter"><i class="fas fa-stream"></i><span>动态</span></div><div class="cm-nav-item" data-tab="tasks"><i class="fas fa-bullhorn"></i><span>招租</span></div></div>';
                shadow.appendChild(panel); panelEl = panel;
                shadow.getElementById('cm-close').addEventListener('click', function () { panel.classList.remove('cm-show'); });
                var navItems = shadow.querySelectorAll('.cm-nav-item');
                for (var i = 0; i < navItems.length; i++) { navItems[i].addEventListener('click', function () { switchTab(this.getAttribute('data-tab')); }); }
                var titleEl = shadow.getElementById('cm-title');
                titleEl.addEventListener('click', function () {
                    if (this.querySelector('input')) return;
                    var oldName = state.companyName;
                    this.innerHTML = '<input type="text" value="' + esc(oldName) + '" placeholder="输入公寓名称">';
                    var inp = this.querySelector('input'); inp.focus(); inp.select();
                    function finish() { var newName = inp.value.trim() || oldName; state.companyName = newName; saveVar(V_COMPANY, newName); titleEl.textContent = newName; renderHome(); }
                    inp.addEventListener('blur', finish);
                    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); inp.blur(); } });
                });
            }
            function togglePanel() { createPanel(); if (panelEl.classList.contains('cm-show')) { panelEl.classList.remove('cm-show'); } else { loadAll(); updateHeader(); switchTab(currentTab); panelEl.classList.add('cm-show'); } }
            function switchTab(tab) {
                currentTab = tab;
                var items = shadow.querySelectorAll('.cm-nav-item');
                for (var i = 0; i < items.length; i++) { items[i].classList.toggle('cm-active', items[i].getAttribute('data-tab') === tab); }
                var body = shadow.getElementById('cm-body');
                if (tab === 'home') renderHome();
                else if (tab === 'works') renderWorks();
                else if (tab === 'twitter') renderTwitter();
                else if (tab === 'tasks') renderTasks();
            }
            function updateHeader() { shadow.getElementById('cm-title').textContent = state.companyName; shadow.getElementById('cm-balance').textContent = fmtMoney(state.balance); }
            function renderHome() {
                var body = shadow.getElementById('cm-body');
                var wpStyle = state.wallpaper ? 'background-image:url(\'' + state.wallpaper + '\');' : '';
                var totalRevenue = 0, totalViews = 0;
                for (var i = 0; i < state.works.length; i++) { totalRevenue += state.works[i].revenue || 0; totalViews += state.works[i].views || 0; }
                body.innerHTML = '<div class="cm-page cm-active"><div class="cm-home-hero" style="' + wpStyle + '"><div class="cm-home-hero-overlay"><div class="cm-home-hero-name">' + esc(state.companyName) + '</div><div class="cm-home-hero-sub">公寓住户管理中心</div></div><button class="cm-home-wp-btn" id="cm-wp-btn" title="上传本地壁纸"><i class="fas fa-image"></i></button><button class="cm-home-wp-btn" id="cm-wp-gallery" title="壁纸库" style="right:52px;"><i class="fas fa-th-large"></i></button></div><div class="cm-stat-row"><div class="cm-stat-card"><div class="cm-stat-val" style="color:#e67e22;">' + fmtMoney(state.balance) + '</div><div class="cm-stat-label">账户资金</div></div><div class="cm-stat-card"><div class="cm-stat-val">' + state.works.length + '</div><div class="cm-stat-label">房源总数</div></div></div><div class="cm-stat-row"><div class="cm-stat-card"><div class="cm-stat-val" style="color:#16a34a;">' + fmtMoney(totalRevenue) + '</div><div class="cm-stat-label">累计租金</div></div><div class="cm-stat-card"><div class="cm-stat-val">' + totalViews.toLocaleString() + '</div><div class="cm-stat-label">累计入住</div></div></div><div class="cm-quick-grid"><div class="cm-quick-card" data-quick="works"><div class="cm-quick-icon" style="background:linear-gradient(135deg,#667eea,#764ba2);"><i class="fas fa-door-open"></i></div><div class="cm-quick-label">房源管理</div></div><div class="cm-quick-card" data-quick="twitter"><div class="cm-quick-icon" style="background:linear-gradient(135deg,#1da1f2,#0d8bd9);"><i class="fas fa-stream"></i></div><div class="cm-quick-label">动态发布</div></div><div class="cm-quick-card" data-quick="tasks"><div class="cm-quick-icon" style="background:linear-gradient(135deg,#f59e0b,#d97706);"><i class="fas fa-plus-circle"></i></div><div class="cm-quick-label">发布招租</div></div><div class="cm-quick-card" data-quick="addwork"><div class="cm-quick-icon" style="background:linear-gradient(135deg,#10b981,#059669);"><i class="fas fa-upload"></i></div><div class="cm-quick-label">添加房源</div></div></div></div>';
                body.querySelector('#cm-wp-btn').addEventListener('click', function () { pickFile(false, function (files) { if (!files || !files[0]) return; fileToDataUrl(files[0], 1080, 0.85).then(function (url) { state.wallpaper = url; saveVar(V_WALLPAPER, url); renderHome(); showToast('壁纸已更换'); }).catch(function (e) { showToast(e.message || '失败', true); }); }); });
                var wpGalBtn = body.querySelector('#cm-wp-gallery'); if (wpGalBtn) wpGalBtn.addEventListener('click', openWallpaperGallery);
                var quicks = body.querySelectorAll('[data-quick]');
                for (var j = 0; j < quicks.length; j++) { quicks[j].addEventListener('click', function () { var q = this.getAttribute('data-quick'); if (q === 'addwork') openWorkForm(); else switchTab(q); }); }
            }
            var WORK_CATS = [{ key: 'cosplay', label: '单间', icon: 'fa-door-open' }, { key: 'shortvideo', label: '合租', icon: 'fa-users' }, { key: 'movie', label: '整租', icon: 'fa-home' }, { key: 'asmr', label: '商铺', icon: 'fa-store' }];
            function renderWorks() {
                var body = shadow.getElementById('cm-body');
                var tabsHtml = '';
                for (var i = 0; i < WORK_CATS.length; i++) { tabsHtml += '<button class="cm-tab' + (WORK_CATS[i].key === currentWorkCat ? ' cm-active' : '') + '" data-cat="' + WORK_CATS[i].key + '">' + WORK_CATS[i].label + '</button>'; }
                var filtered = state.works.filter(function (w) { return w.category === currentWorkCat; });
                var cardsHtml = '';
                if (filtered.length === 0) { cardsHtml = '<div class="cm-empty"><i class="fas fa-folder-open"></i>暂无房源，点击右上角添加</div>'; }
                else {
                    for (var j = 0; j < filtered.length; j++) {
                        var w = filtered[j];
                        var coverHtml = w.cover ? '<img src="' + w.cover + '" alt="">' : '<i class="fas ' + getCatIcon(w.category) + '"></i>';
                        cardsHtml += '<div class="cm-work-card" data-wid="' + w.id + '"><div class="cm-work-cover">' + coverHtml + '<span class="cm-work-badge">' + getCatLabel(w.category) + '</span></div><div class="cm-work-info"><div class="cm-work-title">' + esc(w.title) + '</div><div class="cm-work-meta"><span><i class="fas fa-eye"></i> ' + (w.views || 0) + '</span><span class="cm-work-revenue">' + fmtMoney(w.revenue || 0) + '</span></div></div></div>';
                    }
                }
                body.innerHTML = '<div class="cm-page cm-active"><div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;"><div class="cm-tabs" style="flex:1;margin-bottom:0;">' + tabsHtml + '</div><button class="cm-btn cm-btn-primary" id="cm-add-work" style="flex:none;width:36px;padding:8px 0;"><i class="fas fa-plus"></i></button></div><div class="cm-work-grid">' + cardsHtml + '</div></div>';
                var tabs = body.querySelectorAll('.cm-tab'); for (var k = 0; k < tabs.length; k++) { tabs[k].addEventListener('click', function () { currentWorkCat = this.getAttribute('data-cat'); renderWorks(); }); }
                body.querySelector('#cm-add-work').addEventListener('click', openWorkForm);
                var cards = body.querySelectorAll('.cm-work-card'); for (var m = 0; m < cards.length; m++) { cards[m].addEventListener('click', function () { openWorkDetail(this.getAttribute('data-wid')); }); }
            }
            function getCatIcon(cat) { for (var i = 0; i < WORK_CATS.length; i++) if (WORK_CATS[i].key === cat) return WORK_CATS[i].icon; return 'fa-file'; }
            function getCatLabel(cat) { for (var i = 0; i < WORK_CATS.length; i++) if (WORK_CATS[i].key === cat) return WORK_CATS[i].label; return cat; }
            function openWorkForm(editId) {
                var work = editId ? state.works.find(function (w) { return w.id === editId; }) : null;
                var modal = document.createElement('div'); modal.className = 'cm-modal';
                modal.innerHTML = '<div class="cm-modal-content"><div class="cm-modal-header"><div class="cm-modal-title">' + (work ? '编辑房源' : '添加房源') + '</div><button class="cm-modal-close"><i class="fas fa-times"></i></button></div><div class="cm-modal-body"><div class="cm-form-group"><label class="cm-form-label">房源分类</label><select class="cm-form-input" id="wf-cat"><option value="cosplay"' + (!work || work.category === 'cosplay' ? ' selected' : '') + '>单间公寓</option><option value="shortvideo"' + (work && work.category === 'shortvideo' ? ' selected' : '') + '>合租房源</option><option value="movie"' + (work && work.category === 'movie' ? ' selected' : '') + '>整租房源</option><option value="asmr"' + (work && work.category === 'asmr' ? ' selected' : '') + '>商铺房源</option></select></div><div class="cm-form-group"><label class="cm-form-label">房源标题</label><input class="cm-form-input" id="wf-title" placeholder="输入房源标题" value="' + esc(work ? work.title : '') + '"></div><div class="cm-form-group"><label class="cm-form-label">详细描述（会被酒馆记忆）</label><textarea class="cm-form-textarea" id="wf-desc" placeholder="输入房源详细描述...">' + esc(work ? work.desc : '') + '</textarea></div><div class="cm-form-group"><label class="cm-form-label">封面图片（可选）</label><button class="cm-btn cm-btn-secondary" id="wf-cover-btn" style="width:100%;"><i class="fas fa-folder-open"></i> 选择本地图片</button><div id="wf-cover-preview" style="margin-top:8px;"></div></div><div class="cm-form-group"><label class="cm-form-label">月租金（元）</label><input class="cm-form-input" id="wf-revenue" type="number" placeholder="0" value="' + (work ? work.revenue : 0) + '"></div></div><div class="cm-modal-actions">' + (work ? '<button class="cm-btn cm-btn-danger" id="wf-del"><i class="fas fa-trash"></i> 删除</button>' : '') + '<button class="cm-btn cm-btn-secondary" id="wf-cancel">取消</button><button class="cm-btn cm-btn-primary" id="wf-save"><i class="fas fa-save"></i> 保存</button></div></div>';
                shadow.querySelector('.cm-body').appendChild(modal);
                var coverData = work ? work.cover : '';
                modal.querySelector('#wf-cover-btn').addEventListener('click', function () { pickFile(false, function (files) { if (!files || !files[0]) return; fileToDataUrl(files[0], 800, 0.85).then(function (url) { coverData = url; modal.querySelector('#wf-cover-preview').innerHTML = '<img src="' + url + '" style="width:100%;border-radius:8px;max-height:160px;object-fit:cover;">'; }); }); });
                modal.querySelector('.cm-modal-close').addEventListener('click', function () { modal.remove(); });
                modal.querySelector('#wf-cancel').addEventListener('click', function () { modal.remove(); });
                if (work) { modal.querySelector('#wf-del').addEventListener('click', function () { state.works = state.works.filter(function (w) { return w.id !== editId; }); saveVar(V_WORKS, state.works); modal.remove(); renderWorks(); showToast('房源已删除'); }); }
                modal.querySelector('#wf-save').addEventListener('click', function () {
                    var title = modal.querySelector('#wf-title').value.trim(); var desc = modal.querySelector('#wf-desc').value.trim(); var cat = modal.querySelector('#wf-cat').value; var revenue = parseInt(modal.querySelector('#wf-revenue').value) || 0;
                    if (!title) { showToast('请输入房源标题', true); return; }
                    if (work) { work.category = cat; work.title = title; work.desc = desc; work.cover = coverData; work.revenue = revenue; }
                    else { state.works.unshift({ id: uid(), category: cat, title: title, desc: desc, cover: coverData, revenue: revenue, views: 0, date: Date.now() }); }
                    saveVar(V_WORKS, state.works);
                    sendToChat('【公寓新增房源】分类：' + getCatLabel(cat) + '\n标题：' + title + '\n描述：' + desc);
                    modal.remove(); renderWorks(); showToast(work ? '房源已更新' : '房源已添加');
                });
            }
            function openWorkDetail(wid) {
                var w = state.works.find(function (x) { return x.id === wid; }); if (!w) return;
                w.views = (w.views || 0) + 1; saveVar(V_WORKS, state.works);
                var coverHtml = w.cover ? '<img src="' + w.cover + '" alt="">' : '<i class="fas ' + getCatIcon(w.category) + '"></i>';
                var modal = document.createElement('div'); modal.className = 'cm-modal';
                modal.innerHTML = '<div class="cm-modal-content"><div class="cm-modal-header"><div class="cm-modal-title">' + esc(w.title) + '</div><button class="cm-modal-close"><i class="fas fa-times"></i></button></div><div class="cm-modal-body"><div class="cm-modal-cover">' + coverHtml + '</div><div style="display:inline-block;background:#eef2ff;color:#667eea;padding:3px 10px;border-radius:8px;font-size:11px;font-weight:600;margin-bottom:10px;">' + getCatLabel(w.category) + '</div><div class="cm-modal-desc">' + esc(w.desc || '暂无描述') + '</div><div class="cm-modal-stats"><div class="cm-modal-stat"><div class="cm-modal-stat-val">' + (w.views || 0) + '</div><div class="cm-modal-stat-label">查看次数</div></div><div class="cm-modal-stat"><div class="cm-modal-stat-val" style="color:#e67e22;">' + fmtMoney(w.revenue || 0) + '</div><div class="cm-modal-stat-label">月租金</div></div><div class="cm-modal-stat"><div class="cm-modal-stat-val">' + fmtDate(w.date) + '</div><div class="cm-modal-stat-label">发布时间</div></div></div></div><div class="cm-modal-actions"><button class="cm-btn cm-btn-secondary" id="wd-edit"><i class="fas fa-edit"></i> 编辑</button><button class="cm-btn cm-btn-primary" id="wd-post"><i class="fas fa-bullhorn"></i> 发布到动态</button></div></div>';
                shadow.querySelector('.cm-body').appendChild(modal);
                modal.querySelector('.cm-modal-close').addEventListener('click', function () { modal.remove(); });
                modal.querySelector('#wd-edit').addEventListener('click', function () { modal.remove(); openWorkForm(wid); });
                modal.querySelector('#wd-post').addEventListener('click', function () {
                    var chanMap = { cosplay: 'photo', shortvideo: 'shortvideo', movie: 'movie', asmr: 'asmr' };
                    state.tweets.unshift({ id: uid(), channel: chanMap[w.category] || 'photo', content: '【' + getCatLabel(w.category) + '】' + w.title + '\n' + (w.desc || ''), images: w.cover ? [w.cover] : [], likes: 0, date: Date.now() });
                    saveVar(V_TWEETS, state.tweets); modal.remove(); switchTab('twitter'); showToast('已发布到动态');
                });
            }
            var TWEET_CHANS = [{ key: 'shortvideo', label: '合租', icon: 'fa-users' }, { key: 'movie', label: '整租', icon: 'fa-home' }, { key: 'asmr', label: '出行', icon: 'fa-car' }, { key: 'photo', label: '美图', icon: 'fa-camera' }];
            function renderTwitter() {
                var body = shadow.getElementById('cm-body');
                var tabsHtml = '';
                for (var i = 0; i < TWEET_CHANS.length; i++) { tabsHtml += '<button class="cm-tab' + (TWEET_CHANS[i].key === currentTweetChan ? ' cm-active' : '') + '" data-chan="' + TWEET_CHANS[i].key + '"><i class="fas ' + TWEET_CHANS[i].icon + '"></i> ' + TWEET_CHANS[i].label + '</button>'; }
                var filtered = state.tweets.filter(function (t) { return t.channel === currentTweetChan; });
                var tweetsHtml = '';
                if (filtered.length === 0) { tweetsHtml = '<div class="cm-empty"><i class="fas fa-stream"></i>该频道暂无内容<br>可从房源详情页发布，或手动发动态</div>'; }
                else {
                    for (var j = 0; j < filtered.length; j++) {
                        var t = filtered[j]; var imgs = '';
                        if (t.images && t.images.length) { for (var k = 0; k < t.images.length; k++) imgs += '<img class="cm-tweet-img" src="' + t.images[k] + '" alt="">'; }
                        tweetsHtml += '<div class="cm-tweet" data-tid="' + t.id + '"><div class="cm-tweet-head"><div class="cm-tweet-avatar">' + esc(state.companyName.charAt(0)) + '</div><div><div class="cm-tweet-user">' + esc(state.companyName) + '</div><div class="cm-tweet-time">' + fmtDate(t.date) + '</div></div></div><div class="cm-tweet-content">' + esc(t.content) + '</div>' + imgs + '<div class="cm-tweet-actions"><span class="cm-tweet-action" data-like="' + t.id + '"><i class="far fa-heart"></i> ' + (t.likes || 0) + '</span><span class="cm-tweet-action"><i class="fas fa-retweet"></i> 转发</span><span class="cm-tweet-action" data-del="' + t.id + '"><i class="fas fa-trash"></i></span></div></div>';
                    }
                }
                body.innerHTML = '<div class="cm-page cm-active"><div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;"><div class="cm-tabs" style="flex:1;margin-bottom:0;">' + tabsHtml + '</div><button class="cm-btn cm-btn-primary" id="cm-add-tweet" style="flex:none;width:36px;padding:8px 0;"><i class="fas fa-feather"></i></button></div><div>' + tweetsHtml + '</div></div>';
                var cTabs = body.querySelectorAll('.cm-tab'); for (var m = 0; m < cTabs.length; m++) { cTabs[m].addEventListener('click', function () { currentTweetChan = this.getAttribute('data-chan'); renderTwitter(); }); }
                body.querySelector('#cm-add-tweet').addEventListener('click', openTweetForm);
                var likes = body.querySelectorAll('[data-like]'); for (var n = 0; n < likes.length; n++) { likes[n].addEventListener('click', function (e) { e.stopPropagation(); var tid = this.getAttribute('data-like'); var tw = state.tweets.find(function (x) { return x.id === tid; }); if (tw) { tw.likes = (tw.likes || 0) + 1; saveVar(V_TWEETS, state.tweets); this.innerHTML = '<i class="fas fa-heart" style="color:#e67e22;"></i> ' + tw.likes; } }); }
                var dels = body.querySelectorAll('[data-del]'); for (var p = 0; p < dels.length; p++) { dels[p].addEventListener('click', function (e) { e.stopPropagation(); var tid = this.getAttribute('data-del'); state.tweets = state.tweets.filter(function (x) { return x.id !== tid; }); saveVar(V_TWEETS, state.tweets); renderTwitter(); showToast('动态已删除'); }); }
            }
            function openWallpaperGallery() {
                var modal = document.createElement('div'); modal.className = 'cm-modal';
                var thumbs = '';
                for (var i = 0; i < PRESET_WALLPAPERS.length; i++) { var isActive = state.wallpaper === PRESET_WALLPAPERS[i] ? ' active' : ''; thumbs += '<img class="cm-wp-thumb' + isActive + '" src="' + PRESET_WALLPAPERS[i] + '" data-url="' + PRESET_WALLPAPERS[i] + '" alt="壁纸' + (i + 1) + '" loading="lazy">'; }
                modal.innerHTML = '<div class="cm-modal-content"><div class="cm-modal-header"><div class="cm-modal-title">壁纸库 (' + PRESET_WALLPAPERS.length + '张)</div><button class="cm-modal-close"><i class="fas fa-times"></i></button></div><div class="cm-wp-grid">' + thumbs + '</div><div class="cm-wp-info">点击图片即可设为公寓壁纸 · 也可点右上角上传本地图片</div></div>';
                shadow.querySelector('.cm-body').appendChild(modal);
                modal.querySelector('.cm-modal-close').addEventListener('click', function () { modal.remove(); });
                modal.addEventListener('click', function (e) { if (e.target === modal) modal.remove(); });
                var imgs = modal.querySelectorAll('.cm-wp-thumb');
                for (var j = 0; j < imgs.length; j++) { imgs[j].addEventListener('click', function () { var url = this.getAttribute('data-url'); state.wallpaper = url; saveVar(V_WALLPAPER, url); renderHome(); modal.remove(); showToast('壁纸已更换'); }); }
            }
            function openTweetForm() {
                var modal = document.createElement('div'); modal.className = 'cm-modal';
                var chanOpts = '';
                for (var i = 0; i < TWEET_CHANS.length; i++) { chanOpts += '<option value="' + TWEET_CHANS[i].key + '"' + (TWEET_CHANS[i].key === currentTweetChan ? ' selected' : '') + '>' + TWEET_CHANS[i].label + '</option>'; }
                modal.innerHTML = '<div class="cm-modal-content"><div class="cm-modal-header"><div class="cm-modal-title">发布动态</div><button class="cm-modal-close"><i class="fas fa-times"></i></button></div><div class="cm-modal-body"><div class="cm-form-group"><label class="cm-form-label">发布频道</label><select class="cm-form-input" id="tf-chan">' + chanOpts + '</select></div><div class="cm-form-group"><label class="cm-form-label">动态内容（会被酒馆记忆）</label><textarea class="cm-form-textarea" id="tf-content" placeholder="输入动态内容..."></textarea></div><div class="cm-form-group"><label class="cm-form-label">配图（可选，可多选）</label><button class="cm-btn cm-btn-secondary" id="tf-imgs" style="width:100%;"><i class="fas fa-folder-open"></i> 选择本地图片</button><div id="tf-imgs-preview" style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap;"></div></div></div><div class="cm-modal-actions"><button class="cm-btn cm-btn-secondary" id="tf-cancel">取消</button><button class="cm-btn cm-btn-primary" id="tf-publish"><i class="fas fa-paper-plane"></i> 发布</button></div></div>';
                shadow.querySelector('.cm-body').appendChild(modal);
                var imgList = [];
                modal.querySelector('#tf-imgs').addEventListener('click', function () { pickFile(true, function (files) { if (!files || !files.length) return; var ps = files.map(function (f) { return fileToDataUrl(f, 800, 0.85); }); Promise.all(ps).then(function (urls) { imgList = imgList.concat(urls); var ph = modal.querySelector('#tf-imgs-preview'); ph.innerHTML = ''; for (var i = 0; i < imgList.length; i++) { ph.innerHTML += '<img src="' + imgList[i] + '" style="width:60px;height:60px;object-fit:cover;border-radius:6px;">'; } }); }); });
                modal.querySelector('.cm-modal-close').addEventListener('click', function () { modal.remove(); });
                modal.querySelector('#tf-cancel').addEventListener('click', function () { modal.remove(); });
                modal.querySelector('#tf-publish').addEventListener('click', function () {
                    var content = modal.querySelector('#tf-content').value.trim(); var chan = modal.querySelector('#tf-chan').value;
                    if (!content) { showToast('请输入动态内容', true); return; }
                    state.tweets.unshift({ id: uid(), channel: chan, content: content, images: imgList, likes: 0, date: Date.now() });
                    saveVar(V_TWEETS, state.tweets);
                    sendToChat('【公寓发布动态】频道：' + getChanLabel(chan) + '\n内容：' + content);
                    currentTweetChan = chan; modal.remove(); renderTwitter(); showToast('动态已发布');
                });
            }
            function getChanLabel(c) { for (var i = 0; i < TWEET_CHANS.length; i++) if (TWEET_CHANS[i].key === c) return TWEET_CHANS[i].label; return c; }
            function renderTasks() {
                var body = shadow.getElementById('cm-body');
                var openTasks = state.tasks.filter(function (t) { return t.status === 'open'; });
                var doneTasks = state.tasks.filter(function (t) { return t.status === 'done' || t.status === 'saved'; });
                var all = openTasks.concat(doneTasks);
                var html = '';
                if (all.length === 0) { html = '<div class="cm-empty"><i class="fas fa-bullhorn"></i>暂无招租信息，点击下方发布</div>'; }
                else {
                    for (var i = 0; i < all.length; i++) {
                        var t = all[i];
                        var statusClass = t.status === 'open' ? 'open' : (t.status === 'saved' ? 'saved' : 'done');
                        var statusText = t.status === 'open' ? '招租中' : (t.status === 'saved' ? '已收藏' : '已出租');
                        var subCount = (t.submissions || []).length;
                        var subsHtml = '';
                        if (t.submissions && t.submissions.length) {
                            for (var j = 0; j < t.submissions.length; j++) {
                                var sub = t.submissions[j];
                                subsHtml += '<div class="cm-submission"><div class="cm-submission-head"><span class="cm-submission-author">' + esc(sub.applicant) + '</span><span style="font-size:10px;color:#999;">' + fmtDate(sub.date) + '</span></div><div class="cm-submission-content">' + esc(sub.content) + '</div>' + (sub.status === 'pending' ? '<div class="cm-submission-actions"><button class="cm-btn cm-btn-primary" data-publish-sub="' + t.id + '|' + sub.id + '">同意入住</button><button class="cm-btn cm-btn-secondary" data-save-sub="' + t.id + '|' + sub.id + '">收藏</button><button class="cm-btn cm-btn-danger" data-rej-sub="' + t.id + '|' + sub.id + '">拒绝</button></div>' : '<div style="font-size:11px;color:' + (sub.status === 'published' ? '#16a34a' : sub.status === 'saved' ? '#d97706' : '#999') + ';margin-top:4px;">' + (sub.status === 'published' ? '已出租' : sub.status === 'saved' ? '已收藏' : '已拒绝') + '</div>') + '</div>';
                            }
                        }
                        html += '<div class="cm-task-card"><div class="cm-task-header"><span class="cm-task-status ' + statusClass + '">' + statusText + '</span><span class="cm-task-reward">' + fmtMoney(t.reward) + '</span></div><div class="cm-task-req">' + esc(t.requirement) + '</div>' + (subsHtml ? '<div style="margin-top:10px;border-top:1px solid #f0f0f0;padding-top:8px;"><div style="font-size:11px;color:#999;margin-bottom:6px;">申请 (' + subCount + ')</div>' + subsHtml + '</div>' : '<div style="font-size:11px;color:#bbb;margin-top:8px;">暂无申请，等待住户响应...</div>') + '<div class="cm-task-meta"><span>' + fmtDate(t.date) + '</span><span>' + subCount + ' 份申请</span></div></div>';
                    }
                }
                body.innerHTML = '<div class="cm-page cm-active"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;"><span style="font-size:14px;font-weight:600;color:#333;">招租列表</span><button class="cm-btn cm-btn-primary" id="cm-add-task" style="flex:none;padding:8px 14px;"><i class="fas fa-plus"></i> 发布招租</button></div><div>' + html + '</div></div>';
                body.querySelector('#cm-add-task').addEventListener('click', openTaskForm);
                var pubBtns = body.querySelectorAll('[data-publish-sub]'); for (var k = 0; k < pubBtns.length; k++) { pubBtns[k].addEventListener('click', function () { var parts = this.getAttribute('data-publish-sub').split('|'); handleSubmission(parts[0], parts[1], 'published'); }); }
                var saveBtns = body.querySelectorAll('[data-save-sub]'); for (var l = 0; l < saveBtns.length; l++) { saveBtns[l].addEventListener('click', function () { var parts = this.getAttribute('data-save-sub').split('|'); handleSubmission(parts[0], parts[1], 'saved'); }); }
                var rejBtns = body.querySelectorAll('[data-rej-sub]'); for (var m = 0; m < rejBtns.length; m++) { rejBtns[m].addEventListener('click', function () { var parts = this.getAttribute('data-rej-sub').split('|'); handleSubmission(parts[0], parts[1], 'rejected'); }); }
            }
            function handleSubmission(taskId, subId, status) {
                var task = state.tasks.find(function (t) { return t.id === taskId; }); if (!task) return;
                var sub = task.submissions.find(function (s) { return s.id === subId; }); if (!sub) return;
                sub.status = status;
                if (status === 'published') {
                    task.status = 'done';
                    state.balance = Math.max(0, state.balance + (task.reward || 0));
                    saveVar(V_BALANCE, state.balance);
                    state.works.unshift({ id: uid(), category: task.category || 'shortvideo', title: sub.applicant + '的入住档案', desc: sub.content, cover: '', revenue: task.reward || 0, views: 0, date: Date.now() });
                    saveVar(V_WORKS, state.works);
                    sendToChat('【入住申请通过】住户：' + sub.applicant + '\n申请内容：' + sub.content + '\n月租金：' + fmtMoney(task.reward));
                    showToast('已同意入住，收取租金 ' + fmtMoney(task.reward));
                } else if (status === 'saved') { task.status = 'saved'; showToast('已收藏申请'); }
                else { showToast('已拒绝申请'); }
                saveVar(V_TASKS, state.tasks); updateHeader(); renderTasks();
            }
            function openTaskForm() {
                var modal = document.createElement('div'); modal.className = 'cm-modal';
                modal.innerHTML = '<div class="cm-modal-content"><div class="cm-modal-header"><div class="cm-modal-title">发布招租信息</div><button class="cm-modal-close"><i class="fas fa-times"></i></button></div><div class="cm-modal-body"><div class="cm-form-group"><label class="cm-form-label">房源类型</label><select class="cm-form-input" id="tf-cat"><option value="cosplay">单间公寓</option><option value="shortvideo">合租</option><option value="movie">整租</option><option value="asmr">商铺</option></select></div><div class="cm-form-group"><label class="cm-form-label">招租要求（详细描述，会被酒馆记忆）</label><textarea class="cm-form-textarea" id="tf-req" placeholder="例如：&#10;1. 一室一厅，朝南采光好&#10;2. 限女生，不养宠物&#10;3. 押一付三，月租3500&#10;4. 随时看房入住"></textarea></div><div class="cm-form-group"><label class="cm-form-label">月租金（元）</label><input class="cm-form-input" id="tf-reward" type="number" placeholder="500" value="500"></div><div style="background:#fef3c7;padding:10px 12px;border-radius:8px;font-size:11px;color:#92400e;line-height:1.5;"><i class="fas fa-info-circle"></i> 发布后，招租要求会发送到聊天框，AI 扮演的住户会看到并申请入住。</div></div><div class="cm-modal-actions"><button class="cm-btn cm-btn-secondary" id="tf-cancel">取消</button><button class="cm-btn cm-btn-primary" id="tf-publish"><i class="fas fa-paper-plane"></i> 发布招租</button></div></div>';
                shadow.querySelector('.cm-body').appendChild(modal);
                modal.querySelector('.cm-modal-close').addEventListener('click', function () { modal.remove(); });
                modal.querySelector('#tf-cancel').addEventListener('click', function () { modal.remove(); });
                modal.querySelector('#tf-publish').addEventListener('click', function () {
                    var req = modal.querySelector('#tf-req').value.trim(); var reward = parseInt(modal.querySelector('#tf-reward').value) || 0; var cat = modal.querySelector('#tf-cat').value;
                    if (!req) { showToast('请输入招租要求', true); return; }
                    if (reward <= 0) { showToast('请输入有效租金', true); return; }
                    state.tasks.unshift({ id: uid(), category: cat, requirement: req, reward: reward, status: 'open', submissions: [], date: Date.now() });
                    saveVar(V_TASKS, state.tasks);
                    var chatText = '【公寓发布招租信息】\n房型：' + getCatLabel(cat) + '\n要求：' + req + '\n租金：' + fmtMoney(reward) + '\n\n请有意向的住户回复你的入住申请和个人情况。';
                    sendToChat(chatText);
                    modal.remove(); renderTasks(); showToast('招租已发布，已通知住户');
                });
            }
            function injectToolbarButton() {
                try {
                    var doc = activeDoc || document;
                    if (doc.getElementById('cm-toolbar-btn')) return;
                    var btn = doc.createElement('button'); btn.id = 'cm-toolbar-btn'; btn.innerHTML = '<i class="fas fa-home"></i> 住户管理'; btn.title = '打开住户管理 (Ctrl+Shift+C)';
                    btn.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); togglePanel(); });
                    var sendBtn = doc.getElementById('send_but') || doc.querySelector('button[id*="send"]');
                    if (sendBtn && sendBtn.parentNode) { sendBtn.parentNode.style.position = sendBtn.parentNode.style.position || 'relative'; sendBtn.parentNode.appendChild(btn); }
                    else { doc.body.appendChild(btn); }
                } catch (e) {}
            }
            function init() {
                if (window[INIT_FLAG]) return true;
                try {
                    activeDoc = detectActiveDoc();
                    if (!activeDoc || !activeDoc.body) return false;
                    window[INIT_FLAG] = true;
                    loadAll(); injectStyle(); createFab(); createPanel(); injectToolbarButton();
                    var kdDoc = activeDoc;
                    kdDoc.addEventListener('keydown', function (e) { if (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c')) { e.preventDefault(); togglePanel(); } });
                    exposeGlobals(togglePanel);
                    console.log('[TenantManager] v1.0 已加载 | 触发: 浮窗/底部按钮/手机APP/Ctrl+Shift+C/openCM()');
                    return true;
                } catch (e) { window[INIT_FLAG] = false; return false; }
            }
            function ensureFabVisible() {
                try {
                    var doc = activeDoc || detectActiveDoc(); if (!doc) return; activeDoc = doc;
                    var fab = doc.getElementById(FAB_ID); if (!fab) { createFab(); fab = doc.getElementById(FAB_ID); }
                    if (fab) { fab.style.display = 'flex'; fab.style.visibility = 'visible'; fab.style.opacity = '1'; fab.style.zIndex = '2147483647'; }
                    if (!doc.getElementById('cm-toolbar-btn')) injectToolbarButton();
                } catch (e) {}
            }
            function start() {
                function tryInit() { if (window[INIT_FLAG]) return; init(); }
                if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', tryInit); } else { tryInit(); }
                [100, 300, 800, 1500, 2500, 4000, 6000, 10000, 15000, 20000].forEach(function (d) { setTimeout(function () { if (!window[INIT_FLAG]) tryInit(); else ensureFabVisible(); }, d); });
                setInterval(ensureFabVisible, 3000);
                try { var docs = getAllDocs(); for (var i = 0; i < docs.length; i++) { if (docs[i].body) { new MutationObserver(function () { if (!window[INIT_FLAG]) tryInit(); else ensureFabVisible(); }).observe(docs[i].body, { childList: true, subtree: false }); } } } catch (e) {}
            }
            start();
        })();
    })();
