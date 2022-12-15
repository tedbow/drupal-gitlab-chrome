const drupalConfig = {
  statusField: {
    ACTIVE: "1",
    FIXED: "2",
    CLOSED_DUPLICATE: "3",
    POSTPONED: "4",
    CLOSED_WONT_FIX: "5",
    CLOSED_WORKS_AS_DESIGNED: "6",
    CLOSED_FIXED: "7",
    NEEDS_REVIEW: "8",
    NEEDS_WORK: "13",
    RTBC: "14",
    PATCH_TO_BE_PORTED: "15",
    POSTPONED_MAINTAINER_NEEDS_MO_INFO: "16",
    CLOSED_OUTDATED: "17",
    CLOSED_CANNOT_REPRODUCE: "18",
  },
};
const utils = {
  settingDefaults: {
    projects: [],
    load_pages: false,
    auto_tags: ["Needs tests", "Needs issue summary update", "Accessibility"],
  },

  getIssueListViewElement: function () {
    return document.querySelector(
      ".view-project-issue-search-project-searchapi"
    );
  },
  getIssueIdFromUrl: function (url) {
    let parts = url.split("/");
    let lastPart = parts[parts.length - 1];
    parts = lastPart.split("#");
    parts = parts[0].split("?");
    return parts[0];
  },
  getStatusForId: (id) => {
    return Object.keys(drupalConfig.statusField).find(
      (key) => drupalConfig.statusField[key] === id
    );
  },
  getIssueTableElement: function () {
    return this.getIssueListViewElement().querySelector("table.project-issue");
  },
  getNidForRow: function (rowElement) {
    const issueLink = rowElement.querySelector(".views-field-title a");
    return utils.getIssueIdFromUrl(issueLink.getAttribute("href"));
  },
  gotoNode: function (nid, queryString) {
    let url = `https://www.drupal.org/i/${nid}`;
    if (queryString !== undefined) {
      url += `?${queryString}`;
    }
    window.location.href = url;
  },
  setProject: function (project) {
    this.getIssueListViewElement().setAttribute("current_project", project);
  },
  getProject: function () {
    return this.getIssueListViewElement().getAttribute("current_project");
  },
  sleep: function (ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },
  removeArrayItem: function (theArray, theItem) {
    const index = theArray.indexOf(theItem);
    if (index > -1) {
      // only splice array when item is found
      theArray.splice(index, 1); // 2nd parameter means remove one item only
    }
    return theArray;
  },
};
export { utils };
