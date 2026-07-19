/*
 * 表格布局助手 - main.ts
 * TypeScript 源文件，用于类型检查和二次开发参考
 * 实际运行使用 main.js，此文件仅供参考
 *
 * 本文件包含 i18n（中英双语）的完整结构定义，
 * 但详细设置项的实现请参考 main.js 中的 display() 方法。
 */

import { App, Notice, Plugin, PluginSettingTab, Setting } from "obsidian";

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

interface TableFixedSettings {
  enabled: boolean;
  language: "zh" | "en";

  // 表格布局
  tableLayout: "fixed" | "auto";
  tableWidth: string;

  // 第一列
  firstColumnWidth: string;
  firstColumnWrap: boolean;

  // 内容列
  contentColumnWrap: "break-word" | "break-all" | "normal";
  verticalAlign: "top" | "middle" | "bottom";
  lineHeight: string;

  // 溢出收敛
  overflowMode: "visible" | "hidden" | "scroll" | "auto";
  maxHeight: string;

  // 表头粘性
  stickyHeader: boolean;

  // 斑马纹
  zebraStripes: boolean;
  zebraColor: string;

  // 链接不折行
  linkNoWrap: boolean;

  // 边框
  borderWidth: string;
  borderColor: string;
  borderCollapse: "collapse" | "separate";
}

const DEFAULT_SETTINGS: TableFixedSettings = {
  enabled: true,
  language: "zh",
  tableLayout: "fixed",
  tableWidth: "100%",
  firstColumnWidth: "200",
  firstColumnWrap: false,
  contentColumnWrap: "break-word",
  verticalAlign: "top",
  lineHeight: "1.6",
  overflowMode: "visible",
  maxHeight: "",
  stickyHeader: false,
  zebraStripes: false,
  zebraColor: "#f8f9fa",
  linkNoWrap: true,
  borderWidth: "1",
  borderColor: "#e8e8e8",
  borderCollapse: "collapse",
};

export default class TableLayoutHelperPlugin extends Plugin {
  settings!: TableFixedSettings;

  // i18n helper
  t(key: string): string {
    const lang = this.settings ? this.settings.language : "zh";
    const dict = I18N[lang] || I18N.zh;
    return dict[key] || key;
  }

  async onload(): Promise<void> {
    await this.loadSettings();
    this.injectStyle();

    // 命令名使用 i18n，切换语言时会重新注册
    this.registerCommands();

    this.addSettingTab(new TableLayoutHelperSettingTab(this.app, this));
  }

  registerCommands(): void {
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

  onunload(): void {
    const styleEl = document.getElementById(STYLE_ID);
    if (styleEl) {
      styleEl.remove();
    }
  }

  injectStyle(): void {
    let styleEl = document.getElementById(STYLE_ID);
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = STYLE_ID;
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = generateCSS(this.settings);
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }
}

class TableLayoutHelperSettingTab extends PluginSettingTab {
  plugin: TableLayoutHelperPlugin;

  constructor(app: App, plugin: TableLayoutHelperPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  // i18n helper
  t(key: string): string {
    return this.plugin.t(key);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "XU Table Layout Helper" });

    // ---------- 语言切换器（顶部）----------
    new Setting(containerEl)
      .setName(this.t("setting_language"))
      .setDesc(this.t("setting_language_desc"))
      .addDropdown((dropdown) =>
        dropdown
          .addOption("zh", this.t("lang_zh"))
          .addOption("en", this.t("lang_en"))
          .setValue(this.plugin.settings.language)
          .onChange(async (value) => {
            this.plugin.settings.language = value as "zh" | "en";
            await this.plugin.saveSettings();
            // 用新语言重新注册命令
            this.plugin.registerCommands();
            // 重新渲染设置面板
            this.display();
          })
      );

    containerEl.createEl("hr");

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

    // ... 其余设置项见 main.js（均通过 t() 获取文本）
  }
}

function generateCSS(settings: TableFixedSettings): string {
  if (!settings.enabled) return "/* table helper: 已禁用 */";
  // 详见 main.js 中的 generateCSS 函数
  return "";
}
