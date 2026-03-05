import { utils } from "./common.js";

const textareaEnhance = {
  /**
   * Collects unique usernames from links on the current page matching /u/<username>.
   */
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

  /**
   * Builds a map of comment sequential number → comment anchor ID.
   * e.g. { 1: "comment-16319120" }
   */
  getCommentMap: function () {
    const map = {};
    document.querySelectorAll("a.permalink").forEach((link) => {
      const text = link.textContent.replace("Comment", "").trim();
      const num = parseInt(text.replace("#", ""), 10);
      if (!isNaN(num)) {
        const anchor = link.getAttribute("href").split("#")[1];
        if (anchor) {
          map[num] = anchor;
        }
      }
    });
    return map;
  },

  /**
   * Expands #N references in textarea text to HTML anchor links.
   * Only replaces when #N is followed by a non-digit character (space, punctuation, etc.)
   * so the user can finish typing a multi-digit number.
   * e.g. #11 + space → <a href="#comment-16492411">#11</a>
   */
  expandCommentLinks: function (textarea, commentMap) {
    const value = textarea.value;
    const pos = textarea.selectionStart;
    const newValue = value.replace(/#(\d+)(?=\D)/g, (match, num) => {
      const anchor = commentMap[parseInt(num, 10)];
      return anchor !== undefined ? `<a href="#${anchor}">#${num}</a>` : match;
    });
    if (newValue !== value) {
      textarea.value = newValue;
      const delta = newValue.length - value.length;
      textarea.setSelectionRange(pos + delta, pos + delta);
    }
  },

  /**
   * Returns the combined list of page usernames and configured common usernames.
   */
  getAllUsernames: function (commonUsernames) {
    const pageUsernames = this.getUsernamesFromPage();
    const combined = new Set([...pageUsernames, ...commonUsernames]);
    return Array.from(combined).sort((a, b) =>
      a.toLowerCase().localeCompare(b.toLowerCase())
    );
  },

  /**
   * Gets the @mention prefix currently being typed at the cursor position.
   * Returns null if the cursor is not within an @mention context.
   */
  getCurrentMentionPrefix: function (textarea) {
    const value = textarea.value;
    const pos = textarea.selectionStart;
    const textBefore = value.slice(0, pos);
    const match = textBefore.match(/@(\w*)$/);
    return match ? match[1] : null;
  },

  /**
   * Replaces the current @<partial> in the textarea with the chosen username.
   */
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

  /**
   * Creates and positions an autocomplete dropdown below the textarea cursor area.
   */
  showDropdown: function (textarea, matches, onSelect) {
    this.removeDropdown();
    if (matches.length === 0) return;

    const dropdown = document.createElement("ul");
    dropdown.id = "dat-mention-dropdown";
    dropdown.style.cssText = `
      position: absolute;
      background: #fff;
      border: 1px solid #ccc;
      border-radius: 3px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
      list-style: none;
      margin: 0;
      padding: 0;
      z-index: 9999;
      max-height: 200px;
      overflow-y: auto;
      min-width: 150px;
    `;

    matches.forEach((username) => {
      const item = document.createElement("li");
      item.textContent = `@${username}`;
      item.style.cssText = `
        padding: 4px 10px;
        cursor: pointer;
        font-size: 13px;
        white-space: nowrap;
      `;
      item.addEventListener("mouseenter", () => {
        item.style.background = "#0679c8";
        item.style.color = "#fff";
      });
      item.addEventListener("mouseleave", () => {
        item.style.background = "";
        item.style.color = "";
      });
      item.addEventListener("mousedown", (e) => {
        e.preventDefault(); // Prevent textarea blur before selection
        onSelect(username);
      });
      dropdown.appendChild(item);
    });

    // Position below the textarea (simple approach)
    const rect = textarea.getBoundingClientRect();
    dropdown.style.top = `${window.scrollY + rect.bottom}px`;
    dropdown.style.left = `${window.scrollX + rect.left}px`;

    document.body.appendChild(dropdown);
  },

  removeDropdown: function () {
    const existing = document.getElementById("dat-mention-dropdown");
    if (existing) existing.remove();
  },

  /**
   * Handles paste events: converts pasted Drupal issue URLs to [#ISSUE_NUMBER].
   * e.g. https://www.drupal.org/project/canvas/issues/3554197 → [#3554197]
   */
  handlePaste: function (textarea, e) {
    const pasted = e.clipboardData.getData("text");
    const drupalIssueUrlPattern = /https?:\/\/www\.drupal\.org\/(?:project\/[^/]+\/issues|node|i)\/(\d+)[^\s]*/g;
    const replaced = pasted.replace(drupalIssueUrlPattern, (match, issueId) => `[#${issueId}]`);
    if (replaced === pasted) return; // nothing to do

    e.preventDefault();
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = textarea.value.slice(0, start);
    const after = textarea.value.slice(end);
    textarea.value = before + replaced + after;
    const newPos = start + replaced.length;
    textarea.setSelectionRange(newPos, newPos);
  },

  /**
   * Attaches autocomplete behaviour to a single textarea element.
   */
  attachToTextarea: function (textarea, allUsernames, commentMap) {
    textarea.addEventListener("paste", (e) => {
      this.handlePaste(textarea, e);
    });

    textarea.addEventListener("input", () => {
      // Expand #N comment references first
      this.expandCommentLinks(textarea, commentMap);

      const prefix = this.getCurrentMentionPrefix(textarea);
      if (prefix === null) {
        this.removeDropdown();
        return;
      }
      const matches = allUsernames.filter((u) =>
        u.toLowerCase().startsWith(prefix.toLowerCase())
      );
      this.showDropdown(textarea, matches, (username) => {
        this.applyMention(textarea, username);
        this.removeDropdown();
      });
    });

    textarea.addEventListener("blur", () => {
      // Small delay so mousedown on dropdown item fires first
      setTimeout(() => this.removeDropdown(), 150);
    });

    textarea.addEventListener("keydown", (e) => {
      const dropdown = document.getElementById("dat-mention-dropdown");
      if (!dropdown) return;
      const items = Array.from(dropdown.querySelectorAll("li"));
      const active = dropdown.querySelector("li.dat-active");
      let idx = active ? items.indexOf(active) : -1;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (active) active.classList.remove("dat-active");
        idx = (idx + 1) % items.length;
        items[idx].classList.add("dat-active");
        items[idx].style.background = "#0679c8";
        items[idx].style.color = "#fff";
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (active) active.classList.remove("dat-active");
        idx = (idx - 1 + items.length) % items.length;
        items[idx].classList.add("dat-active");
        items[idx].style.background = "#0679c8";
        items[idx].style.color = "#fff";
      } else if (e.key === "Enter" && active) {
        e.preventDefault();
        const username = active.textContent.slice(1); // strip leading @
        this.applyMention(textarea, username);
        this.removeDropdown();
      } else if (e.key === "Escape") {
        this.removeDropdown();
      }
    });
  },

  /**
   * Initializes the textarea enhancement on all textareas on the page.
   */
  init: function () {
    chrome.storage.sync.get({ common_usernames: [] }, (items) => {
      const allUsernames = this.getAllUsernames(items.common_usernames);
      const commentMap = this.getCommentMap();
      document.querySelectorAll("textarea").forEach((textarea) => {
        this.attachToTextarea(textarea, allUsernames, commentMap);
      });
    });
  },
};

export { textareaEnhance };
