// Adds a link to the related Drupal.org issue (with title) at the top of GitLab MR pages
(function addDrupalIssueLink() {
  let src = chrome.runtime.getURL("common.js");
  function tryAddLink() {
    const issueRef = document.querySelector('a.ref-container[href^="/issue/"]');
    if (!issueRef) return false;
    import(src).then(({ utils }) => {
      const match = issueRef.getAttribute("href").match(/\/issue\/[^-]+-(\d+)/);
      if (!match) return;
      const issueId = match[1];
      fetch(`https://www.drupal.org/api-d7/node/${issueId}.json`)
        .then((response) => response.json())
        .then((data) => {
          const title =
            data && data.title
              ? data.title.trim().replace(/\s+/g, " ")
              : `Drupal.org issue #${issueId}`;
          const status = utils.getStatusForId(data.field_issue_status);
          const infoDiv = document.createElement("div");
          infoDiv.style.display = "block";
          infoDiv.style.fontWeight = "bold";
          infoDiv.style.marginBottom = "10px";
          const link = document.createElement("a");
          link.href = `https://www.drupal.org/project/canvas/issues/${issueId}`;
          link.textContent = `Drupal.org: ${title}`;
          link.style.marginRight = "10px";
          infoDiv.appendChild(link);
          const statusSpan = document.createElement("span");
          statusSpan.textContent = `Status: ${status}`;
          statusSpan.style.marginRight = "10px";
          infoDiv.appendChild(statusSpan);
          const assigneeSpan = document.createElement("span");
          assigneeSpan.textContent = "Assigned to: ";
          infoDiv.appendChild(assigneeSpan);
          let assigneeUri = null;
          if (data.field_issue_assigned && data.field_issue_assigned.uri) {
            assigneeUri = `${data.field_issue_assigned.uri}.json`;
          }
          if (assigneeUri) {
            fetch(assigneeUri)
              .then((response) => response.json())
              .then((userData) => {
                const name = userData.name ? userData.name : "Unknown";
                assigneeSpan.textContent += name;
              })
              .catch(() => {
                assigneeSpan.textContent += "Unknown";
              });
          } else {
            assigneeSpan.textContent += "Unassigned";
          }
          document.body.insertBefore(infoDiv, document.body.firstChild);
        });
    });
    return true;
  }
  if (tryAddLink()) return;
  const observer = new MutationObserver(() => {
    if (tryAddLink()) observer.disconnect();
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
