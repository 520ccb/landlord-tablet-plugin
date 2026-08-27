/**
 * 房东模拟器 - 外置平板插件 v1.1
 * 整合：手机增强插件 + 住户管理插件 + 自定义APP注入 + 壁纸库 + 住户通讯录同步
 *
 * 用法：在酒馆助手中新建脚本，内容为：
 *   import 'https://cdn.jsdelivr.net/gh/520ccb/landlord-tablet-plugin@main/index.js'
 *
 * 依赖：酒馆助手环境（getVariables / insertOrAssignVariables / triggerSlash 等API）
 * 兼容：Tauri桌面端 + 浏览器端 + 安卓TauriTavern
 * v1.1: 改用jsDelivr CDN，修复移动端raw.githubusercontent.com MIME type导致加载失败的问题
 */
(function() {
    'use strict';

    console.log('[平板插件] 房东模拟器外置平板插件 v1.1 加载中...');

    if (window.__LANDLORD_TABLET_LOADED__) {
        console.log('[平板插件] 已加载，跳过');
        return;
    }
    window.__LANDLORD_TABLET_LOADED__ = true;

    // 使用 jsDelivr CDN（返回正确的 application/javascript MIME type）
    // 不要用 raw.githubusercontent.com（返回 text/plain，移动端会拒绝加载）
    var BASE = 'https://cdn.jsdelivr.net/gh/520ccb/landlord-tablet-plugin@main/modules/';
    var modules = ['phone-enhanced.js', 'tenant-manager.js', 'custom-apps.js', 'wallpaper-lib.js', 'contacts-sync.js'];

    function loadModule(name) {
        return fetch(BASE + name).then(function(r) {
            if (!r.ok) throw new Error('加载失败: ' + name + ' (' + r.status + ')');
            return r.text();
        }).then(function(code) {
            try {
                (0, eval)(code);
                console.log('[平板插件] 模块已加载: ' + name);
            } catch(e) {
                console.error('[平板插件] 模块执行失败: ' + name, e);
            }
        });
    }

    var chain = Promise.resolve();
    modules.forEach(function(m) {
        chain = chain.then(function() { return loadModule(m); });
    });
    chain.then(function() {
        console.log('[平板插件] 所有模块加载完成');
    }).catch(function(e) {
        console.error('[平板插件] 加载出错:', e);
    });
})();
