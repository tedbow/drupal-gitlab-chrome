import { utils } from "./common.js";
import { issueUtils } from "./issue-node-common.js";
import { rowFilterer } from "./rowFilterer.js";

const issueCollect = {
  createForm: function () {
    chrome.storage.sync.get({ collect_issues: {} }, function (items) {
      if (items.collect_issues.hasOwnProperty("finish_msg")) {
        const textValue = '';
        items.collect_issues.results.forEach(function (result) {
          textValue.concat(result.join(','));
          textValue.concat("\n");
        });
        document.getElementById('collect-results').innerText = textValue;
        alert(items.collect_issues.finish_msg);
        chrome.storage.sync.set(
          {
            collect_issues: {},
          },
          function () {}
        );
      }
    });
    const inputDetails = document.createElement("details");
    const collectLabel = document.createElement("summary");
    collectLabel.innerText = "Get Issue info";
    inputDetails.appendChild(collectLabel);
    const table = utils.getIssueTableElement();
    // Create drop-down for versions
    const issueCollectDiv = document.createElement("div");
    const issueCollectDivLabel = document.createElement("h4");
    issueCollectDivLabel.innerText = "Issue Info collect";
    inputDetails.appendChild(issueCollectDivLabel);
    issueCollectDiv.className = "issueCollectDiv";
    inputDetails.appendChild(issueCollectDiv);
    //issueCollectDiv.innerText = '😜';
    const collectIssuesLabel = document.createElement("h2");
    collectIssuesLabel.innerText = "Issue URls";
    issueCollectDiv.appendChild(collectIssuesLabel);
    const issuesTextArea = document.createElement("textarea");
    issuesTextArea.name = `collect-issues`;
    issuesTextArea.id = "collect-issues";
    issueCollectDiv.append(issuesTextArea);
    const collectSelectorsLabel = document.createElement("h2");
    collectSelectorsLabel.innerText = "element selectors";
    issueCollectDiv.appendChild(collectSelectorsLabel);
    const selectorsTextArea = document.createElement("textarea");
    selectorsTextArea.name = `collect-selectors`;
    selectorsTextArea.id = "collect-selectors";
    issueCollectDiv.append(selectorsTextArea);


    const collectResultsLabel = document.createElement("h2");
    collectResultsLabel.innerText = "results";
    issueCollectDiv.appendChild(collectResultsLabel);
    const resultTextArea = document.createElement("textarea");
    resultTextArea.name = `collect-results`;
    resultTextArea.id = "collect-results";
    issueCollectDiv.append(resultTextArea);
    table.parentNode.append(inputDetails);


    const actionButton = document.createElement("button");
    actionButton.value = "collect_issues";
    actionButton.innerText = "Collect Issues";
    actionButton.onclick = function () {
      chrome.storage.sync.set(
        {
          collect_issues: {
            urls: issueCollect.convertTextAreaToArray(issuesTextArea),
            selectors:  issueCollect.convertTextAreaToArray(selectorsTextArea),
            results: [],
            return_url: window.location.href,
          },
        },
        function () {
          issueCollect.gotoNextNode();
        }
      );
    };
    inputDetails.appendChild(actionButton);
  },
  gotoNextNode: function () {
    utils.sleep(1000);
    chrome.storage.sync.get({ collect_issues: {} }, function (items) {
      if (items.collect_issues.hasOwnProperty("urls")) {
        window.location.href = items.collect_issues.urls[0];
        //utils.gotoNode(items.collect_issues.urls[0], "collect_issues=1");
      }
    });
  },
  convertTextAreaToArray: function convertTextAreaToArray(element) {
  return element.value
      .split(/\n/)
      .map((line) => line.trim())
      .filter((n) => n);
  },
  doAction: function () {
    const params = new URLSearchParams(window.location.search);
    chrome.storage.sync.get({ collect_issues: {} }, function (items) {
      const url = window.location.href;
      console.log(items.collect_issues);

      if (!items.collect_issues.hasOwnProperty("urls")) {
        if (items.collect_issues.hasOwnProperty("finish_msg")) {
          window.location.href = items.collect_issues.return_url;
          return;
        }
        return;
      }
      if (!items.collect_issues.urls.includes(url)) {
        const statusMessage = document.querySelector(".messages.status");
        if (statusMessage === undefined) {
          alert("Maybe wrong node 🤔");
          return;
        }
        bulkActions.gotoNextNode();
        return;
      }

      // Apply tag changes if any.
      const collected = [
          url
      ];
      if (items.collect_issues.hasOwnProperty("selectors")) {
        items.collect_issues.selectors.forEach(function (selector) {
          const element = document.querySelector(selector);
          if (!element) {
            alert(`Could not find ${selector}`);
            return;
          }
          collected.push(document.querySelector(selector).textContent)
        })
      }
      items.collect_issues.results.push(collected);

      const urls = utils.removeArrayItem(items.collect_issues.urls, url);

      let newBulksActions;
      if (url.length === 0) {
        newBulksActions = {
          finish_msg: "Operations complete🎉",
          return_url: items.collect_issues.return_url,
        };
      } else {
        items.collect_issues.urls = urls;
        newBulksActions = items.collect_issues;
      }
      chrome.storage.sync.set(
        {
          collect_issues: newBulksActions,
        },
        function () {
          if (url.length === 0) {

            window.location.href = items.collect_issues.return_url;
          }
          else {
            window.location.href =  urls[0];
          }
        }
      );
    });
  },
};
export { issueCollect };
