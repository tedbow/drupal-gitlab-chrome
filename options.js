// Copied from https://developer.chrome.com/docs/extensions/mv3/options/
// Saves options to chrome.storage

function save_options() {
  const projects = document
    .getElementById("projects")
    .value.split(/\n/)
    .map((line) => line.trim())
    .filter((n) => n);
  const auto_tags = document
      .getElementById("auto_tags")
      .value.split(/\n/)
      .map((line) => line.trim())
      .filter((n) => n);
  const load_pages = document.getElementById("load_pages").checked;

  chrome.storage.sync.set(
    {
      projects: projects,
      load_pages: load_pages,
      auto_tags: auto_tags
    },
    function () {
      // Reset from storage to remove empty lines, if any.
      restore_options();
      // Update status to let user know options were saved.
      const status = document.getElementById("status");
      status.textContent = "Options saved";
      setTimeout(function () {
        status.textContent = "";
      }, 1500);
    }
  );
}
// Restores form values from the preferences stored in chrome.storage.
function restore_options() {
  chrome.storage.sync.get(
    {
      projects: [],
      load_pages: false,
      auto_tags: [],
    },
    function (items) {
      if (items.auto_tags.length === 0) {
        items.auto_tags = [
          'Needs tests',
          'Needs issue summary update',
          'Accessibility',
        ];
      }
      document.getElementById("projects").value = items.projects.join("\n");
      document.getElementById("auto_tags").value = items.auto_tags.join("\n");
      document.getElementById("load_pages").checked = items.load_pages;
    }
  );
}
document.addEventListener("DOMContentLoaded", restore_options);
document.getElementById("save").addEventListener("click", save_options);
