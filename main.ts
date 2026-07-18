/*
 * 表格布局助手 - main.ts
 * TypeScript 源文件，用于类型检查和二次开发参考
 * 实际运行使用 main.js，此文件仅供参考
 */

import { App, Notice, Plugin, PluginSettingTab, Setting } from "obsidian";

const PLUGIN_ID = "xu-table-helper";
const STYLE_ID = "xu-table-helper-style";

interface TableFixedSettings {
  enabled: boolean;

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

export default class XuTableFixedPlugin extends Plugin {
  settings!: TableFixedSettings;

  async onload(): Promise<void> {
    await this.loadSettings();
    this.injectStyle();

    this.addCommand({
      id: "toggle-table-fixed",
      name: "切换表格布局助手开关",
      callback: () => {
        this.settings.enabled = !this.settings.enabled;
        this.saveSettings();
        this.injectStyle();
        new Notice(
          `表格布局助手: ${this.settings.enabled ? "已开启" : "已关闭"}`,
          2000
        );
      },
    });

    this.addCommand({
      id: "reload-table-style",
      name: "重新加载表格样式",
      callback: () => {
        this.injectStyle();
        new Notice("表格布局助手: 样式已重新加载", 2000);
      },
    });

    this.addSettingTab(new XuTableFixedSettingTab(this.app, this));
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

class XuTableFixedSettingTab extends PluginSettingTab {
  plugin: XuTableFixedPlugin;

  constructor(app: App, plugin: XuTableFixedPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "表格布局助手" });

    new Setting(containerEl)
      .setName("启用插件")
      .setDesc("关闭后将恢复 Obsidian 默认表格样式")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enabled)
          .onChange(async (value) => {
            this.plugin.settings.enabled = value;
            await this.plugin.saveSettings();
            this.plugin.injectStyle();
          })
      );

    // ... 其余设置项见 main.js
  }
}

function generateCSS(settings: TableFixedSettings): string {
  if (!settings.enabled) return "/* table helper: 已禁用 */";
  // 详见 main.js 中的 generateCSS 函数
  return "";
}
