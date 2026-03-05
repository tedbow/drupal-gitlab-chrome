/**
 * Plugin: @mention autocomplete
 *
 * Provides username autocomplete when the user types @ in a textarea.
 * Sources: usernames scraped from /u/ links on the page + configured common_usernames.
 */
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

  removeDropdown: function () {
    const existing = document.getElementById("dat-mention-dropdown");
    if (existing) existing.remove();
  },

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
        e.preventDefault();
        onSelect(username);
      });
      dropdown.appendChild(item);
    });

    const rect = textarea.getBoundingClientRect();
    dropdown.style.top = `${window.scrollY + rect.bottom}px`;
    dropdown.style.left = `${window.scrollX + rect.left}px`;
    document.body.appendChild(dropdown);
  },

  attach: function (textarea, context) {
    const { allUsernames } = context;

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
        const username = active.textContent.slice(1);
        this.applyMention(textarea, username);
        this.removeDropdown();
      } else if (e.key === "Escape") {
        this.removeDropdown();
      }
    });
  },
};

export { mentionPlugin };
