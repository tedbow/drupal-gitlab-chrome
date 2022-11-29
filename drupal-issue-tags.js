(async () => {
  const src = chrome.runtime.getURL("common.js");
  const { utils } = await import(src);

  var url = document.URL;
  const regex1 = /https:\/\/www\.drupal\.org\/project\/.*\/issues\/.*/g;
  const regex2 = /https:\/\/www\.drupal\.org\/node\/add\/.*/g;
  if (url.match(regex1) || url.match(regex2)) {
    const assignedInput = document.getElementById("edit-taxonomy-vocabulary-9-und");
    const assignedText = assignedInput.value;
    const existingTags = assignedText.split(", ");

    const issueTagsDiv = document.createElement("div");
    issueTagsDiv.className = "issueTagsDiv";
    let commonIssueTags = [
      'Needs tests',
      'Needs issue summary update',
      'Accessibility',
      'core-mvp',
    ]
    commonIssueTags.forEach((tag)=> {
      const tagDiv = document.createElement("button");
      tagDiv.className = "tagDiv";
      tagDiv.innerText = `${tag}`;
      tagDiv.id = `${tag}`;
      if(existingTags.includes(`${tag}`)){
        document.getElementById(`${tag}`).setAttribute("disabled", "disabled");
      }
      issueTagsDiv.append(tagDiv);
    });
    const issueTagsInputField = document.querySelector("#edit-taxonomy-vocabulary-9-und");
    issueTagsInputField.parentNode.append(issueTagsInputField, issueTagsDiv);

    commonIssueTags.forEach((tag)=> {
      document.getElementById(`${tag}`).addEventListener('click', function () {
        const assignedText = assignedInput.value;
        let tagsAdded = (assignedText !== "" ? `${assignedText}, ` : '') + `${tag}`;
        document.getElementById(`${tag}`).setAttribute("disabled", "disabled");
        document.getElementById("edit-taxonomy-vocabulary-9-und").value = tagsAdded;
      })
    });

    document.getElementById("edit-taxonomy-vocabulary-9-und").addEventListener('input', function (event) {
      const assignedText = assignedInput.value;
      const existingTags = assignedText.split(", ");
      commonIssueTags.forEach((tag)=> {
        if(!existingTags.includes(`${tag}`)){
          document.getElementById(`${tag}`).removeAttribute("disabled");
        }
      });
    })
  }
})();
