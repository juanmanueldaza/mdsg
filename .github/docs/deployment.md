# MDSG Deployment Guide

## 🤖 Agent Navigation Hub

**Primary Reference**: `../copilot-instructions.md` → Deployment section
**Cross-References**: 
- `architecture.md` → Frontend-only architecture patterns
- `security.md` → Security deployment configuration
- `performance.md` → Production optimization
- `api.md` → GitHub API integration

## Overview

This guide covers deploying MDSG (Markdown Site Generator) as a **frontend-only static site** to GitHub Pages. MDSG is currently live at **https://mdsg.daza.ar/** and requires no backend server in production.

> **Agent Alert**: Frontend-only deployment - no backend server required in production
> **Live Site**: https://mdsg.daza.ar/ (GitHub Pages with custom domain)
> **Architecture**: Static site with direct GitHub OAuth integration

## Table of Contents

- [Current Production Setup](#current-production-setup)
- [GitHub Pages Deployment](#github-pages-deployment)
- [Custom Domain Configuration](#custom-domain-configuration)
- [Frontend-Only Architecture](#frontend-only-architecture)
- [Development Server (Optional)](#development-server-optional)
- [Security Configuration](#security-configuration)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)

## Current Production Setup

**Live Site**: https://mdsg.daza.ar/
**Hosting**: GitHub Pages (static site)
**Domain**: Custom domain via CNAME file
**Architecture**: Frontend-only, no backend server
**Authentication**: Direct GitHub OAuth (Personal Access Token)
**Deployment**: Automatic via GitHub Actions on push to main

### Production Characteristics
- ✅ Zero server maintenance required
- ✅ Auto-scaling via GitHub's CDN
- ✅ SSL/TLS handled by GitHub Pages
- ✅ Custom domain support
- ✅ Automatic deployments from repository

## GitHub Pages Deployment

### Current Working Setup (mdsg.daza.ar)

The production site uses GitHub Pages with automated deployment:

1. **Repository**: https://github.com/juanmanueldaza/mdsg
2. **Build Process**: Vite static site build
3. **Deployment**: GitHub Actions workflow
4. **Custom Domain**: mdsg.daza.ar via CNAME file
5. **SSL**: Automatic via GitHub Pages

### Deployment Workflow

```yaml
# .github/workflows/deploy-pages.yml (current working config)
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20.x'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
  
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/deploy-pages@v4
```

### Prerequisites for Your Own Deployment
- GitHub repository
- GitHub Pages enabled
- Node.js 18.x+ for local development
- Optional: Custom domain name

## Environment Setup

### Environment Variables

Create production environment variables:

```bash
# GitHub OAuth Configuration (Required)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Security (Required)
JWT_SECRET=your_jwt_secret_min_32_chars

# Server Configuration
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-frontend-domain.com

# Optional: Database (for future features)
DATABASE_URL=postgresql://user:pass@host:port/db
REDIS_URL=redis://user:pass@host:port
```

### Generate Secure JWT Secret

```bash
# Generate a secure JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Frontend Deployment

### Option 1: GitHub Pages (Recommended)

#### Automatic Deployment

1. **Fork or clone the repository**
   ```bash
   git clone https://github.com/juanmanueldaza/mdsg.git
   cd mdsg
   ```

2. **Configure build settings**
   ```bash
   # Update vite.config.js for your domain
   export default defineConfig({
     base: '/', // Keep as root for custom domain
     build: {
       outDir: 'dist',
       target: 'es2020',
       minify: true,
       sourcemap: false,
     },
   });
   ```

3. **Set up GitHub Pages**
   - Go to repository Settings → Pages
   - Source: GitHub Actions
   - The CI/CD pipeline will automatically deploy on push to main

4. **Custom domain setup** (optional)
   - Add `CNAME` file with your domain
   - Configure DNS to point to GitHub Pages

#### Manual Deployment

```bash
# Build the application
npm run build

# Deploy to GitHub Pages manually
npm install -g gh-pages
gh-pages -d dist
```

### Option 2: Static Site Hosting

#### Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   # Build first
   npm run build
   
   # Deploy
   vercel --prod
   ```

3. **Configure vercel.json**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```

#### Netlify

1. **Connect repository** to Netlify
2. **Build settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **Environment variables**: Add frontend-specific vars if needed

#### Cloudflare Pages

1. **Connect GitHub repository**
2. **Build configuration**:
   - Framework preset: None
   - Build command: `npm run build`
   - Build output directory: `dist`

## Backend Deployment

### Option 1: Railway (Recommended)

1. **Connect repository** to Railway
2. **Environment variables**: Set all required variables
3. **Deploy configuration**:
   ```json
   {
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "npm run server"
     }
   }
   ```

### Option 2: Heroku

1. **Create Heroku app**
   ```bash
   heroku create your-mdsg-api
   ```

2. **Set environment variables**
   ```bash
   heroku config:set GITHUB_CLIENT_ID=your_client_id
   heroku config:set GITHUB_CLIENT_SECRET=your_client_secret
   heroku config:set JWT_SECRET=your_jwt_secret
   heroku config:set NODE_ENV=production
   heroku config:set FRONTEND_URL=https://your-frontend-domain.com
   ```

3. **Configure Procfile**
   ```
   web: node server.js
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

### Option 3: DigitalOcean App Platform

1. **Create app** from GitHub repository
2. **Configure build and run commands**:
   - Build: `npm install`
   - Run: `npm run server`
3. **Set environment variables** in the control panel
4. **Configure HTTP routes** for the API endpoints

### Option 4: AWS (Advanced)

#### Using AWS App Runner

1. **Create apprunner.yaml**
   ```yaml
   version: 1.0
   runtime: nodejs16
   build:
     commands:
       build:
         - npm install
   run:
     runtime-version: 16
     command: npm run server
     network:
       port: 3000
       env: PORT
   ```

2. **Deploy via AWS Console** or CLI

#### Using Elastic Beanstalk

1. **Install EB CLI**
   ```bash
   pip install awsebcli
   ```

2. **Initialize and deploy**
   ```bash
   eb init
   eb create production
   eb deploy
   ```

### Option 5: Self-Hosted (VPS)

#### Server Setup

1. **Prepare server** (Ubuntu/Debian)
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2 for process management
   sudo npm install -g pm2
   ```

2. **Deploy application**
   ```bash
   # Clone repository
   git clone https://github.com/your-username/mdsg.git
   cd mdsg
   
   # Install dependencies
   npm install --production
   
   # No environment configuration needed - frontend-only static site
   ```

3. **Configure PM2**
   ```javascript
   // ecosystem.config.js
   module.exports = {
     apps: [{
       name: 'mdsg-api',
       script: 'server.js',
       env_production: {
         NODE_ENV: 'production',
         PORT: 3000
       }
     }]
   };
   ```

4. **Start with PM2**
   ```bash
   pm2 start ecosystem.config.js --env production
   pm2 save
   pm2 startup
   ```

5. **Configure Nginx** (reverse proxy)
   ```nginx
   # /etc/nginx/sites-available/mdsg-api
   server {
       listen 80;
       server_name api.your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

6. **SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d api.your-domain.com
   ```

## Domain Configuration

### DNS Setup

#### Frontend Domain
```
Type: A
Name: @
Value: [GitHub Pages IP or hosting provider IP]

Type: CNAME
Name: www
Value: your-domain.com
```

#### API Domain
```
Type: A
Name: api
Value: [Backend server IP]

Type: CNAME
Name: api
Value: [Hosting service domain] # For hosted solutions
```

### SSL Certificates

#### Let's Encrypt (Free)
```bash
# For self-hosted
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
sudo certbot --nginx -d api.your-domain.com
```

#### Cloudflare (Recommended)
1. Add domain to Cloudflare
2. Update nameservers
3. Enable "Full (strict)" SSL mode
4. Enable "Always Use HTTPS"

## Security Configuration

### Production Security Checklist

#### Backend Security
- [ ] Environment variables set securely
- [ ] JWT secret is cryptographically secure (32+ chars)
- [ ] CORS configured with specific origins
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] HTTPS enforced
- [ ] No sensitive data in logs

#### Frontend Security
- [ ] Content Security Policy (CSP) configured
- [ ] HTTPS enforced
- [ ] No hardcoded secrets
- [ ] Input validation on all forms
- [ ] XSS protection enabled

### Content Security Policy

```html
<!-- Add to index.html for production -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://api.github.com https://your-api-domain.com;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
">
```

### Security Headers (Backend)

```javascript
// Additional security headers for production
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  next();
});
```

## Monitoring & Maintenance

### Health Checks

#### Backend Health Check
```bash
# Manual health check
curl https://api.your-domain.com/health

# Expected response
{
  "status": "ok",
  "timestamp": "2023-12-07T10:30:00.000Z",
  "environment": "production"
}
```

#### Automated Monitoring

##### UptimeRobot Setup
1. Create account at UptimeRobot
2. Add HTTP monitor for `https://your-domain.com`
3. Add HTTP monitor for `https://api.your-domain.com/health`
4. Configure alerts via email/SMS

##### Pingdom Setup
1. Add website monitoring
2. Set up alerts for downtime
3. Monitor response times

### Logging

#### Production Logging (Backend)
```javascript
// Use structured logging in production
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'mdsg-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### Performance Monitoring

#### Frontend Performance
```javascript
// Add to main.js for performance monitoring
if (typeof window !== 'undefined' && 'performance' in window) {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const nav = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');
      
      console.log('Load Time:', nav.loadEventEnd - nav.loadEventStart);
      console.log('DOMContentLoaded:', nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart);
      
      if (paint.length > 0) {
        console.log('First Paint:', paint[0].startTime);
      }
    }, 0);
  });
}
```

### Backup Strategy

#### Code Backup
- Repository mirrored on GitHub
- Tagged releases for rollback
- Environment variables backed up securely

#### Data Backup (if applicable)
```bash
# For future database features
# Automated daily backups
0 2 * * * /usr/local/bin/backup-script.sh
```

## Troubleshooting

### Common Issues

#### OAuth Callback Errors
```
Error: "OAuth callback failed"
Solution:
1. Verify GitHub OAuth app callback URL matches exactly
2. Check GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET
3. Ensure CORS is configured correctly
4. Verify HTTPS is working
```

#### CORS Issues
```
Error: "Access blocked by CORS policy"
Solution:
1. Add frontend domain to CORS origin list
2. Verify protocol (http vs https) matches
3. Check for trailing slashes in URLs
```

#### Rate Limiting
```
Error: "Rate limit exceeded"
Solution:
1. Implement exponential backoff in frontend
2. Check GitHub API rate limits
3. Consider caching responses
```

#### SSL Certificate Issues
```
Error: "SSL certificate invalid"
Solution:
1. Verify certificate covers all domains (www, api)
2. Check certificate expiration
3. Ensure certificate chain is complete
```

### Debug Mode

#### Enable Debug Logging
```bash
# Backend debug mode
DEBUG=mdsg:* npm run server

# Frontend debug mode
localStorage.setItem('debug', 'true');
```

#### Performance Debugging
```bash
# Run performance analysis
npm run perf

# Check bundle sizes
npm run bundle-size

# Lighthouse audit
npm run lighthouse
```

### Rollback Procedure

#### Frontend Rollback
```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or deploy specific version
git checkout v1.0.0
npm run build
# Deploy build output
```

#### Backend Rollback
```bash
# PM2 rollback (self-hosted)
pm2 stop mdsg-api
git checkout previous-tag
npm install
pm2 start mdsg-api

# Heroku rollback
heroku rollback v123

# Railway rollback
# Use web interface to redeploy previous version
```

## Production Checklist

### Pre-Deployment
- [ ] All environment variables configured
- [ ] GitHub OAuth app configured correctly
- [ ] SSL certificates installed
- [ ] DNS records configured
- [ ] CORS origins updated
- [ ] Security headers enabled
- [ ] Rate limiting configured
- [ ] Monitoring set up

### Post-Deployment
- [ ] Health checks passing
- [ ] OAuth flow working
- [ ] Site deployment working
- [ ] Error monitoring active
- [ ] Performance metrics baseline established
- [ ] Backup procedures tested
- [ ] Documentation updated

### Regular Maintenance
- [ ] Security updates applied monthly
- [ ] SSL certificates renewed (if manual)
- [ ] Log rotation configured
- [ ] Performance metrics reviewed
- [ ] Backup integrity verified
- [ ] Dependencies updated quarterly

## Scaling Considerations

### Horizontal Scaling
```javascript
// Use Redis for session storage across instances
const session = require('express-session');
const RedisStore = require('connect-redis')(session);

app.use(session({
  store: new RedisStore({ url: process.env.REDIS_URL }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
```

### CDN Configuration
```javascript
// Configure CDN for static assets
const CDN_URL = process.env.CDN_URL || '';

// Update asset URLs in production
if (process.env.NODE_ENV === 'production' && CDN_URL) {
  // Serve static files from CDN
}
```

### Database Migration (Future)
```javascript
// When adding database features
const DATABASE_URL = process.env.DATABASE_URL;

if (DATABASE_URL) {
  // Initialize database connection
  // Run migrations
  // Set up connection pooling
}
```

This deployment guide provides comprehensive instructions for deploying MDSG to production environments with proper security, monitoring, and maintenance procedures.