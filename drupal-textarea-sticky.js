// Load Sticksy library
const loadSticksy = new Promise((resolve) => {
  if (window.Sticksy) {
    resolve();
    return;
  }
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("sticksy.min.js");
  script.onload = () => {
    resolve();
  };
  document.head.appendChild(script);
});

/**
 * Plugin: Sticky textarea
 *
 * Adds a 📌 toggle button above each textarea. When activated, uses Sticksy.js
 * to keep the textarea visible while scrolling. Clicking again restores the original position.
 */
const stickyPlugin = {
  attach: function (textarea) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = "📌 Sticky";
    btn.title = "Stick textarea to viewport while scrolling";
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

    // Wrap textarea in a container that Sticksy can work with
    const container = document.createElement("div");
    container.style.cssText =
      "position: relative; display: block; width: 100%;";
    textarea.parentNode.insertBefore(container, textarea);
    container.appendChild(textarea);
    container.appendChild(btn);

    let isSticky = false;
    let stickysyInstance = null;

    btn.addEventListener("click", async () => {
      await loadSticksy;

      if (!isSticky) {
        // Activate sticky positioning
        stickysyInstance = new window.Sticksy(textarea, {
          topSpacing: 0,
        });

        btn.textContent = "📌 Unstick";
        btn.style.background = "#d6eaf8";
        btn.style.color = "#0679c8";
        btn.style.borderColor = "#0679c8";
        btn.title = "Restore textarea to original position";

        textarea.style.boxShadow = "0 -3px 10px rgba(0,0,0,0.25)";
        textarea.style.borderTop = "3px solid #0679c8";

        textarea.focus();
      } else {
        // Deactivate sticky positioning
        if (stickysyInstance) {
          stickysyInstance.disable();
          stickysyInstance = null;
        }

        textarea.style.boxShadow = "";
        textarea.style.borderTop = "";

        btn.textContent = "📌 Sticky";
        btn.style.background = "#f5f5f5";
        btn.style.color = "#333";
        btn.style.borderColor = "#ccc";
        btn.title = "Stick textarea to viewport while scrolling";
      }
      isSticky = !isSticky;
    });
  },
};

export { stickyPlugin };
