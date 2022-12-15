const issueUtils = {
    addTag: function (tag) {

        if (this.hasTag(tag)) {
            return;
        }
        const existingTags = this.getExistingTags();
        existingTags.push(tag);
        this.getTagInput().value = existingTags.join(', ');

    },
    hasTag: function (tag) {
        return this.getExistingTags().includes(tag);
    },
    getTagInput: function () {
        return document.getElementById(
            "edit-taxonomy-vocabulary-9-und"
        );
    },
    getExistingTags: function () {
        const tagInput = this.getTagInput();
        return tagInput.value.split(", ").map(tag => tag.trim()).filter(tag => tag.length > 0);
    }
};
export { issueUtils };
