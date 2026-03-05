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
   * Attaches autocomplete behaviour to a single textarea element.
   */
  attachToTextarea: function (textarea, allUsernames) {
    textarea.addEventListener("input", () => {
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
      document.querySelectorAll("textarea").forEach((textarea) => {
        this.attachToTextarea(textarea, allUsernames);
      });
    });
  },
};

export { textareaEnhance };
