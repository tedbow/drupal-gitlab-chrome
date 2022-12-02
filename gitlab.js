(async () => {
  let src = chrome.runtime.getURL("common.js");
  const { utils } = await import(src);

  function waitForElm(selector) {
    return new Promise((resolve) => {
      if (document.querySelector(selector)) {
        return resolve(document.querySelector(selector));
      }

      const observer = new MutationObserver((mutations) => {
        if (document.querySelector(selector)) {
          resolve(document.querySelector(selector));
          observer.disconnect();
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    });
  }

  waitForElm(".js-discussion-container").then(() => {
    const allLinks = document.querySelectorAll(".note-text a");
    for (const anchorElement of allLinks) {
      const hrefAtt = anchorElement.getAttribute("href");
      const anchorText = anchorElement.innerHTML;
      const issueId = utils.getIssueIdFromUrl(hrefAtt);
      // Replace only if Drupal issue links.
      if (
        hrefAtt.includes("https://www.drupal.org/project/") &&
        !isNaN(issueId) &&
        hrefAtt === anchorText
      ) {
        fetch(`https://www.drupal.org/api-d7/node/` + issueId + `.json`)
          .then((response) => response.json())
          .then((data) => {
            if (Object.keys(data).length !== 0) {
              const issueStatus = utils.getStatusForId(data.field_issue_status);
              anchorElement.text = "#" + issueId + ": " + data.title;
              anchorElement.setAttribute("title", "Status: " + issueStatus);
              anchorElement.classList.add(
                "project-issue-status-" + data.field_issue_status
              );
            }
          });
      }
    }
  });
})();
