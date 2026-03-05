import { mentionPlugin } from "./drupal-textarea-mention.js";
import { commentLinkPlugin } from "./drupal-textarea-comment-link.js";
import { pastePlugin } from "./drupal-textarea-paste.js";

/**
 * Coordinator for textarea enhancements on Drupal.org issue pages.
 *
 * To add a new enhancement, create a plugin file that exports an object with:
 *   attach(textarea, context) — called once per textarea on the page.
 *
 * The context object contains shared page data:
 *   - allUsernames: string[] — combined page + configured usernames
 *   - commentMap: object    — sequential comment number → anchor ID
 *
 * Then register the plugin in the `plugins` array below.
 */
const textareaEnhance = {
  plugins: [mentionPlugin, commentLinkPlugin, pastePlugin],

  buildContext: function (commonUsernames) {
    return {
      allUsernames: mentionPlugin.getAllUsernames(commonUsernames),
      commentMap: commentLinkPlugin.buildCommentMap(),
    };
  },

  init: function () {
    chrome.storage.sync.get({ common_usernames: [] }, (items) => {
      const context = this.buildContext(items.common_usernames);
      document.querySelectorAll("textarea").forEach((textarea) => {
        this.plugins.forEach((plugin) => plugin.attach(textarea, context));
      });
    });
  },
};

export { textareaEnhance };
