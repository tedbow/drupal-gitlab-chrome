/**
 * Plugin: Sticky textarea
 *
 * Adds a 📌 toggle button above each textarea. When activated, the textarea
 * is fixed to the bottom of the viewport so the user can scroll the page
 * while continuing to type. Clicking again restores the original position.
 */
const stickyPlugin = {
  attach: function (textarea) {
    // Find the toolbar above the textarea (BUEditor example: .bue-ui.editor-container)
    let toolbar = null;
    let node = textarea.parentNode;
    while (node && !toolbar) {
      toolbar =
        node.querySelector && node.querySelector(".bue-ui.editor-container");
      node = node.parentNode;
    }
    // If not found, fallback to previous sibling
    if (
      !toolbar &&
      textarea.parentNode.previousElementSibling &&
      textarea.parentNode.previousElementSibling.classList.contains("bue-ui")
    ) {
      toolbar = textarea.parentNode.previousElementSibling;
    }

    // Wrap textarea in a relative container so the button can be positioned
    const wrapper = document.createElement("div");
    wrapper.style.cssText =
      "position: relative; display: inline-block; width: 100%;";
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
      color: #333;
      border: 1px solid #ccc;
      border-radius: 3px;
      z-index: 10000;
      line-height: 1.4;
    `;

    wrapper.appendChild(btn);

    let isSticky = false;
    let savedStyles = {};
    let savedToolbarStyles = {};
    // Placeholder keeps the original space in the document flow
    const placeholder = document.createElement("div");

    btn.addEventListener("click", () => {
      if (!isSticky) {
        this.makeSticky(
          textarea,
          wrapper,
          btn,
          placeholder,
          savedStyles,
          toolbar,
          savedToolbarStyles
        );
      } else {
        this.unstick(
          textarea,
          wrapper,
          btn,
          placeholder,
          savedStyles,
          toolbar,
          savedToolbarStyles
        );
      }
      isSticky = !isSticky;
    });
  },

  makeSticky: function (
    textarea,
    wrapper,
    btn,
    placeholder,
    savedStyles,
    toolbar,
    savedToolbarStyles
  ) {
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
      left: `${textarea.getBoundingClientRect().left}px`,
      width: `${textarea.offsetWidth}px`,
      zIndex: "9998",
      boxShadow: "0 -3px 10px rgba(0,0,0,0.25)",
      borderTop: "3px solid #0679c8",
    });

    if (toolbar) {
      savedToolbarStyles.position = toolbar.style.position;
      savedToolbarStyles.left = toolbar.style.left;
      savedToolbarStyles.width = toolbar.style.width;
      savedToolbarStyles.zIndex = toolbar.style.zIndex;
      savedToolbarStyles.boxShadow = toolbar.style.boxShadow;
      savedToolbarStyles.bottom = toolbar.style.bottom;

      const rect = textarea.getBoundingClientRect();
      const toolbarHeight = toolbar.offsetHeight; // Ensure toolbar is in DOM to get height
      // Place toolbar just above textarea
      Object.assign(toolbar.style, {
        position: "fixed",
        left: `${rect.left}px`,
        width: `${textarea.offsetWidth}px`,
        zIndex: "9999",
        boxShadow: "0 -3px 10px rgba(0,0,0,0.15)",
        top: `${rect.top - toolbarHeight - 8}px`,
        bottom: "auto",
      });
    }

    btn.textContent = "📌 Unstick";
    btn.style.background = "#d6eaf8";
    btn.style.color = "#0679c8";
    btn.style.borderColor = "#0679c8";
    btn.title = "Restore textarea to original position";

    textarea.focus();
  },

  unstick: function (
    textarea,
    wrapper,
    btn,
    placeholder,
    savedStyles,
    toolbar,
    savedToolbarStyles
  ) {
    Object.assign(textarea.style, {
      position: savedStyles.position,
      bottom: savedStyles.bottom,
      left: savedStyles.left,
      width: savedStyles.width,
      zIndex: savedStyles.zIndex,
      boxShadow: savedStyles.boxShadow,
      borderTop: savedStyles.borderTop,
    });

    if (toolbar && savedToolbarStyles) {
      Object.assign(toolbar.style, {
        position: savedToolbarStyles.position,
        bottom: savedToolbarStyles.bottom,
        left: savedToolbarStyles.left,
        width: savedToolbarStyles.width,
        zIndex: savedToolbarStyles.zIndex,
        boxShadow: savedToolbarStyles.boxShadow,
      });
    }

    if (placeholder.parentNode) {
      placeholder.parentNode.removeChild(placeholder);
    }

    btn.textContent = "📌 Sticky";
    btn.style.background = "#f5f5f5";
    btn.style.color = "#333";
    btn.style.borderColor = "#ccc";
    btn.title = "Fix textarea to bottom of screen while scrolling";
  },
};

export { stickyPlugin };
