# Code & Architecture Review: daza.ar Sites

_This document compiles expert feedback and recommendations for all sites in the `sites/` directory. Use this as a reference for creating new issues and planning improvements._

---

## General Observations
- **KISS & UNIX Philosophy**: Each site is self-contained, minimal, and easy to debug.
- **Reusability**: Shared remote navbar and common CSS libraries are used efficiently.
- **Minimalism**: Most sites are static, reducing attack surface and complexity.
- **Open Source Alignment**: Reliance on open, CDN-hosted libraries and clear HTML structure.

---

## Site-by-Site Feedback

### 1. `cv`
- **Strengths**:
  - Semantic HTML, strong meta tags, CSS variables, and dark mode.
  - Minimal, remote resources for styling and navigation.
- **Improvements**:
  - Sanitize Markdown output before injecting into the DOM (use DOMPurify or similar).
  - Add error handling for failed fetches.
  - Add ARIA roles and improve keyboard navigation.
  - Consider local fallbacks for critical CSS/JS.

### 2. `data`
- **Strengths**:
  - Simple, clear data/content repository.
  - Well-structured JSON for programmatic use.
- **Improvements**:
  - Document data schema and update process.
  - If served via API, ensure CORS, rate limiting, and input validation.
  - Use access controls for sensitive data.

### 3. `mdsite`
- **Strengths**:
  - Modern static site template, modular CSS/JS/content.
  - PDF export and dynamic navbar integration.
- **Improvements**:
  - Sanitize Markdown output before DOM injection.
  - Add error handling for fetch failures.
  - Document config options for `mdsite.js`.
  - Consider lazy loading/code splitting for performance.

### 4. `navbar`
- **Strengths**:
  - Reusable, modular navigation component.
  - Class-based JS, themable CSS.
- **Improvements**:
  - Add documentation for JS API/config.
  - Version assets for cache busting.
  - Add automated tests for JS logic.
  - Sanitize any user-generated content.

### 5. `onepager`
- **Strengths**:
  - Clean, minimal HTML and consistent styling.
  - Good SEO meta tags.
- **Improvements**:
  - Add accessibility features (ARIA, alt text).
  - Add Content-Security-Policy header.
  - Consider local fallbacks for critical assets.

### 6. `start`
- **Strengths**:
  - Creative CSS for profile image effects.
  - Minimal, clean HTML.
- **Improvements**:
  - Add ARIA roles and improve keyboard navigation.
  - Add meta tags for social sharing.
  - Split large CSS blocks for maintainability.

### 7. `wallpapers`
- **Strengths**:
  - Excellent meta tags for SEO/social sharing.
  - Modern, minimal HTML.
- **Improvements**:
  - Add lazy loading for images.
  - Add robots.txt and sitemap for SEO.
  - Add accessibility features for the gallery.
  - Sanitize any dynamic content.

---

## General Security & Best Practices
- Add security headers: Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Referrer-Policy.
- Always serve over HTTPS in production.
- Monitor CDN dependencies for vulnerabilities.
- Add automated HTML validation, accessibility, and link checking.
- Expand READMEs with usage, configuration, and contribution guidelines.

---

## Code-Level Recommendations
- Sanitize all HTML injected into the DOM, especially from Markdown or remote data.
- Add accessibility features (ARIA, keyboard navigation, color contrast).
- Add error handling for network requests.
- Document configuration options and public APIs for reusable components.
- Consider automated tests for JS logic and HTML validation.

---

_Use this document as a checklist for future improvements and issue creation across all sites._
