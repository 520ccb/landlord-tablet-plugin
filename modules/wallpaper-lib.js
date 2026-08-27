/* ===== 房东模拟器·壁纸库 ===== */
    (function() {
        
        /**
         * 创业模拟器 - 手机壁纸库 v1
         * 提供30张壁纸，可在手机中切换
         */
        (function() {
            'use strict';
            console.log('[房东模拟器] 壁纸库加载中...');
        
            var WALLPAPERS = ["https://aka.doubaocdn.com/s/6TagT6uNr3", "https://aka.doubaocdn.com/s/1IkEh9UeQc", "https://aka.doubaocdn.com/s/3pnild68FV", "https://aka.doubaocdn.com/s/LWNUFQTmD1", "https://aka.doubaocdn.com/s/11WAC1BMpC", "https://aka.doubaocdn.com/s/DqeGZ4cYvl", "https://aka.doubaocdn.com/s/VkwqJoIeLL", "https://aka.doubaocdn.com/s/qP6E7LNCpV", "https://aka.doubaocdn.com/s/k5IP42gZm8", "https://aka.doubaocdn.com/s/iNAoTLa1DB", "https://aka.doubaocdn.com/s/Osw689Y3zz", "https://aka.doubaocdn.com/s/WTfrYL5NP0", "https://aka.doubaocdn.com/s/jz8H4nzZLM", "https://aka.doubaocdn.com/s/HuUjI6xRY6", "https://aka.doubaocdn.com/s/88kYRKlfKP", "https://aka.doubaocdn.com/s/E87lDPkRsD", "https://aka.doubaocdn.com/s/tmFnT71ym4", "https://aka.doubaocdn.com/s/TPYsGAMePC", "https://aka.doubaocdn.com/s/1iJzZX2pFH", "https://aka.doubaocdn.com/s/XyemV9RSwp", "https://aka.doubaocdn.com/s/1KzLvwi0OV", "https://aka.doubaocdn.com/s/8912Ov1MMi", "https://aka.doubaocdn.com/s/purTIwSHgJ", "https://aka.doubaocdn.com/s/4z6SduraHf", "https://aka.doubaocdn.com/s/50pkFpde78", "https://aka.doubaocdn.com/s/QCu6ehVOtT", "https://aka.doubaocdn.com/s/IPaWKKEdzv", "https://aka.doubaocdn.com/s/bMTqu6Vs9o", "https://aka.doubaocdn.com/s/S56mSsqlXj", "https://aka.doubaocdn.com/s/Z3p9EjtFUQ"];
            var currentWallpaper = 0;
        
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
                            if (sr && sr.querySelector && sr.querySelector('.phone-container')) {
                                return { doc: doc, root: sr };
                            }
                        }
                    } catch(e) {}
                }
                return null;
            }
        
            function applyWallpaper(ctx, index) {
                currentWallpaper = index % WALLPAPERS.length;
                var url = WALLPAPERS[currentWallpaper];
                var root = ctx.root;
        
                var styleId = 'startup-wallpaper-style';
                var existingStyle = root.getElementById(styleId);
                if (existingStyle) existingStyle.remove();
        
                var style = ctx.doc.createElement('style');
                style.id = styleId;
                style.textContent =
                    '.phone-container, .phone-home, .phone-lock-screen {' +
                    '  background-image: url("' + url + '") !important;' +
                    '  background-size: cover !important;' +
                    '  background-position: center !important;' +
                    '  background-repeat: no-repeat !important;' +
                    '}' +
                    '.phone-container::before {' +
                    '  content: "" !important;' +
                    '  position: absolute !important;' +
                    '  inset: 0 !important;' +
                    '  background: rgba(0,0,0,0.15) !important;' +
                    '  z-index: 0 !important;' +
                    '  pointer-events: none !important;' +
                    '}' +
                    '.app-block span, .phone-time, .phone-date {' +
                    '  text-shadow: 0 1px 4px rgba(0,0,0,0.6) !important;' +
                    '}';
                root.appendChild(style);
                console.log('[房东模拟器] 壁纸已切换 #' + currentWallpaper);
            }
        
            function addWallpaperButton(ctx) {
                var phoneContainer = ctx.root.querySelector('.phone-container');
                if (!phoneContainer) return;
                if (ctx.root.getElementById('wallpaper-toggle-btn')) return;
        
                var btn = ctx.doc.createElement('div');
                btn.id = 'wallpaper-toggle-btn';
                btn.style.cssText =
                    'position:absolute;top:44px;right:8px;z-index:9998;' +
                    'width:30px;height:30px;border-radius:50%;' +
                    'background:rgba(0,0,0,0.35);color:#fff;' +
                    'display:flex;align-items:center;justify-content:center;' +
                    'font-size:14px;cursor:pointer;backdrop-filter:blur(6px);' +
                    '-webkit-backdrop-filter:blur(6px);' +
                    'border:1px solid rgba(255,255,255,0.15);' +
                    'transition:all 0.2s;user-select:none;' +
                    '-webkit-tap-highlight-color:transparent;';
                btn.innerHTML = '<i class="fas fa-images" style="font-size:13px;"></i>';
                btn.title = '切换壁纸';
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    currentWallpaper = (currentWallpaper + 1) % WALLPAPERS.length;
                    applyWallpaper(ctx, currentWallpaper);
                });
                phoneContainer.appendChild(btn);
            }
        
            function start() {
                var ctx = getPhoneRoot();
                if (!ctx) return;
                applyWallpaper(ctx, currentWallpaper);
                addWallpaperButton(ctx);
            }
        
            setInterval(start, 2000);
            setTimeout(start, 1000);
            setTimeout(start, 3000);
            setTimeout(start, 6000);
            try { new MutationObserver(start).observe(window.parent.document.body, { childList: true, subtree: true }); } catch(e) {}
            console.log('[房东模拟器] 壁纸库脚本已加载，共' + WALLPAPERS.length + '张壁纸');
        })();
        
    })();
