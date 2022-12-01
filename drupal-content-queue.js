(async () => {
  let src = chrome.runtime.getURL("common.js");
  const { utils } = await import(src);
  // Import the source files the individual features on this page.
  src = chrome.runtime.getURL("multi-page.js");
  const { multiPage } = await import(src);
  src = chrome.runtime.getURL("toolbar.js");
  const { listingToolbar } = await import(src);

  src = chrome.runtime.getURL("merge-request-status.js");
  const { mergeRequestStatus } = await import(src);

  chrome.storage.sync.get(
    utils.settingDefaults,
    function (items) {
      console.log(items)
      items.projects.every((project) => {
        if (document.URL.includes(`issues/search/${project}`)) {
          if (items.load_pages) {
            multiPage.addPages();
          }
          mergeRequestStatus.addColumn();
          listingToolbar.create();
          return false;
        }
        return true;
      });
    }
  );
})();
