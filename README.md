# 房东模拟器 - 外置平板插件 v1.0

为酒馆助手（SillyTavern / TauriTavern）的房东模拟器角色卡打造的外置平板/手机插件整合包。

**关键更新**：v1.0 改用 jsDelivr CDN + 单文件 bundle.js，兼容 TauriTavern 手机端。

## 为什么之前加载失败？

`raw.githubusercontent.com` 返回的 Content-Type 是 `text/plain`，而 ES module `import` 要求正确的 MIME type（`application/javascript`）。在 TauriTavern 手机端的 WebView 中，这会导致 import 静默失败。

此外，旧版 `index.js` 内部用 `fetch()` + `eval()` 二次加载5个模块文件，手机端网络/CORS 更不可靠。

**解决方案**：
1. 所有模块合并为单文件 `bundle.js`（97KB），消除二次加载
2. 改用 **jsDelivr CDN**（`cdn.jsdelivr.net/gh/...`），正确返回 `application/javascript`，且中国大陆有加速节点

## 功能模块

| 模块 | 说明 |
|------|------|
| 手机增强 | 本地图片上传、壁纸滑动切换、表情包本地上传、住户管理APP入口 |
| 住户管理 | 浮窗式公寓管理面板：首页/房源管理/住户动态/招租任务 |
| 自定义APP | 招租中心APP + 天眼监控APP |
| 壁纸库 | 30张预设壁纸，一键切换 |
| 通讯录同步 | MVU租客列表自动同步到手机通讯录和住户邻里群 |

## 安装方法

### 方式一：导入角色卡（推荐，手机端适用）

1. 下载仓库中的 `房东模拟器角色卡.json`
2. 在 TauriTavern / 酒馆助手中导入角色卡
3. 进入聊天，插件会自动加载

### 方式二：手动添加脚本

1. 打开酒馆助手 → 扩展插件 → 脚本
2. 新建脚本，名称随意（如「房东平板插件」）
3. 脚本内容填入以下一行（**必须用 jsDelivr + bundle.js**）：

```javascript
import 'https://cdn.jsdelivr.net/gh/520ccb/landlord-tablet-plugin@main/bundle.js'
```

4. 保存并启用，刷新页面

### 方式三：使用引用脚本文件

仓库中的 `tavern-helper-import.js` 即为上述单行引用脚本，可直接导入。

## 使用方法

### 住户管理面板
- **浮窗按钮**：屏幕右侧紫色圆形按钮（🏠）
- **底部按钮**：聊天输入框下方的「住户管理」按钮
- **快捷键**：`Ctrl + Shift + C`（桌面端）
- **手机APP**：手机桌面新增「住户管理」APP图标
- **全局函数**：控制台调用 `openCM()`

面板四个标签页：首页、房源、动态、招租

### 手机增强
- 本地上传表情包/头像/背景图
- 手机首页向左滑动进入壁纸页面
- 手机右上角壁纸切换按钮

### 自定义APP
- **招租中心**：快捷模板 + 自定义招租要求
- **天眼监控**：输入监控目标，AI描述画面，支持录制/截图/切角度

## 仓库结构

```
landlord-tablet-plugin/
├── bundle.js                    # 单文件版（97KB，推荐使用，手机端兼容）
├── index.js                     # 模块加载器（旧版，不推荐手机端使用）
├── 房东模拟器角色卡.json         # 可直接导入的角色卡
├── tavern-helper-import.js      # 单行引用脚本
├── README.md
└── modules/                     # 分模块源码（开发用）
    ├── phone-enhanced.js
    ├── tenant-manager.js
    ├── custom-apps.js
    ├── wallpaper-lib.js
    └── contacts-sync.js
```

## 注意事项

1. **手机端必须使用 `bundle.js`（jsDelivr）**，不要使用 `index.js`（fetch+eval 在手机端不稳定）
2. 插件数据存在角色变量中（`cm_` 前缀和 `phone_data`），导入角色卡时会一并带入
3. 如遇加载问题，按 F12（桌面端）或远程调试（手机端）查看 `[平板插件]` 开头的日志
4. 首次加载需要从 jsDelivr 下载约 97KB 的脚本，请确保网络通畅
5. jsDelivr 对 GitHub 新文件有缓存延迟，如刚更新后不生效，可加版本号参数：`bundle.js?v=时间戳`

## 更新日志

### v1.0 (2026-08-27)
- 修复：改用 jsDelivr CDN + 单文件 bundle.js，解决 TauriTavern 手机端加载失败问题
- 合并：5个模块合并为单文件，消除 fetch 二次加载
- 新增：可直接导入的角色卡 JSON 模板
- 主题：公司管理插件改造为住户管理插件（公寓主题）
