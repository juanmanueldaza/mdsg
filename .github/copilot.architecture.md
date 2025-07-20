# 🏗️ MDSG ARCHITECTURE REFERENCE
*Essential architecture patterns for GitHub Copilot*

## 🎯 **CURRENT ARCHITECTURE: 13-MODULE SYSTEM** ✅

### **📁 Module Structure**
```
src/main.js (1396L) → Core MDSG class, UI coordination
├── services/
│   ├── auth.js → Authentication & token management
│   ├── github.js → GitHub API integration
│   ├── deployment.js → GitHub Pages deployment
│   └── registry.js → Service coordination
├── events/
│   ├── observable.js → Reactive programming (Observable, Subject)
│   └── handlers.js → Event coordination & management
├── utils/
│   ├── security-minimal.js → XSS prevention & input validation
│   ├── validation.js → Input validation utilities
│   ├── csrf.js → CSRF protection
│   ├── markdown-processor.js → Markdown parsing engine
│   └── state-management.js → Application state
└── components/
    └── ui-components.js → UI building patterns
```

## 🎯 **DESIGN PRINCIPLES**
1. **Service-Based Modules** → Clear separation of concerns
2. **Observable Events** → Reactive, memory-safe event handling
3. **Security-First** → MinimalSecurity for all user input
4. **Bundle Efficiency** → 20.80KB total (at 20KB limit)
5. **Comment-Free** → Self-documenting code only

## ⚡ **INTEGRATION PATTERNS**
```javascript
// Main orchestration (main.js)
import { AuthenticationService } from './services/auth.js';
import { Observable } from './events/observable.js';
import { MinimalSecurity } from '@security';

class MDSG {
  constructor() {
    this.auth = new AuthenticationService();
    this.setupObservables();
  }
}

// Service coordination
const auth = ServiceRegistry.get('auth');
const github = ServiceRegistry.get('github');
```

## 🔒 **SECURITY ARCHITECTURE**
- **Layer 1**: Input validation (validation.js)
- **Layer 2**: HTML sanitization (security-minimal.js)
- **Layer 3**: CSP headers (index.html)
- **Layer 4**: Token security (auth.js)

## 📦 **BUNDLE OPTIMIZATION**
- **Target**: <20KB (currently at limit: 20.80KB)
- **Strategy**: Efficient modules, no redundancy
- **Priority**: Core functionality over abstractions

*Condensed from 666-line architecture.md*
