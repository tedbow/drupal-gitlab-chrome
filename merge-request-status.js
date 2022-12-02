/**
 * Creates a new column for merge request status.
 *
 * @type {{addColumn: (function(): HTMLElement)}}
 */
import { utils } from "./common.js";

const mergeRequestStatus = {
  existingStatues: new Set(),
  addColumn: function () {
    // store name elements in array-like object
    const namesFromDOM = document.querySelectorAll(
      "tbody .views-field-title a"
    );
    let columnsAdded = 0;
    for (const nameElement of namesFromDOM) {
      const issueId = utils.getIssueIdFromUrl(nameElement.getAttribute("href"));

      const address = fetch(
        `https://git.drupalcode.org/api/v4/merge_requests?state=opened&scope=all&in=title&search=` +
          issueId
      )
        .then((response) => response.json())
        .then((data) => {
          const tdElement = document.createElement("td");
          tdElement.classList.add('merge-request-status')
          if (Object.keys(data).length === 0) {
            tdElement.appendChild(document.createTextNode("No"));
            tdElement.classList.add('merge-request-status-none')
          } else {
            for (const key in data) {
              const anchorLink = document.createElement("a");
              const link = document.createTextNode(
                "#" +
                  data[key].iid +
                  " " +
                  data[key].merge_status +
                  `, ${data[key].user_notes_count} comments`
              );
              anchorLink.appendChild(link);
              this.existingStatues.add(data[key].merge_status);
              tdElement.classList.add('merge-request-status-exists')
              tdElement.classList.add('merge-request-status_' + data[key].merge_status);
              Object.assign(anchorLink, {
                title: "Merge request #" + data[key].iid,
                href: data[key].web_url,
                target: "_blank",
              });
              tdElement.appendChild(anchorLink);
              tdElement.appendChild(document.createElement("br"));
            }
          }
          nameElement.parentNode.parentNode.appendChild(tdElement);
          columnsAdded++;
          if (columnsAdded === namesFromDOM.length) {
            utils.getIssueListViewElement().classList.add('merge-request-column-added');
          }
        });
    }
    const thElement = document.createElement("TH");
    thElement.appendChild(document.createTextNode("Merge request available?"));

    // Add header for merge request.
    document
      .querySelector("table.project-issue thead tr")
      .appendChild(thElement);
  },
  isAdded: function () {
    return utils.getIssueListViewElement().classList.contains('merge-request-column-added');
  },
};

export { mergeRequestStatus };
