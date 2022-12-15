import { utils } from "./common.js";
import { issueUtils} from "./issue-node-common.js";


const bulkActions = {
    createColumn: function () {
        const table = utils.getIssueTableElement();
        const headColumn = document.createElement('th');
        headColumn.innerText = "🛠";
        const headRow =table.querySelector('thead tr');
        headRow.insertBefore(headColumn, headRow.querySelector('th'));
        table.querySelectorAll('tbody tr').forEach(row => {
            const td = document.createElement('td');
            const input = document.createElement('input');
            const nid = utils.getNidForRow(row);
            input.name = `nid-select-${nid}`;
            input.value = nid;
            input.classList.add('bulk-nid-select');
            input.type = 'checkbox';
            td.appendChild(input);
            row.insertBefore(td, row.querySelector('td'));
        });
    },
    createForm: function () {
        this.createColumn();
        const inputDiv = document.createElement('div');
        const table = utils.getIssueTableElement();
        table.append(inputDiv);
        chrome.storage.sync.get(utils.settingDefaults, function (items) {
            const issueTagsDiv = document.createElement("div");
            issueTagsDiv.className = "issueTagsDiv";
            inputDiv.appendChild(issueTagsDiv);
            const commonIssueTags = items.auto_tags;
            commonIssueTags.forEach((tag) => {
                const tagSelect = document.createElement('select');
                tagSelect.name = `bulk-tag-${tag}`;
                tagSelect.id = tagSelect.name;
                tagSelect.setAttribute('bulk_tag', tag);
                tagSelect.classList.add('bulk-tag');
                const tagLabel = document.createElement('label')
                tagLabel.setAttribute("for",tagSelect.id);
                tagLabel.innerHTML = tag;
                issueTagsDiv.appendChild(tagLabel);
                ['no-action', 'add', 'remove'].forEach(option => {
                    const optionElement = document.createElement("option");
                    optionElement.text = option;
                    optionElement.value = option;
                    tagSelect.appendChild(optionElement);
                });
                issueTagsDiv.appendChild(tagSelect);
            });
        });
        const actionButton = document.createElement('button');
        actionButton.value = 'bulk_action';
        actionButton.innerText = "Do it";
        actionButton.onclick = function () {
            const tagActions = {};
            document.querySelectorAll('.bulk-tag').forEach(tagSelect => {
                if (tagSelect.value === 'no-action') {
                    return;
                }
                const tag = tagSelect.getAttribute('bulk_tag');
                tagActions[tag] = tagSelect.value;
            });
            const nidCheckBoxes = document.querySelectorAll('.bulk-nid-select');
            const nids = new Set();
            nidCheckBoxes.forEach(checkbox => {
                if (checkbox.checked) {
                    nids.add(checkbox.value);
                }
            });
            chrome.storage.sync.set(
                {
                    bulk_actions: {"nids": nids, "tagActions": tagActions},
                },
                function () {
                    utils.gotoNode(nids.values().next().value, 'bulk_action=1')
                }
            );
            console.log(tagActions);
            console.log(nids);
        }
        table.append(actionButton);
    },
    doBulkAction: function () {
        const params = new Proxy(new URLSearchParams(window.location.search), {
            get: (searchParams, prop) => searchParams.get(prop),
        });
        if (!params.has('bulk_action')) {
            return;
        }
        chrome.storage.sync.get({bulk_actions: {"nids": []}}, function (items) {
            const nid = utils.getIssueIdFromUrl(window.location.href);
        });
    }
};
export { bulkActions };
