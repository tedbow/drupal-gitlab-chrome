import { utils } from "./common.js";
import { issueUtils } from "./issue-node-common.js";

const issueTags = {
  addButtons: function () {
    function createIdForTag(tag) {
      return ("tag-button-" + tag.replace(/\W/g, "-")).toLowerCase();
    }
    function getElementForTag(tag) {
      return document.getElementById(createIdForTag(tag));
    }
    chrome.storage.sync.get(utils.settingDefaults, function (items) {
      const issueTagsDiv = document.createElement("div");
      issueTagsDiv.className = "issueTagsDiv";
      const commonIssueTags = items.auto_tags;
      commonIssueTags.forEach((tag) => {
        const tagDiv = document.createElement("button");
        tagDiv.className = "tagDiv";
        tagDiv.innerText = `${tag}`;
        tagDiv.id = createIdForTag(tag);
        if (issueUtils.hasTag(tag)) {
          tagDiv.setAttribute("disabled", "disabled");
        }
        issueTagsDiv.append(tagDiv);
      });
      const issueTagsInputField = issueUtils.getTagInput();
      issueTagsInputField.parentNode.append(issueTagsInputField, issueTagsDiv);

      commonIssueTags.forEach((tag) => {
        getElementForTag(tag).addEventListener("click", function () {
          issueUtils.addTag(tag);
          getElementForTag(tag).setAttribute("disabled", "disabled");
        });
      });

      issueTagsInputField.addEventListener("input", function (event) {
        const existingTags = issueUtils.getExistingTags();
        commonIssueTags.forEach((tag) => {
          if (!existingTags.includes(`${tag}`)) {
            getElementForTag(tag).removeAttribute("disabled");
          }
        });
      });
    });
  },
};
export { issueTags };
