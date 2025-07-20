# 🧠 MDSG COPILOT QUICK REFERENCE

_Ultra-condensed memory system for instant consumption_

## 🎯 **INSTANT STATUS** (2025-01-20)

```
Bundle: 20.80KB gzipped (⚠️ AT 20KB LIMIT)
Tests: 31/31 core ✅ | Security tests: import issues ❌
Files: 13 JS modules | Main: 1396 lines
Security: 100/100 score ✅ | Comments: 0 (MANDATORY)
Live: https://mdsg.daza.ar/ ✅
```

## 🚨 **CRITICAL RULES**

- **NO COMMENTS** in any .js files (auto-remove if found)
- **Bundle <20KB** (currently at limit - optimize before adding)
- **31/31 tests** must pass before any commit
- **All docs in** `.github/docs/` only

## 📁 **FILE ARCHITECTURE**

```
src/
├── main.js (1396L) → MDSG class, UI, markdown
├── services/ → auth.js, github.js, deployment.js, registry.js
├── events/ → observable.js, handlers.js
├── utils/ → security-minimal.js, validation.js, csrf.js
└── components/ → ui-components.js
```

## 🔒 **SECURITY ESSENTIALS**

```javascript
// ✅ REQUIRED PATTERN
import { MinimalSecurity } from '@security';
html = MinimalSecurity.sanitizeHTML(userInput);
token = MinimalSecurity.validateToken(token);
```

## 🧪 **TESTING COMMAND**

```bash
npm run test tests/basic.test.js --run  # Must show 31 passed
```

## 🔧 **QUICK COMMANDS**

```bash
npm run dev           # Dev server
npm run build         # Production build
npm run size          # Check bundle size
npm run test basic    # Core tests only
```

## 📚 **DOCS REFERENCE**

- `architecture.md` → 13-module structure
- `security.md` → XSS prevention patterns
- `OBSERVABLE_TRANSFORMATION.md` → Event system
- `performance.md` → Bundle optimization
