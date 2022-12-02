(async () => {
  let src = chrome.runtime.getURL("common.js");
  const { utils } = await import(src);
  // Import the source files the individual features on this page.
  src = chrome.runtime.getURL("multi-page.js");
  const { multiPage } = await import(src);
  src = chrome.runtime.getURL("toolbar.js");
  const { listingToolbar } = await import(src);
  src = chrome.runtime.getURL("mergeRequestFilter.js");
  const { mergeRequestFilter } = await import(src);

  src = chrome.runtime.getURL("merge-request-status.js");
  const { mergeRequestStatus } = await import(src);

  chrome.storage.sync.get(utils.settingDefaults, function (items) {
    items.projects.every((project) => {
      if (document.URL.includes(`issues/search/${project}`)) {
        if (items.load_pages) {
          multiPage.addPages();
          const checkInterval = setInterval(function () {
            const isMultiplePage = document.getElementsByClassName('multi-page-all-loaded');
            if (
                isMultiplePage.length > 0
            ) {
              listingToolbar.create();
              window.clearInterval(checkInterval);
              mergeRequestStatus.addColumn();
            }
          }, 500);
        } else {
          listingToolbar.create();
          mergeRequestStatus.addColumn();
        }
        const checkMergeRequestColumnInterval = setInterval(function () {
          const isMultiplePage = document.getElementsByClassName('multi-page-all-loaded');
          if (
              mergeRequestStatus.isAdded()
          ) {

            window.clearInterval(checkMergeRequestColumnInterval);
            listingToolbar.getElement().insertBefore(mergeRequestFilter.createElement(), document.getElementById('extension-filter'));
          }
        }, 500);
        return false;
      }
      return true;
    });
  });
})();
