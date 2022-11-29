// Copied from https://developer.chrome.com/docs/extensions/mv3/options/
// Saves options to chrome.storage
function save_options() {
    const projects = document.getElementById('projects').value.split(/\n/).map(line => line.trim()).filter(n => n);
    chrome.storage.sync.set({
        projects: projects,
    }, function() {
        // Update status to let user know options were saved.
        const status = document.getElementById('status');
        status.textContent = "Options saved";
        setTimeout(function() {
            status.textContent = '';
        }, 1500);
    });
}
// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    chrome.storage.sync.get({
        projects: [],
    }, function(items) {
        document.getElementById('projects').value = items.projects;
    });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);
