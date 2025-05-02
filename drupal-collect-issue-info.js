/**
 * Issue Information Collector
 * 
 * This file implements a utility for batch processing Drupal.org issue pages.
 * It allows users to:
 * 1. Input a list of issue URLs to visit
 * 2. Specify CSS selectors to extract information from each page
 * 3. Collect data from multiple issue pages sequentially
 * 4. Return to the starting page with all collected data
 * 
 * The tool is useful for gathering structured information across multiple 
 * Drupal.org issues for reporting or analysis.
 */

import { utils } from "./common.js";
import { issueUtils } from "./issue-node-common.js";
import { rowFilterer } from "./rowFilterer.js";

const issueCollect = {
  /**
   * Creates the collection form UI in the Drupal.org issue list page
   * Handles displaying previously collected results if returning from collection
   */
  createForm: function () {
    // Check if we're returning from a completed collection process
    chrome.storage.sync.get({ collect_issues: {} }, function (items) {
      if (items.collect_issues.hasOwnProperty("finish_msg")) {
        // Format and display collection results
        let textValue = '';
        if (items.collect_issues.results && Array.isArray(items.collect_issues.results)) {
          items.collect_issues.results.forEach(function (result) {
            textValue += result.join(',');
            textValue += "\n";
          });
        }
        const resultElement = document.getElementById('collect-results');
        if (resultElement) {
          resultElement.innerText = textValue;
        }
        
        // Alert user about completion and clear the collection state
        alert(items.collect_issues.finish_msg);
        chrome.storage.sync.set(
          {
            collect_issues: {},
          },
          function () {}
        );
      }
    });

    // Create the collapsible UI container
    const inputDetails = document.createElement("details");
    const collectLabel = document.createElement("summary");
    collectLabel.innerText = "Get Issue info";
    inputDetails.appendChild(collectLabel);
    
    // Find the issue table to attach our form
    const table = utils.getIssueTableElement();
    
    // Create the form container
    const issueCollectDiv = document.createElement("div");
    const issueCollectDivLabel = document.createElement("h4");
    issueCollectDivLabel.innerText = "Issue Info collect";
    inputDetails.appendChild(issueCollectDivLabel);
    issueCollectDiv.className = "issueCollectDiv";
    inputDetails.appendChild(issueCollectDiv);
    
    // Create URL input section
    const collectIssuesLabel = document.createElement("h2");
    collectIssuesLabel.innerText = "Issue URLs";
    issueCollectDiv.appendChild(collectIssuesLabel);
    const issuesTextArea = document.createElement("textarea");
    issuesTextArea.name = `collect-issues`;
    issuesTextArea.id = "collect-issues";
    issueCollectDiv.append(issuesTextArea);
    
    // Create selectors input section
    const collectSelectorsLabel = document.createElement("h2");
    collectSelectorsLabel.innerText = "Element selectors";
    issueCollectDiv.appendChild(collectSelectorsLabel);
    const selectorsTextArea = document.createElement("textarea");
    selectorsTextArea.name = `collect-selectors`;
    selectorsTextArea.id = "collect-selectors";
    issueCollectDiv.append(selectorsTextArea);

    // Create results display area
    const collectResultsLabel = document.createElement("h2");
    collectResultsLabel.innerText = "Results";
    issueCollectDiv.appendChild(collectResultsLabel);
    const resultTextArea = document.createElement("textarea");
    resultTextArea.name = `collect-results`;
    resultTextArea.id = "collect-results";
    issueCollectDiv.append(resultTextArea);
    
    // Add the form to the page
    table.parentNode.append(inputDetails);

    // Add the action button that starts the collection process
    const actionButton = document.createElement("button");
    actionButton.value = "collect_issues";
    actionButton.innerText = "Collect Issues";
    actionButton.onclick = function () {
      // Store collection configuration in Chrome storage
      chrome.storage.sync.set(
        {
          collect_issues: {
            urls: issueCollect.convertTextAreaToArray(issuesTextArea),
            selectors: issueCollect.convertTextAreaToArray(selectorsTextArea),
            results: [],
            return_url: window.location.href,
          },
        },
        function () {
          // Begin the collection process
          issueCollect.gotoNextNode();
        }
      );
    };
    inputDetails.appendChild(actionButton);
  },
  /**
   * Navigate to the next URL in the collection queue
   * Adds a small delay to prevent rate limiting
   */
  gotoNextNode: function () {
    utils.sleep(1000);
    chrome.storage.sync.get({ collect_issues: {} }, function (items) {
      if (items.collect_issues.hasOwnProperty("urls")) {
        window.location.href = items.collect_issues.urls[0];
      }
    });
  },
  
  /**
   * Utility function to convert textarea content into an array of lines
   * Removes empty lines and trims whitespace
   * @param {HTMLElement} element - The textarea DOM element
   * @return {Array} - Array of non-empty trimmed lines
   */
  convertTextAreaToArray: function convertTextAreaToArray(element) {
    return element.value
      .split(/\n/)
      .map((line) => line.trim())
      .filter((n) => n);
  },
  /**
   * Performs data collection on the current issue page
   * This runs automatically when navigating to an issue page in the collection queue
   */
  doAction: function () {
    const params = new URLSearchParams(window.location.search);
    chrome.storage.sync.get({ collect_issues: {} }, function (items) {
      const url = window.location.href;
      console.log(items.collect_issues);

      // Check if we're in collection mode
      if (!items.collect_issues.hasOwnProperty("urls")) {
        // If we have a finish message, return to the starting page
        if (items.collect_issues.hasOwnProperty("finish_msg")) {
          window.location.href = items.collect_issues.return_url;
          return;
        }
        return;
      }
      
      // Check if current URL is in our collection list
      if (!items.collect_issues.urls.includes(url)) {
        // Validate we're on a Drupal.org issue page
        const statusMessage = document.querySelector(".messages.status");
        if (statusMessage === undefined) {
          alert("Maybe wrong node 🤔");
          return;
        }
        // Skip to next issue if this one isn't in our list
        issueCollect.gotoNextNode();
        return;
      }

      // Start collecting data, beginning with the current URL
      const collected = [
          url
      ];
      
      // Extract data using the provided CSS selectors
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
      
      // Store the collected data
      items.collect_issues.results.push(collected);

      // Remove current URL from the queue
      const urls = utils.removeArrayItem(items.collect_issues.urls, url);

      // Prepare the next state 
      let newBulksActions;
      if (urls.length === 0) {
        // If no more URLs to process, prepare completion state
        newBulksActions = {
          finish_msg: "Operations complete🎉",
          return_url: items.collect_issues.return_url,
          results: items.collect_issues.results || []
        };
      } else {
        // Otherwise update the URL queue
        items.collect_issues.urls = urls;
        newBulksActions = items.collect_issues;
      }
      
      // Store the updated state and navigate to next URL or return
      chrome.storage.sync.set(
        {
          collect_issues: newBulksActions,
        },
        function () {
          if (urls.length === 0) {
            // If collection is complete, return to start page
            window.location.href = items.collect_issues.return_url;
          }
          else {
            // Otherwise go to next URL in the queue
            window.location.href = urls[0];
          }
        }
      );
    });
  },
};
export { issueCollect };
