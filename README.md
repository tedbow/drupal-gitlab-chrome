# ⚠️ WARNING: Use at Your Own Risk! ⚠️

This extension is a wild beast—tame it if you dare! It may eat your issues, tag your friends, or cause spontaneous productivity. No warranty, no guarantees, and definitely no refunds. Proceed with caution and a sense of humor.

# DAT Drupal.org Chrome Extension

This Chrome extension provides a suite of productivity enhancements for working with Drupal.org issues and GitLab merge requests. It is designed to streamline issue triage, tagging, bulk actions, and merge request review for Drupal project maintainers and contributors.

## Features

- **Issue Queue Enhancements**: Adds toolbars, filters, and bulk actions to Drupal.org issue search and listing pages, including multi-page loading and project-specific utilities.
- **Issue Node Tools**: Enhances individual issue pages with quick tag buttons, merge test controls, comment enhancements (such as @mention autocomplete and sticky textarea), and information collectors.
- **Tag Management**: Provides quick-add buttons for common tags, configurable via the extension options.
- **Bulk Actions**: Enables bulk tagging and other actions on multiple issues at once.
- **Merge Request Status**: Integrates GitLab merge request status and links directly into issue pages.
- **Textarea Enhancements**: Improves the comment textarea with features like sticky positioning, paste enhancements, and quick tag/mention insertion.
- **User and Component Counters**: Adds counters for users, components, priorities, and statuses in issue listings.
- **Options Page**: Lets you configure projects, common tags, and usernames for autocomplete.

## Supported Sites
- [Drupal.org](https://www.drupal.org/)
- [GitLab for Drupal](https://git.drupalcode.org/)

## Installation
1. Clone or download this repository.
2. In Chrome, go to `chrome://extensions/` and enable Developer Mode.
3. Click "Load unpacked" and select this directory.
4. Configure your projects and preferences via the extension options.

## Usage
- Visit Drupal.org issue queues or issue pages to see the enhanced toolbars and features.
- Use the options page to set up your projects, common tags, and usernames for autocomplete.

## Development
- Main logic is in modular JS files loaded as content scripts for specific Drupal.org and GitLab pages.
- See `manifest.json` for script/page mappings.

## License
MIT
