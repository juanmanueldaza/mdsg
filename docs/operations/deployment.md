# 🚀 MDSG Deployment Guide

> Complete guide for deploying MDSG to production environments with best
> practices and optimization strategies.

## 🎯 Deployment Overview

MDSG is a **client-side static application** that can be deployed to any static
hosting provider. This guide covers deployment strategies, optimization
techniques, and production considerations.

### 🌐 Supported Hosting Platforms

| Platform                | ✅ Free Tier | 🚀 Performance | 🔧 Setup Complexity | 🌍 CDN     |
| ----------------------- | ------------ | -------------- | ------------------- | ---------- |
| **GitHub Pages**        | ✅           | ⭐⭐⭐         | ⭐                  | ⭐⭐       |
| **Netlify**             | ✅           | ⭐⭐⭐⭐⭐     | ⭐⭐                | ⭐⭐⭐⭐⭐ |
| **Vercel**              | ✅           | ⭐⭐⭐⭐⭐     | ⭐⭐                | ⭐⭐⭐⭐⭐ |
| **Cloudflare Pages**    | ✅           | ⭐⭐⭐⭐⭐     | ⭐⭐                | ⭐⭐⭐⭐⭐ |
| **AWS S3 + CloudFront** | 💰           | ⭐⭐⭐⭐⭐     | ⭐⭐⭐⭐            | ⭐⭐⭐⭐⭐ |

## 🚀 Quick Deployment

### GitHub Pages (Recommended for Beginners)

**✅ Pros:** Free, integrated with GitHub, zero configuration **❌ Cons:**
Limited custom domains on free tier

```bash
# 1. Build the application
npm run build

# 2. Enable GitHub Pages in repository settings
# Settings → Pages → Source: Deploy from a branch
# Branch: main, Folder: / (root)

# 3. Access your site at:
# https://yourusername.github.io/mdsg
```

### Netlify (Recommended for Production)

**✅ Pros:** Excellent performance, form handling, serverless functions **❌
Cons:** None for static sites

```bash
# Option 1: Drag and drop (Quick start)
npm run build
# Drag the built files to netlify.com/drop

# Option 2: Git integration (Recommended)
# 1. Connect your GitHub repository
# 2. Build command: npm run build
# 3. Publish directory: dist
# 4. Deploy!
```

### Vercel (Recommended for Performance)

**✅ Pros:** Edge network, excellent DX, automatic optimizations **❌ Cons:**
Focused on Next.js (but works great for static sites)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts:
# ? Set up and deploy "mdsg"? Y
# ? In which directory is your code located? ./
# ? Want to override the settings? N
```

## 🏗️ Production Build Process

### 1. **Pre-deployment Checklist**

```bash
# Quality gates - ALL must pass
npm test              # ✅ 191/191 tests pass
npm run lint          # ✅ 0 ESLint errors
npm run format        # ✅ Prettier formatting
npm run build         # ✅ Successful build
npx bundlesize        # ✅ Bundle ≤ 20KB
```

### 2. **Build Optimization**

```bash
# Production build with optimizations
npm run build

# This runs:
# - Vite production build
# - Code minification
# - Asset optimization
# - Bundle analysis
```

**Build Output:**

```
dist/
├── index.html              # Entry point
├── assets/
│   ├── main-[hash].js      # Application bundle
│   ├── style-[hash].css    # Styles
│   └── [assets]            # Images, fonts, etc.
└── favicon.ico             # Site icon
```

### 3. **Bundle Analysis**

```bash
# Analyze bundle composition
npm run build:analyze

# Check specific metrics
npx bundlesize --config bundlesize.config.json
```

**Current Bundle Metrics:**

- **JavaScript Bundle:** ~18.5KB gzipped
- **CSS Bundle:** ~1.2KB gzipped
- **Total Bundle:** ~19.7KB gzipped ✅
- **Target:** ≤ 20KB gzipped

## 🔧 Platform-Specific Configuration

### GitHub Pages

#### Manual Setup

```bash
# 1. Build for production
npm run build

# 2. Copy files to repository root or docs/ folder
cp -r dist/* .
# OR
cp -r dist/* docs/

# 3. Commit and push
git add .
git commit -m "deploy: update GitHub Pages"
git push origin main
```

#### Automated Deployment (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build application
        run: npm run build

      - name: Deploy to Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### Netlify

#### Manual Deployment

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
npm run build
netlify deploy --prod --dir=dist
```

#### Netlify Configuration (`netlify.toml`)

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.github.com"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Vercel

#### Vercel Configuration (`vercel.json`)

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.github.com"
        }
      ]
    }
  ]
}
```

### Cloudflare Pages

#### Configuration (`_headers`)

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.github.com
```

#### Configuration (`_redirects`)

```
/*    /index.html   200
```

## 🔒 Security Configuration

### Content Security Policy (CSP)

**Recommended CSP Header:**

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://api.github.com;
  frame-ancestors 'none';
```

**Why these directives:**

- `default-src 'self'` - Only load resources from same origin
- `script-src 'self' 'unsafe-inline'` - Allow inline scripts (required for
  dynamic imports)
- `connect-src 'self' https://api.github.com` - Allow GitHub API calls
- `frame-ancestors 'none'` - Prevent clickjacking

### Security Headers

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### HTTPS Configuration

**All production deployments MUST use HTTPS:**

- GitHub Pages: Automatic HTTPS with custom domains
- Netlify: Automatic HTTPS with Let's Encrypt
- Vercel: Automatic HTTPS with custom domains
- Cloudflare: Automatic HTTPS with universal SSL

## 🚀 Performance Optimization

### 1. **Asset Optimization**

#### Image Optimization

```bash
# Optimize images before deployment
npm install -g imagemin-cli

# Compress images
imagemin public/images/* --out-dir=dist/images --plugin=imagemin-mozjpeg --plugin=imagemin-pngquant
```

#### Font Optimization

```css
/* Use system fonts for better performance */
body {
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
```

### 2. **Caching Strategy**

#### Static Assets

```
# Immutable assets (with content hash)
/assets/*           Cache-Control: public, immutable, max-age=31536000

# HTML files
/*.html             Cache-Control: public, max-age=0, must-revalidate

# Service worker
/sw.js              Cache-Control: public, max-age=0
```

#### CDN Configuration

```javascript
// Vite build configuration for CDN
export default {
  build: {
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash].[ext]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
};
```

### 3. **Bundle Optimization**

#### Code Splitting

```javascript
// Dynamic imports for large features
const deploymentService = await import('./services/deployment.js');

// Preload critical modules
const link = document.createElement('link');
link.rel = 'modulepreload';
link.href = './services/auth.js';
document.head.appendChild(link);
```

#### Tree Shaking

```javascript
// Good: Import only what you need
import { sanitizeHTML } from './utils/security-minimal.js';

// Bad: Import everything
import * as Security from './utils/security-minimal.js';
```

## 📊 Monitoring & Analytics

### 1. **Core Web Vitals**

Monitor these metrics in production:

- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1

### 2. **Performance Monitoring**

#### Web Analytics

```html
<!-- Google Analytics 4 (GDPR compliant) -->
<script
  async
  src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID', {
    anonymize_ip: true,
    cookie_flags: 'secure;samesite=strict',
  });
</script>
```

#### Error Monitoring

```javascript
// Simple error tracking
window.addEventListener('error', event => {
  console.error('Application Error:', {
    message: event.error.message,
    stack: event.error.stack,
    filename: event.filename,
    lineno: event.lineno,
  });

  // Send to monitoring service
  if (window.gtag) {
    gtag('event', 'exception', {
      description: event.error.message,
      fatal: false,
    });
  }
});
```

### 3. **Bundle Analysis**

```bash
# Generate bundle report
npm run build:analyze

# Check bundle size
npx bundlesize

# Analyze dependencies
npx depcheck
```

## 🔄 CI/CD Pipeline

### GitHub Actions (Recommended)

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run lint

      - name: Run tests
        run: npm test

      - name: Check bundle size
        run: npx bundlesize

      - name: Build application
        run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### Deployment Scripts

```bash
#!/bin/bash
# scripts/deploy.sh

set -e  # Exit on any error

echo "🚀 Starting deployment process..."

# Run quality gates
echo "🔍 Running tests..."
npm test

echo "🔧 Checking code quality..."
npm run lint

echo "📦 Building application..."
npm run build

echo "📊 Checking bundle size..."
npx bundlesize

echo "🌐 Deploying to production..."
# Platform-specific deployment command
netlify deploy --prod --dir=dist

echo "✅ Deployment complete!"
```

## 🐛 Troubleshooting

### Common Deployment Issues

#### 1. **Bundle Size Too Large**

```bash
# Check what's in your bundle
npm run build:analyze

# Common solutions:
# - Remove unused dependencies
# - Use dynamic imports
# - Optimize images
# - Remove console.log statements
```

#### 2. **CSP Violations**

```javascript
// Check browser console for CSP errors
// Common fixes:
// - Add missing directives to CSP header
// - Remove inline scripts
// - Whitelist required domains
```

#### 3. **404 Errors on SPA Routes**

```
# Solution: Configure redirects
# Netlify: _redirects file
/*    /index.html   200

# Vercel: vercel.json
{
  "routes": [{ "src": "/(.*)", "dest": "/index.html" }]
}
```

#### 4. **GitHub API Limits**

```javascript
// Check API rate limits
fetch('https://api.github.com/rate_limit', {
  headers: {
    Authorization: `token ${token}`,
  },
})
  .then(response => response.json())
  .then(data => console.log('Rate limit:', data));
```

### Performance Issues

#### Slow Loading

- **Check bundle size** - Should be ≤ 20KB
- **Optimize images** - Use WebP format
- **Enable compression** - Gzip/Brotli
- **Use CDN** - Distribute assets globally

#### Memory Leaks

- **Check event listeners** - Proper cleanup
- **Monitor DOM references** - Avoid storing elements
- **Service lifecycle** - Proper initialization/destruction

## 📈 Scaling Considerations

### 1. **Multi-Environment Strategy**

```bash
# Development
npm run dev
# → localhost:3000

# Staging
npm run build:staging
# → staging.mdsg.app

# Production
npm run build:production
# → mdsg.app
```

### 2. **Feature Flags**

```javascript
// Environment-based features
const features = {
  analyticsEnabled: process.env.NODE_ENV === 'production',
  debugMode: process.env.NODE_ENV === 'development',
  betaFeatures: process.env.ENVIRONMENT === 'staging',
};
```

### 3. **CDN Strategy**

- **Static assets** - Serve from CDN
- **API calls** - Direct to GitHub API
- **Images** - Optimize and serve from CDN
- **Fonts** - Use system fonts or CDN fonts

## 🔐 Security Checklist

### Pre-Deployment Security Review

- [ ] **CSP headers configured** properly
- [ ] **HTTPS enforced** on all environments
- [ ] **Security headers** implemented
- [ ] **Input validation** in place
- [ ] **XSS prevention** tested
- [ ] **Token handling** secure
- [ ] **Dependencies scanned** for vulnerabilities
- [ ] **Error handling** doesn't leak sensitive info

### Security Monitoring

```bash
# Scan for vulnerabilities
npm audit

# Check dependencies
npm audit fix

# Security headers test
curl -I https://your-domain.com
```

## 📚 Additional Resources

### Deployment Guides

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Netlify Documentation](https://docs.netlify.com/)
- [Vercel Documentation](https://vercel.com/docs)
- [Cloudflare Pages](https://developers.cloudflare.com/pages/)

### Performance Resources

- [Web.dev Performance](https://web.dev/performance/)
- [Core Web Vitals](https://web.dev/vitals/)
- [Bundle Analysis Tools](https://bundlephobia.com/)

### Security Resources

- [OWASP Security Headers](https://owasp.org/www-project-secure-headers/)
- [CSP Guide](https://content-security-policy.com/)
- [Security Headers Test](https://securityheaders.com/)

---

**🚀 Deployment Motto:** _"Deploy fast, deploy secure, deploy with confidence."_

This guide ensures your MDSG deployment is optimized, secure, and
production-ready! 🌟
