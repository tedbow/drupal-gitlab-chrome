// Adds a link to the related Drupal.org issue (with title) at the top of GitLab MR pages
(function addDrupalIssueLink() {
  // Find the issue reference link
  const issueRef = document.querySelector('a.ref-container[href^="/issue/"]');
  if (!issueRef) return;
  // Extract the issue number from the href
  const match = issueRef.getAttribute('href').match(/\/issue\/[^-]+-(\d+)/);
  if (!match) return;
  const issueId = match[1];
  // Fetch the issue title from Drupal.org
  fetch(`https://www.drupal.org/api-d7/node/${issueId}.json`)
    .then((response) => response.json())
    .then((data) => {
      const title = (data && data.title) ? data.title.trim().replace(/\s+/g, ' ') : `Drupal.org issue #${issueId}`;
      const status = data.field_issue_status && data.field_issue_status.und && data.field_issue_status.und[0] ? data.field_issue_status.und[0].value : 'Unknown';
      // Build info div
      const infoDiv = document.createElement('div');
      infoDiv.style.display = 'block';
      infoDiv.style.fontWeight = 'bold';
      infoDiv.style.marginBottom = '10px';
      // Link
      const link = document.createElement('a');
      link.href = `https://www.drupal.org/project/canvas/issues/${issueId}`;
      link.textContent = `Drupal.org: ${title}`;
      link.target = '_blank';
      link.style.marginRight = '10px';
      infoDiv.appendChild(link);
      // Status
      const statusSpan = document.createElement('span');
      statusSpan.textContent = `Status: ${status}`;
      statusSpan.style.marginRight = '10px';
      infoDiv.appendChild(statusSpan);
      // Assignee (fetch user info if assigned)
      const assigneeSpan = document.createElement('span');
      assigneeSpan.textContent = 'Assigned to: ';
      infoDiv.appendChild(assigneeSpan);
      let assigneeUri = null;
      if (data.field_issue_assigned && data.field_issue_assigned.uri) {
        assigneeUri = `${data.field_issue_assigned.uri}.json`;
      }
      if (assigneeUri) {
        fetch(assigneeUri)
          .then((response) => response.json())
          .then((userData) => {
            const name = userData.name ? userData.name : 'Unknown';
            assigneeSpan.textContent += name;
          })
          .catch(() => {
            assigneeSpan.textContent += 'Unknown';
          });
      } else {
        assigneeSpan.textContent += 'Unassigned';
      }
      // Insert at the top of the page (before the MR title)
      const mrTitle = document.querySelector('.merge-request-details .title, .merge-request-title');
      if (mrTitle && mrTitle.parentNode) {
        mrTitle.parentNode.insertBefore(infoDiv, mrTitle);
      } else {
        document.body.insertBefore(infoDiv, document.body.firstChild);
      }
    });
})();
