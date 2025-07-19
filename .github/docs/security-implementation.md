# MDSG Security Implementation Guide

**Document Version**: 1.0  
**Implementation Date**: January 19, 2025  
**Priority**: CRITICAL - Immediate implementation required  
**Related**: `security-audit.md` - Complete vulnerability assessment  

## 🚨 CRITICAL SECURITY FIXES - IMMEDIATE ACTION REQUIRED

This guide provides step-by-step implementation for fixing critical security vulnerabilities identified in the security audit. **These fixes must be implemented immediately before any new feature development.**

## 📋 Implementation Checklist

### **Phase 1: Critical Issues (Days 1-7)**
- [ ] 1. Fix XSS vulnerabilities via innerHTML sanitization
- [ ] 2. Implement secure token storage
- [ ] 3. Add Content Security Policy headers
- [ ] 4. Update vulnerable dependencies

### **Phase 2: High Priority (Days 8-14)**
- [ ] 5. Strengthen input validation
- [ ] 6. Add CSRF protection
- [ ] 7. Implement security headers
- [ ] 8. Add subresource integrity

### **Phase 3: Medium Priority (Days 15-30)**
- [ ] 9. Enhanced rate limiting
- [ ] 10. Security monitoring
- [ ] 11. Session management
- [ ] 12. Security documentation

## 🔥 Critical Fix #1: XSS Prevention

### Problem
Multiple `innerHTML` usages without sanitization allow XSS attacks:
```javascript
// VULNERABLE CODE - DO NOT USE
preview.innerHTML = this.markdownToHTML(this.content);
app.innerHTML = `<div class="container">...${userContent}...`;
```

### Solution: DOMPurify Integration

#### Step 1: Install DOMPurify
```bash
npm install dompurify
npm install --save-dev @types/dompurify
```

#### Step 2: Create Secure HTML Utility
Create `src/utils/security.js`:
```javascript
import DOMPurify from 'dompurify';

/**
 * Secure HTML sanitization utility
 */
export class SecureHTML {
  static sanitize(html, options = {}) {
    const defaultConfig = {
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'br', 'strong', 'em', 'u', 's',
        'code', 'pre', 'blockquote',
        'ul', 'ol', 'li',
        'a', 'img',
        'table', 'thead', 'tbody', 'tr', 'th', 'td'
      ],
      ALLOWED_ATTR: [
        'href', 'src', 'alt', 'title', 'class', 'id',
        'target', 'rel', 'loading'
      ],
      ALLOWED_URI_REGEXP: /^(?:(?:https?|ftp):\/\/|mailto:|#)/i,
      ADD_ATTR: ['target'],
      ADD_TAGS: [],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
      FORBID_TAGS: ['script', 'object', 'embed', 'iframe'],
      ...options
    };

    return DOMPurify.sanitize(html, defaultConfig);
  }

  static sanitizeAndRender(html, container, options = {}) {
    const clean = this.sanitize(html, options);
    container.innerHTML = clean;
  }

  static escapeText(text) {
    if (typeof text !== 'string') return '';
    
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
```

#### Step 3: Update main.js to Use Secure Rendering
Replace all innerHTML usage:

```javascript
// BEFORE (VULNERABLE)
preview.innerHTML = this.markdownToHTML(this.content);

// AFTER (SECURE)
import { SecureHTML } from './utils/security.js';

// In updatePreview method
updatePreview() {
  const preview = document.getElementById('markdown-preview');
  if (!preview) return;

  if (this.content.trim() === '') {
    const emptyHTML = `
      <div class="preview-empty">
        <p>✨ Start typing in the editor to see your markdown come to life!</p>
        <p>Try some basic formatting:</p>
        <ul>
          <li><strong>**bold text**</strong></li>
          <li><em>*italic text*</em></li>
          <li><code>\`code\`</code></li>
          <li><a href="#">[links](https://example.com)</a></li>
        </ul>
      </div>
    `;
    SecureHTML.sanitizeAndRender(emptyHTML, preview);
  } else {
    const sanitizedHTML = SecureHTML.sanitize(this.markdownToHTML(this.content));
    preview.innerHTML = sanitizedHTML;
  }
}

// Replace all other innerHTML usages
setupUI() {
  const app = document.getElementById('app');
  const safeHTML = `
    <div class="container">
      <header>
        <h1>📝 MDSG</h1>
        <p>Create GitHub Pages sites from markdown</p>
      </header>
      <main id="main-content">
        ${SecureHTML.escapeText('Loading...')}
      </main>
    </div>
  `;
  SecureHTML.sanitizeAndRender(safeHTML, app);
}
```

## 🔐 Critical Fix #2: Secure Token Storage

### Problem
GitHub tokens stored in localStorage are vulnerable to XSS attacks:
```javascript
// VULNERABLE - Accessible to any script
localStorage.setItem('github_token', token);
const token = localStorage.getItem('github_token');
```

### Solution: HttpOnly Cookies + Secure Session Management

#### Step 1: Update Server.js for Secure Token Handling
```javascript
// Add to server.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
const SESSION_COOKIE_NAME = 'mdsg_session';

// Secure session creation
function createSecureSession(githubToken, userInfo) {
  const payload = {
    github_token: githubToken,
    user_id: userInfo.id,
    user_login: userInfo.login,
    issued_at: Date.now(),
    expires_at: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

// Session validation middleware
function validateSession(req, res, next) {
  const sessionToken = req.cookies[SESSION_COOKIE_NAME];
  
  if (!sessionToken) {
    return res.status(401).json({ error: 'No session found' });
  }

  try {
    const session = jwt.verify(sessionToken, JWT_SECRET);
    req.session = session;
    next();
  } catch (error) {
    res.clearCookie(SESSION_COOKIE_NAME);
    return res.status(401).json({ error: 'Invalid session' });
  }
}

// Update OAuth callback
app.get('/auth/github/callback', rateLimit(), async (req, res) => {
  try {
    const { code } = req.query;
    
    // Exchange code for token (existing logic)
    const tokenData = await exchangeCodeForToken(code);
    const userInfo = await fetchGitHubUser(tokenData.access_token);
    
    // Create secure session
    const sessionToken = createSecureSession(tokenData.access_token, userInfo);
    
    // Set secure, httpOnly cookie
    res.cookie(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/'
    });

    // Redirect to frontend
    res.redirect(`${FRONTEND_URL}?auth=success`);
    
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect(`${FRONTEND_URL}?auth=error`);
  }
});

// Add session validation endpoint
app.get('/auth/validate', validateSession, (req, res) => {
  res.json({
    authenticated: true,
    user: {
      id: req.session.user_id,
      login: req.session.user_login
    }
  });
});

// Add secure logout
app.post('/auth/logout', (req, res) => {
  res.clearCookie(SESSION_COOKIE_NAME);
  res.json({ success: true });
});
```

#### Step 2: Update Frontend Authentication
```javascript
// In main.js - Replace localStorage token handling
class SecureAuth {
  constructor() {
    this.authenticated = false;
    this.user = null;
    // Remove token storage - now handled server-side
  }

  async checkAuth() {
    try {
      const response = await fetch('/auth/validate', {
        credentials: 'include' // Include cookies
      });

      if (response.ok) {
        const data = await response.json();
        this.authenticated = true;
        this.user = data.user;
        this.showEditor();
      } else {
        this.showLogin();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      this.showLogin();
    }
  }

  async logout() {
    try {
      await fetch('/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } finally {
      this.authenticated = false;
      this.user = null;
      this.showLogin();
    }
  }

  // Update all API calls to use session-based auth
  async makeAuthenticatedRequest(url, options = {}) {
    const config = {
      ...options,
      credentials: 'include', // Include session cookie
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const response = await fetch(url, config);
    
    if (response.status === 401) {
      // Session expired - redirect to login
      this.logout();
      throw new Error('Session expired');
    }

    return response;
  }
}
```

## 🛡️ Critical Fix #3: Content Security Policy

### Implementation
Add CSP headers to prevent script injection:

#### Step 1: Add CSP Middleware to Server.js
```javascript
// Add to server.js security headers section
app.use((req, res, next) => {
  // Existing headers...
  
  // Content Security Policy
  const cspPolicy = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'", // Remove 'unsafe-inline' after inline script cleanup
    "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://api.github.com https://github.com",
    "font-src 'self' https://cdnjs.cloudflare.com",
    "frame-ancestors 'none'",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'"
  ].join('; ');

  res.setHeader('Content-Security-Policy', cspPolicy);
  
  // Additional security headers
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  
  next();
});
```

#### Step 2: Add CSP Meta Tag for Static Deployment
Update `index.html`:
```html
<head>
  <!-- Existing meta tags... -->
  
  <!-- Content Security Policy -->
  <meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self' 'unsafe-inline';
    style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com;
    img-src 'self' data: https:;
    connect-src 'self' https://api.github.com https://github.com;
    frame-ancestors 'none';
    object-src 'none';
    base-uri 'self';
  ">
</head>
```

## 📦 Critical Fix #4: Dependency Updates

### Step 1: Update Package.json
```json
{
  "devDependencies": {
    "vite": "^5.4.10",
    "vitest": "^1.6.0",
    "@vitest/ui": "^1.6.0",
    "@vitest/coverage-v8": "^1.6.0",
    "eslint": "^8.57.0",
    "prettier": "^3.2.5",
    "terser": "^5.26.0"
  }
}
```

### Step 2: Update Dependencies Safely
```bash
# Backup current state
git add . && git commit -m "backup: before security updates"

# Update dependencies
npm update
npm audit fix

# Test after updates
npm run test
npm run build
npm run lint

# Verify functionality
npm run dev
```

## 🔒 High Priority Fix #5: Input Validation

### Enhanced Validation System
Create `src/utils/validation.js`:
```javascript
export class ValidationUtils {
  static validateRepositoryName(name) {
    if (typeof name !== 'string') return false;
    if (name.length === 0 || name.length > 100) return false;
    if (!/^[a-zA-Z0-9._-]+$/.test(name)) return false;
    if (name.startsWith('.') || name.startsWith('-')) return false;
    return true;
  }

  static validateMarkdownContent(content) {
    if (typeof content !== 'string') return false;
    if (content.length > 1000000) return false; // 1MB limit
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /<script[^>]*>/i,
      /javascript:/i,
      /vbscript:/i,
      /onload\s*=/i,
      /onerror\s*=/i
    ];
    
    return !suspiciousPatterns.some(pattern => pattern.test(content));
  }

  static validateGitHubToken(token) {
    if (typeof token !== 'string') return false;
    if (token.length < 20 || token.length > 100) return false;
    if (!/^[a-zA-Z0-9_]+$/.test(token)) return false;
    return true;
  }

  static validateURL(url) {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }

  static sanitizeFilename(filename) {
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '-')
      .replace(/--+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
```

### Apply Validation Throughout Application
```javascript
// In main.js - Update validation calls
async deployToGitHub() {
  // Enhanced validation
  if (!ValidationUtils.validateMarkdownContent(this.content)) {
    this.showError('Invalid content detected. Please check for suspicious elements.');
    return;
  }

  if (!ValidationUtils.validateRepositoryName(this.repoName)) {
    this.showError('Invalid repository name. Use only letters, numbers, dots, and hyphens.');
    return;
  }

  // Proceed with deployment...
}
```

## 🛡️ High Priority Fix #6: CSRF Protection

### Step 1: Add CSRF Token Generation
```javascript
// Add to server.js
const CSRF_SECRET = process.env.CSRF_SECRET || crypto.randomBytes(32).toString('hex');

function generateCSRFToken() {
  return crypto.randomBytes(32).toString('hex');
}

function validateCSRFToken(token, sessionToken) {
  // In production, use proper CSRF token validation
  return typeof token === 'string' && token.length === 64;
}

// CSRF token endpoint
app.get('/csrf-token', (req, res) => {
  const token = generateCSRFToken();
  // Store token in session or temporary storage
  res.json({ csrf_token: token });
});

// Add CSRF validation middleware
function validateCSRF(req, res, next) {
  const token = req.headers['x-csrf-token'] || req.body.csrf_token;
  
  if (!validateCSRFToken(token, req.session)) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  
  next();
}
```

### Step 2: Update Frontend CSRF Handling
```javascript
// In main.js - Add CSRF token management
class CSRFManager {
  constructor() {
    this.token = null;
  }

  async getToken() {
    if (!this.token) {
      const response = await fetch('/csrf-token', {
        credentials: 'include'
      });
      const data = await response.json();
      this.token = data.csrf_token;
    }
    return this.token;
  }

  async makeSecureRequest(url, options = {}) {
    const token = await this.getToken();
    
    return fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'X-CSRF-Token': token,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
  }
}
```

## 📊 Testing Security Fixes

### Step 1: Create Security Test Suite
Create `tests/security.test.js`:
```javascript
import { describe, it, expect } from 'vitest';
import { SecureHTML, ValidationUtils } from '../src/utils/security.js';

describe('Security Features', () => {
  describe('XSS Prevention', () => {
    it('should sanitize malicious scripts', () => {
      const malicious = '<script>alert("XSS")</script><p>Safe content</p>';
      const cleaned = SecureHTML.sanitize(malicious);
      
      expect(cleaned).not.toContain('<script>');
      expect(cleaned).not.toContain('alert');
      expect(cleaned).toContain('<p>Safe content</p>');
    });

    it('should remove event handlers', () => {
      const malicious = '<img src="x" onerror="alert(1)">';
      const cleaned = SecureHTML.sanitize(malicious);
      
      expect(cleaned).not.toContain('onerror');
      expect(cleaned).toContain('<img src="x">');
    });
  });

  describe('Input Validation', () => {
    it('should validate repository names', () => {
      expect(ValidationUtils.validateRepositoryName('valid-repo')).toBe(true);
      expect(ValidationUtils.validateRepositoryName('invalid repo')).toBe(false);
      expect(ValidationUtils.validateRepositoryName('<script>')).toBe(false);
    });

    it('should validate markdown content', () => {
      expect(ValidationUtils.validateMarkdownContent('# Valid content')).toBe(true);
      expect(ValidationUtils.validateMarkdownContent('<script>evil</script>')).toBe(false);
    });
  });
});
```

### Step 2: Run Security Tests
```bash
npm run test tests/security.test.js
npm run test tests/basic.test.js
npm run build
npm run lint
```

## 🚀 Deployment Security Checklist

### Pre-Deployment Validation
```bash
#!/bin/bash
# security-check.sh

echo "🔒 Running security checks..."

# 1. Dependency audit
echo "📦 Checking dependencies..."
npm audit --audit-level high

# 2. Lint for security issues
echo "🔍 Linting for security..."
npm run lint

# 3. Run security tests
echo "🧪 Running security tests..."
npm run test tests/security.test.js

# 4. Build and verify
echo "🏗️ Building application..."
npm run build

# 5. Check for sensitive data
echo "🔐 Checking for sensitive data..."
grep -r "password\|secret\|key\|token" src/ --exclude-dir=node_modules || true

echo "✅ Security checks complete!"
```

### Production Deployment Security
```yaml
# .github/workflows/security-deploy.yml
name: Security-Enhanced Deployment

on:
  push:
    branches: [main]

jobs:
  security-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Security Audit
        run: |
          npm ci
          npm audit --audit-level high
          
      - name: Run Security Tests
        run: npm run test tests/security.test.js
        
      - name: Build with Security Headers
        run: npm run build
        
      - name: Deploy with Security
        if: success()
        uses: actions/deploy-pages@v4
```

## 📈 Security Monitoring

### Step 1: Add Security Logging
```javascript
// Add to server.js
const securityLogger = {
  logSecurityEvent(event, details = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      ip: details.ip,
      userAgent: details.userAgent,
      ...details
    };
    
    console.log('SECURITY_EVENT:', JSON.stringify(logEntry));
    
    // In production, send to monitoring service
    if (NODE_ENV === 'production') {
      // Send to your monitoring service
    }
  }
};

// Log security events
app.use('/auth/*', (req, res, next) => {
  securityLogger.logSecurityEvent('auth_attempt', {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    path: req.path
  });
  next();
});
```

### Step 2: Set Up Alerts
```javascript
// Monitor for suspicious activity
const securityMonitor = {
  rateLimitExceeded(ip) {
    securityLogger.logSecurityEvent('rate_limit_exceeded', { ip });
    // Alert on repeated violations
  },
  
  suspiciousInput(input, source) {
    securityLogger.logSecurityEvent('suspicious_input', { input, source });
    // Alert on potential attacks
  },
  
  authenticationFailure(reason, ip) {
    securityLogger.logSecurityEvent('auth_failure', { reason, ip });
    // Track failed login attempts
  }
};
```

## ✅ Verification Steps

After implementing all fixes:

1. **XSS Testing**:
   ```javascript
   // Test in browser console - should be sanitized
   mdsg.content = '<script>alert("XSS")</script>';
   mdsg.updatePreview();
   ```

2. **Token Security**:
   ```javascript
   // Should return null - tokens no longer in localStorage
   console.log(localStorage.getItem('github_token'));
   ```

3. **CSP Validation**:
   - Check browser dev tools for CSP violations
   - Verify no inline scripts execute

4. **Dependency Security**:
   ```bash
   npm audit --audit-level high
   # Should show 0 vulnerabilities
   ```

## 🎯 Success Metrics

### Security KPIs to Monitor
- **XSS Vulnerabilities**: 0 (from 10+)
- **Token Exposure Risk**: Eliminated
- **CSP Compliance**: 100%
- **Dependency Vulnerabilities**: 0 (from 6)
- **Security Headers**: 9/9 implemented
- **Input Validation Coverage**: 95%+

### Testing Checklist
- [ ] XSS attacks blocked by sanitization
- [ ] Tokens not accessible via localStorage
- [ ] CSP prevents script injection
- [ ] All dependencies updated and secure
- [ ] CSRF protection working
- [ ] Input validation catches malicious input
- [ ] Security headers present in responses
- [ ] Security tests pass
- [ ] Build process includes security checks

---

**Implementation Priority**: CRITICAL  
**Timeline**: Complete Phase 1 within 7 days  
**Validation**: Test each fix thoroughly before proceeding  
**Documentation**: Update security.md after implementation