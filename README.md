# Table Layout Helper

Customize Markdown table layout, column width, text wrapping, alignment, overflow control, and sticky headers. Replaces hand-written CSS snippets with visual settings and live preview.

> 中文说明在后 / Chinese description below

自定义 Markdown 表格的布局、列宽、换行、对齐、溢出收敛与表头粘性，替代手写 CSS snippet，所有设置可视化配置且实时生效。

## Features

- **Table layout mode**: fixed / auto
- **Table width**: 100% / custom pixels / auto
- **Column width control**: first column fixed, content column auto
- **Text wrapping**: nowrap / break-word / break-all
- **Vertical alignment**: top / middle / bottom
- **Custom line height**
- **Overflow control**: visible / hidden / scroll / auto
- **Max height with scroll**
- **Sticky header**: header stays on top when scrolling
- **Zebra stripes**: alternating row colors with custom color
- **Link no-wrap**: prevent separators from wrapping alone
- **Border control**: width, color, collapse mode
- **Live preview**: changes apply instantly without restart
- **Dual view support**: reading view and live preview

## 功能特性

- **表格布局模式**: fixed(固定列宽，推荐) / auto(自动列宽)
- **表格宽度**: 100% / 自定义像素值(如 800px) / 自适应
- **列宽控制**: 第一列固定宽度(默认 200px)，内容列自适应
- **文本换行**: nowrap(不换行) / break-word(按词换行) / break-all(强制断字)
- **垂直对齐**: top(顶部) / middle(居中) / bottom(底部)
- **行高自定义**: 可调整单元格文本行高(默认 1.6)
- **溢出收敛**: visible(显示) / hidden(隐藏) / scroll(滚动条) / auto(自动)
- **最大高度限制**: 设置表格最大高度，超出部分滚动显示
- **表头粘性**: 滚动时表头固定在顶部，配合溢出 scroll 使用效果最佳
- **斑马纹**: 奇偶行交替背景色，颜色可自定义
- **链接不折行**: 表格内链接不换行，防止分隔符单独换行
- **边框控制**: 宽度、颜色、合并模式(collapse / separate)均可配置
- **实时预览**: 修改设置后样式立即生效，无需重启 Obsidian
- **双视图支持**: 阅读视图和实时预览视图均生效

## Installation

### From Obsidian Community Directory (Recommended)

1. Open Obsidian Settings → Community Plugins
2. Click "Browse" and search for "Table Layout Helper"
3. Click "Install", then "Enable"

### Manual Installation

1. Download `main.js`, `manifest.json`, `styles.css` from the [latest release](https://github.com/xcloud-ai/table-layout-helper/releases)
2. Put them in `<vault>/.obsidian/plugins/table-layout-helper/`
3. Enable in Settings → Community Plugins

## 安装

### 方式一：从 Obsidian 社区目录安装(推荐)

1. 打开 Obsidian 设置 → 社区插件
2. 点击"浏览"，搜索 "Table Layout Helper"
3. 点击"安装"，然后"启用"

### 方式二：手动安装

1. 从 [最新 Release](https://github.com/xcloud-ai/table-layout-helper/releases) 下载 `main.js`、`manifest.json`、`styles.css` 三个文件
2. 在 vault 中创建目录 `.obsidian/plugins/table-layout-helper/`
3. 将三个文件放入该目录
4. 打开 Obsidian 设置 → 社区插件，找到 "Table Layout Helper" 并开启

## Usage

1. After enabling, all Markdown tables will use the configured layout automatically
2. Go to Settings → Table Layout Helper to customize
3. Changes apply instantly in both reading view and live preview
4. Use Ctrl+P → "Toggle table layout control" to toggle on/off
5. Use Ctrl+P → "Reload table style" to refresh styles manually

## 使用方法

1. 启用插件后，所有 Markdown 表格将自动使用配置的布局，无需手动标记
2. 进入 设置 → Table Layout Helper，可视化调整各项参数
3. 修改设置后样式**实时生效**，阅读视图和实时预览均支持
4. 命令面板(Ctrl+P)搜索"切换表格布局控制开关"可快速开关插件
5. 命令面板搜索"重新加载表格样式"可手动刷新样式

## Recommended Config

**Long table with scroll:**
- Overflow = scroll, Max height = 400px, Sticky header = on

**Clean look:**
- Zebra stripes = on, Border width = 1, Line height = 1.8

**Compact table:**
- Layout = auto, First column width = empty, Line height = 1.4

## 推荐配置

**场景一：长表格内滚动(推荐)**
- 溢出处理 = scroll
- 最大高度 = 400px
- 表头粘性 = 开

效果：表格超过 400px 高度时出现滚动条，表头始终固定在顶部，适合命令列表、参数说明等长表格。

**场景二：简洁美观**
- 斑马纹 = 开
- 斑马纹颜色 = #f8f9fa
- 边框宽度 = 1
- 边框颜色 = #e8e8e8
- 行高 = 1.8

**场景三：紧凑型表格**
- 表格布局 = auto
- 第一列宽度 = 留空
- 行高 = 1.4

## Settings

| Setting | Description | Default |
|---------|-------------|---------|
| Enable plugin | Global toggle | On |
| Table layout mode | fixed / auto | fixed |
| Table width | 100% / pixels / auto | 100% |
| First column width | pixels, empty = auto | 200 |
| First column nowrap | prevent heading wrap | On |
| Content column wrap | break-word / break-all / normal | break-word |
| Vertical alignment | top / middle / bottom | top |
| Line height | cell text line height | 1.6 |
| Overflow mode | visible / hidden / scroll / auto | visible |
| Max height | pixels, empty = no limit | empty |
| Sticky header | header stays on scroll | Off |
| Zebra stripes | alternating row colors | Off |
| Zebra color | even row background | #f8f9fa |
| Link no-wrap | prevent link wrapping | On |
| Border width | pixels, 0 = no border | 1 |
| Border color | border color | #e8e8e8 |
| Border collapse | collapse / separate | collapse |

## 设置说明

| 设置项 | 说明 | 默认值 |
|--------|------|--------|
| 启用插件 | 全局开关 | 开 |
| 表格布局模式 | fixed / auto | fixed |
| 表格宽度 | 100% / 像素值 / auto | 100% |
| 第一列宽度 | 像素值，留空=自适应 | 200 |
| 第一列不换行 | 防止标题列折行 | 开 |
| 内容列换行方式 | break-word / break-all / normal | break-word |
| 垂直对齐 | top / middle / bottom | top |
| 行高 | 单元格文本行高 | 1.6 |
| 溢出处理 | visible / hidden / scroll / auto | visible |
| 最大高度 | 像素值，留空=不限制 | 空 |
| 表头粘性 | 滚动时固定表头 | 关 |
| 斑马纹 | 奇偶行交替色 | 关 |
| 斑马纹颜色 | 偶数行背景色 | #f8f9fa |
| 链接不折行 | 表格内链接不换行 | 开 |
| 边框宽度 | 像素值，0=无边框 | 1 |
| 边框颜色 | 边框颜色 | #e8e8e8 |
| 边框合并 | collapse / separate | collapse |

## Technical Notes

- Pure JavaScript implementation (`main.js`), no compilation needed
- `main.ts` is TypeScript source reference for secondary development
- Dynamic style injection via `<style>` tag in document.head
- No `!important` used — overrides via selector specificity
- Supports both reading view and live preview

## 技术实现

- 纯 JavaScript 实现（`main.js`），无需编译，直接可用
- `main.ts` 为 TypeScript 源码参考，供二次开发使用
- 通过动态注入 `<style>` 标签到 document.head 应用样式
- 不使用 `!important`，通过提高选择器特异性覆盖默认样式
- 支持阅读视图和实时预览双视图

## License

MIT License - Copyright (c) 2026 旭说云原生
