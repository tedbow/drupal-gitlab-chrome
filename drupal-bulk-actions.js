import { utils } from "./common.js";
import { issueUtils } from "./issue-node-common.js";

const bulkActions = {
  createColumn: function () {
    const table = utils.getIssueTableElement();
    const headColumn = document.createElement("th");
    headColumn.innerText = "🛠";
    const headRow = table.querySelector("thead tr");
    headRow.insertBefore(headColumn, headRow.querySelector("th"));
    table.querySelectorAll("tbody tr").forEach((row) => {
      const td = document.createElement("td");
      const input = document.createElement("input");
      const nid = utils.getNidForRow(row);
      input.name = `nid-select-${nid}`;
      input.value = nid;
      input.classList.add("bulk-nid-select");
      input.type = "checkbox";
      td.appendChild(input);
      row.insertBefore(td, row.querySelector("td"));
    });
  },
  createForm: function () {
    chrome.storage.sync.get({ bulk_actions: {} }, function (items) {
      if (items.bulk_actions.hasOwnProperty("finish_msg")) {
        alert(items.bulk_actions.finish_msg);
        chrome.storage.sync.set(
          {
            bulk_actions: {},
          },
          function () {}
        );
      }
    });
    this.createColumn();
    const inputDiv = document.createElement("div");
    const bulkLabel = document.createElement('h3');
    bulkLabel.innerText = "Bulk actions";
    inputDiv.appendChild(bulkLabel);
    const table = utils.getIssueTableElement();
    table.parentNode.append(inputDiv);
    chrome.storage.sync.get(utils.settingDefaults, function (items) {
      const issueTagsDiv = document.createElement("div");
      const tagsDivLabel = document.createElement('h4');
      tagsDivLabel.innerText = "Tags";
      inputDiv.appendChild(tagsDivLabel);
      inputDiv.classList.add('bulk-inputs');
      issueTagsDiv.className = "issueTagsDiv";
      inputDiv.appendChild(issueTagsDiv);
      const commonIssueTags = items.auto_tags;
      commonIssueTags.forEach((tag) => {
        const tagContainer = document.createElement('div');
        tagContainer.classList.add('tag-container');
        issueTagsDiv.appendChild(tagContainer);
        const tagSelect = document.createElement("select");
        tagSelect.name = `bulk-tag-${tag}`;
        tagSelect.id = tagSelect.name;
        tagSelect.setAttribute("bulk_tag", tag);
        tagSelect.classList.add("bulk-tag");
        const tagLabel = document.createElement("label");
        tagLabel.setAttribute("for", tagSelect.id);
        tagLabel.innerHTML = tag;
        tagContainer.appendChild(tagLabel);
        ["no-action", "add", "remove"].forEach((option) => {
          const optionElement = document.createElement("option");
          optionElement.text = option;
          optionElement.value = option;
          tagSelect.appendChild(optionElement);
        });
        tagContainer.appendChild(tagSelect);
      });
    });
    const actionButton = document.createElement("button");
    actionButton.value = "bulk_action";
    actionButton.innerText = "Do it";
    actionButton.onclick = function () {
      const tagActions = {};
      document.querySelectorAll(".bulk-tag").forEach((tagSelect) => {
        if (tagSelect.value === "no-action") {
          return;
        }
        const tag = tagSelect.getAttribute("bulk_tag");
        tagActions[tag] = tagSelect.value;
      });
      const nidCheckBoxes = document.querySelectorAll(".bulk-nid-select");
      const nids = new Set();
      nidCheckBoxes.forEach((checkbox) => {
        if (checkbox.checked) {
          nids.add(checkbox.value);
        }
      });
      console.log(tagActions);
      console.log(nids);
      chrome.storage.sync.set(
        {
          bulk_actions: {
            nids: Array.from(nids.values()),
            tagActions: tagActions,
            return_url: window.location.href,
          },
        },
        function () {
          bulkActions.gotoNextNode();
        }
      );
    };
    table.parentNode.append(actionButton);
  },
  gotoNextNode: function () {
    utils.sleep(1000);
    chrome.storage.sync.get({ bulk_actions: {} }, function (items) {
      if (items.bulk_actions.hasOwnProperty("nids")) {
        utils.gotoNode(items.bulk_actions.nids[0], "bulk_action=1");
      }
    });
  },
  doBulkAction: function () {
    const params = new URLSearchParams(window.location.search);
    chrome.storage.sync.get({ bulk_actions: {} }, function (items) {
      const nid = utils.getIssueIdFromUrl(window.location.href);
      console.log(items.bulk_actions);

      if (!items.bulk_actions.hasOwnProperty("nids")) {
        if (items.bulk_actions.hasOwnProperty("finish_msg")) {
          window.location.href = items.bulk_actions.return_url;
          return;
        }
        return;
      }
      if (!items.bulk_actions.nids.includes(nid)) {
        const statusMessage = document.querySelector(".messages.status");
        if (statusMessage === undefined) {
          alert("Maybe wrong node 🤔");
          return;
        }
        bulkActions.gotoNextNode();
        return;
      }
      if (items.bulk_actions.hasOwnProperty("tagActions")) {
        for (const [tag, action] of Object.entries(
          items.bulk_actions.tagActions
        )) {
          if (action === "add") {
            issueUtils.addTag(tag);
          } else if (action === "remove") {
            issueUtils.removeTag(tag);
          }
        }
      }
      const nids = utils.removeArrayItem(items.bulk_actions.nids, nid);
      let newBulksActions;
      if (nids.length === 0) {
        newBulksActions = {
          finish_msg: "Operations complete🎉",
          return_url: items.bulk_actions.return_url,
        };
      } else {
        items.bulk_actions.nids = nids;
        newBulksActions = items.bulk_actions;
      }
      chrome.storage.sync.set(
        {
          bulk_actions: newBulksActions,
        },
        function () {
          document.getElementById("edit-submit--2").click();
        }
      );
    });
  },
};
export { bulkActions };
