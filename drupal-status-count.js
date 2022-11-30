/**
 * Creates a toolbar item that lists the number of issues with different statuses.
 *
 * @type {{createElement: (function(): HTMLDivElement)}}
 */
const statusCount = {
    createElement: function () {
        const statusFields = document.querySelectorAll(
            "td.views-field.views-field-field-issue-status"
        );
        let statuses = [];
        statuses = [
            ...new Set(
                [...statusFields].map((statusField) =>
                    statusField.innerText.trim()
                )
            ),
        ];

        const statusesDiv = document.createElement("div");
        statusesDiv.className = "statusCount";
        statuses.forEach((name) => {
            let statusIssue = { name: name, count: 0 };
            statusFields.forEach((field) => {
                if (field.textContent.includes(name)) {
                    statusIssue.count++;
                }
            });
            const statusDiv = document.createElement("div");
            statusDiv.innerText = `${name}: ${statusIssue.count}`;
            if (statusIssue.count) {
                const clicker = document.createElement("a");
                //clicker.setAttribute('href', '#')
                clicker.setAttribute("user", name);
                clicker.onclick = function (event) {
                    const target = event.target;
                    const targetIsFiltered = target.hasAttribute("filtered");
                    document.querySelectorAll(".user-filter").forEach((link) => {
                        link.innerText = "🔎";
                        link.removeAttribute("filtered");
                    });
                    if (targetIsFiltered) {
                        statusFields.forEach(
                            (statusField) =>
                                (statusField.closest("tr").style.display = "table-row")
                        );
                        return;
                    }

                    target.innerText = "✅";
                    target.setAttribute("filtered", true);
                    statusFields.forEach((statusField) => {
                        const parentRow = statusField.closest("tr");
                        if (statusField.innerText.includes(name)) {
                            parentRow.style.display = "table-row";
                        } else {
                            parentRow.style.display = "none";
                        }
                    });
                };
                clicker.innerText = "🔎";
                clicker.className = "user-filter";
                statusDiv.appendChild(clicker);
            }
            statusesDiv.appendChild(statusDiv);
        });
        return statusesDiv;

    }
};
export { statusCount };
