/*
 * XU Table Layout Helper - main.js
 * Pure JavaScript implementation, no compilation needed
 *
 * Features:
 *   1. Custom table layout (fixed / auto)
 *   2. Table width control (100% / custom / auto)
 *   3. Column width: first column fixed, others auto
 *   4. Text wrapping: nowrap / break-word / break-all
 *   5. Vertical alignment: top / middle / bottom
 *   6. Custom line height
 *   7. Overflow control: visible / hidden / scroll / auto
 *   8. Max height with scroll
 *   9. Sticky header
 *   10. Zebra stripes
 *   11. Link no-wrap
 *   12. Border control
 *
 * Implementation: Dynamic <style> injection into document.head
 * No !important used — overrides via selector specificity
 * Bilingual UI (Chinese / English) with language switcher
 */

const { Plugin, Notice, PluginSettingTab, Setting } = require("obsidian");

const PLUGIN_ID = "table-layout-helper";
const STYLE_ID = "table-layout-helper-style";

// ================================================================
//  i18n (Bilingual support)
// ================================================================

const I18N = {
  zh: {
    // Commands
    cmd_toggle: "切换表格布局助手开关",
    cmd_reload: "重新加载表格样式",
    // Notices
    notice_enabled: "已开启",
    notice_disabled: "已关闭",
    notice_reloaded: "样式已重新加载",
    notice_reset: "设置已恢复为默认值",
    // Settings - language
    setting_language: "界面语言",
    setting_language_desc: "选择设置面板的显示语言",
    lang_zh: "中文",
    lang_en: "English",
    // Settings - basic
    setting_enable: "启用插件",
    setting_enable_desc: "关闭后将恢复 Obsidian 默认表格样式",
    // Settings - sections
    sec_table_layout: "表格布局",
    sec_column_width: "列宽",
    sec_alignment: "对齐与行高",
    sec_overflow: "溢出控制",
    sec_styling: "样式",
    sec_border: "边框",
    // Settings - table layout
    setting_table_layout: "表格布局模式",
    setting_table_layout_desc: "fixed = 固定列宽（推荐），auto = 自动列宽",
    setting_table_width: "表格宽度",
    setting_table_width_desc: "支持 100% / auto / 像素值（如 800px）",
    // Settings - column width
    setting_first_col_width: "首列宽度",
    setting_first_col_width_desc: "像素值（如 200），留空为自动",
    setting_first_col_nowrap: "首列不换行",
    setting_first_col_nowrap_desc: "防止首列文字换行（适合标签列）",
    setting_content_wrap: "内容列换行模式",
    setting_content_wrap_desc: "break-word（推荐）/ break-all / normal",
    // Settings - alignment
    setting_vertical_align: "垂直对齐",
    setting_vertical_align_desc: "单元格内容的垂直对齐方式",
    setting_line_height: "行高",
    setting_line_height_desc: "单元格文字行高（如 1.6）",
    // Settings - overflow
    setting_overflow_mode: "溢出模式",
    setting_overflow_mode_desc: "visible / hidden / scroll / auto",
    setting_max_height: "最大高度",
    setting_max_height_desc: "像素值（如 400px），留空为无限制。与 overflow=scroll 配合使用效果最佳",
    setting_sticky_header: "粘性表头",
    setting_sticky_header_desc: "滚动时表头固定在顶部（需配合最大高度 + overflow=scroll）",
    setting_color_preset: "表格配色方案",
    setting_color_preset_desc: "表头深色 + 斑马纹浅色行（自动适配深浅主题）；选择 Obsidian 默认则不配色，斑马纹设置恢复独立生效",
    // Settings - styling
    setting_zebra: "斑马纹",
    setting_zebra_desc: "交替行背景色",
    setting_zebra_color: "斑马纹颜色",
    setting_zebra_color_desc: "偶数行背景色",
    setting_link_nowrap: "链接不换行",
    setting_link_nowrap_desc: "防止表格中的链接换行",
    // Settings - border
    setting_border_width: "边框宽度",
    setting_border_width_desc: "像素值，0 = 无边框",
    setting_border_color: "边框颜色",
    setting_border_color_desc: "边框颜色",
    setting_border_collapse: "边框合并",
    setting_border_collapse_desc: "collapse / separate",
    // Settings - reset
    setting_reset: "恢复默认设置",
    setting_reset_desc: "将所有设置恢复为默认值",
    btn_reset: "重置",
    // Tip
    tip_title: "使用提示",
    tip_1: "1. 本插件自动应用于所有 Markdown 表格",
    tip_2: "2. 修改设置后立即生效，无需重启",
    tip_3: "3. 使用 Ctrl+P → \"切换表格布局助手开关\" 快速开关",
    tip_4: "4. 推荐配置：长表格使用 overflow=scroll + max-height=400px + sticky-header=on",
    tip_css_title: "替换 CSS 代码片段",
    tip_css_desc: "本插件替换 table-fixed.css 代码片段。启用本插件后请禁用原代码片段。",
  },
  en: {
    // Commands
    cmd_toggle: "Toggle table layout control",
    cmd_reload: "Reload table style",
    // Notices
    notice_enabled: "Enabled",
    notice_disabled: "Disabled",
    notice_reloaded: "style reloaded",
    notice_reset: "Settings reset to defaults",
    // Settings - language
    setting_language: "UI Language",
    setting_language_desc: "Select the display language for settings panel",
    lang_zh: "中文",
    lang_en: "English",
    // Settings - basic
    setting_enable: "Enable plugin",
    setting_enable_desc: "Turn off to restore default Obsidian table styles",
    // Settings - sections
    sec_table_layout: "Table Layout",
    sec_column_width: "Column Width",
    sec_alignment: "Alignment & Line Height",
    sec_overflow: "Overflow Control",
    sec_styling: "Styling",
    sec_border: "Border",
    // Settings - table layout
    setting_table_layout: "Table layout mode",
    setting_table_layout_desc: "fixed = fixed column width (recommended), auto = auto column width",
    setting_table_width: "Table width",
    setting_table_width_desc: "Supports 100% / auto / pixel value (e.g. 800px)",
    // Settings - column width
    setting_first_col_width: "First column width",
    setting_first_col_width_desc: "Pixel value (e.g. 200), leave empty for auto",
    setting_first_col_nowrap: "First column no-wrap",
    setting_first_col_nowrap_desc: "Prevent first column text from wrapping (good for label columns)",
    setting_content_wrap: "Content column wrap mode",
    setting_content_wrap_desc: "break-word (recommended) / break-all / normal",
    // Settings - alignment
    setting_vertical_align: "Vertical alignment",
    setting_vertical_align_desc: "Vertical alignment of cell content",
    setting_line_height: "Line height",
    setting_line_height_desc: "Cell text line height (e.g. 1.6)",
    // Settings - overflow
    setting_overflow_mode: "Overflow mode",
    setting_overflow_mode_desc: "visible / hidden / scroll / auto",
    setting_max_height: "Max height",
    setting_max_height_desc: "Pixel value (e.g. 400px), leave empty for no limit. Works best with overflow=scroll",
    setting_sticky_header: "Sticky header",
    setting_sticky_header_desc: "Header stays on top when scrolling (requires max height + overflow=scroll)",
    setting_color_preset: "Table color preset",
    setting_color_preset_desc: "Dark header + light zebra rows (auto-adapts to light/dark theme); choose Obsidian default to disable and let zebra settings work standalone",
    // Settings - styling
    setting_zebra: "Zebra stripes",
    setting_zebra_desc: "Alternating row background colors",
    setting_zebra_color: "Zebra color",
    setting_zebra_color_desc: "Even row background color",
    setting_link_nowrap: "Link no-wrap",
    setting_link_nowrap_desc: "Prevent links in tables from wrapping",
    // Settings - border
    setting_border_width: "Border width",
    setting_border_width_desc: "Pixel value, 0 = no border",
    setting_border_color: "Border color",
    setting_border_color_desc: "Border color",
    setting_border_collapse: "Border collapse",
    setting_border_collapse_desc: "collapse / separate",
    // Settings - reset
    setting_reset: "Reset to defaults",
    setting_reset_desc: "Restore all settings to default values",
    btn_reset: "Reset",
    // Tip
    tip_title: "Usage Tips",
    tip_1: "1. This plugin applies to all Markdown tables automatically",
    tip_2: "2. Changes apply instantly — no restart needed",
    tip_3: "3. Use Ctrl+P → \"Toggle table layout control\" for quick on/off",
    tip_4: "4. Recommended: overflow=scroll + max-height=400px + sticky-header=on for long tables",
    tip_css_title: "Replaces CSS snippet",
    tip_css_desc: "This plugin replaces the table-fixed.css snippet. Disable the original snippet after enabling this plugin.",
  },
};

// Color presets — all values use Obsidian theme CSS variables so they
// auto-adapt to light/dark themes and stay visually coherent with the
// user's current theme (borrowed from quiet-outline's variable-only approach).
// color-mix() is supported in Obsidian's embedded Chromium (≥v111).
const COLOR_PRESETS = {
  obsidian: { zh: "Obsidian 默认", en: "Obsidian default" },
  subtle: {
    zh: "素雅（主题灰）", en: "Subtle (theme gray)",
    headerBg: "var(--background-secondary)",
    headerColor: "var(--text-normal)",
    zebraBg: "var(--background-primary-alt)",
  },
  accentSoft: {
    zh: "主题色·浅", en: "Accent soft",
    headerBg: "color-mix(in srgb, var(--interactive-accent) 28%, var(--background-secondary))",
    headerColor: "var(--text-normal)",
    zebraBg: "color-mix(in srgb, var(--interactive-accent) 7%, transparent)",
  },
  accentDeep: {
    zh: "主题色·深", en: "Accent deep",
    headerBg: "var(--interactive-accent)",
    headerColor: "var(--text-on-accent)",
    zebraBg: "color-mix(in srgb, var(--interactive-accent) 12%, transparent)",
  },
  warm: {
    zh: "暖调", en: "Warm",
    headerBg: "var(--background-modifier-hover)",
    headerColor: "var(--text-normal)",
    zebraBg: "var(--background-primary-alt)",
  },
  underline: {
    zh: "底线强调", en: "Underline accent",
    headerBg: "var(--background-secondary)",
    headerColor: "var(--text-normal)",
    zebraBg: "var(--background-primary-alt)",
    headerBorder: "2px solid var(--interactive-accent)",
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
  firstColumnWrap: false,

  // Content columns
  contentColumnWrap: "break-word",
  verticalAlign: "top",
  lineHeight: "1.6",

  // Overflow
  overflowMode: "visible",
  maxHeight: "",

  // Sticky header
  stickyHeader: false,

  // Color preset ("obsidian" = no color injection)
  colorPreset: "obsidian",

  // Zebra stripes
  zebraStripes: false,
  zebraColor: "#f8f9fa",

  // Link no-wrap
  linkNoWrap: true,

  // Border
  borderWidth: "1",
  borderColor: "#e8e8e8",
  borderCollapse: "collapse",
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
  // th selector targets thead cells explicitly with high specificity so the
  // whole header row gets one uniform background (avoids partial per-cell color).
  const thSel = ".markdown-preview-view table thead tr th, .markdown-source-view.mod-cm6 .cm-table-widget table thead tr th";
  const tdSel = ".markdown-preview-view table td, .markdown-source-view .cm-table-widget table td";
  const firstColSel = ".markdown-preview-view table th:first-child, .markdown-preview-view table td:first-child, .markdown-source-view .cm-table-widget table th:first-child, .markdown-source-view .cm-table-widget table td:first-child";
  const lastColSel = ".markdown-preview-view table th:last-child, .markdown-preview-view table td:last-child, .markdown-source-view .cm-table-widget table th:last-child, .markdown-source-view .cm-table-widget table td:last-child";

  // 1. Table layout
  const tableWidth = settings.tableWidth || "100%";
  css.push(`${tableSel} {
  table-layout: ${settings.tableLayout};
  width: ${tableWidth};
  border-collapse: ${settings.borderCollapse};
  ${settings.borderWidth > 0 ? `border: ${settings.borderWidth}px solid ${settings.borderColor};` : ""}
}`);

  // 2. Cell styles
  const cellStyles = [
    `vertical-align: ${settings.verticalAlign};`,
    `line-height: ${settings.lineHeight};`,
  ];
  if (settings.borderWidth > 0) {
    cellStyles.push(`border: ${settings.borderWidth}px solid ${settings.borderColor};`);
  }
  css.push(`${thSel}, ${tdSel} {
  ${cellStyles.join("\n  ")}
}`);

  // 3. First column
  const firstColStyles = [];
  if (settings.firstColumnWidth) {
    firstColStyles.push(`width: ${settings.firstColumnWidth}px;`);
  }
  firstColStyles.push(`white-space: ${settings.firstColumnWrap ? "normal" : "nowrap"};`);
  css.push(`${firstColSel} {
  ${firstColStyles.join("\n  ")}
}`);

  // 4. Content columns (last column)
  const contentColStyles = [`width: auto;`];
  if (settings.contentColumnWrap === "break-word") {
    contentColStyles.push("word-break: break-word;");
  } else if (settings.contentColumnWrap === "break-all") {
    contentColStyles.push("word-break: break-all;");
  } else {
    contentColStyles.push("word-break: normal;");
  }
  css.push(`${lastColSel} {
  ${contentColStyles.join("\n  ")}
}`);

  // 5. Overflow
  if (settings.overflowMode !== "visible" || settings.maxHeight) {
    const wrapperSel = ".markdown-preview-view .tlh-table-wrapper, .markdown-source-view .cm-table-widget .tlh-table-wrapper";
    const wrapperStyles = [];
    if (settings.overflowMode !== "visible") {
      wrapperStyles.push(`overflow: ${settings.overflowMode};`);
    }
    if (settings.maxHeight) {
      wrapperStyles.push(`max-height: ${settings.maxHeight};`);
    }
    css.push(`${wrapperSel} {
  ${wrapperStyles.join("\n  ")}
}`);
  }

  // 6. Sticky header (do NOT set background here — color preset owns it)
  if (settings.stickyHeader) {
    css.push(`${thSel} {
  position: sticky;
  top: 0;
  z-index: 10;
}`);
  }

  // 7. Zebra stripes (standalone; skipped when a color preset owns the palette)
  if (settings.zebraStripes && settings.colorPreset === "obsidian") {
    css.push(`.markdown-preview-view table tbody tr:nth-child(even) td, .markdown-source-view .cm-table-widget table tbody tr:nth-child(even) td {
  background-color: ${settings.zebraColor};
}`);
  }

  // 8. Color preset — theme-variable based, whole header row uniform.
  const preset = COLOR_PRESETS[settings.colorPreset];
  if (preset && settings.colorPreset !== "obsidian") {
    const zebraSel = ".markdown-preview-view table tbody tr:nth-child(even) td, .markdown-source-view.mod-cm6 .cm-table-widget table tbody tr:nth-child(even) td";
    css.push(`${thSel} {
  background-color: ${preset.headerBg};
  color: ${preset.headerColor};
  ${preset.headerBorder ? `border-bottom: ${preset.headerBorder};` : ""}
}`);
    css.push(`${zebraSel} {
  background-color: ${preset.zebraBg};
}`);
  }

  // 9. Link no-wrap
  if (settings.linkNoWrap) {
    css.push(`.markdown-preview-view table td:last-child a, .markdown-source-view .cm-table-widget table td:last-child a {
  white-space: nowrap;
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
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
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

    containerEl.createEl("h2", { text: "XU Table Layout Helper" });

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

    // ---------- Basic ----------
    new Setting(containerEl)
      .setName(this.t("setting_enable"))
      .setDesc(this.t("setting_enable_desc"))
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enabled)
          .onChange(async (value) => {
            this.plugin.settings.enabled = value;
            await this.plugin.saveSettings();
            this.plugin.injectStyle();
          })
      );

    containerEl.createEl("hr");

    // ---------- Table layout ----------
    containerEl.createEl("h3", { text: this.t("sec_table_layout") });

    new Setting(containerEl)
      .setName(this.t("setting_table_layout"))
      .setDesc(this.t("setting_table_layout_desc"))
      .addDropdown((dropdown) =>
        dropdown
          .addOption("fixed", "fixed")
          .addOption("auto", "auto")
          .setValue(this.plugin.settings.tableLayout)
          .onChange(async (value) => {
            this.plugin.settings.tableLayout = value;
            await this.plugin.saveSettings();
            this.plugin.injectStyle();
          })
      );

    new Setting(containerEl)
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

    // ---------- Column width ----------
    containerEl.createEl("h3", { text: this.t("sec_column_width") });

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

    new Setting(containerEl)
      .setName(this.t("setting_first_col_nowrap"))
      .setDesc(this.t("setting_first_col_nowrap_desc"))
      .addToggle((toggle) =>
        toggle
          .setValue(!this.plugin.settings.firstColumnWrap)
          .onChange(async (value) => {
            this.plugin.settings.firstColumnWrap = !value;
            await this.plugin.saveSettings();
            this.plugin.injectStyle();
          })
      );

    new Setting(containerEl)
      .setName(this.t("setting_content_wrap"))
      .setDesc(this.t("setting_content_wrap_desc"))
      .addDropdown((dropdown) =>
        dropdown
          .addOption("break-word", "break-word")
          .addOption("break-all", "break-all")
          .addOption("normal", "normal")
          .setValue(this.plugin.settings.contentColumnWrap)
          .onChange(async (value) => {
            this.plugin.settings.contentColumnWrap = value;
            await this.plugin.saveSettings();
            this.plugin.injectStyle();
          })
      );

    // ---------- Alignment & line height ----------
    containerEl.createEl("h3", { text: this.t("sec_alignment") });

    new Setting(containerEl)
      .setName(this.t("setting_vertical_align"))
      .setDesc(this.t("setting_vertical_align_desc"))
      .addDropdown((dropdown) =>
        dropdown
          .addOption("top", "top")
          .addOption("middle", "middle")
          .addOption("bottom", "bottom")
          .setValue(this.plugin.settings.verticalAlign)
          .onChange(async (value) => {
            this.plugin.settings.verticalAlign = value;
            await this.plugin.saveSettings();
            this.plugin.injectStyle();
          })
      );

    new Setting(containerEl)
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

    // ---------- Overflow ----------
    containerEl.createEl("h3", { text: this.t("sec_overflow") });

    new Setting(containerEl)
      .setName(this.t("setting_overflow_mode"))
      .setDesc(this.t("setting_overflow_mode_desc"))
      .addDropdown((dropdown) =>
        dropdown
          .addOption("visible", "visible")
          .addOption("hidden", "hidden")
          .addOption("scroll", "scroll")
          .addOption("auto", "auto")
          .setValue(this.plugin.settings.overflowMode)
          .onChange(async (value) => {
            this.plugin.settings.overflowMode = value;
            await this.plugin.saveSettings();
            this.plugin.injectStyle();
          })
      );

    new Setting(containerEl)
      .setName(this.t("setting_max_height"))
      .setDesc(this.t("setting_max_height_desc"))
      .addText((text) =>
        text
          .setPlaceholder("400px")
          .setValue(this.plugin.settings.maxHeight)
          .onChange(async (value) => {
            this.plugin.settings.maxHeight = value;
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

    // ---------- Styling ----------
    containerEl.createEl("h3", { text: this.t("sec_styling") });

    new Setting(containerEl)
      .setName(this.t("setting_color_preset"))
      .setDesc(this.t("setting_color_preset_desc"))
      .addDropdown((dropdown) => {
        for (const [key, val] of Object.entries(COLOR_PRESETS)) {
          dropdown.addOption(key, this.plugin.settings.language === "en" ? val.en : val.zh);
        }
        dropdown
          .setValue(this.plugin.settings.colorPreset)
          .onChange(async (value) => {
            this.plugin.settings.colorPreset = value;
            await this.plugin.saveSettings();
            this.plugin.injectStyle();
          });
      });

    new Setting(containerEl)
      .setName(this.t("setting_zebra"))
      .setDesc(this.t("setting_zebra_desc"))
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.zebraStripes)
          .onChange(async (value) => {
            this.plugin.settings.zebraStripes = value;
            await this.plugin.saveSettings();
            this.plugin.injectStyle();
          })
      );

    new Setting(containerEl)
      .setName(this.t("setting_zebra_color"))
      .setDesc(this.t("setting_zebra_color_desc"))
      .addColorPicker((color) =>
        color
          .setValue(this.plugin.settings.zebraColor)
          .onChange(async (value) => {
            this.plugin.settings.zebraColor = value;
            await this.plugin.saveSettings();
            this.plugin.injectStyle();
          })
      );

    new Setting(containerEl)
      .setName(this.t("setting_link_nowrap"))
      .setDesc(this.t("setting_link_nowrap_desc"))
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.linkNoWrap)
          .onChange(async (value) => {
            this.plugin.settings.linkNoWrap = value;
            await this.plugin.saveSettings();
            this.plugin.injectStyle();
          })
      );

    // ---------- Border ----------
    containerEl.createEl("h3", { text: this.t("sec_border") });

    new Setting(containerEl)
      .setName(this.t("setting_border_width"))
      .setDesc(this.t("setting_border_width_desc"))
      .addText((text) =>
        text
          .setPlaceholder("1")
          .setValue(String(this.plugin.settings.borderWidth))
          .onChange(async (value) => {
            this.plugin.settings.borderWidth = value.replace(/[^\d]/g, "") || "0";
            await this.plugin.saveSettings();
            this.plugin.injectStyle();
          })
      );

    new Setting(containerEl)
      .setName(this.t("setting_border_color"))
      .setDesc(this.t("setting_border_color_desc"))
      .addColorPicker((color) =>
        color
          .setValue(this.plugin.settings.borderColor)
          .onChange(async (value) => {
            this.plugin.settings.borderColor = value;
            await this.plugin.saveSettings();
            this.plugin.injectStyle();
          })
      );

    new Setting(containerEl)
      .setName(this.t("setting_border_collapse"))
      .setDesc(this.t("setting_border_collapse_desc"))
      .addDropdown((dropdown) =>
        dropdown
          .addOption("collapse", "collapse")
          .addOption("separate", "separate")
          .setValue(this.plugin.settings.borderCollapse)
          .onChange(async (value) => {
            this.plugin.settings.borderCollapse = value;
            await this.plugin.saveSettings();
            this.plugin.injectStyle();
          })
      );

    containerEl.createEl("hr");

    // ---------- Usage tips ----------
    const tip = containerEl.createEl("div", { cls: "tlh-tip" });
    tip.innerHTML = `
      <b>${this.t("tip_title")}</b><br>
      ${this.t("tip_1")}<br>
      ${this.t("tip_2")}<br>
      ${this.t("tip_3")}<br>
      ${this.t("tip_4")}<br>
      <br>
      <b>${this.t("tip_css_title")}</b><br>
      ${this.t("tip_css_desc")}
    `;

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
  }
}

module.exports = TableLayoutHelperPlugin;
module.exports.default = TableLayoutHelperPlugin;
