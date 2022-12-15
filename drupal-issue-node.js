
(async () => {
    const src = chrome.runtime.getURL("drupal-issue-tags.js");
    const { issueTags } = await import(src);
    issueTags.addButtons();
})();
