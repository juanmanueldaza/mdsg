# Shared mdsite.js Module Usage

The shared `mdsite.js` module provides unified Markdown rendering, sanitization, accessibility, and error handling for all sites.

## How to Use
1. Import the module in your HTML:
   ```html
   <script type="module">
     import { fetchAndRenderMarkdown } from "https://mdsite.daza.ar/mdsite.js";
     // ...
   </script>
   ```
2. Call `fetchAndRenderMarkdown` with your config:
   ```js
   fetchAndRenderMarkdown({
     url: "https://data.daza.ar/md/one-pager.md",
     targetSelector: "#cv",
     removeContactSection: true,
     errorMessage: "Error loading content"
   });
   ```

## Features
- Markdown rendering with sanitization
- Accessibility (ARIA, skip link, focus)
- Error handling and user-friendly messages
- Easy integration with Daza Navbar and PDF export

See `docs/ACCESSIBILITY.md` and `docs/ERROR_HANDLING.md` for more details.
