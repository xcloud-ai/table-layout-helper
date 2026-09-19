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
    setting_sticky_header: "长表格固定表头",
    setting_sticky_header_desc: "滚动时表头吸顶显示（阅读视图与实时预览）",
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
    cmd_autofit: "自动适配当前文件表格列宽",
    notice_autofit: "已适配 {n} 个表格的列宽",
    notice_autofit_skipped: "{n} 个表格不在可视区域已跳过，滚动到该表格后重新点击即可",
    setting_autofit: "自动适配列宽",
    setting_autofit_desc: "点击后将当前文件所有表格列宽调整为内容单行显示",
    btn_autofit: "适配当前文件",
    sec_col_resize: "列宽拖拽",
    setting_width_mode: "表格宽度模式",
    setting_width_mode_desc: "自适应铺开：列宽按比例换算为百分比，表格始终铺满页面并跟随窗口缩放（窄页面内容换行，无横向滚动条）；固定像素：列宽为拖拽时的像素值",
    option_adaptive: "自适应铺开（推荐）",
    option_fixed: "固定像素",
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
    setting_sticky_header: "Sticky header",
    setting_sticky_header_desc: "Keep the header visible while scrolling long tables (reading view & live preview)",
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
    cmd_autofit: "Auto-fit column widths for current file",
    notice_autofit: "Fitted {n} table(s)",
    notice_autofit_skipped: "{n} tables outside the viewport were skipped; scroll to them and run again",
    setting_autofit: "Auto-fit column widths",
    setting_autofit_desc: "Click to resize all tables in the current file so each column fits its content in one line",
    btn_autofit: "Fit current file",
    sec_col_resize: "Column Resize",
    setting_width_mode: "Table width mode",
    setting_width_mode_desc: "Adaptive: stored widths applied as percentages so tables always fill the page and follow window resizes (content wraps when narrow, no horizontal scrollbar); Fixed: pixel widths as dragged",
    option_adaptive: "Adaptive fill (recommended)",
    option_fixed: "Fixed pixels",
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

  // Long-table reading aid (see generateCSS)
  stickyHeader: true,

  // Column resize (drag / double-click input); widths live in
  // this.tableWidths (saved alongside settings, see loadSettings)
  widthMode: "adaptive", // adaptive | fixed
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

  // 5. Sticky header: keep thead visible while scrolling long tables.
  // Preview views only (reading view + live-preview rendered tables) —
  // the table editor widget does not need it. Opaque background so
  // scrolled rows do not show through the pinned cells.
  if (settings.stickyHeader) {
    // Align the opaque sticky background with the theme's table-header
    // color when available. Themes like Border paint the header grey on
    // the ROW (thead tr) while this rule paints each th; with different
    // colors, sub-pixel rounding of percentage column widths lets the row
    // color bleed through at cell edges — looking like alternating
    // column backgrounds. Matching the color hides the seam.
    css.push(`.markdown-preview-view table thead th {
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: var(--table-header-background, var(--background-alt, var(--background-primary)));
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
    // Fingerprint is content-based (header + first data row), NOT line
    // number, so editing above the table no longer invalidates memory.
    this.registerMarkdownPostProcessor((el, ctx) => {
      if (!this.settings.enabled) return;
      const tables = el.querySelectorAll("table");
      for (const table of Array.from(tables)) {
        this.attachResizeHandles(table, ctx.sourcePath || "");
      }
    });

    // Live preview: when the caret enters a table, Obsidian swaps the
    // rendered table for its built-in TableEditor widget
    // (.cm-table-widget), which does NOT pass through the post
    // processor — saved widths would be lost there. Watch for those
    // widgets (and for colgroup rebuilds inside them) and (re)apply
    // stored widths. Callbacks are coalesced with requestAnimationFrame.
    this._editorMo = new MutationObserver(() => {
      if (this._moScheduled) return;
      this._moScheduled = true;
      requestAnimationFrame(() => {
        this._moScheduled = false;
        this.attachEditorTableWidgets();
      });
    });
    this._editorMo.observe(document.body, { childList: true, subtree: true });

    // Watch data.json for external modifications (e.g. cloud sync from
    // another device). When the file changes on disk but NOT from our
    // own save, merge any new tableWidth keys into memory so widths
    // adjusted on the other machine become available here too.
    this.registerEvent(
      this.app.vault.on("modify", async (file) => {
        const dataPath = `${this.app.vault.configDir}/plugins/${PLUGIN_ID}/data.json`;
        if (file.path !== dataPath) return;
        if (this._saving) return; // skip our own writes
        if (this._reloadTimer) clearTimeout(this._reloadTimer);
        this._reloadTimer = setTimeout(() => this.mergeFromDisk(), 300);
      })
    );

    // Memory hygiene: when a file is deleted its width records can never
    // match again — drop them; when a file/folder is renamed, migrate the
    // records' path prefix. Keeps data.json from accumulating dead keys.
    // saveMerged() first pulls the latest disk state (cloud-sync safety),
    // then force=true writes so removed keys are not merged back.
    this.registerEvent(
      this.app.vault.on("delete", async (file) => {
        await this.saveMerged();
        const prefixes = [`w:${file.path}:`];
        if (file.children) prefixes.push(`w:${file.path}/`); // folder files
        let removed = false;
        for (const prefix of prefixes) {
          for (const id of Object.keys(this.tableWidths)) {
            if (id.startsWith(prefix)) {
              delete this.tableWidths[id];
              removed = true;
            }
          }
        }
        if (removed) this.saveMerged(true);
      })
    );
    this.registerEvent(
      this.app.vault.on("rename", async (file, oldPath) => {
        // Folders carry children — their records use a "path/" prefix.
        const oldPrefix = file.children ? `w:${oldPath}/` : `w:${oldPath}:`;
        await this.saveMerged();
        const ids = Object.keys(this.tableWidths).filter((k) =>
          k.startsWith(oldPrefix)
        );
        if (ids.length === 0) return;
        for (const id of ids) {
          this.tableWidths[
            `w:${file.path}${id.slice(oldPrefix.length - 1)}`
          ] = this.tableWidths[id];
          delete this.tableWidths[id];
        }
        this.saveMerged(true);
      })
    );

    // Commands (names use i18n, re-registered on language change)
    this.registerCommands();

    // Ribbon icon: one-click auto-fit all tables in the current file
    this.addRibbonIcon("columns-3", this.t("cmd_autofit"), () => {
      this.autoFitActiveFile();
    });

    // Settings tab
    this.addSettingTab(new TableLayoutHelperSettingTab(this.app, this));
  }

  // Called when data.json changes on disk from an external source
  // (cloud sync). Pulls any tableWidth keys present on disk but missing
  // from memory into memory, without overwriting memory's own values.
  async mergeFromDisk() {
    const diskData = (await this.loadData()) || {};
    const diskWidths = diskData.tableWidths || {};
    let changed = false;
    for (const key of Object.keys(diskWidths)) {
      const diskVal = diskWidths[key];
      const memVal = this.tableWidths[key];
      // Pull keys memory lacks, AND keys whose disk copy is newer than
      // the one in memory (adjusted on another machine after we last
      // saw it). Without the timestamp check a stale in-memory value
      // would hide the fresh synced value — and clobber it on the next
      // save.
      const diskTs = (diskVal && diskVal._ts) || 0;
      const memTs = (memVal && memVal._ts) || 0;
      if (!memVal || diskTs > memTs) {
        this.tableWidths[key] = diskVal;
        changed = true;
      }
    }
    if (changed) {
      this.refreshOpenTables();
    }
  }

  // Re-apply stored widths to tables currently open in the workspace.
  refreshOpenTables() {
    for (const leaf of this.app.workspace.getLeavesOfType("markdown")) {
      const view = leaf.view;
      if (!view || !view.contentEl) continue;
      const tables = view.contentEl.querySelectorAll("table[data-tlh-table-id]");
      for (const table of tables) {
        const id = table.dataset.tlhTableId;
        if (id && this.tableWidths[id]) {
          this.applyStoredWidths(table, id);
        }
      }
    }
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

    this.addCommand({
      id: "auto-fit-column-widths",
      name: this.t("cmd_autofit"),
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        if (checking) return !!file;
        this.autoFitActiveFile();
      },
    });
  }

  onunload() {
    if (this._editorMo) {
      this._editorMo.disconnect();
      this._editorMo = null;
    }
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
    // Migrate legacy keys that embedded the source line number (e.g.
    // "w:path:L14:2:hash") to the new line-number-free format, and delete
    // the orphaned old keys so they no longer accumulate.
    this.migrateLegacyWidthKeys();
  }

  // Legacy format:  w:${path}:L${line}:${cols}:${headerHash}
  // New format:     w:${path}:${cols}:${headerHash}:${dataHash}
  // Migration strips the ":Lnn:" segment. Legacy keys carry no data-row
  // hash, so they land as "w:path:cols:headerHash:" (empty dataHash) and
  // are matched by the fallback in applyStoredWidths.
  migrateLegacyWidthKeys() {
    const oldKeys = Object.keys(this.tableWidths).filter((k) =>
      /:L\d+:/.test(k)
    );
    if (oldKeys.length === 0) return;
    for (const oldKey of oldKeys) {
      const newKey = oldKey.replace(/:L\d+:/, ":");
      // Keep the first migrated value; later duplicates are dropped.
      if (!(newKey in this.tableWidths)) {
        this.tableWidths[newKey] = this.tableWidths[oldKey];
      }
      delete this.tableWidths[oldKey];
    }
    // force=true: the deleted legacy keys must not be merged back from
    // disk (saveMerged's union merge would resurrect them).
    this.saveMerged(true);
  }

  async saveSettings() {
    await this.saveMerged();
  }

  // Save settings + tableWidths, but first re-read the latest data from
  // disk and merge tableWidths: disk keys that memory lacks are kept
  // (synced from another machine via cloud sync), while memory's own
  // keys always win (this machine's latest action). This prevents a
  // stale in-memory copy from clobbering widths written by another
  // Obsidian instance running on a different device.
  async saveMerged(force = false) {
    let mergedWidths = this.tableWidths;
    if (!force) {
      const diskData = (await this.loadData()) || {};
      const diskWidths = diskData.tableWidths || {};
      // Union merge with timestamp arbitration: for keys present on
      // both sides the newer _ts wins. A fresh local drag still wins
      // (its ts is newest), but a value synced from another machine
      // with a newer ts beats our stale memory instead of being
      // clobbered by it. Legacy records without _ts count as ts=0.
      mergedWidths = Object.assign({}, diskWidths);
      for (const k of Object.keys(this.tableWidths)) {
        const mine = this.tableWidths[k];
        const theirs = diskWidths[k];
        const mineTs = (mine && mine._ts) || 0;
        const theirTs = (theirs && theirs._ts) || 0;
        if (theirs !== undefined && theirTs > mineTs) {
          mergedWidths[k] = theirs;
        } else {
          mergedWidths[k] = mine;
        }
      }
      this.tableWidths = mergedWidths;
    }
    this._saving = true;
    try {
      await this.saveData(
        Object.assign({}, this.settings, { tableWidths: mergedWidths })
      );
    } finally {
      this._saving = false;
    }
  }

  // ================================================================
  //  Column resize (drag header edges / double-click to type width)
  // ================================================================

  // Stable table fingerprint: file path + column count + header text hash
  // + first data row hash. Row count and source line number are
  // intentionally EXCLUDED so adding/removing content above the table
  // does NOT change the ID. (The old Lnn anchor caused width memory to
  // "disappear" after any edit above the table, producing orphan keys.)
  // Tables with identical header AND identical first data row share one
  // width record — acceptable in practice.
  getTableId(table, sourcePath) {
    const rows = table.querySelectorAll("tr");
    const headerRow = rows[0];
    const dataRow = rows[1];
    const headerCells = headerRow
      ? headerRow.querySelectorAll("th, td")
      : [];
    const headerParts = [];
    for (const cell of headerCells) {
      headerParts.push((cell.textContent || "").trim().substring(0, 30));
    }
    const headerHash = headerParts
      .join("|")
      .replace(/[^a-zA-Z0-9一-龥|]/g, "_");
    let dataHash = "";
    if (dataRow) {
      const dataCells = dataRow.querySelectorAll("th, td");
      const dataParts = [];
      for (const cell of dataCells) {
        dataParts.push((cell.textContent || "").trim().substring(0, 30));
      }
      dataHash = dataParts.join("|").replace(/[^a-zA-Z0-9一-龥|]/g, "_");
    }
    return `w:${sourcePath}:${headerCells.length}:${headerHash}:${dataHash}`;
  }

  attachResizeHandles(table, sourcePath) {
    if (table.dataset.tlhResized === "1") return;
    table.dataset.tlhResized = "1";

    const id = this.getTableId(table, sourcePath);
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

    // Live px tooltip that follows the cursor while dragging
    const tip = document.createElement("div");
    tip.className = "tlh-drag-tip";
    document.body.appendChild(tip);

    const onMove = (ev) => {
      const w = Math.max(minW, startW + ev.clientX - startX);
      this.setColWidth(table, colIndex, w);
      tip.textContent = Math.round(w) + " px";
      tip.style.left = ev.clientX + 14 + "px";
      tip.style.top = ev.clientY - 30 + "px";
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.classList.remove("tlh-resizing");
      tip.remove();
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

  // Apply pixel widths as normalized percentages (adaptive fill). The
  // table takes 100% of its container; each column gets its share of the
  // total. The browser re-flows automatically on window resize — no
  // resize listeners needed.
  applyWidthsAdaptive(table, widths) {
    const list = widths.filter((w) => Number.isFinite(w) && w > 0);
    if (list.length === 0) return;
    const total = list.reduce((a, b) => a + b, 0);
    if (total <= 0) return;
    table.style.tableLayout = "fixed";
    table.style.width = "100%";
    const cols = table.querySelectorAll("colgroup col");
    for (let i = 0; i < list.length; i++) {
      const pct = ((list[i] / total) * 100).toFixed(3) + "%";
      const col = cols[i];
      if (col) {
        col.style.width = pct;
        col.style.minWidth = "";
        col.style.maxWidth = "";
      } else {
        const rows = table.querySelectorAll("tr");
        for (const row of rows) {
          const c = row.querySelectorAll("th, td")[i];
          if (c) {
            c.style.width = pct;
            c.style.minWidth = "";
            c.style.maxWidth = "";
          }
        }
      }
    }
  }

  // Mode-aware batch application for computed pixel arrays (auto-fit).
  applyWidthsPx(table, widths) {
    if (this.settings.widthMode === "fixed") {
      for (let i = 0; i < widths.length; i++) {
        this.setColWidth(table, i, widths[i]);
      }
    } else {
      this.applyWidthsAdaptive(table, widths);
    }
  }

  storeTableWidths(table, id) {
    // Read a column width back from the DOM. In adaptive mode widths are
    // applied as percentages; convert back to pixels against the table's
    // current rendered width so stored values stay in pixel space (the
    // ratio is what matters — pixels are just the storage unit).
    const readColWidth = (el) => {
      const raw = el.style.width;
      if (!raw) return NaN;
      if (raw.endsWith("%")) {
        const base =
          table.clientWidth ||
          (table.parentElement && table.parentElement.clientWidth) ||
          0;
        const pct = parseFloat(raw);
        return base > 0 && !Number.isNaN(pct)
          ? Math.round((pct / 100) * base)
          : NaN;
      }
      return parseInt(raw, 10);
    };
    const cols = table.querySelectorAll("colgroup col");
    const map = {};
    if (cols.length > 0) {
      cols.forEach((col, i) => {
        const w = readColWidth(col);
        if (!Number.isNaN(w)) map[i] = w;
      });
    } else {
      const firstRow = table.querySelector("tr");
      const cells = firstRow ? firstRow.querySelectorAll("th, td") : [];
      cells.forEach((cell, i) => {
        const w = readColWidth(cell);
        if (!Number.isNaN(w)) map[i] = w;
      });
    }
    if (Object.keys(map).length === 0) {
      delete this.tableWidths[id];
    } else {
      // Timestamp for cross-machine arbitration (see saveMerged /
      // mergeFromDisk): newest _ts wins when two machines hold
      // different values for the same key.
      map._ts = Date.now();
      // Keep the auto-fit base recorded by a previous fit — it stays
      // valid across manual drags (content unchanged).
      const prev = this.tableWidths[id];
      if (prev && Array.isArray(prev._fit)) {
        map._fit = prev._fit;
      }
      this.tableWidths[id] = map;
      // NOTE: do NOT delete same-prefix keys here. A shared prefix
      // (same file + column count + header hash) can also belong to a
      // DIFFERENT table in the same file (e.g. several "方向 | 说明"
      // tables in one index note) — keys differ only by their first
      // data row. Cleaning by prefix made those tables delete each
      // other's records (and _fit bases), breaking idempotency and
      // cross-linking widths via the fallback matcher. File-level
      // cleanup (vault delete/rename) is the safe boundary.
    }
    // User action (drag end / modal apply / auto-fit): persist
    // immediately instead of a debounce window that can be lost to a
    // quick app close.
    this.saveMerged();
    // In adaptive mode the drag applied raw pixel widths (with min/max
    // caps) for direct manipulation; re-apply as percentages right away so
    // the caps can't keep the table wider than the container.
    if (this.settings.widthMode !== "fixed") {
      this.applyStoredWidths(table, id);
    }
  }

  // Auto-fit column widths so every column shows its content in a
  // single line (no wrapping). Strategy: temporarily switch the table
  // to table-layout:auto + white-space:nowrap so the browser computes
  // each column's natural "single line" width, read those widths, then
  // switch back to fixed and apply them. This is a manual action
  // (command / settings button), never automatic.
  autoFitTable(table, sourcePath = "") {
    // 1. Remove any previously applied colgroup widths so auto layout
    //    can compute from content alone.
    const cols = table.querySelectorAll("colgroup col");
    const oldColStyles = [];
    cols.forEach((col, i) => {
      oldColStyles[i] = {
        width: col.style.width,
        minWidth: col.style.minWidth,
        maxWidth: col.style.maxWidth,
      };
      col.style.width = "";
      col.style.minWidth = "";
      col.style.maxWidth = "";
    });
    // Also clear th/td inline widths: setColWidth's no-colgroup branch
    // writes widths directly onto cells, and leftover widths would
    // pollute the natural measurement below (e.g. widths borrowed from
    // another table by the fallback matcher in a previous render).
    for (const cell of table.querySelectorAll("th, td")) {
      cell.style.width = "";
      cell.style.minWidth = "";
      cell.style.maxWidth = "";
    }

    // 2. Switch to auto layout + force single-line rendering via a
    //    temporary CSS class (.tlh-measuring * with !important) so even
    //    Obsidian's .internal-link { word-break:break-word !important }
    //    is overridden. Using a class is more reliable than setting
    //    inline styles on every nested element.
    const oldLayout = table.style.tableLayout;
    table.style.tableLayout = "auto";
    // Force single-line rendering for the measurement. The CSS class
    // (.tlh-measuring, no !important per review rules) covers normal
    // cells; the inline !important below additionally beats Obsidian's
    // own .internal-link { word-break: break-word !important }, which a
    // plain class selector cannot override. Inline important is the
    // highest cascade level, so links measure at their true width.
    const measuredCells = table.querySelectorAll("th, td");
    const enterMeasure = () => {
      table.classList.add("tlh-measuring");
      for (const cell of measuredCells) {
        cell.style.setProperty("white-space", "nowrap", "important");
        cell.style.setProperty("word-break", "keep-all", "important");
        cell.style.setProperty("overflow-wrap", "normal", "important");
      }
    };
    const exitMeasure = () => {
      table.classList.remove("tlh-measuring");
      for (const cell of measuredCells) {
        cell.style.removeProperty("white-space");
        cell.style.removeProperty("word-break");
        cell.style.removeProperty("overflow-wrap");
      }
    };
    enterMeasure();

    // 3. Read the natural widths from ALL rows, taking the max width
    //    per column. (Using only the header row was wrong: headers are
    //    usually short, so data rows would still wrap.)
    const rows = table.querySelectorAll("tr");
    if (rows.length === 0) {
      exitMeasure();
      table.style.tableLayout = oldLayout;
      return false;
    }
    const maxWidths = [];
    for (const row of rows) {
      const rowCells = row.querySelectorAll("th, td");
      for (let i = 0; i < rowCells.length; i++) {
        const w = rowCells[i].offsetWidth;
        if (maxWidths[i] === undefined || w > maxWidths[i]) {
          maxWidths[i] = w;
        }
      }
    }
    // Viewport guard: a table rendered outside the viewport (CM6 folds
    // off-screen widgets with display:none, and some render paths hide
    // fragments until scrolled) measures offsetWidth 0 on every cell.
    // Fitting from those zeros either squeezes every column to
    // minColWidth (a cramped table) or, when the container splits the
    // space evenly, produces two equal "looks fine" columns that are
    // actually wrong. Skip the table entirely and report it, so the
    // user can scroll it into view and run the fit again.
    if (maxWidths.length === 0 || maxWidths.every((w) => w <= 1)) {
      exitMeasure();
      table.style.tableLayout = oldLayout || "fixed";
      return false;
    }
    // Idempotency: on a REPEAT fit, reuse the natural widths recorded
    // by the FIRST fit (_fit) instead of the freshly measured ones. The
    // measurement above can inherit widths from the currently applied
    // layout, so re-measuring after a fit would stack the buffer on
    // top of the previously applied widths (growing ~4px per click).
    // Computing from the stored base makes every click produce the
    // exact same result: restore to base, then expand once.
    const fitId =
      table.dataset.tlhTableId || this.getTableId(table, sourcePath);
    const fitRec = this.tableWidths[fitId];
    const base =
      fitRec &&
      Array.isArray(fitRec._fit) &&
      fitRec._fit.length === maxWidths.length
        ? fitRec._fit
        : maxWidths.slice(); // copy: maxWidths gets buffer-added in place

    // Add a small buffer to compensate for pixel rounding and border
    // differences between auto-layout measurement and fixed-layout
    // application. Without this, content can overflow by 1-2px and
    // word-break:break-word kicks in, wrapping a single character.
    const BUFFER = 4;
    for (let i = 0; i < maxWidths.length; i++) {
      maxWidths[i] = base[i] + BUFFER;
    }

    // 4. Remove the measuring state so normal wrapping returns.
    exitMeasure();

    // 5. Width distribution strategy:
    //    - If all columns fit within the container (totalNatural <= W):
    //        distribute extra space proportionally, table fills 100%.
    //    - If not (content overflows):
    //        * Column 0 (usually the file-link column) gets priority:
    //          keep its natural width so wiki links stay on one line,
    //          capped at FIRST_COL_MAX_RATIO of W (beyond that it wraps).
    //        * Remaining columns share the leftover space proportionally
    //          to their natural widths; they are allowed to wrap.
    //        Total table width is always 100% (no horizontal scrollbar).
    const minW = Number(this.settings.minColWidth) || 40;
    const FIRST_COL_MAX_RATIO = 0.6; // first column can take up to 60%
    const totalNatural = maxWidths.reduce((a, b) => a + b, 0);
    const containerWidth =
      table.parentElement && table.parentElement.clientWidth
        ? table.parentElement.clientWidth
        : 0;

    let finalWidths;
    if (containerWidth > 0 && totalNatural <= containerWidth) {
      // Roomy: every column fits on one line; distribute extra space.
      const extra = containerWidth - totalNatural;
      finalWidths = maxWidths.map(
        (w) => w + (w / totalNatural) * extra
      );
    } else if (containerWidth > 0) {
      // Overflow: prioritise column 0, let the rest wrap.
      const firstNatural = maxWidths[0] || minW;
      const firstCap = containerWidth * FIRST_COL_MAX_RATIO;
      const firstWidth = Math.min(firstNatural, firstCap);
      const remaining = containerWidth - firstWidth;

      const otherNatural = maxWidths.slice(1);
      const otherSum = otherNatural.reduce((a, b) => a + b, 0) || 1;

      let otherWidths;
      if (otherSum <= remaining) {
        // Other columns also fit; give them their natural width plus a
        // proportional share of whatever is left.
        const extra = remaining - otherSum;
        otherWidths = otherNatural.map(
          (w) => w + (w / otherSum) * extra
        );
      } else {
        // Not enough room: shrink proportionally, allow wrapping.
        const ratio = remaining / otherSum;
        otherWidths = otherNatural.map((w) => Math.max(w * ratio, minW));
      }
      finalWidths = [firstWidth, ...otherWidths];
    } else {
      finalWidths = maxWidths.map((w) => Math.max(w, minW));
    }

    table.style.tableLayout = oldLayout || "fixed";
    this.applyWidthsPx(table, finalWidths);
    this.storeTableWidths(table, fitId);
    // Persist the natural widths this fit was computed from so the next
    // fit is idempotent (see the _fit note above).
    const rec = this.tableWidths[fitId];
    if (rec) {
      rec._fit = base;
      this.saveMerged();
    }
    return true;
  }

  // Auto-fit every table in the currently active file.
  autoFitActiveFile() {
    const file = this.app.workspace.getActiveFile();
    if (!file) return;
    let count = 0;
    let skipped = 0;
    for (const leaf of this.app.workspace.getLeavesOfType("markdown")) {
      const view = leaf.view;
      if (
        !view ||
        !view.file ||
        view.file.path !== file.path ||
        !view.contentEl
      )
        continue;
      const tables = view.contentEl.querySelectorAll("table");
      for (const table of tables) {
        if (this.autoFitTable(table, view.file.path)) {
          count++;
        } else {
          skipped++;
        }
      }
    }
    let msg = `XU Table Layout Helper: ${this.t("notice_autofit").replace("{n}", count)}`;
    if (skipped > 0) {
      msg += `；${this.t("notice_autofit_skipped").replace("{n}", skipped)}`;
    }
    new Notice(msg, 2500);
  }

  applyStoredWidths(table, id) {
    let stored = this.tableWidths[id];
    if (!stored) {
      // Fallback: match by header hash within the same file. This covers
      // (a) migrated legacy keys that have no first-data-row hash, and
      // (b) tables whose first data row changed slightly.
      const match = id.match(/^(w:[^:]+:\d+:[^:]*):/);
      if (match) {
        const prefix = match[1] + ":";
        // Only LEGACY keys without a data hash may lend widths. A
        // same-prefix key that HAS a data hash belongs to a DIFFERENT
        // table in the same file (several tables sharing one header,
        // e.g. Kubernetes.md) — borrowing its widths cross-links
        // unrelated tables and crams them to a wrong layout.
        const candidate = Object.keys(this.tableWidths).find(
          (k) => k === prefix || k === prefix.slice(0, -1)
        );
        if (candidate) stored = this.tableWidths[candidate];
      }
    }
    if (!stored) return;
    table.style.tableLayout = "fixed";
    if (this.settings.widthMode === "fixed") {
      for (const idx of Object.keys(stored)) {
        if (idx.startsWith("_")) continue; // meta keys (_ts, _fit), not column indexes
        this.setColWidth(table, Number(idx), stored[idx]);
      }
      return;
    }
    // Adaptive fill: normalize the stored pixel widths into percentages
    // (ratios preserved) so the table always fills its container and
    // follows window resizes; no min/max caps — they would re-introduce
    // horizontal overflow on narrow pages.
    this.applyWidthsAdaptive(
      table,
      Object.keys(stored)
        .filter((idx) => !idx.startsWith("_"))
        .map((idx) => stored[idx])
    );
  }

  // Re-apply stored widths to every rendered table (reading view and
  // live-preview widgets). Called when the width mode setting changes so
  // already-rendered tables switch immediately.
  reapplyAllWidths() {
    for (const leaf of this.app.workspace.getLeavesOfType("markdown")) {
      const view = leaf.view;
      if (!view || !view.contentEl) continue;
      const tables = view.contentEl.querySelectorAll("table");
      for (const table of Array.from(tables)) {
        const path = view.file ? view.file.path : "";
        const id = table.dataset.tlhTableId || this.getTableId(table, path);
        if (this.tableWidths[id]) {
          this.applyStoredWidths(table, id);
        } else if (this.settings.widthMode === "fixed") {
          // adaptive -> fixed with no stored widths: drop percentage
          // styles so the table returns to the native auto layout.
          const cols = table.querySelectorAll("colgroup col");
          for (const col of cols) {
            if (col.style.width.endsWith("%")) {
              table.style.width = "";
              for (const c of table.querySelectorAll("colgroup col")) {
                c.style.width = "";
                c.style.minWidth = "";
                c.style.maxWidth = "";
              }
              break;
            }
          }
        }
      }
    }
  }

  // Apply saved widths to table-editor widgets in the live preview.
  // Covers freshly created widgets (attach handles once) and widgets
  // whose colgroup was rebuilt by the TableEditor (add/remove row or
  // column) — the latter only needs widths re-applied.
  attachEditorTableWidgets() {
    for (const leaf of this.app.workspace.getLeavesOfType("markdown")) {
      const view = leaf.view;
      if (!view || !view.contentEl || !view.file) continue;
      const tables = view.contentEl.querySelectorAll(
        ".cm-table-widget table"
      );
      for (const table of Array.from(tables)) {
        const path = view.file.path;
        if (table.dataset.tlhResized !== "1") {
          this.attachResizeHandles(table, path);
        } else {
          const id = this.getTableId(table, path);
          table.dataset.tlhTableId = id;
          if (this.tableWidths[id]) {
            this.applyStoredWidths(table, id);
          }
        }
      }
    }
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
    // force=true: do not re-pull deleted keys back from disk
    await this.saveMerged(true);
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

    new Setting(containerEl)
      .setName(this.t("setting_sticky_header"))
      .setDesc(this.t("setting_sticky_header_desc"))
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.stickyHeader)
          .onChange(async (value) => {
            this.plugin.settings.stickyHeader = value;
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
      .setName(this.t("setting_width_mode"))
      .setDesc(this.t("setting_width_mode_desc"))
      .addDropdown((dd) =>
        dd.addOption("adaptive", this.t("option_adaptive"))
          .addOption("fixed", this.t("option_fixed"))
          .setValue(this.plugin.settings.widthMode || "adaptive")
          .onChange(async (value) => {
            this.plugin.settings.widthMode = value;
            await this.plugin.saveSettings();
            this.plugin.reapplyAllWidths();
          })
      );

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

    // Auto-fit button (manual only, never automatic)
    new Setting(adv)
      .setName(this.t("setting_autofit"))
      .setDesc(this.t("setting_autofit_desc"))
      .addButton((button) =>
        button
          .setButtonText(this.t("btn_autofit"))
          .setCta()
          .onClick(() => this.plugin.autoFitActiveFile())
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

/* nosourcemap */
/* nosourcemap */