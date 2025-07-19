# MDSG Security Documentation

## 🤖 Agent Navigation Hub

**Primary Reference**: `../copilot-instructions.md` → Security section
**Cross-References**: 
- `architecture.md` → Security architecture patterns
- `performance.md` → Security vs performance trade-offs
- `api.md` → API security implementation
- `testing.md` → Security testing strategies

## Overview

MDSG implements comprehensive security measures to protect user data, prevent common web vulnerabilities, and ensure secure interactions with GitHub's API. This document outlines security architecture, implementation details, and best practices.

> **Agent Alert**: Security is NON-NEGOTIABLE. Every input must be validated, every output sanitized.
> **Security Score**: Currently B- rating (MODERATE RISK) - see security-audit.md for critical issues requiring immediate attention.
> **🚨 CRITICAL**: XSS vulnerabilities and insecure token storage identified - refer to security-audit.md for action plan.

## 🔒 Security Architecture for Agents

> **Agent Context**: Working on ANY part of MDSG? These security layers apply to your work.
> **Cross-Reference**: `architecture.md#security-architecture` for implementation context.
> **🚨 URGENT**: Review `security-audit.md` for critical vulnerabilities before making ANY changes.

## 📋 Security Audit Status

**Latest Audit**: January 19, 2025  
**Overall Rating**: B- (MODERATE RISK)  
**Critical Issues**: 2 (XSS vulnerabilities, insecure token storage)  
**High Priority**: 4 issues requiring immediate attention  
**Full Report**: See `.github/docs/security-audit.md`

### Immediate Actions Required
1. **XSS Prevention**: Replace innerHTML usage with DOMPurify sanitization
2. **Secure Token Storage**: Move from localStorage to httpOnly cookies
3. **Content Security Policy**: Implement CSP headers
4. **Dependency Updates**: Fix 6 vulnerable packages

### Defense in Depth Strategy

> **Agent Rule**: Every change must consider impact on ALL security layers.

MDSG employs multiple layers of security:

```
┌─────────────────────────────────────────┐
│           User Interface Layer          │ ← XSS Prevention, Input Validation
├─────────────────────────────────────────┤
│         Application Logic Layer         │ ← Authentication, Authorization
├─────────────────────────────────────────┤
│           API Proxy Layer               │ ← Rate Limiting, CORS, Security Headers
├─────────────────────────────────────────┤
│        External Services Layer          │ ← OAuth 2.0, GitHub API Security
└─────────────────────────────────────────┘
```

### Core Security Principles for Agents

> **Agent Mindset**: Apply these principles to EVERY code change, no exceptions.
> **⚠️ WARNING**: Current implementation has CRITICAL vulnerabilities - see security-audit.md

1. **🚨 XSS Prevention** (CRITICAL ISSUE)
   - **Current Problem**: innerHTML usage without sanitization
   - **Agent Action**: NEVER use innerHTML with user content
   - **Required Fix**: Implement DOMPurify sanitization for all HTML rendering

2. **🚨 Secure Token Storage** (CRITICAL ISSUE)
   - **Current Problem**: GitHub tokens in localStorage (vulnerable to XSS)
   - **Agent Action**: NEVER store sensitive data in localStorage
   - **Required Fix**: Implement httpOnly cookies for token storage

3. **Zero Trust**: Validate all inputs and outputs
   - **Agent Action**: Use `validateInput()` patterns from `copilot-instructions.md`
   - **Enhancement Needed**: Strengthen validation per audit recommendations

4. **Least Privilege**: Minimal permissions and access rights
   - **Agent Action**: Request minimum GitHub scopes needed

5. **Defense in Depth**: Multiple security layers
   - **Agent Action**: Implement validation at UI, API, and data layers
4. **Secure by Default**: Safe configurations out of the box
   - **Agent Action**: Default to most restrictive settings
5. **Privacy by Design**: Minimal data collection and storage
   - **Agent Action**: Store only essential data, clear on logout

## 🔐 Authentication Security

> **Agent Context**: Working on `server.js` OAuth flow? This is your security bible.
> **Cross-Reference**: `api.md#authentication-api` for complete flow details.

### OAuth 2.0 Implementation

> **Agent Critical**: OAuth implementation must prevent CSRF, token leakage, and replay attacks.

#### Secure OAuth Flow
```javascript
// server.js - OAuth callback with security measures
app.get('/auth/github/callback', rateLimit(), async (req, res) => {
  try {
    const { code, state } = req.query;

    // Input validation
    if (!validateGitHubCode(code)) {
      return res.status(400).json({
        error: 'Invalid authorization code',
        message: 'The authorization code is invalid or missing.'
      });
    }

    // CSRF protection via state parameter
    const storedState = req.session?.oauthState;
    if (state !== storedState) {
      return res.status(400).json({
        error: 'Invalid state parameter',
        message: 'CSRF protection failed.'
      });
    }

    // Exchange code for token (secure implementation)
    const tokenData = await exchangeCodeForToken(code);
    
    // Create secure session
    const sessionToken = createSecureSession(tokenData);
    
    // Redirect with secure parameters
    redirectToFrontend(res, sessionToken);
    
  } catch (error) {
    handleSecurityError(error, res);
  }
});
```

#### Token Security Measures

> **Agent Pattern**: Use these validation patterns for ALL token handling.
> **Security Rule**: Never log, console.log, or expose tokens in any form.

**Personal Access Token Validation**:
```javascript
// Frontend token validation
isValidToken(token) {
  // Format validation
  if (!token || typeof token !== 'string') return false;
  
  // Length validation (GitHub tokens are 40+ chars)
  if (token.length < 20 || token.length > 255) return false;
  
  // Character validation (alphanumeric + underscore)
  if (!/^[a-zA-Z0-9_]+$/.test(token)) return false;
  
  // Prefix validation for known GitHub token types
  const validPrefixes = ['ghp_', 'gho_', 'ghu_', 'ghs_', 'ghr_'];
  const hasValidPrefix = validPrefixes.some(prefix => token.startsWith(prefix));
  
  return hasValidPrefix;
}
```

**Secure Token Storage**:

> **Agent Critical**: Backend-only storage. Frontend NEVER stores raw GitHub tokens.
```javascript
// Backend secure token management
class SecureTokenStore {
  constructor() {
    this.tokenStore = new Map();
    this.cleanup();
  }
  
  store(tokenId, githubToken, userId) {
    // Encrypt token before storage
    const encryptedToken = this.encrypt(githubToken);
    
    this.tokenStore.set(tokenId, {
      token: encryptedToken,
      userId,
      createdAt: Date.now(),
      lastUsed: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    });
  }
  
  retrieve(tokenId) {
    const tokenData = this.tokenStore.get(tokenId);
    if (!tokenData || Date.now() > tokenData.expiresAt) {
      this.tokenStore.delete(tokenId);
      return null;
    }
    
    // Update last used time
    tokenData.lastUsed = Date.now();
    
    // Decrypt token
    return this.decrypt(tokenData.token);
  }
  
  encrypt(data) {
    // Use crypto module for encryption
    const cipher = crypto.createCipher('aes-256-gcm', process.env.ENCRYPTION_KEY);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }
  
  cleanup() {
    // Clean expired tokens every hour
    setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.tokenStore.entries()) {
        if (now > value.expiresAt) {
          this.tokenStore.delete(key);
        }
      }
    }, 60 * 60 * 1000);
  }
}
```

### Session Management

> **Agent Context**: Session security prevents unauthorized access and session hijacking.
> **Performance Note**: Session tokens expire in 24h for security vs usability balance.

#### Secure Session Tokens
```javascript
// JWT-like token creation with security enhancements
const createSessionToken = (userData) => {
  const payload = {
    sub: userData.id,
    login: userData.login,
    avatar_url: userData.avatar_url,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    iss: 'mdsg-api',
    aud: 'mdsg-frontend'
  };

  const header = {
    typ: 'JWT',
    alg: 'HS256'
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  
  const signature = crypto
    .createHmac('sha256', process.env.JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

// Session token verification
const verifySessionToken = (token) => {
  try {
    const [headerB64, payloadB64, signature] = token.split('.');
    
    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.JWT_SECRET)
      .update(`${headerB64}.${payloadB64}`)
      .digest('base64url');

    if (signature !== expectedSignature) {
      throw new Error('Invalid signature');
    }

    // Decode and validate payload
    const payload = JSON.parse(base64UrlDecode(payloadB64));
    
    // Check expiration
    if (Date.now() / 1000 > payload.exp) {
      throw new Error('Token expired');
    }
    
    // Check issuer and audience
    if (payload.iss !== 'mdsg-api' || payload.aud !== 'mdsg-frontend') {
      throw new Error('Invalid token claims');
    }

    return payload;
  } catch (error) {
    return null;
  }
};
```

## 🛡️ Input Validation & Sanitization

> **Agent Rule #1**: NEVER trust user input. Validate EVERYTHING.
> **Performance Impact**: Validation adds <1ms overhead but prevents attacks.

### Frontend Input Validation

> **Agent Pattern**: Apply these validators to ALL user inputs before processing.
```javascript
// Comprehensive input validation
class InputValidator {
  static validateGitHubToken(token) {
    if (!token || typeof token !== 'string') return false;
    if (token.length < 20 || token.length > 255) return false;
    if (!/^[a-zA-Z0-9_]+$/.test(token)) return false;
    return true;
  }
  
  static validateRepositoryName(name) {
    if (!name || typeof name !== 'string') return false;
    if (name.length < 1 || name.length > 100) return false;
    if (!/^[a-zA-Z0-9._-]+$/.test(name)) return false;
    if (name.startsWith('.') || name.endsWith('.')) return false;
    return true;
  }
  
  static validateMarkdownContent(content) {
    if (typeof content !== 'string') return false;
    if (content.length > 1000000) return false; // 1MB limit
    return true;
  }
  
  static validateURL(url) {
    try {
      new URL(url);
      // Check for safe protocols
      return ['http:', 'https:'].includes(new URL(url).protocol);
    } catch {
      return false;
    }
  }
}
```

### Markdown Sanitization

> **Agent Critical**: XSS prevention in markdown parsing is essential for user safety.
> **Cross-Reference**: `performance.md#markdown-parsing` for performance considerations.
```javascript
// XSS-safe markdown parsing
class SecureMarkdownParser {
  constructor() {
    this.allowedTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'strong', 'em', 'code', 'pre', 'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'table', 'thead', 'tbody', 'tr', 'th', 'td'];
    this.allowedAttributes = {
      'a': ['href', 'title'],
      'img': ['src', 'alt', 'title'],
      'code': ['class'],
      'pre': ['class']
    };
  }
  
  parseMarkdown(markdown) {
    // Basic markdown parsing
    let html = this.basicMarkdownToHTML(markdown);
    
    // Sanitize HTML output
    html = this.sanitizeHTML(html);
    
    return html;
  }
  
  sanitizeHTML(html) {
    // Create DOM parser
    const doc = new DOMParser().parseFromString(html, 'text/html');
    
    // Remove script tags and event handlers
    this.removeScripts(doc);
    this.removeEventHandlers(doc);
    this.validateLinks(doc);
    this.validateImages(doc);
    
    return doc.body.innerHTML;
  }
  
  removeScripts(doc) {
    // Remove all script tags
    const scripts = doc.querySelectorAll('script');
    scripts.forEach(script => script.remove());
    
    // Remove dangerous tags
    const dangerousTags = ['iframe', 'object', 'embed', 'form', 'input', 'button'];
    dangerousTags.forEach(tag => {
      const elements = doc.querySelectorAll(tag);
      elements.forEach(el => el.remove());
    });
  }
  
  removeEventHandlers(doc) {
    // Remove all event handler attributes
    const allElements = doc.querySelectorAll('*');
    allElements.forEach(el => {
      Array.from(el.attributes).forEach(attr => {
        if (attr.name.startsWith('on')) {
          el.removeAttribute(attr.name);
        }
      });
    });
  }
  
  validateLinks(doc) {
    const links = doc.querySelectorAll('a');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href) {
        // Block javascript: and data: URLs
        if (href.startsWith('javascript:') || href.startsWith('data:')) {
          link.removeAttribute('href');
        }
        // Add rel="noopener noreferrer" for external links
        if (href.startsWith('http')) {
          link.setAttribute('rel', 'noopener noreferrer');
          link.setAttribute('target', '_blank');
        }
      }
    });
  }
  
  validateImages(doc) {
    const images = doc.querySelectorAll('img');
    images.forEach(img => {
      const src = img.getAttribute('src');
      if (src) {
        // Block javascript: and dangerous data: URLs
        if (src.startsWith('javascript:') || src.startsWith('data:image/svg+xml')) {
          img.remove();
        }
      }
    });
  }
}
```

## 🔌 API Security

> **Agent Context**: Working on API endpoints? Implement ALL these security measures.
> **Cross-Reference**: `api.md#rate-limiting` for complete implementation details.

### Rate Limiting Implementation

> **Agent Protection**: Rate limiting prevents abuse and DDoS attacks. Non-negotiable for production.
```javascript
// Advanced rate limiting with different tiers
class RateLimiter {
  constructor() {
    this.requests = new Map();
    this.limits = {
      oauth: { window: 15 * 60 * 1000, max: 10 },      // 10 per 15 min
      api: { window: 15 * 60 * 1000, max: 100 },       // 100 per 15 min
      upload: { window: 60 * 1000, max: 5 }            // 5 per minute
    };
  }
  
  middleware(type = 'api') {
    return (req, res, next) => {
      const clientId = this.getClientId(req);
      const key = `${type}:${clientId}`;
      const limit = this.limits[type];
      
      if (!this.requests.has(key)) {
        this.requests.set(key, {
          count: 1,
          resetTime: Date.now() + limit.window
        });
        return next();
      }
      
      const clientData = this.requests.get(key);
      
      if (Date.now() > clientData.resetTime) {
        // Reset window
        clientData.count = 1;
        clientData.resetTime = Date.now() + limit.window;
        return next();
      }
      
      if (clientData.count >= limit.max) {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: `Too many ${type} requests. Try again later.`,
          retryAfter: Math.ceil((clientData.resetTime - Date.now()) / 1000)
        });
      }
      
      clientData.count++;
      next();
    };
  }
  
  getClientId(req) {
    // Use multiple identifiers for better accuracy
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded ? forwarded.split(',')[0] : req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';
    
    // Combine IP and User-Agent hash for identification
    return crypto.createHash('sha256')
      .update(ip + userAgent)
      .digest('hex')
      .substring(0, 16);
  }
}
```

### CORS Security Configuration

> **Agent Rule**: CORS must be restrictive by default. Only allow known origins.
```javascript
// Secure CORS setup
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://mdsg.daza.ar',
      'https://juanmanueldaza.github.io'
    ];
    
    // Add development origins in non-production
    if (process.env.NODE_ENV !== 'production') {
      allowedOrigins.push(
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:3000'
      );
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));
```

### Security Headers

> **Agent Requirement**: ALL responses must include security headers in production.
> **Cross-Reference**: `deployment.md#security-headers` for deployment configuration.
```javascript
// Comprehensive security headers
app.use((req, res, next) => {
  // Prevent XSS attacks
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Control referrer information
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Content Security Policy
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Content-Security-Policy', 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "connect-src 'self' https://api.github.com; " +
      "font-src 'self'; " +
      "object-src 'none'; " +
      "base-uri 'self'; " +
      "form-action 'self'"
    );
    
    // HSTS for HTTPS enforcement
    res.setHeader('Strict-Transport-Security', 
      'max-age=31536000; includeSubDomains; preload'
    );
  }
  
  next();
});
```

## 🔐 Data Protection

> **Agent Context**: Sensitive data handling requires encryption and careful lifecycle management.
> **Privacy Rule**: Collect minimum data, encrypt everything, delete when not needed.

### Encryption at Rest

> **Agent Pattern**: Use this encryption class for ANY sensitive data storage.
```javascript
// Sensitive data encryption
class DataEncryption {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.keyDerivation = 'pbkdf2';
    this.iterations = 100000;
  }
  
  encrypt(data, password = process.env.ENCRYPTION_KEY) {
    const salt = crypto.randomBytes(16);
    const iv = crypto.randomBytes(16);
    
    // Derive key from password
    const key = crypto.pbkdf2Sync(password, salt, this.iterations, 32, 'sha256');
    
    // Encrypt data
    const cipher = crypto.createCipherGCM(this.algorithm, key, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Combine salt, iv, authTag, and encrypted data
    return JSON.stringify({
      salt: salt.toString('hex'),
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      encrypted
    });
  }
  
  decrypt(encryptedData, password = process.env.ENCRYPTION_KEY) {
    try {
      const data = JSON.parse(encryptedData);
      const salt = Buffer.from(data.salt, 'hex');
      const iv = Buffer.from(data.iv, 'hex');
      const authTag = Buffer.from(data.authTag, 'hex');
      
      // Derive key
      const key = crypto.pbkdf2Sync(password, salt, this.iterations, 32, 'sha256');
      
      // Decrypt
      const decipher = crypto.createDecipherGCM(this.algorithm, key, iv);
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(data.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      throw new Error('Decryption failed');
    }
  }
}
```

### Data Minimization

> **Agent Privacy**: Store only essential fields. More data = more attack surface.
```javascript
// Minimal data collection and storage
class PrivacyCompliantStorage {
  constructor() {
    this.allowedUserFields = ['id', 'login', 'name', 'avatar_url'];
    this.dataRetentionPeriod = 30 * 24 * 60 * 60 * 1000; // 30 days
  }
  
  sanitizeUserData(userData) {
    // Only store necessary user information
    const sanitized = {};
    this.allowedUserFields.forEach(field => {
      if (userData[field]) {
        sanitized[field] = userData[field];
      }
    });
    
    // Add timestamp for data retention
    sanitized.storedAt = Date.now();
    
    return sanitized;
  }
  
  cleanupExpiredData() {
    const cutoff = Date.now() - this.dataRetentionPeriod;
    
    // Remove expired user sessions
    for (const [key, value] of this.sessionStore.entries()) {
      if (value.storedAt < cutoff) {
        this.sessionStore.delete(key);
      }
    }
  }
  
  // No persistent storage of sensitive data
  // All tokens stored in memory only
  // User data expires with session
}
```

## 🔗 GitHub API Security

> **Agent Context**: GitHub API proxy prevents token exposure and adds security layers.
> **Cross-Reference**: `api.md#github-proxy-api` for complete endpoint documentation.

### Secure API Proxy Implementation

> **Agent Pattern**: ALL GitHub API calls must go through this secure proxy pattern.
```javascript
// Secure GitHub API proxy with validation
app.post('/api/github/:endpoint(*)', 
  rateLimiter.middleware('api'),
  validateAPIRequest,
  async (req, res) => {
    try {
      const { endpoint } = req.params;
      const { token_id, method = 'GET', data } = req.body;
      
      // Validate endpoint
      if (!isValidGitHubEndpoint(endpoint)) {
        return res.status(400).json({
          error: 'Invalid endpoint',
          message: 'The requested endpoint is not allowed.'
        });
      }
      
      // Retrieve and validate token
      const githubToken = tokenStore.retrieve(token_id);
      if (!githubToken) {
        return res.status(401).json({
          error: 'Invalid token',
          message: 'Token is invalid or expired.'
        });
      }
      
      // Validate request data
      if (data && !validateRequestData(endpoint, method, data)) {
        return res.status(400).json({
          error: 'Invalid request data',
          message: 'Request data validation failed.'
        });
      }
      
      // Make secure request to GitHub
      const response = await makeSecureGitHubRequest(endpoint, method, data, githubToken);
      
      // Sanitize response before sending
      const sanitizedResponse = sanitizeGitHubResponse(response);
      
      res.status(response.status).json(sanitizedResponse);
      
    } catch (error) {
      handleAPIError(error, res);
    }
  }
);

function isValidGitHubEndpoint(endpoint) {
  const allowedEndpoints = [
    /^user$/,
    /^user\/repos$/,
    /^repos\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/,
    /^repos\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+\/contents\/[a-zA-Z0-9._/-]+$/,
    /^repos\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+\/pages$/
  ];
  
  return allowedEndpoints.some(pattern => pattern.test(endpoint));
}

function validateRequestData(endpoint, method, data) {
  // Validate based on endpoint and method
  if (endpoint === 'user/repos' && method === 'POST') {
    return InputValidator.validateRepositoryName(data.name) &&
           typeof data.description === 'string' &&
           typeof data.private === 'boolean';
  }
  
  if (endpoint.includes('/contents/') && method === 'PUT') {
    return typeof data.message === 'string' &&
           typeof data.content === 'string' &&
           data.message.length <= 200 &&
           Buffer.from(data.content, 'base64').length <= 100 * 1024 * 1024; // 100MB limit
  }
  
  return true;
}
```

### API Response Sanitization

> **Agent Rule**: Sanitize ALL API responses before sending to frontend. No raw GitHub data.
```javascript
// Sanitize GitHub API responses
function sanitizeGitHubResponse(response) {
  // Remove sensitive fields that shouldn't be exposed
  const sensitiveFields = [
    'permissions',
    'private_key',
    'secret',
    'token',
    'webhook_secret'
  ];
  
  function removeSensitiveData(obj) {
    if (Array.isArray(obj)) {
      return obj.map(removeSensitiveData);
    }
    
    if (obj && typeof obj === 'object') {
      const cleaned = {};
      for (const [key, value] of Object.entries(obj)) {
        if (!sensitiveFields.includes(key)) {
          cleaned[key] = removeSensitiveData(value);
        }
      }
      return cleaned;
    }
    
    return obj;
  }
  
  return removeSensitiveData(response.data || response);
}
```

## 🧪 Security Testing

> **Agent Requirement**: ALL security features need corresponding tests.
> **Cross-Reference**: `testing.md#security-testing` for complete test patterns.

### Automated Security Tests

> **Agent Pattern**: Use these test patterns for XSS, injection, and validation testing.
```javascript
// tests/security/security.test.js
describe('Security Tests', () => {
  describe('XSS Prevention', () => {
    it('should sanitize script tags', () => {
      const malicious = '<script>alert("xss")</script>';
      const sanitized = secureParser.parseMarkdown(malicious);
      expect(sanitized).not.toContain('<script>');
    });
    
    it('should remove event handlers', () => {
      const malicious = '<img src="x" onerror="alert(1)">';
      const sanitized = secureParser.parseMarkdown(malicious);
      expect(sanitized).not.toContain('onerror=');
    });
  });
  
  describe('Input Validation', () => {
    it('should reject invalid tokens', () => {
      expect(InputValidator.validateGitHubToken('')).toBe(false);
      expect(InputValidator.validateGitHubToken('invalid')).toBe(false);
      expect(InputValidator.validateGitHubToken('has spaces')).toBe(false);
    });
    
    it('should validate repository names', () => {
      expect(InputValidator.validateRepositoryName('valid-repo')).toBe(true);
      expect(InputValidator.validateRepositoryName('invalid repo')).toBe(false);
      expect(InputValidator.validateRepositoryName('../malicious')).toBe(false);
    });
  });
  
  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      const requests = Array(11).fill().map(() => 
        request(app).post('/auth/github/callback')
      );
      
      const responses = await Promise.all(requests);
      const rateLimited = responses.filter(r => r.status === 429);
      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });
});
```

### Penetration Testing Checklist

> **Agent Validation**: Complete this checklist for any security-related changes.
- [ ] SQL Injection (N/A - no database)
- [ ] XSS Prevention (multiple test cases)
- [ ] CSRF Protection (state parameter validation)
- [ ] Authentication bypass attempts
- [ ] Authorization privilege escalation
- [ ] Rate limiting effectiveness
- [ ] Input validation boundary testing
- [ ] File upload security (content validation)
- [ ] API endpoint enumeration
- [ ] Session management security

## 📊 Security Monitoring

> **Agent Context**: Security monitoring detects attacks and prevents abuse.
> **Cross-Reference**: `deployment.md#monitoring` for production monitoring setup.

### Security Event Logging

> **Agent Pattern**: Log all security events but never log sensitive data.
```javascript
// Security event monitoring
class SecurityMonitor {
  constructor() {
    this.events = [];
    this.alertThresholds = {
      failedLogins: 5,
      rateLimitHits: 10,
      invalidTokens: 3
    };
  }
  
  logSecurityEvent(type, details, clientId) {
    const event = {
      type,
      details,
      clientId,
      timestamp: Date.now(),
      ip: details.ip,
      userAgent: details.userAgent
    };
    
    this.events.push(event);
    this.checkForThreats(clientId, type);
    
    // Log to external monitoring system
    console.warn(`Security Event: ${type}`, event);
  }
  
  checkForThreats(clientId, eventType) {
    const recentEvents = this.events.filter(e => 
      e.clientId === clientId && 
      e.type === eventType &&
      Date.now() - e.timestamp < 60 * 60 * 1000 // Last hour
    );
    
    const threshold = this.alertThresholds[eventType];
    if (threshold && recentEvents.length >= threshold) {
      this.triggerSecurityAlert(clientId, eventType, recentEvents.length);
    }
  }
  
  triggerSecurityAlert(clientId, eventType, count) {
    console.error(`SECURITY ALERT: ${eventType} threshold exceeded`, {
      clientId,
      eventType,
      count,
      timestamp: new Date().toISOString()
    });
    
    // Send to external monitoring service
    // Block IP if necessary
    // Notify administrators
  }
}
```

### Error Handling Security

> **Agent Rule**: Error messages must be helpful to users but not attackers. Never expose internals.
```javascript
// Secure error handling that doesn't leak information
class SecureErrorHandler {
  static handleError(error, req, res, next) {
    // Log full error details internally
    console.error('Application Error:', {
      error: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
    
    // Send generic error to client
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isProduction) {
      // Generic error message for production
      res.status(500).json({
        error: 'Internal server error',
        message: 'An unexpected error occurred. Please try again later.',
        timestamp: Date.now()
      });
    } else {
      // Detailed error for development
      res.status(500).json({
        error: error.name,
        message: error.message,
        stack: error.stack
      });
    }
  }
  
  static handleSecurityError(error, res) {
    // Special handling for security-related errors
    console.error('Security Error:', error);
    
    res.status(403).json({
      error: 'Security violation',
      message: 'Request blocked for security reasons.'
    });
  }
}
```

## 🛡️ Security Best Practices for Agents

> **Agent Mindset**: Security is everyone's responsibility. Apply these practices consistently.

### Development Guidelines for Agents

> **Agent Standard**: These practices are MANDATORY for all code contributions.

#### 1. Secure Coding Practices
```javascript
// ✅ Always validate inputs
function processUserInput(input) {
  if (!InputValidator.validate(input)) {
    throw new SecurityError('Invalid input detected');
  }
  return sanitizeInput(input);
}

// ✅ Use parameterized queries (when using database)
// const query = 'SELECT * FROM users WHERE id = ?';
// db.query(query, [userId]);

// ✅ Sanitize outputs
function renderUserData(userData) {
  return {
    id: userData.id,
    name: escapeHtml(userData.name),
    avatar: sanitizeUrl(userData.avatar_url)
  };
}

// ❌ Never trust user input
// const query = `SELECT * FROM users WHERE id = ${userId}`; // SQL injection risk
// element.innerHTML = userInput; // XSS risk
```

#### 2. Authentication Best Practices
```javascript
// ✅ Always verify authentication
function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !verifySessionToken(token)) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

// ✅ Implement proper session expiration
function createSession(userData) {
  return {
    ...userData,
    expiresAt: Date.now() + SESSION_DURATION,
    lastActivity: Date.now()
  };
}

// ✅ Clear sensitive data on logout
function logout(sessionId) {
  tokenStore.delete(sessionId);
  sessionStore.delete(sessionId);
  // Clear any other sensitive data
}
```

#### 3. API Security Practices
```javascript
// ✅ Validate all API inputs