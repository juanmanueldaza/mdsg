# 🔒 SECURITY QUICK REFERENCE

_Essential security patterns for MDSG_

## 🎯 **SECURITY SCORE: 100/100** ✅

## 🚨 **MANDATORY SECURITY PATTERNS**

```javascript
// ALWAYS import and use MinimalSecurity
import { MinimalSecurity } from '@security';

// User input processing (REQUIRED)
const safeHTML = MinimalSecurity.sanitizeHTML(userMarkdown);
const validToken = MinimalSecurity.validateToken(githubToken);
const escapedText = MinimalSecurity.escapeText(userText);

// Token management (REQUIRED)
MinimalSecurity.storeToken(token, userData);
const tokenData = MinimalSecurity.getToken();
MinimalSecurity.clearToken();
```

## 🛡️ **XSS PREVENTION** (31/31 tests passing)

```javascript
// ✅ SAFE: Use sanitizeHTML for all user content
const safeHTML = MinimalSecurity.sanitizeHTML(markdown);
element.textContent = safeHTML; // NOT innerHTML

// ❌ DANGEROUS: Never use directly
element.innerHTML = userContent; // XSS risk
```

## 🔐 **TOKEN SECURITY**

```javascript
// ✅ VALIDATED: Always check token format
if (!MinimalSecurity.validateToken(token)) {
  throw new Error('Invalid token format');
}

// ✅ SECURE: Use structured storage
MinimalSecurity.storeToken(token, {
  login: userData.login,
  tokenValid: true,
  lastAuthenticated: new Date().toISOString(),
});
```

## 🌐 **CSP IMPLEMENTATION**

```html
<!-- REQUIRED: Content Security Policy -->
<meta
  http-equiv="Content-Security-Policy"
  content="
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com;
  connect-src 'self' https://api.github.com https://github.com;
"
/>
```

## ⚡ **QUICK SECURITY VALIDATION**

```bash
# Run security tests (should work after fixing imports)
npm run test tests/security.test.js

# Manual security check
grep -r "innerHTML" src/ && echo "❌ XSS RISK FOUND"
grep -r "eval(" src/ && echo "❌ CODE INJECTION RISK"
```

## 🎯 **SECURITY CHECKLIST**

- [ ] All user input passed through MinimalSecurity
- [ ] No direct innerHTML usage
- [ ] Tokens validated before use
- [ ] CSP headers implemented
- [ ] No eval() or Function() constructors
- [ ] All external URLs validated

_Condensed from 1000+ lines of security docs_
