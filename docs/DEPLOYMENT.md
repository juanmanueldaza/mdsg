# Deployment Guide: GitHub Pages Multi-Repo Architecture

This document explains how the daza.ar ecosystem is deployed using GitHub Pages with a sophisticated multi-repository architecture that enables independent deployments while maintaining shared functionality.

## Overview

The daza.ar ecosystem uses a **microservices approach for static sites** where:
- Each site is deployed to its own GitHub repository with GitHub Pages
- Custom subdomain routing provides clean URLs (cv.daza.ar, start.daza.ar, etc.)
- Shared modules are hosted centrally and imported remotely via ES modules
- Development and production use the same remote dependencies for true parity

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        daza.ar Domain                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  cv.daza.ar ──────────► juanmanueldaza/cv (GitHub Pages)       │
│  onepager.daza.ar ────► juanmanueldaza/onepager                │
│  start.daza.ar ───────► juanmanueldaza/start                   │
│  navbar.daza.ar ──────► juanmanueldaza/navbar (shared)         │
│  mdsite.daza.ar ──────► juanmanueldaza/mdsite (shared)         │
│  data.daza.ar ────────► juanmanueldaza/data (content)          │
│  wallpapers.daza.ar ──► juanmanueldaza/wallpapers              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
                    Shared Module Imports
                                │
    ┌───────────────────────────┼───────────────────────────┐
    │                           │                           │
    ▼                           ▼                           ▼
mdsite.daza.ar/mdsite.js   navbar.daza.ar/utils/   data.daza.ar/md/
(markdown processing)      (PDF & navigation)      (content files)
```

## Repository Structure

Each site repository contains:
```
site-repository/
├── index.html          # Main entry point
├── styles/             # Site-specific CSS
├── scripts/            # Site-specific JS
├── package.json        # Dependencies and deployment scripts
├── vite.config.js      # Build configuration (if needed)
└── README.md          # Site-specific documentation
```

## Deployment Process

### 1. Individual Site Deployment

Each site uses the `gh-pages` package for deployment:

```bash
# Navigate to site directory
cd sites/cv

# Install dependencies (if not already done)
npm install

# Build site (if build step is needed)
npm run build

# Deploy to GitHub Pages
npm run deploy
```

### 2. Deployment Scripts

Each site's `package.json` includes deployment scripts:

```json
{
  "scripts": {
    "deploy": "gh-pages -d . -b gh-pages",
    "deploy:clean": "gh-pages -d . -b gh-pages --remove '*.{js,css,html}' --add"
  },
  "devDependencies": {
    "gh-pages": "^6.3.0"
  }
}
```

### 3. GitHub Pages Configuration

For each repository:
1. Enable GitHub Pages in repository settings
2. Set source to `gh-pages` branch
3. Configure custom domain (e.g., `cv.daza.ar`)
4. Enable HTTPS enforcement

## DNS Configuration

### Custom Domain Setup

```dns
# DNS Records for daza.ar domain
Type    Name        Value                   TTL
CNAME   cv          juanmanueldaza.github.io  300
CNAME   onepager    juanmanueldaza.github.io  300
CNAME   start       juanmanueldaza.github.io  300
CNAME   navbar      juanmanueldaza.github.io  300
CNAME   mdsite      juanmanueldaza.github.io  300
CNAME   data        juanmanueldaza.github.io  300
CNAME   wallpapers  juanmanueldaza.github.io  300
```

### SSL Certificates

- GitHub Pages automatically provides SSL certificates for custom domains
- HTTPS is enforced for all subdomains
- Certificates are automatically renewed

## Shared Module Architecture

### Remote Module Imports

Sites import shared functionality from production URLs:

```javascript
// Shared markdown processing
import { fetchAndRenderMarkdown } from "https://mdsite.daza.ar/mdsite.js";

// Shared PDF utilities
import { DownloadPdfUtil } from "https://navbar.daza.ar/utils/downloadPdf.js";

// Remote content loading
const contentUrl = "https://data.daza.ar/md/cv-content.md";
```

### Benefits

1. **Single Source of Truth**: Update shared logic once, all sites benefit
2. **Independent Deployment**: Sites can be updated without coordinating releases
3. **Version Consistency**: All sites use the same version of shared modules
4. **Development Parity**: Local development uses same remote dependencies as production
5. **Caching**: Shared modules are cached across all sites

### Considerations

- **Network Dependency**: Sites require network access to shared modules
- **Error Handling**: Implement fallbacks for failed module loads
- **Versioning Strategy**: Consider versioned URLs for breaking changes

## Deployment Workflows

### Automated Deployment with GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm install
      
    - name: Build (if needed)
      run: |
        if [ -f "vite.config.js" ]; then
          npm run build
        fi
        
    - name: Deploy to GitHub Pages
      run: npm run deploy
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Manual Deployment

```bash
# Deploy all sites (run from daza.ar-env root)
./deploy-all.sh

# Deploy specific site
cd sites/cv && npm run deploy
```

## Development vs Production

### Local Development
- Uses `.local` domains (cv.local:3001, etc.)
- Imports from remote production URLs
- Vite dev server for hot reload
- `/etc/hosts` entries for custom domains

### Production
- Uses custom subdomains (cv.daza.ar, etc.)
- Same remote imports as development
- Static files served by GitHub Pages
- SSL certificates and CDN provided by GitHub

## Troubleshooting

### Common Issues

1. **Custom Domain Not Working**
   - Check DNS propagation: `dig cv.daza.ar`
   - Verify CNAME file in gh-pages branch
   - Ensure custom domain is set in repository settings

2. **Module Import Failures**
   - Check network connectivity to shared modules
   - Verify CORS headers for cross-origin requests
   - Implement error handling and fallbacks

3. **Deployment Failures**
   - Check GitHub token permissions
   - Verify gh-pages branch exists and is not protected
   - Review GitHub Actions logs for errors

### Debug Commands

```bash
# Check DNS resolution
dig cv.daza.ar

# Test module availability
curl -I https://mdsite.daza.ar/mdsite.js

# Verify GitHub Pages status
gh api repos/juanmanueldaza/cv/pages
```

## Security Considerations

### Content Security Policy

```html
<!-- Recommended CSP for sites using remote modules -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' https://*.daza.ar https://cdn.jsdelivr.net 'unsafe-inline';
  style-src 'self' https://*.daza.ar 'unsafe-inline';
  connect-src 'self' https://*.daza.ar;
">
```

### HTTPS Enforcement

- All sites enforce HTTPS through GitHub Pages settings
- Mixed content issues prevented by using HTTPS for all resources
- Subresource Integrity (SRI) recommended for external dependencies

## Monitoring and Analytics

### Site Health Monitoring

```javascript
// Basic health check for shared modules
async function checkModuleHealth() {
  try {
    const response = await fetch('https://mdsite.daza.ar/mdsite.js');
    return response.ok;
  } catch (error) {
    console.error('Module health check failed:', error);
    return false;
  }
}
```

### Performance Considerations

- Shared modules are cached by browsers across sites
- GitHub Pages CDN provides global distribution
- Monitor Core Web Vitals for each subdomain
- Consider HTTP/2 push for critical shared resources

## Best Practices

1. **Version Shared Modules**: Use versioned URLs for breaking changes
2. **Implement Fallbacks**: Handle network failures gracefully  
3. **Test Across Sites**: Changes to shared modules affect all sites
4. **Monitor Dependencies**: Track external CDN dependencies
5. **Document APIs**: Maintain clear documentation for shared modules
6. **Use Semantic Versioning**: Tag releases for shared modules
7. **Test Deployment**: Use staging environments for major changes

## Future Enhancements

- Consider implementing versioned shared module URLs
- Add automated cross-site testing for shared module changes
- Implement deployment orchestration for coordinated releases
- Add performance monitoring and alerting
- Consider moving to a monorepo structure if complexity grows

---

This deployment architecture demonstrates how to build scalable, maintainable static site ecosystems using GitHub Pages while maintaining the KISS principle and minimal operational overhead.