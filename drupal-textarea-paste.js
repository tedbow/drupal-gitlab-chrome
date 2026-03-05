/**
 * Plugin: Drupal issue URL → [#ISSUE_NUMBER] on paste
 *
 * When a Drupal.org issue URL is pasted into a textarea it is converted to
 * the [#ISSUE_NUMBER] shorthand format. If the issue is not already listed
 * in the "Related issues links" field, the user is offered the option to
 * add it there.
 */
const pastePlugin = {
  DRUPAL_ISSUE_URL:
    /https?:\/\/www\.drupal\.org\/(?:project\/[^/]+\/issues|node|i)\/(\d+)[^\s]*/g,

  /**
   * Returns all current values from the Related Issues Links URL inputs.
   */
  getRelatedLinkInputs: function () {
    return Array.from(
      document.querySelectorAll(
        '#edit-field-issue-related-links input[id*="-url"], ' +
          '#field-issue-related-links-add-more-wrapper input[id*="-url"], ' +
          'input[id^="edit-field-issue-related-links-und-"][id*="-url"]'
      )
    );
  },

  /**
   * Returns true if the given issue ID already appears in any related link.
   */
  isInRelatedLinks: function (issueId) {
    return this.getRelatedLinkInputs().some((input) =>
      input.value.includes(issueId)
    );
  },

  /**
   * Sets the value of the first empty related link URL input to the given URL.
   * Returns true if successful.
   */
  setEmptyRelatedLink: function (url) {
    const empty = this.getRelatedLinkInputs().find(
      (input) => input.value.trim() === ""
    );
    if (empty) {
      empty.value = url;
      empty.dispatchEvent(new Event("input", { bubbles: true }));
      empty.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    }
    return false;
  },

  /**
   * Clicks "Add another item", polls until a new URL input appears, then sets it.
   */
  addViaButton: function (url) {
    const btn = document.getElementById(
      "edit-field-issue-related-links-und-add-more"
    );
    if (!btn) return;

    const before = this.getRelatedLinkInputs().length;

    chrome.runtime.sendMessage({
      call: "triggerClick",
      elementId: "edit-field-issue-related-links-und-add-more",
    });

    // Poll until count increases (Drupal AJAX replaces the wrapper div, so
    // MutationObserver on the wrapper misses the replacement; polling the whole
    // document is more reliable).
    let attempts = 0;
    const poll = setInterval(() => {
      attempts++;
      const inputs = this.getRelatedLinkInputs();
      if (inputs.length > before) {
        clearInterval(poll);
        const newest = inputs[inputs.length - 1];
        if (newest.value.trim() === "") {
          newest.value = url;
          newest.dispatchEvent(new Event("input", { bubbles: true }));
          newest.dispatchEvent(new Event("change", { bubbles: true }));
          newest.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      } else if (attempts > 30) {
        clearInterval(poll);
      }
    }, 300);
  },

  /**
   * Offers to add url (with issueId) to the Related Issues links field.
   */
  offerRelatedLink: function (issueId, originalUrl) {
    if (this.isInRelatedLinks(issueId)) return;
    if (!window.confirm(`Add issue #${issueId} to "Related issues links"?`))
      return;

    if (!this.setEmptyRelatedLink(originalUrl)) {
      this.addViaButton(originalUrl);
    }
  },

  attach: function (textarea) {
    textarea.addEventListener("paste", (e) => {
      const pasted = e.clipboardData.getData("text");
      const replacements = [];

      const replaced = pasted.replace(
        new RegExp(this.DRUPAL_ISSUE_URL.source, "g"),
        (match, issueId) => {
          replacements.push({ issueId, originalUrl: match });
          return `[#${issueId}]`;
        }
      );

      if (replaced === pasted) return;

      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      textarea.value =
        textarea.value.slice(0, start) + replaced + textarea.value.slice(end);
      const newPos = start + replaced.length;
      textarea.setSelectionRange(newPos, newPos);

      // Only offer to add to related links if the field exists on this page
      if (
        document.getElementById(
          "edit-field-issue-related-links-und-add-more"
        ) ||
        this.getRelatedLinkInputs().length > 0
      ) {
        replacements.forEach(({ issueId, originalUrl }) => {
          this.offerRelatedLink(issueId, originalUrl);
        });
      }
    });
  },
};

export { pastePlugin };
