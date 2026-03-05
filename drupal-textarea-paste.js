/**
 * Plugin: Drupal issue URL → [#ISSUE_NUMBER] on paste
 *
 * When a Drupal.org issue URL is pasted into a textarea it is converted to
 * the [#ISSUE_NUMBER] shorthand format used in Drupal issue comments.
 * e.g. https://www.drupal.org/project/canvas/issues/3554197 → [#3554197]
 */
const pastePlugin = {
  DRUPAL_ISSUE_URL: /https?:\/\/www\.drupal\.org\/(?:project\/[^/]+\/issues|node|i)\/(\d+)[^\s]*/g,

  attach: function (textarea) {
    textarea.addEventListener("paste", (e) => {
      const pasted = e.clipboardData.getData("text");
      const replaced = pasted.replace(this.DRUPAL_ISSUE_URL, (match, issueId) => `[#${issueId}]`);
      if (replaced === pasted) return;

      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      textarea.value =
        textarea.value.slice(0, start) + replaced + textarea.value.slice(end);
      const newPos = start + replaced.length;
      textarea.setSelectionRange(newPos, newPos);
    });
  },
};

export { pastePlugin };
