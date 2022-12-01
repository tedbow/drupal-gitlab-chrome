let src = chrome.runtime.getURL("rowFilterer.js");
const { rowFilterer } = await import(src);

/**
 * A row filter that also has a toolbar element.
 */
class toolbarRowFilterer extends rowFilterer {
  /**
   *
   * @param displayedElements
   * @param filterType
   * @param filterValues
   * @returns {HTMLDivElement}
   */
  setUpFilter(displayedElements, filterType, filterValues) {
    if (filterValues === undefined) {
      filterValues = [
        ...new Set(
          [...displayedElements].map((displayedElement) =>
            displayedElement.innerText.trim()
          )
        ),
      ];
    }
    const containerDiv = document.createElement("div");
    containerDiv.className = `${filterType}Count`;
    filterValues.forEach(
      function (filterValue) {
        let issueInfo = { name: filterValue, count: 0 };
        displayedElements.forEach((field) => {
          if (field.textContent.includes(filterValue)) {
            issueInfo.count++;
          }
        });
        const filterValueDiv = document.createElement("div");
        filterValueDiv.innerText = `${filterValue}: ${issueInfo.count}`;
        if (issueInfo.count) {
          const clicker = document.createElement("a");
          //clicker.setAttribute('href', '#')
          clicker.setAttribute("filterValue", filterValue);
          clicker.onclick = function (event) {
            const target = event.target;
            const targetIsFiltered = target.hasAttribute("filtered");
            document
              .querySelectorAll(`.${filterType}Count .filter`)
              .forEach((link) => {
                link.innerText = "🔎";
                link.removeAttribute("filtered");
              });
            if (targetIsFiltered) {
              displayedElements.forEach(
                function (displayedElement) {
                  this.removeHideCondition(displayedElement);
                }.bind(this)
              );
              return;
            }

            target.innerText = "✅";
            target.setAttribute("filtered", true);
            displayedElements.forEach(
              function (displayedElement) {
                if (displayedElement.innerText.includes(filterValue)) {
                  this.removeHideCondition(displayedElement);
                } else {
                  this.addHideCondition(displayedElement);
                }
              }.bind(this)
            );
          }.bind(this);
          clicker.innerText = "🔎";
          clicker.className = `filter`;
          filterValueDiv.appendChild(clicker);
        }

        filterValueDiv.className = `${filterType}-issue-cnt-${issueInfo.count}`;
        containerDiv.appendChild(filterValueDiv);
      }.bind(this)
    );
    return containerDiv;
  }
}
export { toolbarRowFilterer };
