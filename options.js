// Copied from https://developer.chrome.com/docs/extensions/mv3/options/
// Saves options to chrome.storage

function convertTextAreaToArray(element) {
  return element.value
    .split(/\n/)
    .map((line) => line.trim())
    .filter((n) => n);
}
function setTextAreaValueByArray(element, items) {
  element.value = items.join("\n");
  element.setAttribute("rows", items.length + 1);
  let maxLength = 30;
  items.forEach((item) => {
    maxLength = Math.max(maxLength, item.length);
  });
  element.setAttribute("cols", maxLength);
}
function save_options() {
  const projects = convertTextAreaToArray(document.getElementById("projects"));
  const auto_tags = convertTextAreaToArray(
    document.getElementById("auto_tags")
  );
  const load_pages = document.getElementById("load_pages").checked;
  const project_test_requirements = {};
  document.querySelectorAll(".project-tests").forEach((textArea) => {
    const project = textArea.getAttribute("project");
    project_test_requirements[project] = convertTextAreaToArray(textArea);
  });

  chrome.storage.sync.set(
    {
      projects: projects,
      load_pages: load_pages,
      project_test_requirements: project_test_requirements,
      auto_tags: auto_tags,
    },
    function () {
      // Reset from storage to remove empty lines, if any.
      restore_options();
      // Update status to let user know options were saved.
      const status = document.getElementById("status");
      status.textContent = "Options saved";
      setTimeout(function () {
        status.textContent = "";
      }, 1500);
    }
  );
}
// Restores form values from the preferences stored in chrome.storage.
function restore_options() {
  chrome.storage.sync.get(
    {
      projects: [],
      project_test_requirements: {},
      load_pages: false,
      auto_tags: [],
    },
    function (items) {
      if (items.auto_tags.length === 0) {
        items.auto_tags = [
          "Needs tests",
          "Needs issue summary update",
          "Accessibility",
        ];
      }
      setTextAreaValueByArray(
        document.getElementById("projects"),
        items.projects
      );
      setTextAreaValueByArray(
        document.getElementById("auto_tags"),
        items.auto_tags
      );
      document.getElementById("load_pages").checked = items.load_pages;
      document
        .querySelectorAll("#project-container .project-tests-container")
        .forEach((div) => div.remove());
      items.projects.forEach((project) => {
        const projectTestDiv = document.createElement("div");
        projectTestDiv.classList.add("project-tests-container");
        document.getElementById("project-container").append(projectTestDiv);
        const projectTestLabel = document.createElement("label");
        const projectTests = document.createElement("textarea");
        if (items.project_test_requirements.hasOwnProperty(project)) {
          setTextAreaValueByArray(
            projectTests,
            items.project_test_requirements[project]
          );
        }
        projectTests.classList.add("project-tests");
        projectTests.id = `project-tests-${project}`;
        projectTests.setAttribute("project", project);
        projectTestLabel.setAttribute("for", projectTests.id);
        projectTestLabel.innerText = `Test requirements for '${project}`;
        projectTestDiv.append(projectTestLabel, projectTests);
      });
    }
  );
}
document.addEventListener("DOMContentLoaded", restore_options);
document.getElementById("save").addEventListener("click", save_options);
