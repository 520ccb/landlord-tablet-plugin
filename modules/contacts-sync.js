/* ===== 房东模拟器·住户通讯录同步 ===== */
    (function() {
        
        /**
         * 房东模拟器 - 住户通讯录同步器
         * 将MVU中的租客列表自动同步到手机通讯录和住户群
         */
        (function() {
            'use strict';
            console.log('[房东模拟器] 通讯录同步器加载中...');
        
            var lastSyncHash = '';
        
            function getMvuTenants() {
                try {
                    if (window.parent && window.parent.Mvu && window.parent.Mvu.getMvuData) {
                        var data = window.parent.Mvu.getMvuData({ type: 'message', message_id: -1 });
                        if (data && data.stat_data && data.stat_data['租客列表']) {
                            return data.stat_data['租客列表'];
                        }
                    }
                } catch(e) {}
                try {
                    var vars = null;
                    if (typeof getVariables === 'function') {
                        vars = getVariables({ type: 'chat' }) || getVariables({ type: 'character' }) || {};
                    }
                    if (vars && vars.stat_data && vars.stat_data['租客列表']) {
                        return vars.stat_data['租客列表'];
                    }
                } catch(e) {}
                return null;
            }
        
            function getPhoneData() {
                try {
                    if (typeof getVariables === 'function') {
                        var vars = getVariables({ type: 'character' }) || {};
                        return vars.phone_data || null;
                    }
                } catch(e) {}
                return null;
            }
        
            function savePhoneData(phoneData) {
                try {
                    if (typeof insertOrAssignVariables === 'function') {
                        insertOrAssignVariables({ phone_data: phoneData }, { type: 'character' });
                        return true;
                    }
                } catch(e) { console.warn('[同步器] 保存phone_data失败:', e); }
                return false;
            }
        
            var AVATAR_POOL = ["https://aka.doubaocdn.com/s/UtTtFUOhWw", "https://aka.doubaocdn.com/s/gYhCerdbOf", "https://aka.doubaocdn.com/s/C914H7apeI", "https://aka.doubaocdn.com/s/OWtUaX4Uzw", "https://aka.doubaocdn.com/s/IpGQjfvBth", "https://aka.doubaocdn.com/s/AqUbV7fIVG", "https://aka.doubaocdn.com/s/4aOU4wrIo0", "https://aka.doubaocdn.com/s/VLpBJgk03B", "https://aka.doubaocdn.com/s/CInQLaC7sY", "https://aka.doubaocdn.com/s/chpj61wet9"];
            function makeAvatar(seed) {
                var hash = 0;
                var s = String(seed || '');
                for (var i = 0; i < s.length; i++) hash = ((hash << 5) - hash + s.charCodeAt(i)) | 0;
                return AVATAR_POOL[Math.abs(hash) % AVATAR_POOL.length];
            }
        
            function makeOnlineStyle(name, tenant) {
                var pos = tenant['职业'] || '住户';
                var dept = tenant['楼层'] || '';
                var personality = tenant['性格'] || '';
                return (dept + pos + '，' + personality).substring(0, 50);
            }
        
            function syncContacts() {
                var tenants = getMvuTenants();
                if (!tenants) return;
        
                var phoneData = getPhoneData();
                if (!phoneData) return;
                if (!Array.isArray(phoneData.characters)) phoneData.characters = [];
                if (!Array.isArray(phoneData.groups)) phoneData.groups = [];
        
                var tenantNames = Object.keys(tenants);
                var hash = tenantNames.sort().join(',');
                if (hash === lastSyncHash) return;
                lastSyncHash = hash;
        
                var changed = false;
        
                var tenantGroup = phoneData.groups.find(function(g) { return g.id === 'tenant_group'; });
                if (!tenantGroup) {
                    tenantGroup = {
                        admins: [],
                        avatar: 'https://aka.doubaocdn.com/s/D042Q3ZmEh',
                        createTime: '2026-08-18',
                        id: 'tenant_group',
                        mainMembers: ['房东'],
                        members: ['user'],
                        name: '住户邻里群',
                        notice: '公寓住户邻里群 | 通知公告 | 日常交流',
                        owner: 'user'
                    };
                    phoneData.groups.push(tenantGroup);
                    changed = true;
                }
        
                tenantNames.forEach(function(name) {
                    var tenant = tenants[name];
                    var existing = phoneData.characters.find(function(c) { return c.name === name; });
                    if (!existing) {
                        var id = name.toLowerCase().replace(/\s/g, '');
                        phoneData.characters.push({
                            avatar: makeAvatar(name),
                            bio: (tenant['年龄'] || '') + '岁 | ' + (tenant['职业'] || '住户'),
                            email: id + '@apartment.com',
                            id: id,
                            name: name,
                            nickname: name.substring(name.length - 2),
                            onlineStyle: makeOnlineStyle(name, tenant),
                            phone: '138****' + String(Math.floor(1000 + Math.random() * 9000)),
                            state: '在线',
                            tags: ['公寓住户', tenant['楼层'] || '未分配']
                        });
                        changed = true;
                        console.log('[同步器] 添加联系人:', name);
                    }
        
                    var tenantId = name.toLowerCase().replace(/\s/g, '');
                    if (tenantGroup.members.indexOf(tenantId) === -1) {
                        tenantGroup.members.push(tenantId);
                        if (tenantGroup.mainMembers.indexOf(name) === -1) {
                            tenantGroup.mainMembers.push(name);
                        }
                        changed = true;
                        console.log('[同步器] 添加到住户群:', name);
                    }
                });
        
                var toRemove = [];
                phoneData.characters.forEach(function(c, idx) {
                    if (c.tags && c.tags.indexOf('公寓住户') !== -1 && tenantNames.indexOf(c.name) === -1) {
                        toRemove.push(idx);
                    }
                });
                toRemove.reverse().forEach(function(idx) {
                    var removed = phoneData.characters.splice(idx, 1)[0];
                    var removedId = removed.id;
                    tenantGroup.members = tenantGroup.members.filter(function(m) { return m !== removedId; });
                    tenantGroup.mainMembers = tenantGroup.mainMembers.filter(function(m) { return m !== removed.name; });
                    changed = true;
                    console.log('[同步器] 移除退租住户:', removed.name);
                });
        
                if (changed) {
                    savePhoneData(phoneData);
                    console.log('[同步器] 通讯录已同步，住户数:', tenantNames.length);
                }
            }
        
            setInterval(syncContacts, 3000);
            setTimeout(syncContacts, 2000);
            console.log('[房东模拟器] 通讯录同步器已启动');
        })();
        
    })();
