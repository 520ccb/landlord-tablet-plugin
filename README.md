# 房东模拟器 - 外置平板插件 v1.1

为酒馆助手（SillyTavern / TauriTavern）的房东模拟器角色卡打造的外置平板/手机插件整合包，通过 jsDelivr CDN 远程引用，无需手动复制大量代码。

## 安装方法（酒馆助手 / TauriTavern 手机端）

1. 打开酒馆助手，进入「扩展插件」→「脚本」
2. 新建一个脚本，名称随意（如「房东平板插件」）
3. 脚本内容填入以下一行（**注意不要换行**）：

```javascript
import 'https://cdn.jsdelivr.net/gh/520ccb/landlord-tablet-plugin@main/index.js'
```

4. 保存并启用脚本
5. 刷新页面或重新进入聊天，插件会自动加载所有模块

> **重要**：必须使用 `cdn.jsdelivr.net` 地址，不要用 `raw.githubusercontent.com`。后者返回 `text/plain` MIME type，移动端 WebView 会拒绝加载 ES module。

## 功能模块

| 模块 | 文件 | 说明 |
|------|------|------|
| 手机增强 | `modules/phone-enhanced.js` | 本地图片上传、壁纸滑动切换、表情包本地上传、住户管理APP入口 |
| 住户管理 | `modules/tenant-manager.js` | 浮窗式公寓管理面板：首页/房源管理/住户动态/招租任务 |
| 自定义APP | `modules/custom-apps.js` | 招租中心APP + 天眼监控APP（画面描述/录制/截图/切角度） |
| 壁纸库 | `modules/wallpaper-lib.js` | 30张预设壁纸，一键切换手机壁纸 |
| 通讯录同步 | `modules/contacts-sync.js` | MVU租客列表自动同步到手机通讯录和住户邻里群 |

## 使用方法

### 住户管理面板
- **浮窗按钮**：屏幕右侧紫色圆形按钮（🏠），点击打开
- **底部按钮**：聊天输入框下方的「住户管理」按钮
- **快捷键**：`Ctrl + Shift + C`（桌面端）
- **手机APP**：手机桌面新增「住户管理」APP图标
- **全局函数**：在控制台调用 `openCM()` 或 `toggleTenantManager()`

面板包含四个标签页：
1. **首页**：公寓壁纸、名称编辑、账户资金、累计租金、快捷入口
2. **房源**：单间/合租/整租/商铺 四分类管理，添加/编辑/删除房源
3. **动态**：合租/整租/出行/美图 四频道，发布住户生活动态
4. **招租**：发布招租信息，AI住户主动申请，审核同意/收藏/拒绝

### 手机增强功能
- **本地上传**：表情包、头像、背景图均支持本地文件上传
- **壁纸滑动**：手机首页向左滑动进入壁纸页面，可添加/删除/切换本地壁纸
- **壁纸按钮**：手机右上角壁纸切换按钮，30张预设壁纸一键切换

### 自定义APP
- **招租中心**：快捷模板 + 自定义招租要求，一键发布给AI住户
- **天眼监控**：输入监控目标，AI实时描述画面；支持录制、截图、切换角度

### 通讯录同步
- 自动检测 MVU 中的「租客列表」变量
- 新住户自动添加到手机通讯录和「住户邻里群」
- 退租住户自动移除
- 每3秒自动同步一次

## 技术说明

- **加载方式**：`index.js` 作为入口加载器，通过 `fetch()` + `eval()` 从 jsDelivr CDN 顺序加载 `modules/` 下的5个模块
- **CDN选择**：使用 jsDelivr（`cdn.jsdelivr.net`）而非 raw.githubusercontent.com，因为后者返回 `text/plain` MIME type 且带 `x-content-type-options: nosniff`，移动端 WebView 会拒绝 ES module 加载
- **数据存储**：所有数据存入角色变量（`cm_` 前缀），支持持久化
- **防重复加载**：每个模块都有独立的初始化标记，避免重复执行
- **多document支持**：自动检测聊天UI所在的 document（兼容 iframe 和 Tauri 桌面端/移动端）
- **兼容环境**：酒馆助手 Tauri 桌面端 + 浏览器端 + 安卓 TauriTavern

## 仓库结构

```
landlord-tablet-plugin/
├── index.js                  # 入口加载器（2KB）
├── README.md                 # 说明文档
├── tavern-helper-import.js  # 单行引用脚本（可直接导入）
└── modules/
    ├── phone-enhanced.js     # 手机增强插件（37KB）
    ├── tenant-manager.js     # 住户管理插件（65KB）
    ├── custom-apps.js        # 自定义APP注入（27KB）
    ├── wallpaper-lib.js      # 壁纸库（7KB）
    └── contacts-sync.js      # 住户通讯录同步（8KB）
```

## 故障排查

1. **插件没加载**：检查脚本内容是否为一行 `import 'https://cdn.jsdelivr.net/...'`，不要换行；确认脚本已启用
2. **手机端加载失败**：确认使用的是 jsDelivr 地址而非 raw.githubusercontent.com
3. **部分功能不显示**：按 F12（桌面端）或远程调试（手机端）查看控制台中 `[平板插件]` 开头的日志
4. **数据丢失**：确认角色卡已保存，插件数据存在角色变量中
5. **网络问题**：jsDelivr 在国内访问稳定，如遇问题可尝试刷新

## 更新日志

### v1.1 (2026-08-27)
- 修复：改用 jsDelivr CDN，解决移动端 TauriTavern 因 raw.githubusercontent.com MIME type 错误导致加载失败的问题
- 改进：加载器增加错误日志输出

### v1.0 (2026-08-27)
- 初始版本：整合5个模块为外置平板插件
- 手机增强 + 住户管理 + 自定义APP + 壁纸库 + 通讯录同步
