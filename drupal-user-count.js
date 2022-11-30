let src = chrome.runtime.getURL("rowFilterer.js");
const { rowFilterer } = await import(src);

/**
 * Creates a toolbar item that lists how many issues each user has and allows filtering by user.
 *
 * @type {{createElement: (function(): HTMLDivElement)}}
 */

class userCountFilter extends rowFilterer {
    createElement() {
        // On issue queue search page
        const assignedInput = document.getElementById("edit-assigned");
        const assignedText = assignedInput.getAttribute("value").trim();
        const assignedFields = document.querySelectorAll(
            "td.views-field-field-issue-assigned"
        );
        if (assignedText) {
            const filterValues = assignedText.split(",").map((name) => name.trim());
            return this.setUpFilter(assignedFields, 'user', filterValues);
        }
        return this.setUpFilter(assignedFields, 'user');
    }
}
const userCount = new userCountFilter();
export { userCount };
