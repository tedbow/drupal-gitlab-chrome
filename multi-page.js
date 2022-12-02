let src = chrome.runtime.getURL("common.js");
const { utils } = await import(src);
src = chrome.runtime.getURL("toolbar.js");
const { listingToolbar } = await import(src);

/**
 * Loads issues from the pagination results.
 *
 * @todo Limit to only queries with 3 pages
 * @todo considering triggering from a link
 *
 * @type {{addPages: multiPage.addPages}}
 */
const multiPage = {
  addPages: function () {
    const viewEl = utils.getIssueListViewElement();
    const pageLinks = viewEl.querySelectorAll(".pager .pager-item a");
    const beforePages = viewEl.querySelector("div.attachment-before");
    if (pageLinks.length > 3) {
      beforePages.textContent +=
        "(auto-loading page not allowed because too many pages)";
      // If we are not going to load more pages then signal that we are done.
      viewEl.classList.add("multi-page-all-loaded");
      return;
    }
    if (pageLinks.length === 0) {
      viewEl.classList.add("multi-page-all-loaded");
      return;
    }
    const table = viewEl.querySelector("tbody");
    const parser = new DOMParser();

    beforePages.textContent = "Loading pages....";
    viewEl.querySelector(".pager").remove();

    let pagesLoadedCnt = 0;
    pageLinks.forEach((link) => {
      const url = "https://www.drupal.org/" + link.getAttribute("href");
      function reqListener() {
        const responseDom = parser.parseFromString(
          this.responseText,
          "text/html"
        );
        const rows = responseDom.querySelectorAll(
          ".view-project-issue-search-project-searchapi tbody tr"
        );
        rows.forEach((row) => {
          table.append(row);
        });
        beforePages.textContent = `Showing all ${
          document.querySelectorAll(
            ".view-project-issue-search-project-searchapi tbody tr"
          ).length
        } items`;
        pagesLoadedCnt++;
        if (pagesLoadedCnt === pageLinks.length) {
          // Add the pages have now been loaded.
          viewEl.classList.add("multi-page-all-loaded");
        }
        listingToolbar.create();
      }
      const req = new XMLHttpRequest();
      req.addEventListener("load", reqListener);
      req.open("GET", url);
      req.send();
    });
  },
};

export { multiPage };
