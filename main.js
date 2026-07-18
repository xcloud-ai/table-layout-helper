/*
 * Table Layout Helper - main.js
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
 */

const { Plugin, Notice, PluginSettingTab, Setting } = require("obsidian");

const PLUGIN_ID = "table-layout-helper";
const STYLE_ID = "table-layout-helper-style";

const DEFAULT_SETTINGS = {
  enabled: true,

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
    return "/* Table Layout Helper: disabled */";
  }

  const css = [];

  // Selectors with high specificity to avoid !important
  const tableSel = ".markdown-preview-view table, .markdown-source-view .cm-table-widget table";
  const thSel = ".markdown-preview-view table th, .markdown-source-view .cm-table-widget table th";
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

  // 6. Sticky header
  if (settings.stickyHeader) {
    css.push(`${thSel} {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--background-secondary, #f8f9fa);
}`);
  }

  // 7. Zebra stripes
  if (settings.zebraStripes) {
    css.push(`.markdown-preview-view table tr:nth-child(even), .markdown-source-view .cm-table-widget table tr:nth-child(even) {
  background: ${settings.zebraColor};
}`);
  }

  // 8. Link no-wrap
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

  async onload() {
    await this.loadSettings();
    this.injectStyle();

    // Commands
    this.addCommand({
      id: "toggle-table-layout",
      name: "Toggle table layout control",
      callback: () => {
        this.settings.enabled = !this.settings.enabled;
        this.saveSettings();
        this.injectStyle();
        new Notice(
          `Table Layout Helper: ${this.settings.enabled ? "Enabled" : "Disabled"}`,
          2000
        );
      },
    });

    this.addCommand({
      id: "reload-table-style",
      name: "Reload table style",
      callback: () => {
        this.injectStyle();
        new Notice("Table Layout Helper: style reloaded", 2000);
      },
    });

    // Settings tab
    this.addSettingTab(new TableLayoutHelperSettingTab(this.app, this));
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

  display() {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "Table Layout Helper" });

    // ---------- Basic ----------
    new Setting(containerEl)
      .setName("Enable plugin")
      .setDesc("Turn off to restore default Obsidian table styles")
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
    containerEl.createEl("h3", { text: "Table Layout" });

    new Setting(containerEl)
      .setName("Table layout mode")
      .setDesc("fixed = fixed column width (recommended), auto = auto column width")
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
      .setName("Table width")
      .setDesc("Supports 100% / auto / pixel value (e.g. 800px)")
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
    containerEl.createEl("h3", { text: "Column Width" });

    new Setting(containerEl)
      .setName("First column width")
      .setDesc("Pixel value (e.g. 200), leave empty for auto")
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
      .setName("First column no-wrap")
      .setDesc("Prevent first column text from wrapping (good for label columns)")
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
      .setName("Content column wrap mode")
      .setDesc("break-word (recommended) / break-all / normal")
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
    containerEl.createEl("h3", { text: "Alignment & Line Height" });

    new Setting(containerEl)
      .setName("Vertical alignment")
      .setDesc("Vertical alignment of cell content")
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
      .setName("Line height")
      .setDesc("Cell text line height (e.g. 1.6)")
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
    containerEl.createEl("h3", { text: "Overflow Control" });

    new Setting(containerEl)
      .setName("Overflow mode")
      .setDesc("visible / hidden / scroll / auto")
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
      .setName("Max height")
      .setDesc("Pixel value (e.g. 400px), leave empty for no limit. Works best with overflow=scroll")
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
      .setName("Sticky header")
      .setDesc("Header stays on top when scrolling (requires max height + overflow=scroll)")
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
    containerEl.createEl("h3", { text: "Styling" });

    new Setting(containerEl)
      .setName("Zebra stripes")
      .setDesc("Alternating row background colors")
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
      .setName("Zebra color")
      .setDesc("Even row background color")
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
      .setName("Link no-wrap")
      .setDesc("Prevent links in tables from wrapping")
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
    containerEl.createEl("h3", { text: "Border" });

    new Setting(containerEl)
      .setName("Border width")
      .setDesc("Pixel value, 0 = no border")
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
      .setName("Border color")
      .setDesc("Border color")
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
      .setName("Border collapse")
      .setDesc("collapse / separate")
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
      <b>Usage Tips</b><br>
      1. This plugin applies to all Markdown tables automatically<br>
      2. Changes apply <b>instantly</b> — no restart needed<br>
      3. Use Ctrl+P &rarr; "Toggle table layout control" for quick on/off<br>
      4. Recommended: overflow=scroll + max-height=400px + sticky-header=on for long tables<br>
      <br>
      <b>Replaces CSS snippet</b><br>
      This plugin replaces the <code>table-fixed.css</code> snippet. Disable the original snippet after enabling this plugin.
    `;

    // ---------- Reset ----------
    new Setting(containerEl)
      .setName("Reset to defaults")
      .setDesc("Restore all settings to default values")
      .addButton((button) =>
        button
          .setButtonText("Reset")
          .setWarning()
          .onClick(async () => {
            this.plugin.settings = Object.assign({}, DEFAULT_SETTINGS);
            await this.plugin.saveSettings();
            this.plugin.injectStyle();
            this.display();
            new Notice("Settings reset to defaults", 2000);
          })
      );
  }
}

module.exports = TableLayoutHelperPlugin;
module.exports.default = TableLayoutHelperPlugin;
