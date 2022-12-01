let src = chrome.runtime.getURL("toolbarRowFilterer.js");
const { toolbarRowFilterer } = await import(src);

/**
 * Creates a toolbar item that lists how many issues are in each priority and allows filtering by priority.
 *
 * @type {{createElement: (function(): HTMLDivElement)}}
 */

class priorityCountFilter extends toolbarRowFilterer {
    createElement() {
        // On issue queue search page
        const prioritySelect = document.getElementById("edit-priorities");
        // Attempt get all selected priorities.
        let priorityLabels = Array.from(prioritySelect.options).map(option => {
            if (option.selected) {
                return option.innerText;
            }
            return false;
        }).filter(selected => selected);
        if (priorityLabels.length === 1) {
            // If there is only on priority shown on the page add an empty element.
            return document.createElement('div');
        }
        if (priorityLabels.length === 0) {
            // If no items have been selected show all priorities.
            priorityLabels = Array.from(prioritySelect.options).map(option => option.innerText);
        }
        const priorityFields = document.querySelectorAll(
            "td.views-field-field-issue-priority"
        );
        return this.setUpFilter(priorityFields, 'assigned', priorityLabels);
    }
}
const priorityCount = new priorityCountFilter();
export { priorityCount };
