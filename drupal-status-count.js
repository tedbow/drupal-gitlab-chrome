let src = chrome.runtime.getURL("toolbarRowFilterer.js");
const { toolbarRowFilterer } = await import(src);

/**
 * Creates a toolbar item that lists the number of issues with different statuses.
 *
 * @type {{createElement: (function(): HTMLDivElement)}}
 */
class statusCountFilter extends toolbarRowFilterer {
    createElement() {
        const statusFields = document.querySelectorAll(
            "td.views-field.views-field-field-issue-status"
        );
        return this.setUpFilter(statusFields, 'status');

    }
}
const statusCount = new statusCountFilter();
export { statusCount };
