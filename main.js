/*
 * XU Table Layout Helper - main.js
 * Pure JavaScript implementation, no compilation needed
 *
 * Features:
 *   1. Custom table layout (fixed / auto)
 *   2. Table width control (100% / custom / auto)
 *   3. Column width: first column fixed
 *   4. Vertical alignment: top / middle / bottom
 *   5. Custom line height
 *   6. Header style: first row and/or first column as header
 *       (independent toggles), bold by default, optional text color
 *   7. Column resize: drag the right edge of any header cell, or
 *       double-click the edge to type an exact width; widths persist
 *       per table in plugin data and are restored on reopen
 *
 * Implementation: Dynamic <style> injection into document.head
 * No !important used — overrides via selector specificity
 * No border/color injection except the optional header text color —
 * tables keep Obsidian's native theme look
 * Bilingual UI (Chinese / English) with language switcher
 */

const { Plugin, Notice, PluginSettingTab, Setting, Modal } = require("obsidian");

const PLUGIN_ID = "table-layout-helper";
const STYLE_ID = "table-layout-helper-style";

// ================================================================
//  i18n (Bilingual support)
// ================================================================

const I18N = {
  zh: {
    // Settings page standard header
    setting_title: "XU Table Layout Helper（表格布局助手）",
    setting_header_desc:
      "Markdown 表格美化与列宽拖拽：表头样式、布局对齐可视化配置，列宽拖拽自动记忆。",
    Documentation: "使用文档",
    doc_desc: "在 GitHub 查看完整使用说明",
    GitHub: "GitHub",
    // Commands
    cmd_toggle: "切换表格布局助手开关",
    cmd_reload: "重新加载表格样式",
    // Notices
    notice_enabled: "已开启",
    notice_disabled: "已关闭",
    notice_reloaded: "样式已重新加载",
    notice_reset: "设置已恢复为默认值",
    setting_reset: "恢复默认设置",
    setting_reset_desc: "将所有设置恢复为默认值",
    btn_reset: "重置",
    // Settings - language
    setting_language: "界面语言",
    setting_language_desc: "选择设置面板的显示语言",
    lang_zh: "中文",
    lang_en: "English",
    // Settings - sections
    sec_table_layout: "表格布局",
    sec_column_width: "列宽",
    sec_alignment: "对齐与行高",
    sec_header_style: "表头样式",
    sec_advanced: "高级",
    // Dropdown option labels (stored values stay fixed/auto/top/middle/bottom)
    opt_fixed: "固定列宽（推荐）",
    opt_auto: "自动列宽",
    opt_top: "顶部",
    opt_middle: "居中",
    opt_bottom: "底部",
    setting_first_row_header: "首行作为表头",
    setting_first_row_header_desc: "横向表头：样式应用于首行",
    setting_first_col_header: "首列作为表头",
    setting_first_col_header_desc: "纵向表头：样式应用于首列（可与首行同时开启）",
    setting_header_color: "表头颜色",
    setting_header_color_desc: "表头文字颜色，留空跟随主题；表头默认加粗",
    // Settings - table layout
    setting_table_layout: "表格布局模式",
    setting_table_layout_desc: "选择表格的列宽分配方式",
    setting_table_width: "表格宽度",
    setting_table_width_desc: "支持 100% / auto / 像素值（如 800px）",
    // Settings - column width
    setting_first_col_width: "首列宽度",
    setting_first_col_width_desc: "像素值（如 200），留空为自动",
    // Settings - alignment
    setting_vertical_align: "垂直对齐",
    setting_vertical_align_desc: "单元格内容的垂直对齐方式",
    setting_line_height: "行高",
    setting_line_height_desc: "单元格文字行高（如 1.6）",
    // Column resize
    cmd_clear_widths: "清除本文件的表格列宽",
    notice_no_widths: "本文件没有已保存的列宽",
    notice_widths_cleared: "已清除本文件的表格列宽",
    sec_col_resize: "列宽拖拽",
    setting_min_col_width: "拖拽最小列宽",
    setting_min_col_width_desc: "拖拽/输入列宽的下限（像素）",
    modal_title: "设置列宽",
    modal_desc: "输入该列的宽度（像素）",
    modal_apply: "应用",
  },
  en: {
    // Settings page standard header
    setting_title: "XU Table Layout Helper",
    setting_header_desc:
      "Markdown table beautifier: header styles, layout and alignment with visual settings, plus drag-to-resize column widths with auto memory.",
    Documentation: "Documentation",
    doc_desc: "View the full manual on GitHub",
    GitHub: "GitHub",
    // Commands
    cmd_toggle: "Toggle table layout control",
    cmd_reload: "Reload table style",
    // Notices
    notice_enabled: "Enabled",
    notice_disabled: "Disabled",
    notice_reloaded: "style reloaded",
    notice_reset: "Settings reset to defaults",
    setting_reset: "Reset to defaults",
    setting_reset_desc: "Restore all settings to default values",
    btn_reset: "Reset",
    // Settings - language
    setting_language: "UI Language",
    setting_language_desc: "Select the display language for settings panel",
    lang_zh: "中文",
    lang_en: "English",
    // Settings - sections
    sec_table_layout: "Table Layout",
    sec_column_width: "Column Width",
    sec_alignment: "Alignment & Line Height",
    sec_header_style: "Header Style",
    sec_advanced: "Advanced",
    // Dropdown option labels (stored values stay fixed/auto/top/middle/bottom)
    opt_fixed: "Fixed (recommended)",
    opt_auto: "Auto",
    opt_top: "Top",
    opt_middle: "Middle",
    opt_bottom: "Bottom",
    setting_first_row_header: "First row as header",
    setting_first_row_header_desc: "Horizontal header: style applies to the first row",
    setting_first_col_header: "First column as header",
    setting_first_col_header_desc: "Vertical header: style applies to the first column (can be combined with first row)",
    setting_header_color: "Header color",
    setting_header_color_desc: "Header text color, leave empty to follow theme; header is bold by default",
    // Settings - table layout
    setting_table_layout: "Table layout mode",
    setting_table_layout_desc: "Choose how column widths are allocated",
    setting_table_width: "Table width",
    setting_table_width_desc: "Supports 100% / auto / pixel value (e.g. 800px)",
    // Settings - column width
    setting_first_col_width: "First column width",
    setting_first_col_width_desc: "Pixel value (e.g. 200), leave empty for auto",
    // Settings - alignment
    setting_vertical_align: "Vertical alignment",
    setting_vertical_align_desc: "Vertical alignment of cell content",
    setting_line_height: "Line height",
    setting_line_height_desc: "Cell text line height (e.g. 1.6)",
    // Column resize
    cmd_clear_widths: "Clear table column widths for this file",
    notice_no_widths: "No saved column widths for this file",
    notice_widths_cleared: "Column widths cleared for this file",
    sec_col_resize: "Column Resize",
    setting_min_col_width: "Minimum column width",
    setting_min_col_width_desc: "Lower limit (px) for drag/input resizing",
    modal_title: "Set column width",
    modal_desc: "Enter the width of this column in pixels",
    modal_apply: "Apply",
  },
};

const DEFAULT_SETTINGS = {
  enabled: true,
  language: "zh", // "zh" or "en"

  // Table layout
  tableLayout: "fixed",
  tableWidth: "100%",

  // First column
  firstColumnWidth: "200",

  // Cells
  verticalAlign: "middle",
  lineHeight: "1.3",

  // Header style (first row and/or first column, independent toggles;
  // bold is always on, headerColor "" = follow theme)
  firstRowHeader: true,
  firstColumnHeader: false,
  headerColor: "#ff4d00",

  // Column resize (drag / double-click input); widths live in
  // this.tableWidths (saved alongside settings, see loadSettings)
  minColWidth: 40,
};

// ================================================================
//  CSS Generator
// ================================================================

function generateCSS(settings) {
  if (!settings.enabled) {
    return "/* XU Table Layout Helper: disabled */";
  }

  const css = [];

  // Selectors with high specificity to avoid !important
  const tableSel = ".markdown-preview-view table, .markdown-source-view .cm-table-widget table";
  // th selector targets thead cells explicitly with HIGH specificity in both
  // views so theme styles cannot beat a single-class selector (fixed in 1.1.2).
  const thSel = ".markdown-reading-view .markdown-preview-view table thead tr th, .markdown-preview-view.markdown-rendered table thead tr th, .markdown-source-view.mod-cm6 .cm-table-widget table thead tr th, .markdown-preview-view table thead tr th";
  const tdSel = ".markdown-preview-view table td, .markdown-source-view .cm-table-widget table td";
  const firstColSel = ".markdown-preview-view table th:first-child, .markdown-preview-view table td:first-child, .markdown-source-view .cm-table-widget table th:first-child, .markdown-source-view .cm-table-widget table td:first-child";
  // Column header selector: every first-child cell (th & td) in both views,
  // with HIGH specificity so theme th styles cannot beat it (same rationale
  // as thSel, fixed in 1.1.2).
  const colHeaderSel = ".markdown-reading-view .markdown-preview-view table tr > th:first-child, .markdown-reading-view .markdown-preview-view table tr > td:first-child, .markdown-preview-view.markdown-rendered table tr > th:first-child, .markdown-preview-view.markdown-rendered table tr > td:first-child, .markdown-source-view.mod-cm6 .cm-table-widget table tr > th:first-child, .markdown-source-view.mod-cm6 .cm-table-widget table tr > td:first-child, .markdown-preview-view table th:first-child, .markdown-preview-view table td:first-child, .markdown-source-view .cm-table-widget table th:first-child, .markdown-source-view .cm-table-widget table td:first-child";

  // 1. Table layout (no border rules — tables keep Obsidian's native borders)
  const tableWidth = settings.tableWidth || "100%";
  css.push(`${tableSel} {
  table-layout: ${settings.tableLayout};
  width: ${tableWidth};
}`);

  // 2. Cell styles
  const cellStyles = [
    `vertical-align: ${settings.verticalAlign};`,
    `line-height: ${settings.lineHeight};`,
  ];
  css.push(`${thSel}, ${tdSel} {
  ${cellStyles.join("\n  ")}
}`);

  // 3. First column width (text wrapping follows Obsidian native behavior)
  if (settings.firstColumnWidth) {
    css.push(`${firstColSel} {
  width: ${settings.firstColumnWidth}px;
}`);
  }

  // 4. Header style: bold by default + optional text color, applied to the
  // first row and/or first column (independent toggles, can be combined).
  // Obsidian themes render thead th bold natively, so when the first row is
  // NOT designated as header we force font-weight: normal to undo it.
  const headerDecls = ["font-weight: bold;"];
  if (settings.headerColor) {
    headerDecls.push(`color: ${settings.headerColor};`);
  }
  const decls = headerDecls.join("\n  ");
  if (settings.firstRowHeader) {
    css.push(`${thSel} {
  ${decls}
}`);
  } else {
    css.push(`${thSel} {
  font-weight: normal;
}`);
  }
  if (settings.firstColumnHeader) {
    css.push(`${colHeaderSel} {
  ${decls}
}`);
  }

  return css.join("\n\n");
}

// ================================================================
//  Main Plugin Class
// ================================================================

class TableLayoutHelperPlugin extends Plugin {
  settings;

  // i18n helper
  t(key) {
    const lang = this.settings ? this.settings.language : "zh";
    const dict = I18N[lang] || I18N.zh;
    return dict[key] || key;
  }

  async onload() {
    await this.loadSettings();
    this.injectStyle();

    // Column resize: attach drag handles to every rendered table
    // (reading view + live preview widgets) and restore saved widths.
    // The table's source line anchor is captured synchronously from the
    // section info — DOM position cannot be used because live preview
    // only renders tables inside the viewport (virtualized editor).
    this.registerMarkdownPostProcessor((el, ctx) => {
      if (!this.settings.enabled) return;
      const info =
        typeof ctx.getSectionInfo === "function"
          ? ctx.getSectionInfo(el)
          : null;
      const lineStart = info ? info.lineStart : null;
      const tables = el.querySelectorAll("table");
      for (const table of Array.from(tables)) {
        this.attachResizeHandles(table, ctx.sourcePath || "", lineStart);
      }
    });

    // Commands (names use i18n, re-registered on language change)
    this.registerCommands();

    // Settings tab
    this.addSettingTab(new TableLayoutHelperSettingTab(this.app, this));
  }

  registerCommands() {
    // Commands (names use i18n, re-adding with same id is idempotent for our use case)
    this.addCommand({
      id: "toggle-table-layout",
      name: this.t("cmd_toggle"),
      callback: () => {
        this.settings.enabled = !this.settings.enabled;
        this.saveSettings();
        this.injectStyle();
        new Notice(
          `XU Table Layout Helper: ${this.settings.enabled ? this.t("notice_enabled") : this.t("notice_disabled")}`,
          2000
        );
      },
    });

    this.addCommand({
      id: "reload-table-style",
      name: this.t("cmd_reload"),
      callback: () => {
        this.injectStyle();
        new Notice(`XU Table Layout Helper: ${this.t("notice_reloaded")}`, 2000);
      },
    });

    this.addCommand({
      id: "clear-column-widths",
      name: this.t("cmd_clear_widths"),
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        if (checking) return !!file;
        this.clearFileWidths(file);
      },
    });
  }

  onunload() {
    const styleEl = document.getElementById(STYLE_ID);
    if (styleEl) {
      styleEl.remove();
    }
  }

  injectStyle() {
    let styleEl = document.getElementById(STYLE_ID);
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = STYLE_ID;
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = generateCSS(this.settings);
  }

  async loadSettings() {
    const data = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    this.tableWidths = data.tableWidths || {};
    delete data.tableWidths;
    this.settings = data;
  }

  async saveSettings() {
    await this.saveData(
      Object.assign({}, this.settings, { tableWidths: this.tableWidths })
    );
  }

  // ================================================================
  //  Column resize (drag header edges / double-click to type width)
  // ================================================================

  // Stable table fingerprint: file path + source line anchor + column count
  // + header text hash. Row count is intentionally excluded so adding/
  // removing rows keeps the same ID (same approach as obsidian-table-resizer).
  // The line anchor disambiguates tables with identical/empty headers and is
  // independent of what is currently rendered (live preview virtualizes the
  // editor, so DOM-based ordinals are unreliable).
  getTableId(table, sourcePath, lineStart) {
    const firstRow = table.querySelector("tr");
    const cells = firstRow ? firstRow.querySelectorAll("th, td") : [];
    const parts = [];
    for (const cell of cells) {
      parts.push((cell.textContent || "").trim().substring(0, 30));
    }
    const hash = parts.join("|").replace(/[^a-zA-Z0-9一-龥|]/g, "_");
    const anchor =
      lineStart === null || lineStart === undefined ? "x" : `L${lineStart}`;
    return `w:${sourcePath}:${anchor}:${cells.length}:${hash}`;
  }

  attachResizeHandles(table, sourcePath, lineStart) {
    if (table.dataset.tlhResized === "1") return;
    table.dataset.tlhResized = "1";

    const id = this.getTableId(table, sourcePath, lineStart);
    table.dataset.tlhTableId = id;
    this.applyStoredWidths(table, id);
    this.addResizeHandles(table, id);
  }

  addResizeHandles(table, id) {
    const firstRow = table.querySelector("tr");
    if (!firstRow) return;
    const cells = firstRow.querySelectorAll("th, td");
    const minW = Number(this.settings.minColWidth) || 40;

    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      cell.style.position = "relative";
      const handle = document.createElement("div");
      handle.className = "tlh-col-resizer";
      handle.addEventListener("mousedown", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.startColDrag(e, table, i, minW, id);
      });
      handle.addEventListener("dblclick", (e) => {
        e.preventDefault();
        e.stopPropagation();
        new ColumnWidthModal(this.app, table, i, id, this).open();
      });
      cell.appendChild(handle);
    }
  }

  startColDrag(e, table, colIndex, minW, id) {
    const firstRow = table.querySelector("tr");
    const cell = firstRow && firstRow.querySelectorAll("th, td")[colIndex];
    if (!cell) return;
    const startX = e.clientX;
    const startW = cell.offsetWidth || 100;
    document.body.classList.add("tlh-resizing");

    const onMove = (ev) => {
      this.setColWidth(
        table,
        colIndex,
        Math.max(minW, startW + ev.clientX - startX)
      );
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.classList.remove("tlh-resizing");
      this.storeTableWidths(table, id);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }

  // Width application prefers colgroup <col> (Obsidian renders one per
  // column in both views); falls back to every cell when colgroup missing.
  setColWidth(table, colIndex, px) {
    table.style.tableLayout = "fixed";
    const col = table.querySelectorAll("colgroup col")[colIndex];
    if (col) {
      col.style.width = px + "px";
      col.style.minWidth = px + "px";
      col.style.maxWidth = px + "px";
      return;
    }
    const rows = table.querySelectorAll("tr");
    for (const row of rows) {
      const c = row.querySelectorAll("th, td")[colIndex];
      if (c) {
        c.style.width = px + "px";
        c.style.minWidth = px + "px";
        c.style.maxWidth = px + "px";
      }
    }
  }

  storeTableWidths(table, id) {
    const cols = table.querySelectorAll("colgroup col");
    const map = {};
    if (cols.length > 0) {
      cols.forEach((col, i) => {
        const w = parseInt(col.style.width, 10);
        if (!Number.isNaN(w)) map[i] = w;
      });
    } else {
      const firstRow = table.querySelector("tr");
      const cells = firstRow ? firstRow.querySelectorAll("th, td") : [];
      cells.forEach((cell, i) => {
        const w = parseInt(cell.style.width, 10);
        if (!Number.isNaN(w)) map[i] = w;
      });
    }
    if (Object.keys(map).length === 0) {
      delete this.tableWidths[id];
    } else {
      this.tableWidths[id] = map;
    }
    this.saveWidthsDebounced();
  }

  applyStoredWidths(table, id) {
    const stored = this.tableWidths[id];
    if (!stored) return;
    table.style.tableLayout = "fixed";
    for (const idx of Object.keys(stored)) {
      this.setColWidth(table, Number(idx), stored[idx]);
    }
  }

  saveWidthsDebounced() {
    if (this.widthSaveTimer) clearTimeout(this.widthSaveTimer);
    this.widthSaveTimer = window.setTimeout(() => {
      this.widthSaveTimer = null;
      this.saveData(
        Object.assign({}, this.settings, { tableWidths: this.tableWidths })
      );
    }, 500);
  }

  async clearFileWidths(file) {
    if (!file) return;
    const prefix = `w:${file.path}:`;
    const ids = Object.keys(this.tableWidths).filter((id) =>
      id.startsWith(prefix)
    );
    if (ids.length === 0) {
      new Notice(this.t("notice_no_widths"), 2000);
      return;
    }
    for (const id of ids) {
      delete this.tableWidths[id];
    }
    await this.saveData(
      Object.assign({}, this.settings, { tableWidths: this.tableWidths })
    );
    // Clear inline widths on the currently rendered tables of this file
    for (const leaf of this.app.workspace.getLeavesOfType("markdown")) {
      const view = leaf.view;
      const f = view && view.file;
      if (!f || f.path !== file.path || !view.contentEl) continue;
      const tables = view.contentEl.querySelectorAll("table");
      for (const table of tables) {
        if (!(table.dataset.tlhTableId || "").startsWith(prefix)) continue;
        for (const col of table.querySelectorAll("colgroup col")) {
          col.style.width = "";
          col.style.minWidth = "";
          col.style.maxWidth = "";
        }
        for (const c of table.querySelectorAll("th, td")) {
          c.style.width = "";
          c.style.minWidth = "";
          c.style.maxWidth = "";
        }
        table.style.tableLayout = "";
      }
    }
    new Notice(this.t("notice_widths_cleared"), 2000);
  }
}

// ================================================================
//  Column Width Modal (double-click a resize handle)
// ================================================================

class ColumnWidthModal extends Modal {
  constructor(app, table, colIndex, tableId, plugin) {
    super(app);
    this.table = table;
    this.colIndex = colIndex;
    this.tableId = tableId;
    this.plugin = plugin;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.createEl("h3", { text: this.plugin.t("modal_title") });
    contentEl.createEl("p", { text: this.plugin.t("modal_desc") });
    const firstRow = this.table.querySelector("tr");
    const cell =
      firstRow && firstRow.querySelectorAll("th, td")[this.colIndex];
    const input = contentEl.createEl("input", { type: "number" });
    input.value = cell ? String(cell.offsetWidth || "") : "";
    input.style.width = "100%";
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") this.submit(input.value);
    });
    new Setting(contentEl).addButton((b) =>
      b
        .setButtonText(this.plugin.t("modal_apply"))
        .setCta()
        .onClick(() => this.submit(input.value))
    );
    input.focus();
    input.select();
  }

  submit(value) {
    const px = parseInt(value, 10);
    if (!Number.isNaN(px) && px > 0) {
      const min = Number(this.plugin.settings.minColWidth) || 40;
      this.plugin.setColWidth(this.table, this.colIndex, Math.max(min, px));
      this.plugin.storeTableWidths(this.table, this.tableId);
      this.close();
    }
  }

  onClose() {
    this.contentEl.empty();
  }
}

// ================================================================
//  Settings Tab
// ================================================================

class TableLayoutHelperSettingTab extends PluginSettingTab {
  plugin;

  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  // i18n helper
  t(key) {
    return this.plugin.t(key);
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();

    // 标准头：英文名（中文名）标题 + 1 行功能描述
    // （官方要求 setHeading，禁止直接创建 h2/h3）
    new Setting(containerEl).setName(this.t("setting_title")).setHeading();
    containerEl.createDiv({
      cls: "tlh-hint",
      text: this.t("setting_header_desc"),
    });

    // ---------- Language switcher (top) ----------
    new Setting(containerEl)
      .setName(this.t("setting_language"))
      .setDesc(this.t("setting_language_desc"))
      .addDropdown((dropdown) =>
        dropdown
          .addOption("zh", this.t("lang_zh"))
          .addOption("en", this.t("lang_en"))
          .setValue(this.plugin.settings.language)
          .onChange(async (value) => {
            this.plugin.settings.language = value;
            await this.plugin.saveSettings();
            // Re-register commands with new language
            this.plugin.registerCommands();
            // Re-render settings panel
            this.display();
          })
      );

    containerEl.createEl("hr");

    // ---------- Header style (common) ----------
    new Setting(containerEl).setName(this.t("sec_header_style")).setHeading();

    new Setting(containerEl)
      .setName(this.t("setting_first_row_header"))
      .setDesc(this.t("setting_first_row_header_desc"))
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.firstRowHeader)
          .onChange(async (value) => {
            this.plugin.settings.firstRowHeader = value;
            await this.plugin.saveSettings();
            this.plugin.injectStyle();
          })
      );

    new Setting(containerEl)
      .setName(this.t("setting_first_col_header"))
      .setDesc(this.t("setting_first_col_header_desc"))
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.firstColumnHeader)
          .onChange(async (value) => {
            this.plugin.settings.firstColumnHeader = value;
            await this.plugin.saveSettings();
            this.plugin.injectStyle();
          })
      );

    new Setting(containerEl)
      .setName(this.t("setting_header_color"))
      .setDesc(this.t("setting_header_color_desc"))
      .addColorPicker((color) =>
        color
          .setValue(this.plugin.settings.headerColor)
          .onChange(async (value) => {
            this.plugin.settings.headerColor = value;
            await this.plugin.saveSettings();
            this.plugin.injectStyle();
          })
      );

    // ---------- Column width (common) ----------
    new Setting(containerEl).setName(this.t("sec_column_width")).setHeading();

    new Setting(containerEl)
      .setName(this.t("setting_first_col_width"))
      .setDesc(this.t("setting_first_col_width_desc"))
      .addText((text) =>
        text
          .setPlaceholder("200")
          .setValue(String(this.plugin.settings.firstColumnWidth))
          .onChange(async (value) => {
            this.plugin.settings.firstColumnWidth = value.replace(/[^\d]/g, "");
            await this.plugin.saveSettings();
            this.plugin.injectStyle();
          })
      );

    // ---------- Advanced (collapsed: uncommon options) ----------
    const adv = containerEl.createEl("details");
    const advSummary = adv.createEl("summary");
    advSummary.setText(this.t("sec_advanced"));
    advSummary.style.cursor = "pointer";
    advSummary.style.fontWeight = "600";
    advSummary.style.fontSize = "var(--h3-size)";
    advSummary.style.color = "var(--text-normal)";
    advSummary.style.userSelect = "none";

    // ---------- Table layout (uncommon) ----------
    new Setting(adv).setName(this.t("sec_table_layout")).setHeading();

    new Setting(adv)
      .setName(this.t("setting_table_layout"))
      .setDesc(this.t("setting_table_layout_desc"))
      .addDropdown((dropdown) =>
        dropdown
          .addOption("fixed", this.t("opt_fixed"))
          .addOption("auto", this.t("opt_auto"))
          .setValue(this.plugin.settings.tableLayout)
          .onChange(async (value) => {
            this.plugin.settings.tableLayout = value;
            await this.plugin.saveSettings();
            this.plugin.injectStyle();
          })
      );

    new Setting(adv)
      .setName(this.t("setting_table_width"))
      .setDesc(this.t("setting_table_width_desc"))
      .addText((text) =>
        text
          .setPlaceholder("100%")
          .setValue(this.plugin.settings.tableWidth)
          .onChange(async (value) => {
            this.plugin.settings.tableWidth = value || "100%";
            await this.plugin.saveSettings();
            this.plugin.injectStyle();
          })
      );

    // ---------- Alignment & line height (uncommon) ----------
    new Setting(adv).setName(this.t("sec_alignment")).setHeading();

    new Setting(adv)
      .setName(this.t("setting_vertical_align"))
      .setDesc(this.t("setting_vertical_align_desc"))
      .addDropdown((dropdown) =>
        dropdown
          .addOption("top", this.t("opt_top"))
          .addOption("middle", this.t("opt_middle"))
          .addOption("bottom", this.t("opt_bottom"))
          .setValue(this.plugin.settings.verticalAlign)
          .onChange(async (value) => {
            this.plugin.settings.verticalAlign = value;
            await this.plugin.saveSettings();
            this.plugin.injectStyle();
          })
      );

    new Setting(adv)
      .setName(this.t("setting_line_height"))
      .setDesc(this.t("setting_line_height_desc"))
      .addText((text) =>
        text
          .setPlaceholder("1.6")
          .setValue(this.plugin.settings.lineHeight)
          .onChange(async (value) => {
            this.plugin.settings.lineHeight = value || "1.6";
            await this.plugin.saveSettings();
            this.plugin.injectStyle();
          })
      );

    // ---------- Column resize (uncommon) ----------
    new Setting(adv).setName(this.t("sec_col_resize")).setHeading();

    new Setting(adv)
      .setName(this.t("setting_min_col_width"))
      .setDesc(this.t("setting_min_col_width_desc"))
      .addText((text) =>
        text
          .setPlaceholder("40")
          .setValue(String(this.plugin.settings.minColWidth))
          .onChange(async (value) => {
            this.plugin.settings.minColWidth =
              value.replace(/[^\d]/g, "") || "40";
            await this.plugin.saveSettings();
          })
      );

    // ---------- Reset ----------
    new Setting(containerEl)
      .setName(this.t("setting_reset"))
      .setDesc(this.t("setting_reset_desc"))
      .addButton((button) =>
        button
          .setButtonText(this.t("btn_reset"))
          .setWarning()
          .onClick(async () => {
            const savedLang = this.plugin.settings.language;
            this.plugin.settings = Object.assign({}, DEFAULT_SETTINGS);
            this.plugin.settings.language = savedLang;
            await this.plugin.saveSettings();
            this.plugin.injectStyle();
            this.plugin.registerCommands();
            this.display();
            new Notice(this.t("notice_reset"), 2000);
          })
      );

    // ---------- GitHub 使用文档（统一入口）----------
    containerEl.createEl("hr", { cls: "tlh-divider" });
    new Setting(containerEl)
      .setName(this.t("Documentation"))
      .setDesc(this.t("doc_desc"))
      .addButton((button) =>
        button
          .setButtonText(this.t("GitHub"))
          .onClick(() => {
            window.open(
              "https://github.com/xcloud-ai/table-layout-helper",
              "_blank"
            );
          })
      );
  }
}

module.exports = TableLayoutHelperPlugin;
module.exports.default = TableLayoutHelperPlugin;
