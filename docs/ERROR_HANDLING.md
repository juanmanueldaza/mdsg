# Error Handling and Local Fallbacks in Shared mdsite.js

The shared `mdsite.js` module provides robust error handling:
- Displays a user-friendly error message if markdown fetch fails.
- Sets ARIA `role="alert"` for error messages (screen reader accessible).
- Ensures the error message is focusable for keyboard users.

## Usage
No extra steps are needed—these features are applied automatically when using `fetchAndRenderMarkdown`.

## Example
If the markdown file cannot be loaded, the user will see a red error message in the main content area.

## Local Fallbacks
- For critical JS/CSS assets, use the `onerror` attribute in `<script>` and `<link>` tags to provide local fallbacks (already present in `index.html`).

See the implementation in `mdsite.js` and the HTML templates for details.
