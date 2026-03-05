/**
 * Plugin: #N comment link expansion
 *
 * When the user types #11 (followed by a non-digit character), it is replaced
 * with <a href="#comment-XXXXXXX">#11</a> linking to that comment on the page.
 */
const commentLinkPlugin = {
  /**
   * Builds a map of sequential comment number → comment anchor ID.
   * e.g. { 1: "comment-16319120", 11: "comment-16492411" }
   */
  buildCommentMap: function () {
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

  expand: function (textarea, commentMap) {
    const value = textarea.value;
    const pos = textarea.selectionStart;
    // Match existing <a>…</a> blocks first (skip them), then match bare #N.
    const newValue = value.replace(
      /(<a\b[^>]*>[\s\S]*?<\/a>)|#(\d+)(?=\D)/g,
      (match, existingAnchor, num) => {
        if (existingAnchor) return existingAnchor; // preserve already-converted links
        const anchor = commentMap[parseInt(num, 10)];
        return anchor !== undefined ? `<a href="#${anchor}">#${num}</a>` : match;
      }
    );
    if (newValue !== value) {
      textarea.value = newValue;
      const delta = newValue.length - value.length;
      textarea.setSelectionRange(pos + delta, pos + delta);
    }
  },

  attach: function (textarea, context) {
    const { commentMap } = context;
    textarea.addEventListener("input", () => {
      this.expand(textarea, commentMap);
    });
  },
};

export { commentLinkPlugin };
