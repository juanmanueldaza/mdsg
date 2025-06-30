# Accessibility Improvements in Shared mdsite.js

The shared `mdsite.js` module now includes:
- ARIA roles and labels for the main content area.
- Keyboard focus management (`tabindex="0"`).
- Automatic skip link for keyboard/screen reader users.

## Usage
No extra steps are needed—these features are applied automatically when using `fetchAndRenderMarkdown` or `renderMarkdown` from the shared module.

## Verification Checklist
- [x] Main content area has `role="main"` and `aria-label`.
- [x] Main content is focusable via keyboard.
- [x] Skip link is present and accessible.

See the implementation in `mdsite.js` for details.
