let src = chrome.runtime.getURL("drupal-user-count.js");
const { userCount } = await import(src);
src = chrome.runtime.getURL("dynamic-filter-script.js");
const { titleFilter } = await import(src);
src = chrome.runtime.getURL("drupal-status-count.js");
const { statusCount } = await import(src);

/**
 * Provides a custom toolbar on the listing page.
 *
 * @type {{elementId: string, create: listingToolbar.create, removeExisting: listingToolbar.removeExisting}}
 */
const listingToolbar = {
  elementId: "custom-toolbar",
  create: function () {
    this.removeExisting();
    const customToolbar = document.createElement("div");
    customToolbar.id = this.elementId;
    const issueTable = document.querySelector("table.project-issue");

    // Add the individual elements to the toolbar.
    customToolbar.appendChild(userCount.createElement());
    customToolbar.appendChild(statusCount.createElement());
    customToolbar.appendChild(titleFilter.createElement());
    issueTable.parentNode.insertBefore(customToolbar, issueTable);
  },

  removeExisting: function () {
    const existingToolbar = document.getElementById(this.elementId);
    if (existingToolbar) {
      existingToolbar.remove();
    }
  },
};
export { listingToolbar };
