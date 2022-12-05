(async () => {
  const src = chrome.runtime.getURL("common.js");
  const { utils } = await import(src);

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
  function createIdForTag(tag) {
    return ('tag-button-' + (tag.replace(/\W/g,'-'))).toLowerCase();
  }
  function getElementForTag(tag) {
    return document.getElementById(createIdForTag(tag));
  }
  commonIssueTags.forEach((tag)=> {
    const tagDiv = document.createElement("button");
    tagDiv.className = "tagDiv";
    tagDiv.innerText = `${tag}`;
    tagDiv.id = createIdForTag(tag);
    if(existingTags.includes(`${tag}`)){
      tagDiv.setAttribute("disabled", "disabled");
    }
    issueTagsDiv.append(tagDiv);
  });
  const issueTagsInputField = document.querySelector("#edit-taxonomy-vocabulary-9-und");
  issueTagsInputField.parentNode.append(issueTagsInputField, issueTagsDiv);

  commonIssueTags.forEach((tag)=> {
    getElementForTag(tag).addEventListener('click', function () {
      const assignedText = assignedInput.value;
      let tagsAdded = (assignedText !== "" ? `${assignedText}, ` : '') + `${tag}`;
      getElementForTag(tag).setAttribute("disabled", "disabled");
      document.getElementById("edit-taxonomy-vocabulary-9-und").value = tagsAdded;
    })
  });

  document.getElementById("edit-taxonomy-vocabulary-9-und").addEventListener('input', function (event) {
    const assignedText = assignedInput.value;
    const existingTags = assignedText.split(",").map(tag => tag.trim());
    commonIssueTags.forEach((tag)=> {
      if(!existingTags.includes(`${tag}`)){
        getElementForTag(tag).removeAttribute("disabled");
      }
    });
  })
})();
