# Unified Markdown Site Architecture

All sites (`cv`, `onepager`, `mdsite`) now use the shared `mdsite.js` module for Markdown rendering, accessibility, and error handling.

## Key Points
- Shared module is hosted at https://mdsite.daza.ar/mdsite.js
- All sites import and use the same code for consistent behavior
- Accessibility and error handling are standardized

## How to Update
- To update logic for all sites, update the shared module and redeploy
- See `docs/SHARED_MDSITE_USAGE.md` for usage

## Site-Specific Notes
- `cv` and `onepager` use remote markdown sources and remove contact sections
- `mdsite` can be updated to use the shared module for full unification (optional)

---

For more, see `docs/ACCESSIBILITY.md` and `docs/ERROR_HANDLING.md`.
