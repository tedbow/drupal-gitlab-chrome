(async () => {
  let src = chrome.runtime.getURL("drupal-issue-tags.js");
  const { issueTags } = await import(src);
  src = chrome.runtime.getURL("drupal-bulk-actions.js");
  const { bulkActions } = await import(src);
  src = chrome.runtime.getURL("drupal-merge-tests.js");
  const { mergeTests } = await import(src);
  issueTags.addButtons();
  bulkActions.doBulkAction();
  mergeTests.stopMerge();
})();
