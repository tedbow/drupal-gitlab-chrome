/**
 * Plugin: Sticky textarea
 *
 * Adds a 📌 toggle button above each textarea. When activated, the textarea
 * is fixed to the bottom of the viewport so the user can scroll the page
 * while continuing to type. Clicking again restores the original position.
 */
const stickyPlugin = {
  attach: function (textarea) {
    // Wrap textarea in a relative container so the button can be positioned
    const wrapper = document.createElement("div");
    wrapper.style.cssText = "position: relative; display: inline-block; width: 100%;";
    textarea.parentNode.insertBefore(wrapper, textarea);
    wrapper.appendChild(textarea);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = "📌 Sticky";
    btn.title = "Fix textarea to bottom of screen while scrolling";
    btn.style.cssText = `
      position: absolute;
      top: -24px;
      right: 0;
      font-size: 11px;
      padding: 2px 6px;
      cursor: pointer;
      background: #f5f5f5;
      border: 1px solid #ccc;
      border-radius: 3px;
      z-index: 10000;
      line-height: 1.4;
    `;

    wrapper.appendChild(btn);

    let isSticky = false;
    let savedStyles = {};
    // Placeholder keeps the original space in the document flow
    const placeholder = document.createElement("div");

    btn.addEventListener("click", () => {
      if (!isSticky) {
        this.makeSticky(textarea, wrapper, btn, placeholder, savedStyles);
      } else {
        this.unstick(textarea, wrapper, btn, placeholder, savedStyles);
      }
      isSticky = !isSticky;
    });
  },

  makeSticky: function (textarea, wrapper, btn, placeholder, savedStyles) {
    const rect = textarea.getBoundingClientRect();

    // Reserve the original space so the page layout doesn't jump
    placeholder.style.cssText = `
      display: block;
      width: ${textarea.offsetWidth}px;
      height: ${textarea.offsetHeight}px;
    `;
    textarea.parentNode.insertBefore(placeholder, textarea);

    // Save inline styles to restore later
    savedStyles.position = textarea.style.position;
    savedStyles.bottom = textarea.style.bottom;
    savedStyles.left = textarea.style.left;
    savedStyles.width = textarea.style.width;
    savedStyles.zIndex = textarea.style.zIndex;
    savedStyles.boxShadow = textarea.style.boxShadow;
    savedStyles.borderTop = textarea.style.borderTop;

    Object.assign(textarea.style, {
      position: "fixed",
      bottom: "0",
      left: "0",
      width: "100%",
      zIndex: "9998",
      boxShadow: "0 -3px 10px rgba(0,0,0,0.25)",
      borderTop: "3px solid #0679c8",
    });

    btn.textContent = "📌 Unstick";
    btn.style.background = "#d6eaf8";
    btn.style.borderColor = "#0679c8";
    btn.title = "Restore textarea to original position";

    textarea.focus();
  },

  unstick: function (textarea, wrapper, btn, placeholder, savedStyles) {
    Object.assign(textarea.style, {
      position: savedStyles.position,
      bottom: savedStyles.bottom,
      left: savedStyles.left,
      width: savedStyles.width,
      zIndex: savedStyles.zIndex,
      boxShadow: savedStyles.boxShadow,
      borderTop: savedStyles.borderTop,
    });

    if (placeholder.parentNode) {
      placeholder.parentNode.removeChild(placeholder);
    }

    btn.textContent = "📌 Sticky";
    btn.style.background = "#f5f5f5";
    btn.style.borderColor = "#ccc";
    btn.title = "Fix textarea to bottom of screen while scrolling";
  },
};

export { stickyPlugin };
