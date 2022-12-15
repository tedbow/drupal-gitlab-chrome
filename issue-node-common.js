const issueUtils = {
    addTag: function (tag) {
        if (this.hasTag(tag)) {
            return;
        }
        const existingTags = this.getExistingTags();
        existingTags.push(tag);
        this.setTags(existingTags);

    },
    removeTag: function (tag) {
        if (!this.hasTag(tag)) {
            return;
        }
        const existingTags = this.getExistingTags();
        const index = existingTags.indexOf(tag);
        if (index > -1) { // only splice array when item is found
            existingTags.splice(index, 1); // 2nd parameter means remove one item only
        }
        this.setTags(existingTags);
    },
    setTags: function (tags) {
        this.getTagInput().value = tags.join(', ');
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
