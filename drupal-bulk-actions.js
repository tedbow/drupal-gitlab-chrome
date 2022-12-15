import { utils } from "./common.js";


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
            console.log(tagActions);
        }
        table.append(actionButton);
    },
};
export { bulkActions };
