# Environment Configuration System

This document explains how to use the environment configuration system for the daza.ar ecosystem. The system automatically detects whether you're running in production or local development and provides the appropriate URLs.

## Overview

The environment configuration system allows you to:

- Use production URLs (`https://*.daza.ar`) when deployed to GitHub Pages
- Use local development URLs (`http://*.local:port`) when running locally
- **Hybrid approach**: Selectively use local or production resources as needed
- Fallback to production URLs when local resources aren't available
- Maintain consistent development workflow across all sites

## Quick Start

### Approach 1: Simple (Recommended)

Keep using production URLs by default - they work in both environments:

```javascript
// This works in both production and development
const { initMdsite } = await import('https://mdsite.daza.ar/mdsite.js');
```

### Approach 2: Hybrid Environment-Aware

For selective local development, include the environment config:

```html
<script src="env-config.umd.js"></script>
```

Then use environment-aware URLs selectively:

```javascript
const { getUrl } = window.DazaEnvConfig;
const { initMdsite } = await import(getUrl('https://mdsite.daza.ar/mdsite.js'));
```

### Approach 3: Custom Strategy

Create your own resource loading strategy with fallbacks:

```javascript
async function loadResourceWithFallback(primaryUrl, fallbackUrl) {
  try {
    const response = await fetch(primaryUrl, { method: 'HEAD' });
    if (response.ok) return primaryUrl;
    throw new Error(`HTTP ${response.status}`);
  } catch (error) {
    console.warn(`Falling back from ${primaryUrl} to ${fallbackUrl}`);
    return fallbackUrl;
  }
}
```

## Environment Detection

The system automatically detects the environment based on:

- Hostname contains `.local`
- Hostname is `localhost` or `127.0.0.1`
- Port is specified (not default 80/443)
- Protocol is `file:`

## API Reference

### `getUrl(productionUrl)`

Transforms a production URL to the appropriate environment URL.

```javascript
const { getUrl } = window.DazaEnvConfig;

// In production: returns 'https://mdsite.daza.ar/mdsite.js'
// In development: returns 'http://mdsite.local:3005/mdsite.js'
const scriptUrl = getUrl('https://mdsite.daza.ar/mdsite.js');
```

### `getSiteUrl(siteName)`

Gets the base URL for a specific site.

```javascript
const { getSiteUrl } = window.DazaEnvConfig;

// In production: returns 'https://cv.daza.ar'
// In development: returns 'http://cv.local:3001'
const cvUrl = getSiteUrl('cv');
```

### `getEnvironmentInfo()`

Returns detailed environment information.

```javascript
const { getEnvironmentInfo } = window.DazaEnvConfig;

const info = getEnvironmentInfo();
console.log(info);
// {
//   isDevelopment: true,
//   isProduction: false,
//   hostname: 'cv.local',
//   port: '3001',
//   protocol: 'http:',
//   environment: 'development'
// }
```

### `transformUrlsInConfig(config)`

Recursively transforms all URLs in a configuration object.

```javascript
const { transformUrlsInConfig } = window.DazaEnvConfig;

const config = {
  markdownUrl: 'https://data.daza.ar/md/cv.md',
  scripts: [
    'https://mdsite.daza.ar/mdsite.js',
    'https://navbar.daza.ar/navbar.js',
  ],
};

const envConfig = transformUrlsInConfig(config);
// URLs are automatically transformed based on environment
```

### `urls` Helper Object

Pre-configured URL helpers for common resources:

```javascript
const { urls } = window.DazaEnvConfig;

// MDSite resources
const mdsiteJs = urls.mdsite.js(); // https://mdsite.daza.ar/mdsite.js or http://mdsite.local:3005/mdsite.js
const mdsiteCss = urls.mdsite.css(); // https://mdsite.daza.ar/mdsite.css or http://mdsite.local:3005/mdsite.css

// Navbar resources
const navbarJs = urls.navbar.js(); // https://navbar.daza.ar/navbar.js or http://navbar.local:3004/navbar.js
const navbarCss = urls.navbar.css(); // https://navbar.daza.ar/navbar.css or http://navbar.local:3004/navbar.css

// Data resources
const cvData = urls.data.cv(); // https://data.daza.ar/md/cv.md or http://data.local:3006/md/cv.md

// Site URLs
const cvSite = urls.sites.cv(); // https://cv.daza.ar or http://cv.local:3001
```

## Migration Examples

### Example 1: CV Site

Before:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
  </head>
  <body>
    <script type="module">
      import { initMdsite } from 'https://mdsite.daza.ar/mdsite.js';

      initMdsite({
        markdownUrl: 'https://data.daza.ar/md/cv.md',
        // ... other config
      });
    </script>
  </body>
</html>
```

After:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <script src="env-config.umd.js"></script>
  </head>
  <body>
    <script type="module">
      const { getUrl } = window.DazaEnvConfig;
      const { initMdsite } = await import(
        getUrl('https://mdsite.daza.ar/mdsite.js')
      );

      initMdsite({
        markdownUrl: getUrl('https://data.daza.ar/md/cv.md'),
        // ... other config
      });
    </script>
  </body>
</html>
```

### Example 2: Dynamic Resource Loading

```javascript
// Load CSS dynamically
const { getUrl } = window.DazaEnvConfig;

const navbarCss = document.createElement('link');
navbarCss.rel = 'stylesheet';
navbarCss.href = getUrl('https://navbar.daza.ar/navbar.css');
document.head.appendChild(navbarCss);

// Load JavaScript dynamically
const navbarScript = document.createElement('script');
navbarScript.src = getUrl('https://navbar.daza.ar/navbar.js');
document.head.appendChild(navbarScript);
```

### Example 3: Configuration Object

```javascript
const { transformUrlsInConfig } = window.DazaEnvConfig;

const config = {
  title: 'My Site',
  resources: {
    markdown: 'https://data.daza.ar/md/content.md',
    scripts: [
      'https://mdsite.daza.ar/mdsite.js',
      'https://navbar.daza.ar/navbar.js',
    ],
  },
  links: [
    { href: 'https://cv.daza.ar', label: 'CV' },
    { href: 'https://start.daza.ar', label: 'Start' },
  ],
};

// Transform all URLs in the configuration
const envConfig = transformUrlsInConfig(config);
```

## Development Workflow

### 1. Local Development

When running `npm run dev` or `./dev.sh`:

- Sites are served on `http://*.local:port`
- Environment system automatically detects local development
- All `*.daza.ar` URLs are transformed to local equivalents

### 2. Production Deployment

When deployed to GitHub Pages:

- Sites are served on `https://*.daza.ar`
- Environment system detects production environment
- All URLs remain as production URLs

### 3. Testing Both Environments

```javascript
// Force environment detection (for testing)
const { getEnvironmentInfo } = window.DazaEnvConfig;

const env = getEnvironmentInfo();
console.log(`Current environment: ${env.environment}`);
console.log(`Is development: ${env.isDevelopment}`);
console.log(`Is production: ${env.isProduction}`);
```

## Site Configuration

The following sites are configured in the system:

| Site Name                         | Production URL                                    | Development URL                                     |
| --------------------------------- | ------------------------------------------------- | --------------------------------------------------- |
| cv                                | https://cv.daza.ar                                | http://cv.local:3001                                |
| onepager                          | https://onepager.daza.ar                          | http://onepager.local:3002                          |
| start                             | https://start.daza.ar                             | http://start.local:3003                             |
| navbar                            | https://navbar.daza.ar                            | http://navbar.local:3004                            |
| mdsite                            | https://mdsite.daza.ar                            | http://mdsite.local:3005                            |
| data                              | https://data.daza.ar                              | http://data.local:3006                              |
| wallpapers                        | https://wallpapers.daza.ar                        | http://wallpapers.local:3007                        |
| laboratoriodeprogramacioncreativa | https://laboratoriodeprogramacioncreativa.daza.ar | http://laboratoriodeprogramacioncreativa.local:3008 |
| spanishlessons                    | https://spanishlessons.daza.ar                    | http://spanishlessons.local:3009                    |

## Troubleshooting

### CORS Issues in Development

**Problem**: Cross-origin requests between local sites (e.g., `onepager.local:3002` trying to load from `mdsite.local:3005`)

**Solutions**:

1. **Use production URLs** (recommended): They work in both environments
2. **Use hybrid approach**: Fallback to production when local resources fail
3. **Ensure all servers are running**: `./dev.sh` starts all development servers

### Environment Not Detected Correctly

Check the console for environment info:

```javascript
const { getEnvironmentInfo } = window.DazaEnvConfig;
console.log(getEnvironmentInfo());
```

### URLs Not Transforming

Ensure the environment config script is loaded before your main script:

```html
<script src="env-config.umd.js"></script>
<script type="module">
  const { getUrl } = window.DazaEnvConfig;
  // Your code here
</script>
```

### Resources Not Loading

If local resources aren't loading:

1. Check if the target development server is running
2. Verify the resource exists in the target site
3. Use browser dev tools to check network requests
4. Consider using production URLs as fallback

### Adding New Sites

To add a new site to the configuration:

1. Update `SITE_CONFIG` in `lib/env-config.js` and `lib/env-config.umd.js`
2. Add the site to `sites.config.json`
3. Add the dev script to `package.json`

## Best Practices

1. **Start simple**: Use production URLs by default - they work everywhere
2. **Use environment-aware URLs selectively** for resources you're actively developing
3. **Implement fallback strategies** for better reliability
4. **Keep external URLs unchanged** (e.g., CDN resources, third-party APIs)
5. **Test in both environments** before deploying
6. **Use the `urls` helper object** for common resources
7. **Handle CORS gracefully** with production fallbacks

### Recommended Patterns

```javascript
// ✅ Good: Production URLs (works everywhere)
const { initMdsite } = await import('https://mdsite.daza.ar/mdsite.js');

// ✅ Good: Hybrid with fallback
const { getUrl } = window.DazaEnvConfig;
const mdsiteUrl = await loadResourceWithFallback(
  getUrl('https://mdsite.daza.ar/mdsite.js'),
  'https://mdsite.daza.ar/mdsite.js'
);

// ⚠️ Caution: Local URLs only (might fail in development)
const { initMdsite } = await import('http://mdsite.local:3005/mdsite.js');
```

## Files

- `lib/env-config.js` - ES Module version (master copy)
- `lib/env-config.umd.js` - UMD version for script tags (master copy)
- `sites/*/env-config.umd.js` - Local copies in each site directory
- `sites.config.json` - Site configuration
- `sync-env-config.sh` - Script to copy environment config to all sites
- `sites/*/hybrid-example.html` - Practical hybrid approach example
- `ENVIRONMENT_CONFIG.md` - This documentation

The environment configuration system ensures your sites work seamlessly in both development and production environments without requiring manual URL changes.
