/**
 * Runs in the PAGE context (not the extension isolated world).
 * Reads the button ID from the script tag's data-target attribute and
 * triggers a jQuery click so Drupal's AJAX handlers fire.
 */
(function () {
  var script = document.currentScript;
  var targetId = script && script.getAttribute("data-target");
  if (!targetId) return;
  var btn = document.getElementById(targetId);
  if (!btn) return;
  if (typeof jQuery !== "undefined") {
    jQuery(btn).trigger("click");
  } else {
    btn.click();
  }
})();
