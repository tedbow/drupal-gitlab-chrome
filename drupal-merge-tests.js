import { utils } from "./common.js";

const mergeTests = {
  stopMerge: function () {
    const checkDrupalCi = setInterval(function () {
      if (mergeTests.isTestsAdded()) {
        window.clearInterval(checkDrupalCi);
        chrome.storage.sync.get(
          { project_test_requirements: {} },
          function (items) {
            const project = utils.getProject();
            const missing = {};
            const mergeRequests = {};
            let foundMissing = false;
            if (
              items.project_test_requirements.hasOwnProperty(project) &&
              items.project_test_requirements[project].length > 0
            ) {
              console.log(items.project_test_requirements[project]);
              document
                .querySelectorAll(".branches > li")
                .forEach((branchElement) => {
                  if (
                    branchElement.querySelectorAll("a.merge-request.merged")
                      .length > 0
                  ) {
                    return;
                  }
                  const branch = branchElement.getAttribute("data-branch");
                  items.project_test_requirements[project].forEach(
                    (requirement) => {
                      let foundPassing = false;
                      branchElement
                        .querySelectorAll(".pift-ci-pass a")
                        .forEach((link) => {
                          if (link.innerText.includes(requirement)) {
                            foundPassing = true;
                          }
                        });
                      if (!foundPassing) {
                        if (!missing.hasOwnProperty(branch)) {
                          missing[branch] = [];
                        }
                        foundMissing = true;
                        missing[branch].push(requirement);
                      }
                    }
                  );
                });
              if (foundMissing) {
                const warning = document.createElement("div");
                document
                  .getElementById("drupalorg-issue-credit-form")
                  .append(warning);
                warning.id = "missing-test-requirements";
                warning.classList.add("warning");
                const label = document.createElement("h3");
                label.innerText = "Missing passing tests";
                warning.append(label);
                for (const [branch, requirements] of Object.entries(missing)) {
                  const mergeSelect =
                    document.getElementById("edit-merge-branch");
                  if (mergeSelect !== null) {
                    mergeSelect
                      .querySelectorAll("option")
                      .forEach((optionElement) => {
                        if (
                          optionElement.innerText.includes(`branch ${branch} `)
                        ) {
                          optionElement.disabled = true;
                          optionElement.innerText =
                            "(missing tests) " + optionElement.innerText;
                        }
                      });
                  }
                  const branchLabel = document.createElement("h4");
                  branchLabel.innerText = branch;
                  warning.append(branchLabel);
                  const list = document.createElement("ul");
                  requirements.forEach((requirement) => {
                    const item = document.createElement("li");
                    item.innerText = requirement;
                    list.append(item);
                  });
                  warning.append(list.cloneNode(true));
                  const topBranch = document.querySelector(
                    `.branches > li[data-branch="${branch}"]`
                  );
                  const topDiv = document.createElement("div");
                  topDiv.classList.add("warning");
                  const topLabel = document.createElement("h4");
                  topLabel.innerText = "Needs following tests to merge";
                  topDiv.append(topLabel, list);
                  topBranch.append(topDiv);
                }
              }
            }
          }
        );
      }
    }, 500);
  },
  isTestsAdded: function () {
    const buttons = document.querySelectorAll(
      'input[value="Create issue fork"]'
    );
    if (buttons.length > 0) {
      return true;
    }
    let missingTests = false;
    document.querySelectorAll("ul.branches > li").forEach((branchElement) => {
      if (branchElement.querySelector("a .merge-request") !== undefined) {
        // We have a merge request we should have tests.
        if (branchElement.querySelectorAll(".pift-ci-tests").length === 0) {
          missingTests = true;
        }
      }
    });
    return !missingTests;
  },
};
export { mergeTests };
