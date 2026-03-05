import { textareaUtils } from "./drupal-textarea-utils.js";

/**
 * Plugin: HTML tag autocomplete
 *
 * When the user types < followed by letters, shows a dropdown of matching
 * allowed HTML tags sourced from the BUEditor toolbar config embedded in
 * Drupal.settings. Selecting a tag wraps any selected text or inserts
 * <tag></tag> with the cursor positioned inside.
 */
const DROPDOWN_ID = "dat-tags-dropdown";

const tagsPlugin = {
  FALLBACK_TAGS: ["blockquote", "code", "del", "em", "h2", "h3", "h4", "li", "ol", "strong", "ul"],

  getTagsFromPage: function () {
    try {
      const bue = window.Drupal && Drupal.settings && Drupal.settings.BUE;
      const tags = new Set(this.FALLBACK_TAGS);
      if (bue) {
        Object.values(bue.templates || {}).forEach((template) => {
          (template.buttons || []).forEach((button) => {
            const content = button[1] || "";
            const matches = content.matchAll(/<([a-z][a-z0-9]*)[\s>]/gi);
            for (const m of matches) {
              tags.add(m[1].toLowerCase());
            }
          });
        });
      }
      return Array.from(tags).sort();
    } catch (e) {
      return this.FALLBACK_TAGS;
    }
  },

  getCurrentTagPrefix: function (textarea) {
    const value = textarea.value;
    const pos = textarea.selectionStart;
    const textBefore = value.slice(0, pos);
    const match = textBefore.match(/<([a-z]*)$/i);
    return match ? match[1].toLowerCase() : null;
  },

  buildInsertion: function (tag, selectedText) {
    if (tag === "ul" || tag === "ol") {
      const inner = selectedText
        ? selectedText.split("\n").map((line) => `  <li>${line}</li>`).join("\n")
        : `  <li></li>`;
      const inserted = `<${tag}>\n${inner}\n</${tag}>`;
      const cursorOffset = `<${tag}>\n  <li>`.length;
      return { inserted, cursorOffset };
    }
    const inserted = `<${tag}>${selectedText}</${tag}>`;
    const cursorOffset = `<${tag}>`.length + selectedText.length;
    return { inserted, cursorOffset };
  },

  applyTag: function (textarea, tag) {
    const value = textarea.value;
    const selStart = textarea.selectionStart;
    const selEnd = textarea.selectionEnd;
    const textBefore = value.slice(0, selStart);
    const openBracketPos = textBefore.lastIndexOf("<");
    const selectedText = value.slice(selStart, selEnd);
    const before = value.slice(0, openBracketPos);
    const after = value.slice(selEnd);
    const { inserted, cursorOffset } = this.buildInsertion(tag, selectedText);
    textarea.value = before + inserted + after;
    const cursorPos = openBracketPos + cursorOffset;
    textarea.setSelectionRange(cursorPos, cursorPos);
    textarea.focus();
  },

  attach: function (textarea, context) {
    const { allowedTags } = context;

    textarea.addEventListener("input", () => {
      const prefix = this.getCurrentTagPrefix(textarea);
      if (prefix === null) {
        textareaUtils.removeDropdown(DROPDOWN_ID);
        return;
      }
      const matches = allowedTags.filter((t) => t.startsWith(prefix));
      textareaUtils.showDropdown(
        textarea,
        matches.map((t) => `<${t}>`),
        (idx) => {
          this.applyTag(textarea, matches[idx]);
          textareaUtils.removeDropdown(DROPDOWN_ID);
        },
        DROPDOWN_ID
      );
    });

    textarea.addEventListener("blur", () => {
      setTimeout(() => textareaUtils.removeDropdown(DROPDOWN_ID), 150);
    });

    textareaUtils.attachKeyNav(textarea, DROPDOWN_ID, (idx) => {
      const prefix = this.getCurrentTagPrefix(textarea);
      const matches = allowedTags.filter((t) =>
        t.startsWith((prefix || "").toLowerCase())
      );
      if (matches[idx]) {
        this.applyTag(textarea, matches[idx]);
        textareaUtils.removeDropdown(DROPDOWN_ID);
      }
    });
  },
};

export { tagsPlugin };
