# XU Table Layout Helper

> [!NOTE] 中文说明
> 表格布局助手：Markdown 表格可视化美化插件，支持表头样式（首行 / 首列 / 颜色）与表格列宽拖拽调整，宽度自动记忆，重开文件不丢失。

Markdown 表格零手写 CSS：全局布局设置可视化配置、实时生效；每张表格的列宽可直接用鼠标拖动调整并自动持久化。

## 功能特性（中文）

- **表头样式**：首行作为表头（默认开启）/ 首列作为表头，两者可同时开启；表头默认加粗，颜色可选（留空跟随主题）
- **列宽拖拽**：鼠标悬停表头单元格右边缘出现拖拽手柄，按住拖动即可调整列宽；双击手柄可输入精确像素值
- **列宽记忆**：每张表格的列宽自动保存，重新打开文件、重启 Obsidian 后自动恢复；增删表格行不影响已保存的宽度
- **清除列宽**：命令面板一键清除当前文件所有表格的已保存列宽
- **表格布局**：fixed（固定列宽，推荐）/ auto（自动列宽），表格宽度支持 100% / 像素值
- **单元格排版**：垂直对齐（上 / 中 / 下）与行高调整
- **首列宽度**：全局设置首列固定宽度（默认 200px），适合标签列
- **最小列宽**：拖拽时的列宽下限保护（默认 40px）
- **实时生效**：所有设置修改后立即应用，阅读视图与实时预览双视图支持

## Features (English)

- **Header style**: first row as header (on by default) and/or first column as header; headers are always bold, with an optional text color (empty = follow theme)
- **Column width drag**: hover the right edge of a header cell to grab the drag handle; drag to resize, or double-click the handle to enter an exact pixel value
- **Width memory**: each table's column widths are saved automatically and restored on reopen; adding or removing rows keeps saved widths intact
- **Clear widths**: one command clears all saved column widths in the current file
- **Table layout**: fixed (recommended) / auto, with table width (100% / pixel value)
- **Cell layout**: vertical alignment (top / middle / bottom) and line height
- **First column width**: global fixed width for label-style first columns (200px by default)
- **Minimum column width**: lower bound while dragging (40px by default)
- **Instant apply**: settings apply immediately in both reading view and live preview

## 列宽拖拽使用方法

1. 将鼠标悬停到表头单元格的右边缘，出现高亮竖条后按住拖动
2. 双击拖拽手柄，输入精确像素值后回车或点击「应用」
3. 松开鼠标即自动保存，重新打开文件后宽度自动恢复
4. 需要恢复某文件全部表格的默认宽度时，命令面板执行「清除本文件的表格列宽」

## Column Resize Usage

1. Hover the right edge of a header cell until the highlight bar appears, then drag
2. Double-click the handle to type an exact pixel width, press Enter or click Apply
3. Widths save on mouse release and restore automatically on reopen
4. Run "Clear table column widths in this file" from the command palette to reset the current file

## 安装 / Installation

### 社区目录安装（推荐）/ Community Directory (Recommended)

打开 设置 → 第三方插件 → 浏览，搜索 "Table Layout Helper" 安装并启用。

Open Settings → Community Plugins → Browse, search "Table Layout Helper", install and enable.

### 手动安装 / Manual

1. 从 [最新 Release](https://github.com/xcloud-ai/table-layout-helper/releases) 下载 `main.js`、`manifest.json`、`styles.css` 三个文件
2. 在 vault 中创建目录 `.obsidian/plugins/table-layout-helper/` 并放入三个文件
3. 打开 设置 → 第三方插件，启用 "Table Layout Helper"

1. Download `main.js`, `manifest.json`, `styles.css` from the [latest release](https://github.com/xcloud-ai/table-layout-helper/releases)
2. Create `<vault>/.obsidian/plugins/table-layout-helper/` and put the three files in it
3. Enable "Table Layout Helper" in Settings → Community Plugins

## 设置说明 / Settings

| 设置项 / Setting | 说明 / Description | 默认值 / Default |
|------------------|--------------------|------------------|
| 首行作为表头 / First row as header | 横向表头样式应用于首行 / Horizontal header on the first row | 开 / On |
| 首列作为表头 / First column as header | 纵向表头样式应用于首列，可与首行同开 / Vertical header on the first column, combinable | 关 / Off |
| 表头颜色 / Header color | 表头文字颜色，留空跟随主题 / Header text color, empty = theme | #ff4d00 |
| 首列宽度 / First column width | 像素值，留空自适应 / Pixels, empty = auto | 200 |
| 表格布局 / Table layout | fixed / auto | fixed |
| 表格宽度 / Table width | 100% / 像素值 / 100% / pixels | 100% |
| 垂直对齐 / Vertical alignment | top / middle / bottom | middle |
| 行高 / Line height | 单元格文本行高 / Cell text line height | 1.3 |
| 最小列宽 / Min column width | 拖拽下限 / Drag lower bound | 40 |

命令 / Commands：切换表格布局助手开关、重新加载表格样式、清除本文件的表格列宽（设置 → 热键可自行绑定）。
Commands: toggle plugin, reload styles, clear column widths in current file.

## 技术实现 / Technical Notes

- 纯 JavaScript 实现（`main.js`），无需编译；`main.ts` 为 TypeScript 参考
- 样式通过动态注入 `<style>` 应用，不使用 `!important`，依靠选择器特异性覆盖
- 列宽指纹 = 文件路径 + 表格源码起始行号 + 列数 + 表头哈希，存于插件自身 `data.json`，不修改笔记内容
- 拖拽仅在拖动期间挂载 document 级监听，松手即卸载；无轮询、无全库扫描
- 不使用 Node/Electron API，支持移动端（`isDesktopOnly: false`）

- Pure JavaScript (`main.js`), no build step; `main.ts` is a TypeScript reference
- Styles injected via a dynamic `<style>` tag without `!important` — selector specificity only
- Column width fingerprint = file path + table source line + column count + header hash, stored in the plugin's own `data.json`; notes are never modified
- Document-level drag listeners exist only while dragging; no polling, no vault scans
- No Node/Electron APIs — mobile supported (`isDesktopOnly: false`)

## License

MIT License - Copyright (c) 2026 旭说
