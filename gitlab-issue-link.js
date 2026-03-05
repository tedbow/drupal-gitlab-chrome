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
      const link = document.createElement('a');
      link.href = `https://www.drupal.org/project/canvas/issues/${issueId}`;
      link.textContent = `Drupal.org: ${title}`;
      link.target = '_blank';
      link.style.display = 'block';
      link.style.fontWeight = 'bold';
      link.style.marginBottom = '10px';
      // Insert at the top of the page (before the MR title)
      const mrTitle = document.querySelector('.detail-page-header .titlefff');
      if (mrTitle && mrTitle.parentNode) {
        mrTitle.parentNode.insertBefore(link, mrTitle);
      } else {
        document.body.insertBefore(link, document.body.firstChild);
      }
    });
})();
