// Plugin: Convert pasted Drupal.org issue URLs to Markdown links with issue title on GitLab MR pages
// Listens for paste events in textareas and replaces Drupal.org issue URLs with [Issue Title](URL)

const DRUPAL_ISSUE_URL =
  /https?:\/\/www\.drupal\.org\/(?:project\/[^/]+\/issues|node|i)\/(\d+)[^\s]*/g;

function fetchIssueTitle(issueId) {
  return fetch(`https://www.drupal.org/api-d7/node/${issueId}.json`)
    .then((response) => response.json())
    .then((data) => (data && data.title) || null)
    .catch(() => null);
}

function handlePaste(e) {
  const pasted = e.clipboardData.getData("text");
  const matches = [...pasted.matchAll(DRUPAL_ISSUE_URL)];
  if (matches.length === 0) return;
  e.preventDefault();
  const textarea = e.target;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  let replaced = pasted;
  let pending = matches.length;
  matches.forEach(async ([match, issueId]) => {
    const title = await fetchIssueTitle(issueId);
    const cleanTitle = title ? title.trim().replace(/\s+/g, " ") : "";
    const md = title ? `[${cleanTitle}](${match})` : match;
    replaced = replaced.replace(match, md);
    pending--;
    if (pending === 0) {
      textarea.value =
        textarea.value.slice(0, start) + replaced + textarea.value.slice(end);
      const newPos = start + replaced.length;
      textarea.setSelectionRange(newPos, newPos);
    }
  });
}

function attachToAllTextareas() {
  document.querySelectorAll("textarea").forEach((ta) => {
    if (!ta._drupalPasteAttached) {
      ta.addEventListener("paste", handlePaste);
      ta._drupalPasteAttached = true;
    }
  });
}

// Attach on load and on DOM changes (for dynamically loaded textareas)
attachToAllTextareas();
const observer = new MutationObserver(attachToAllTextareas);
observer.observe(document.body, { childList: true, subtree: true });
