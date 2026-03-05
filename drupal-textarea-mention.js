import { textareaUtils } from "./drupal-textarea-utils.js";

/**
 * Plugin: @mention autocomplete
 *
 * Provides username autocomplete when the user types @ in a textarea.
 * Sources: usernames scraped from /u/ links on the page + configured common_usernames.
 */
const DROPDOWN_ID = "dat-mention-dropdown";

const mentionPlugin = {
  getUsernamesFromPage: function () {
    const usernames = new Set();
    document.querySelectorAll('a[href*="/u/"]').forEach((link) => {
      const match = link.getAttribute("href").match(/\/u\/([^/?#]+)/);
      if (match) {
        usernames.add(match[1]);
      }
    });
    return Array.from(usernames);
  },

  getAllUsernames: function (commonUsernames) {
    const pageUsernames = this.getUsernamesFromPage();
    const combined = new Set([...pageUsernames, ...commonUsernames]);
    return Array.from(combined).sort((a, b) =>
      a.toLowerCase().localeCompare(b.toLowerCase())
    );
  },

  getCurrentMentionPrefix: function (textarea) {
    const value = textarea.value;
    const pos = textarea.selectionStart;
    const textBefore = value.slice(0, pos);
    const match = textBefore.match(/@(\w*)$/);
    return match ? match[1] : null;
  },

  applyMention: function (textarea, username) {
    const value = textarea.value;
    const pos = textarea.selectionStart;
    const textBefore = value.slice(0, pos);
    const textAfter = value.slice(pos);
    const replaced = textBefore.replace(/@(\w*)$/, `@${username}`);
    textarea.value = replaced + textAfter;
    const newPos = replaced.length;
    textarea.setSelectionRange(newPos, newPos);
    textarea.focus();
  },

  attach: function (textarea, context) {
    const { allUsernames } = context;

    textarea.addEventListener("input", () => {
      const prefix = this.getCurrentMentionPrefix(textarea);
      if (prefix === null) {
        textareaUtils.removeDropdown(DROPDOWN_ID);
        return;
      }
      const matches = allUsernames.filter((u) =>
        u.toLowerCase().startsWith(prefix.toLowerCase())
      );
      textareaUtils.showDropdown(
        textarea,
        matches.map((u) => `@${u}`),
        (idx) => {
          this.applyMention(textarea, matches[idx]);
          textareaUtils.removeDropdown(DROPDOWN_ID);
        },
        DROPDOWN_ID
      );
    });

    textarea.addEventListener("blur", () => {
      setTimeout(() => textareaUtils.removeDropdown(DROPDOWN_ID), 150);
    });

    textareaUtils.attachKeyNav(textarea, DROPDOWN_ID, (idx) => {
      const prefix = this.getCurrentMentionPrefix(textarea);
      const matches = allUsernames.filter((u) =>
        u.toLowerCase().startsWith((prefix || "").toLowerCase())
      );
      if (matches[idx]) {
        this.applyMention(textarea, matches[idx]);
        textareaUtils.removeDropdown(DROPDOWN_ID);
      }
    });
  },
};

export { mentionPlugin };
