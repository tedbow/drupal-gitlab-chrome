/**
 * Shared utilities for textarea enhancement plugins.
 */
const textareaUtils = {
  /**
   * Creates a styled dropdown <ul> and appends it to the document body.
   * Automatically positions above or below the textarea based on available
   * viewport space, so it is never clipped off-screen.
   *
   * @param {HTMLElement} textarea
   * @param {string[]} labels - Display text for each item.
   * @param {Function} onSelect - Called with the item's index when selected.
   * @param {string} id - Element ID for the dropdown (must be unique per plugin).
   * @returns {HTMLElement} The dropdown element.
   */
  showDropdown: function (textarea, labels, onSelect, id) {
    this.removeDropdown(id);
    if (labels.length === 0) return null;

    const dropdown = document.createElement("ul");
    dropdown.id = id;
    dropdown.style.cssText = `
      position: absolute;
      background: #fff;
      border: 1px solid #ccc;
      border-radius: 3px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
      list-style: none;
      margin: 0;
      padding: 0;
      z-index: 10001;
      max-height: 200px;
      overflow-y: auto;
      min-width: 150px;
    `;

    labels.forEach((label, i) => {
      const item = document.createElement("li");
      item.textContent = label;
      item.dataset.idx = i;
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
        onSelect(i);
      });
      dropdown.appendChild(item);
    });

    document.body.appendChild(dropdown);
    this.positionDropdown(dropdown, textarea);
    return dropdown;
  },

  /**
   * Positions the dropdown above or below the textarea depending on space.
   */
  positionDropdown: function (dropdown, textarea) {
    const rect = textarea.getBoundingClientRect();
    const dropH = Math.min(200, dropdown.children.length * 28);
    const spaceBelow = window.innerHeight - rect.bottom;
    const left = Math.min(
      window.scrollX + rect.left,
      window.scrollX + window.innerWidth - dropdown.offsetWidth - 8
    );

    if (spaceBelow < dropH + 8 && rect.top > dropH) {
      // Not enough room below — show above
      dropdown.style.top = `${window.scrollY + rect.top - dropH}px`;
    } else {
      dropdown.style.top = `${window.scrollY + rect.bottom}px`;
    }
    dropdown.style.left = `${Math.max(0, left)}px`;
  },

  removeDropdown: function (id) {
    const existing = document.getElementById(id);
    if (existing) existing.remove();
  },

  /**
   * Attaches standard arrow-key / Enter / Escape keyboard navigation to a
   * textarea for the dropdown with the given id.
   *
   * @param {HTMLElement} textarea
   * @param {string} dropdownId
   * @param {Function} onConfirm - Called with the selected item's index.
   */
  attachKeyNav: function (textarea, dropdownId, onConfirm) {
    textarea.addEventListener("keydown", (e) => {
      const dropdown = document.getElementById(dropdownId);
      if (!dropdown) return;
      const items = Array.from(dropdown.querySelectorAll("li"));
      const active = dropdown.querySelector("li.dat-active");
      let idx = active ? parseInt(active.dataset.idx, 10) : -1;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (active) {
          active.classList.remove("dat-active");
          active.style.background = "";
          active.style.color = "";
        }
        idx = (idx + 1) % items.length;
        items[idx].classList.add("dat-active");
        items[idx].style.background = "#0679c8";
        items[idx].style.color = "#fff";
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (active) {
          active.classList.remove("dat-active");
          active.style.background = "";
          active.style.color = "";
        }
        idx = (idx - 1 + items.length) % items.length;
        items[idx].classList.add("dat-active");
        items[idx].style.background = "#0679c8";
        items[idx].style.color = "#fff";
      } else if (e.key === "Enter" && active) {
        e.preventDefault();
        onConfirm(parseInt(active.dataset.idx, 10));
      } else if (e.key === "Escape") {
        this.removeDropdown(dropdownId);
      }
    });
  },
};

export { textareaUtils };
