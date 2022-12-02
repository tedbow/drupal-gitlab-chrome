let src = chrome.runtime.getURL("common.js");
const { utils } = await import(src);
src = chrome.runtime.getURL("toolbarRowFilterer.js");
const { toolbarRowFilterer } = await import(src);
src = chrome.runtime.getURL("merge-request-status.js");
const { mergeRequestStatus } = await import(src);

/**
 * Creates a toolbar item that lists how many issues each user has and allows filtering by user.
 *
 * @type {{createElement: (function(): HTMLDivElement)}}
 */

class mergeRequestFilterer extends toolbarRowFilterer {
    createElement() {
        // On issue queue search page
        const mergeRequestsTds = utils.getIssueListViewElement().querySelectorAll(
            "td.merge-request-status"
        );
        mergeRequestStatus.existingStatues.add('none');
        return this.setUpFilter(mergeRequestsTds, 'user', mergeRequestStatus.existingStatues);
    }

    /**
     * Determines if a field matches a value.
     *
     * @param field
     * @param filterValue
     * @returns {boolean}
     */
    fieldMatchesFilterValue(field, filterValue) {
        const mergeStatusClass = 'merge-request-status_' + filterValue;
        return field.classList.contains(mergeStatusClass)
    }

}
const mergeRequestFilter = new mergeRequestFilterer();
export { mergeRequestFilter };
