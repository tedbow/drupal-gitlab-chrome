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
  src = chrome.runtime.getURL("drupal-bulk-actions.js");
  const { bulkActions } = await import(src);

  src = chrome.runtime.getURL("merge-request-status.js");
  const { mergeRequestStatus } = await import(src);

  chrome.storage.sync.get(utils.settingDefaults, function (items) {
    if (items.projects.length === 0) {
      const info = document.createElement("div");
      info.classList.add("options-help");
      info.innerText =
        "No projects added to chrome extensions options. Add for functionality";
      const issueTable = utils.getIssueTableElement();
      issueTable.parentNode.insertBefore(info, issueTable);
    }
    items.projects.every((project) => {
      if (document.URL.includes(`issues/search/${project}`)) {
        utils.setProject(project);
        if (items.load_pages) {
          multiPage.addPages();
          const checkInterval = setInterval(function () {
            const isMultiplePage = document.getElementsByClassName(
              "multi-page-all-loaded"
            );
            if (isMultiplePage.length > 0) {
              listingToolbar.create();
              window.clearInterval(checkInterval);
              mergeRequestStatus.addColumn();
              bulkActions.createForm();
            }
          }, 500);
        } else {
          listingToolbar.create();
          mergeRequestStatus.addColumn();
          bulkActions.createForm();
        }
        const checkMergeRequestColumnInterval = setInterval(function () {
          if (mergeRequestStatus.isAdded()) {
            window.clearInterval(checkMergeRequestColumnInterval);
            listingToolbar
              .getElement()
              .insertBefore(
                mergeRequestFilter.createElement(),
                document.getElementById("extension-filter")
              );
          }
        }, 500);
        // We have matched project so we can stop iterating.
        return false;
      }
      return true;
    });
  });
})();
