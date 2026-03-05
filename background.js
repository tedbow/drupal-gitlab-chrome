// background.js
import { utils } from "./common.js";

function fetchJson(url, parser, sendResponse) {
  fetch(url)
    .then((response) => response.text())
    .then((text) => sendResponse({ issues: parser(text) }))
    // @todo handle error.
    .catch((error) => sendResponse({ farewell: error }));
}
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(
    sender.tab
      ? "from a content script:" + sender.tab.url
      : "from the extension"
  );
  if (request.call === "sample_call") {
    console.log("sample_call was called");
    return true; // Will respond asynchronously.
  }
  if (request.call === "triggerClick" && sender.tab) {
    chrome.scripting.executeScript({
      target: { tabId: sender.tab.id },
      world: "MAIN",
      func: (elementId) => {
        const btn = document.getElementById(elementId);
        if (!btn) return;
        // Drupal 7 AJAX binds to mousedown on submit buttons, not click.
        if (typeof jQuery !== "undefined") {
          jQuery(btn).trigger("mousedown").trigger("click");
        } else {
          btn.dispatchEvent(
            new MouseEvent("mousedown", { bubbles: true, cancelable: true })
          );
          btn.click();
        }
      },
      args: [request.elementId],
    });
    return false;
  }
});
