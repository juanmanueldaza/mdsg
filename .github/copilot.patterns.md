# 🧬 MDSG CODE PATTERNS
*Essential patterns for GitHub Copilot*

## 🎯 **MANDATORY PATTERNS**

### **Security Pattern** (ALWAYS USE)
```javascript
import { MinimalSecurity } from '@security';

// User input processing
const safeHTML = MinimalSecurity.sanitizeHTML(userInput);
const validToken = MinimalSecurity.validateToken(token);
const safeText = MinimalSecurity.escapeText(text);
```

### **Observable Pattern** (Event Handling)
```javascript
import { Observable, Subject } from '../events/observable.js';

// Create observable
const clicks$ = new Observable(observer => {
  element.addEventListener('click', observer.next);
  return () => element.removeEventListener('click', observer.next);
});

// Use operators
clicks$.debounce(300).map(e => e.target.value).subscribe(handleInput);
```

### **Service Pattern** (Module Organization)
```javascript
// Services export classes
export class AuthenticationService {
  constructor() { this.csrfToken = this.generateCSRFToken(); }
  isAuthenticated() { return MinimalSecurity.getToken()?.token; }
}

// Utils export static methods
export class ValidationUtils {
  static validateGitHubToken(token) { return /^[a-zA-Z0-9_]+$/.test(token); }
}
```

### **Error Handling Pattern**
```javascript
// Descriptive error messages
if (!content) throw new Error('Content required for deployment');
if (!this.isValidToken(token)) throw new Error('Invalid token format provided');

// User-friendly error display  
catch (error) {
  return this.getAuthenticationErrorMessage(error);
}
```

## 🚫 **ANTI-PATTERNS** (Never Use)
```javascript
// ❌ Comments in code
// This function validates tokens

// ❌ Direct innerHTML  
element.innerHTML = userContent;

// ❌ Unvalidated input
const html = markdown; // Process directly

// ❌ Global variables
window.mdsgState = data;
```

## ⚡ **PERFORMANCE PATTERNS**
```javascript
// Debounced input
const debouncedUpdate = debounce(() => this.updatePreview(), 300);

// Efficient DOM updates
const fragment = document.createDocumentFragment();
items.forEach(item => fragment.appendChild(createItemElement(item)));
container.appendChild(fragment);

// Memory cleanup
class Component {
  mount() { this.subscription = events$.subscribe(this.handler); }
  unmount() { this.subscription.unsubscribe(); }
}
```
