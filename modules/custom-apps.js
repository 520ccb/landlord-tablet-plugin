/* ===== 房东模拟器·自定义APP注入 ===== */
    (function() {
        /**
         * 房东模拟器 - 自定义手机APP注入器 v4
         * - 修复发送按钮不显示（createElement显式创建）
         * - 天眼监控增加画面描述面板
         */
        (function() {
            'use strict';
            console.log('[房东模拟器] APP注入器v4启动');
        
            function getPhoneRoot() {
                var docs = [];
                try { docs.push(window.parent.document); } catch(e) {}
                try { docs.push(window.top.document); } catch(e) {}
                try { docs.push(document); } catch(e) {}
                for (var d = 0; d < docs.length; d++) {
                    var doc = docs[d];
                    var hosts = doc.querySelectorAll('[id^="improved-phone-shadow-host-"]');
                    for (var i = 0; i < hosts.length; i++) {
                        if (hosts[i].shadowRoot) return { doc: doc, root: hosts[i].shadowRoot };
                    }
                    try {
                        var all = doc.querySelectorAll('*');
                        for (var j = 0; j < all.length; j++) {
                            var sr = all[j].shadowRoot;
                            if (sr && sr.querySelector && sr.querySelector('.app-grid')) {
                                return { doc: doc, root: sr };
                            }
                        }
                    } catch(e) {}
                }
                return null;
            }
        
            function sendToAI(msg) {
                try {
                    if (typeof triggerSlash === 'function') {
                        triggerSlash('/send ' + msg + '|/trigger');
                        return;
                    }
                } catch(e) {}
                try {
                    var w = window.parent;
                    for (var i = 0; i < 5 && w; i++) {
                        if (typeof w.triggerSlash === 'function') {
                            w.triggerSlash('/send ' + msg + '|/trigger');
                            return;
                        }
                        w = w.parent;
                    }
                } catch(e) {}
                console.warn('[房东模拟器] triggerSlash不可用');
            }
        
            function createOverlay(ctx, title, bodyHTML, inputOpts) {
                var phoneContainer = ctx.root.querySelector('.phone-container');
                if (!phoneContainer) return null;
                var existing = ctx.root.getElementById('custom-app-overlay');
                if (existing) existing.remove();
                var doc = ctx.doc;
                var overlay = doc.createElement('div');
                overlay.id = 'custom-app-overlay';
                overlay.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:0;background:#f0f2f5;z-index:9999;display:flex;flex-direction:column;border-radius:28px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;';
                var header = doc.createElement('div');
                header.style.cssText = 'display:flex;align-items:center;padding:38px 12px 8px;background:#fff;border-bottom:1px solid #e8e8e8;flex-shrink:0;';
                var backBtn = doc.createElement('div');
                backBtn.className = 'ov-back';
                backBtn.style.cssText = 'width:36px;height:36px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#555;font-size:15px;border-radius:50%;flex-shrink:0;';
                backBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
                var titleEl = doc.createElement('div');
                titleEl.style.cssText = 'flex:1;text-align:center;font-size:16px;font-weight:600;color:#333;';
                titleEl.textContent = title;
                var closeBtn = doc.createElement('div');
                closeBtn.className = 'ov-close';
                closeBtn.style.cssText = 'width:36px;height:36px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#999;font-size:17px;border-radius:50%;flex-shrink:0;';
                closeBtn.innerHTML = '<i class="fas fa-times"></i>';
                header.appendChild(backBtn);
                header.appendChild(titleEl);
                header.appendChild(closeBtn);
                var body = doc.createElement('div');
                body.id = 'custom-app-body';
                body.style.cssText = 'flex:1;overflow-y:auto;padding:12px;-webkit-overflow-scrolling:touch;';
                body.innerHTML = bodyHTML;
                overlay.appendChild(header);
                overlay.appendChild(body);
                if (inputOpts) {
                    var inputBar = doc.createElement('div');
                    inputBar.style.cssText = 'display:flex!important;flex-direction:row!important;gap:8px!important;padding:10px 12px!important;background:#fff!important;border-top:1px solid #e8e8e8!important;flex-shrink:0!important;align-items:center!important;min-height:52px!important;box-sizing:border-box!important;';
                    var input = doc.createElement('input');
                    input.type = 'text';
                    input.className = 'ov-input';
                    input.placeholder = inputOpts.placeholder || '输入内容...';
                    input.style.cssText = 'flex:1 1 auto!important;min-width:0!important;border:1px solid #e0e0e0!important;border-radius:20px!important;padding:10px 16px!important;font-size:13px!important;outline:none!important;background:#f7f7f7!important;color:#333!important;height:40px!important;box-sizing:border-box!important;-webkit-appearance:none!important;';
                    var sendBtn = doc.createElement('button');
                    sendBtn.className = 'ov-send';
                    sendBtn.type = 'button';
                    sendBtn.style.cssText = 'flex:0 0 auto!important;width:auto!important;min-width:72px!important;height:40px!important;background:linear-gradient(135deg,#667eea,#764ba2)!important;color:#fff!important;border:none!important;border-radius:20px!important;padding:0 18px!important;font-size:14px!important;font-weight:600!important;cursor:pointer!important;white-space:nowrap!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:4px!important;box-shadow:0 2px 8px rgba(102,126,234,0.3)!important;-webkit-appearance:none!important;appearance:none!important;';
                    sendBtn.innerHTML = '<i class="fas fa-paper-plane" style="font-size:12px;"></i><span>发送</span>';
                    inputBar.appendChild(input);
                    inputBar.appendChild(sendBtn);
                    overlay.appendChild(inputBar);
                    var doSend = function() {
                        var val = input.value.trim();
                        if (!val) return;
                        input.value = '';
                        inputOpts.onSend(val);
                    };
                    sendBtn.addEventListener('click', function(e) { e.preventDefault(); e.stopPropagation(); doSend(); }, true);
                    input.addEventListener('keydown', function(e) { if (e.key === 'Enter') { e.preventDefault(); doSend(); } });
                }
                phoneContainer.appendChild(overlay);
                backBtn.addEventListener('click', function() { overlay.remove(); });
                closeBtn.addEventListener('click', function() { overlay.remove(); });
                return { body: body, doc: doc, root: ctx.root, overlay: overlay };
            }
        
            function openRecruitPanel(ctx) {
                var templates = [
                    { label: '🏠 单间公寓', tmpl: '单间公寓出租，朝南采光好，精装修拎包入住' },
                    { label: '👥 合租房源', tmpl: '合租次卧出租，限女生，不养宠物，押一付三' },
                    { label: '🏡 整租房源', tmpl: '两室一厅整租，家电齐全，随时看房入住' },
                    { label: '🏪 商铺房源', tmpl: '临街商铺出租，人流量大，适合餐饮零售' },
                    { label: '📢 紧急招租', tmpl: '紧急招租，价格优惠，先到先得' }
                ];
                var tmplHTML = templates.map(function(t) {
                    return '<button class="recruit-tmpl" data-tmpl="' + t.tmpl + '" style="padding:10px 12px;border:1px solid #e8e8e8;border-radius:8px;background:#fafafa;cursor:pointer;font-size:13px;text-align:left;color:#333;width:100%;">' + t.label + '</button>';
                }).join('');
                var bodyHTML = '<div style="text-align:center;padding:14px 0 10px;"><div style="font-size:38px;margin-bottom:6px;">🏠</div><div style="font-size:17px;font-weight:600;color:#333;">招租中心</div><div style="font-size:12px;color:#999;margin-top:3px;">发布招租信息，寻找合适住户</div></div><div style="background:#fff;border-radius:12px;padding:14px;margin-bottom:10px;"><div style="font-size:13px;font-weight:600;color:#333;margin-bottom:10px;">⚡ 快捷模板</div><div id="recruit-templates" style="display:flex;flex-direction:column;gap:7px;">' + tmplHTML + '</div></div><div style="background:#fff;border-radius:12px;padding:14px;"><div style="font-size:13px;font-weight:600;color:#333;margin-bottom:6px;">📌 说明</div><div style="font-size:11px;color:#999;line-height:1.8;">• 点击模板或在下方输入框输入招租要求后点发送<br>• 招租信息会发送给AI扮演的住户<br>• 住户看到后会主动申请入住<br>• 可在住户管理中审核申请</div></div>';
                var panel = createOverlay(ctx, '招租中心', bodyHTML, {
                    placeholder: '输入招租要求，如：单间出租，月租2500...',
                    onSend: function(val) {
                        sendToAI('公寓发布招租信息：' + val);
                        var ov = ctx.root.getElementById('custom-app-overlay');
                        if (ov) ov.remove();
                    }
                });
                if (panel) {
                    panel.body.querySelectorAll('.recruit-tmpl').forEach(function(btn) {
                        btn.addEventListener('click', function() {
                            sendToAI('公寓发布招租信息：' + btn.getAttribute('data-tmpl'));
                            var ov = ctx.root.getElementById('custom-app-overlay');
                            if (ov) ov.remove();
                        });
                    });
                }
            }
        
            var survState = { active: false, recording: false, seconds: 0, timer: null, target: '', angle: '', recordings: [] };
        
            function openSurveillancePanel(ctx) {
                var doc = ctx.doc;
                if (!ctx.root.getElementById('surv-anim-style')) {
                    var styleEl = doc.createElement('style');
                    styleEl.id = 'surv-anim-style';
                    styleEl.textContent = '@keyframes survScan{0%{top:0}100%{top:100%}}@keyframes survBlink{0%,100%{opacity:1}50%{opacity:0.3}}@keyframes survNoise{0%,100%{opacity:0.03}50%{opacity:0.06}}@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}';
                    ctx.root.appendChild(styleEl);
                }
                var quickBtns = [
                    { label: '🏢 公寓大厅', target: '公寓大厅全景，俯瞰角度' },
                    { label: '🚪 走廊', target: '楼层走廊，侧面角度' },
                    { label: '☕ 休息区', target: '公共休息区，跟随视角' },
                    { label: '🌆 公寓外景', target: '公寓楼外，远景' }
                ];
                var quickHTML = quickBtns.map(function(b) {
                    return '<button class="surv-quick-btn" data-target="' + b.target + '" style="padding:9px;border:1px solid #e8e8e8;border-radius:8px;background:#fafafa;cursor:pointer;font-size:12px;text-align:center;color:#333;">' + b.label + '</button>';
                }).join('');
                var bodyHTML = '<div style="display:flex;flex-direction:column;gap:10px;"><div id="surv-screen" style="position:relative;background:#0a0a1a;border-radius:10px;overflow:hidden;aspect-ratio:16/10;min-height:160px;display:flex;align-items:center;justify-content:center;"><div style="position:absolute;inset:0;background:linear-gradient(135deg,#0a0a1a 0%,#1a1a3e 50%,#0a0a1a 100%);"></div><div style="position:absolute;inset:0;background-image:linear-gradient(rgba(0,255,0,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,0,0.06) 1px,transparent 1px);background-size:20px 20px;"></div><div id="surv-noise" style="position:absolute;inset:0;background:#fff;opacity:0.03;animation:survNoise 0.5s infinite;display:none;"></div><div id="surv-scanline" style="position:absolute;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(0,255,0,0.5),transparent);animation:survScan 2.5s linear infinite;display:none;"></div><div id="surv-placeholder" style="position:relative;text-align:center;z-index:2;"><div style="font-size:32px;margin-bottom:4px;">👁️</div><div style="color:rgba(255,255,255,0.4);font-size:11px;">输入监控目标开始监控</div></div><div id="surv-info" style="position:absolute;top:6px;left:6px;right:6px;display:none;z-index:3;justify-content:space-between;align-items:flex-start;"><div style="background:rgba(0,0,0,0.65);padding:3px 7px;border-radius:4px;font-size:9px;color:#0f0;font-family:monospace;line-height:1.5;"><div id="surv-target">目标: --</div><div id="surv-angle">角度: --</div></div><div style="display:flex;align-items:center;gap:4px;background:rgba(0,0,0,0.65);padding:3px 7px;border-radius:4px;"><div id="surv-rec-dot" style="width:7px;height:7px;border-radius:50%;background:#f00;display:none;animation:survBlink 1s infinite;"></div><span id="surv-timer" style="font-size:9px;color:#0f0;font-family:monospace;">00:00</span></div></div><div id="surv-status-bar" style="position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,0.55);padding:3px 7px;display:none;z-index:3;justify-content:space-between;font-size:8px;color:rgba(0,255,0,0.7);font-family:monospace;"><span>CH-01 天眼</span><span id="surv-datetime">--</span><span>● REC</span></div></div><div id="surv-desc-panel" style="display:none;background:#1a1a2e;border-radius:10px;padding:10px 12px;border:1px solid #2a2a4e;"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;"><div style="font-size:11px;color:#0f0;font-family:monospace;display:flex;align-items:center;gap:5px;"><span style="width:6px;height:6px;border-radius:50%;background:#0f0;display:inline-block;animation:survBlink 2s infinite;"></span>实时画面描述</div><button id="surv-refresh-btn" style="background:none;border:1px solid #0f0;color:#0f0;padding:2px 8px;border-radius:4px;font-size:10px;cursor:pointer;"><i class="fas fa-sync-alt"></i> 刷新</button></div><div id="surv-desc-content" style="font-size:12px;color:#ccc;line-height:1.7;max-height:120px;overflow-y:auto;">正在接收监控画面...</div></div><div><div style="font-size:12px;font-weight:600;color:#333;margin-bottom:5px;">⚡ 快捷监控</div><div id="surv-quick" style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">' + quickHTML + '</div></div><div id="surv-controls" style="display:none;gap:6px;"><button class="surv-ctrl" data-action="record" style="flex:1;padding:10px;border:none;border-radius:8px;background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:4px;"><i class="fas fa-circle"></i> 录制</button><button class="surv-ctrl" data-action="snapshot" style="flex:1;padding:10px;border:none;border-radius:8px;background:linear-gradient(135deg,#3b82f6,#2563eb);color:#fff;font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:4px;"><i class="fas fa-camera"></i> 截图</button><button class="surv-ctrl" data-action="switch" style="flex:1;padding:10px;border:none;border-radius:8px;background:linear-gradient(135deg,#6b7280,#4b5563);color:#fff;font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:4px;"><i class="fas fa-sync-alt"></i> 切角度</button></div><div id="surv-recordings" style="display:none;"><div style="font-size:12px;font-weight:600;color:#333;margin-bottom:5px;">📹 监控记录 (<span id="surv-rec-count">0</span>)</div><div id="surv-rec-list" style="display:flex;flex-direction:column;gap:5px;max-height:100px;overflow-y:auto;"></div></div></div>';
                var panel = createOverlay(ctx, '天眼监控', bodyHTML, {
                    placeholder: '输入监控目标，如：监控302房间...',
                    onSend: function(val) { startSurveillance(ctx, val); }
                });
                if (!panel) return;
                panel.body.querySelectorAll('.surv-quick-btn').forEach(function(btn) {
                    btn.addEventListener('click', function() { startSurveillance(ctx, btn.getAttribute('data-target')); });
                });
                panel.body.querySelectorAll('.surv-ctrl').forEach(function(btn) {
                    btn.addEventListener('click', function() {
                        var action = btn.getAttribute('data-action');
                        if (action === 'record') toggleRecording(ctx, btn);
                        else if (action === 'snapshot') takeSnapshot(ctx);
                        else if (action === 'switch') switchAngle(ctx);
                    });
                });
                var refreshBtn = panel.body.querySelector('#surv-refresh-btn');
                if (refreshBtn) {
                    refreshBtn.addEventListener('click', function() {
                        if (survState.active) {
                            var descEl = ctx.root.getElementById('surv-desc-content');
                            if (descEl) descEl.textContent = '正在刷新画面...';
                            sendToAI('刷新天眼监控画面，目标：' + survState.target + '，角度：' + survState.angle + '。请详细描述当前画面中人物的动作、神态和环境。');
                        }
                    });
                }
            }
        
            function startSurveillance(ctx, target) {
                survState.active = true;
                survState.target = target;
                var parts = target.split(/[，,]/);
                survState.angle = parts[1] || parts[0];
                var root = ctx.root;
                var setDisplay = function(id, val) { var el = root.getElementById(id); if (el) el.style.display = val; };
                var setText = function(id, val) { var el = root.getElementById(id); if (el) el.textContent = val; };
                setDisplay('surv-placeholder', 'none');
                setDisplay('surv-info', 'flex');
                setDisplay('surv-status-bar', 'flex');
                setDisplay('surv-scanline', 'block');
                setDisplay('surv-noise', 'block');
                setDisplay('surv-controls', 'flex');
                setDisplay('surv-desc-panel', 'block');
                setText('surv-target', '目标: ' + parts[0]);
                setText('surv-angle', '角度: ' + survState.angle);
                setText('surv-datetime', new Date().toLocaleString('zh-CN', {month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}));
                var descEl = root.getElementById('surv-desc-content');
                if (descEl) { descEl.textContent = '正在接收监控画面...'; descEl.style.animation = 'fadeIn 0.3s ease'; }
                sendToAI('打开天眼监控，目标：' + target + '。请用不超过600字详细描述监控画面，重点描写人物的动作、神态、表情和环境细节。');
            }
        
            function toggleRecording(ctx, btn) {
                var root = ctx.root;
                var recDot = root.getElementById('surv-rec-dot');
                var timerEl = root.getElementById('surv-timer');
                if (!survState.recording) {
                    survState.recording = true;
                    survState.seconds = 0;
                    if (recDot) recDot.style.display = 'block';
                    btn.innerHTML = '<i class="fas fa-stop"></i> 停止';
                    btn.style.background = 'linear-gradient(135deg,#6b7280,#4b5563)';
                    survState.timer = setInterval(function() {
                        survState.seconds++;
                        var m = String(Math.floor(survState.seconds / 60)).padStart(2, '0');
                        var s = String(survState.seconds % 60).padStart(2, '0');
                        if (timerEl) timerEl.textContent = m + ':' + s;
                    }, 1000);
                } else {
                    survState.recording = false;
                    clearInterval(survState.timer);
                    if (recDot) recDot.style.display = 'none';
                    btn.innerHTML = '<i class="fas fa-circle"></i> 录制';
                    btn.style.background = 'linear-gradient(135deg,#ef4444,#dc2626)';
                    var rec = { name: '录像_' + new Date().toLocaleTimeString('zh-CN', {hour:'2-digit',minute:'2-digit'}), target: survState.target, duration: survState.seconds, time: new Date().toLocaleString('zh-CN') };
                    survState.recordings.push(rec);
                    updateRecordingList(ctx);
                    sendToAI('天眼监控录制完成，已保存。目标：' + rec.target + '，时长' + rec.duration + '秒。');
                }
            }
        
            function takeSnapshot(ctx) {
                var descEl = ctx.root.getElementById('surv-desc-content');
                if (descEl) descEl.textContent = '正在截取画面...';
                sendToAI('天眼截图，目标：' + survState.target + '。请详细描述当前画面中人物的动作和神态。');
            }
        
            function switchAngle(ctx) {
                var angles = ['俯瞰', '侧面', '跟随', '特写', '全景', '透视'];
                var newAngle = angles[Math.floor(Math.random() * angles.length)];
                survState.angle = newAngle;
                var angleEl = ctx.root.getElementById('surv-angle');
                if (angleEl) angleEl.textContent = '角度: ' + newAngle;
                var descEl = ctx.root.getElementById('surv-desc-content');
                if (descEl) descEl.textContent = '正在切换角度...';
                sendToAI('切换监控角度为' + newAngle + '，目标：' + survState.target + '。请详细描述新角度下的画面，重点描写人物动作神态。');
            }
        
            function updateRecordingList(ctx) {
                var root = ctx.root;
                var container = root.getElementById('surv-recordings');
                var list = root.getElementById('surv-rec-list');
                var count = root.getElementById('surv-rec-count');
                if (!container || !list) return;
                container.style.display = 'block';
                if (count) count.textContent = survState.recordings.length;
                list.innerHTML = '';
                survState.recordings.forEach(function(rec, idx) {
                    var item = ctx.doc.createElement('div');
                    item.style.cssText = 'display:flex;align-items:center;gap:8px;padding:7px 8px;background:#f5f5f5;border-radius:6px;font-size:11px;';
                    item.innerHTML = '<i class="fas fa-video" style="color:#667eea;"></i><div style="flex:1;min-width:0;"><div style="font-weight:600;color:#333;">' + rec.name + '</div><div style="color:#999;font-size:10px;">' + rec.target.substring(0, 18) + ' · ' + rec.duration + 's</div></div><button class="rec-send" data-idx="' + idx + '" style="border:none;background:#667eea;color:#fff;padding:4px 8px;border-radius:4px;font-size:10px;cursor:pointer;">发送</button>';
                    list.appendChild(item);
                });
                list.querySelectorAll('.rec-send').forEach(function(btn) {
                    btn.addEventListener('click', function() {
                        var idx = parseInt(btn.getAttribute('data-idx'));
                        var rec = survState.recordings[idx];
                        sendToAI('将天眼监控录像「' + rec.name + '」发送到住户群。');
                    });
                });
            }
        
            var APPS = [
                { id: 'recruit_app', name: '招租', icon: 'fa-bullhorn', color: 'linear-gradient(135deg,#667eea,#764ba2)', onClick: openRecruitPanel },
                { id: 'surveillance_app', name: '天眼', icon: 'fa-eye', color: 'linear-gradient(135deg,#0f2027,#203a43,#2c5364)', onClick: openSurveillancePanel }
            ];
        
            function injectApps() {
                var ctx = getPhoneRoot();
                if (!ctx) return;
                var appGrid = ctx.root.querySelector('.app-grid');
                if (!appGrid) return;
                if (appGrid.querySelector('[data-custom-app]')) return;
                APPS.forEach(function(app) {
                    var block = ctx.doc.createElement('div');
                    block.className = 'app-block';
                    block.setAttribute('data-custom-app', app.id);
                    block.innerHTML = '<div class="icon-container" style="background:' + app.color + '"><i class="fas ' + app.icon + '"></i></div><span>' + app.name + '</span>';
                    block.addEventListener('click', function(e) { e.stopPropagation(); e.preventDefault(); app.onClick(ctx); });
                    appGrid.appendChild(block);
                });
                console.log('[房东模拟器] APP注入成功');
            }
        
            function start() {
                injectApps();
                var ctx = getPhoneRoot();
                if (ctx && !ctx._observed) {
                    ctx._observed = true;
                    try {
                        new MutationObserver(function() { if (!ctx.root.querySelector('[data-custom-app]')) injectApps(); }).observe(ctx.root, { childList: true, subtree: true });
                    } catch(e) {}
                }
            }
        
            setInterval(start, 1500);
            setTimeout(start, 800);
            setTimeout(start, 2500);
            setTimeout(start, 5000);
            try { new MutationObserver(start).observe(window.parent.document.body, { childList: true, subtree: true }); } catch(e) {}
            console.log('[房东模拟器] APP注入器v4已加载');
        })();
    })();
