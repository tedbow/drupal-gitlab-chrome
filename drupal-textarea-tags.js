/**
 * Plugin: HTML tag autocomplete
 *
 * When the user types < followed by letters in a textarea, shows a dropdown
 * of matching allowed HTML tags sourced from the BUEditor toolbar config
 * embedded in Drupal.settings. Selecting a tag wraps any selected text or
 * inserts <tag></tag> with the cursor positioned between the tags.
 *
 * Tags are derived from Drupal.settings.BUE toolbar button patterns so they
 * stay in sync with what the text format actually allows.
 */
const tagsPlugin = {
  FALLBACK_TAGS: ["blockquote", "code", "del", "em", "h2", "h3", "h4", "strong"],

  /**
   * Extracts allowed tag names from the BUEditor settings on the page.
   * Falls back to a hardcoded list if the settings aren't available.
   */
  getTagsFromPage: function () {
    try {
      const bue = window.Drupal && Drupal.settings && Drupal.settings.BUE;
      if (!bue) return this.FALLBACK_TAGS;
      const tags = new Set();
      Object.values(bue.templates || {}).forEach((template) => {
        (template.buttons || []).forEach((button) => {
          const content = button[1] || "";
          // Extract tag names from patterns like <strong>%TEXT%</strong>
          const matches = content.matchAll(/<([a-z][a-z0-9]*)[\s>]/gi);
          for (const m of matches) {
            tags.add(m[1].toLowerCase());
          }
        });
      });
      return tags.size > 0 ? Array.from(tags).sort() : this.FALLBACK_TAGS;
    } catch (e) {
      return this.FALLBACK_TAGS;
    }
  },

  /**
   * Returns the partial tag being typed at the cursor, e.g. "str" from "<str".
   * Returns null if the cursor is not in a < context.
   */
  getCurrentTagPrefix: function (textarea) {
    const value = textarea.value;
    const pos = textarea.selectionStart;
    const textBefore = value.slice(0, pos);
    const match = textBefore.match(/<([a-z]*)$/i);
    return match ? match[1].toLowerCase() : null;
  },

  /**
   * Inserts <tag></tag> replacing the partial <tagprefix, placing the cursor
   * between the opening and closing tags. If text is selected, wraps it.
   */
  applyTag: function (textarea, tag) {
    const value = textarea.value;
    const selStart = textarea.selectionStart;
    const selEnd = textarea.selectionEnd;

    // Find where the opening < is (just before cursor)
    const textBefore = value.slice(0, selStart);
    const openBracketPos = textBefore.lastIndexOf("<");

    const selectedText = value.slice(selStart, selEnd);
    const before = value.slice(0, openBracketPos);
    const after = value.slice(selEnd);
    const inserted = `<${tag}>${selectedText}</${tag}>`;

    textarea.value = before + inserted + after;

    // Place cursor between opening and closing tag (after selected text)
    const cursorPos = openBracketPos + `<${tag}>`.length + selectedText.length;
    textarea.setSelectionRange(cursorPos, cursorPos);
    textarea.focus();
  },

  removeDropdown: function () {
    const existing = document.getElementById("dat-tags-dropdown");
    if (existing) existing.remove();
  },

  showDropdown: function (textarea, matches, onSelect) {
    this.removeDropdown();
    if (matches.length === 0) return;

    const dropdown = document.createElement("ul");
    dropdown.id = "dat-tags-dropdown";
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
      min-width: 120px;
    `;

    matches.forEach((tag) => {
      const item = document.createElement("li");
      item.textContent = `<${tag}>`;
      item.style.cssText = `
        padding: 4px 10px;
        cursor: pointer;
        font-size: 13px;
        font-family: monospace;
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
        onSelect(tag);
      });
      dropdown.appendChild(item);
    });

    const rect = textarea.getBoundingClientRect();
    dropdown.style.top = `${window.scrollY + rect.bottom}px`;
    dropdown.style.left = `${window.scrollX + rect.left}px`;
    document.body.appendChild(dropdown);
  },

  attach: function (textarea, context) {
    const { allowedTags } = context;

    textarea.addEventListener("input", () => {
      const prefix = this.getCurrentTagPrefix(textarea);
      if (prefix === null) {
        this.removeDropdown();
        return;
      }
      const matches = allowedTags.filter((t) => t.startsWith(prefix));
      this.showDropdown(textarea, matches, (tag) => {
        this.applyTag(textarea, tag);
        this.removeDropdown();
      });
    });

    textarea.addEventListener("blur", () => {
      setTimeout(() => this.removeDropdown(), 150);
    });

    textarea.addEventListener("keydown", (e) => {
      const dropdown = document.getElementById("dat-tags-dropdown");
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
        // Strip leading < and trailing > from display text to get tag name
        const tag = active.textContent.replace(/[<>]/g, "");
        this.applyTag(textarea, tag);
        this.removeDropdown();
      } else if (e.key === "Escape") {
        this.removeDropdown();
      }
    });
  },
};

export { tagsPlugin };
