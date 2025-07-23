# 🧠 MDSG COPILOT QUICK REFERENCE

_Ultra-efficient AI agent guidance system_

## 🎯 **INSTANT STATUS** (2025-07-22)

```
Project: MDSG - Markdown Site Generator
Live: https://mdsg.daza.ar/
Bundle: 20.80KB gzipped (⚠️ AT 20KB LIMIT)
Tests: 31/31 core ✅ | Security: 100/100 ✅
Files: 13 JS modules | Main: 1396 lines
Comments: 0 (MANDATORY) | Status: Production ready
```

## 🚨 **ZERO TOLERANCE RULES**

1. **NO COMMENTS** in .js files (immediate removal required)
2. **Bundle ≤20KB** (currently at limit - optimize before adding)
3. **31/31 tests** passing (regression = stop work)
4. **All docs** follow `copilot.*` pattern in `.github/instructions/`

## ⚡ **INSTRUCTION HIERARCHY**

**🎯 TIER 1 - INSTANT ACCESS** (Daily Use):

- **`copilot.quick-ref.md`** → Status, commands, context (this file)
- **`copilot.decisions.md`** → Decision support, red flags
- **`copilot.patterns.md`** → Code patterns, anti-patterns

**📚 TIER 2 - REFERENCE** (Weekly Use):

- **`copilot.architecture.md`** → 13-module structure
- **`copilot.security.md`** → Security essentials
- **`copilot.testing.md`** → Test patterns, commands
- **`copilot.performance.md`** → Bundle optimization

**🏗️ TIER 3 - DEEP DIVE** (Monthly Use):

- **`copilot.deployment.md`** → Deployment patterns
- **`copilot.navigation.md`** → Codebase exploration

## 📁 **13-MODULE ARCHITECTURE**

```
src/main.js (1396L) → Core MDSG class + UI
src/services/ → auth, github, deployment, registry (4 files)
src/events/ → observable, handlers (2 files)
src/utils/ → security-minimal, validation, csrf, markdown-processor, state-management (5 files)
src/components/ → ui-components (1 file)
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
npm run test tests/basic.test.js  # 31/31 must pass
npm run build && npm run size     # Check bundle size
npm run dev                       # Development server
```

## 🎭 **AI AGENT PROTOCOLS**

**Comment Removal Protocol:**

```bash
find src -name "*.js" -exec grep -l "//" {} \; && echo "❌ COMMENTS FOUND" && exit 1
```

**Pre-Change Validation:**

```bash
npm run test tests/basic.test.js | grep -q "31 passed" || exit 1
npm run size | grep -q "gzipped" && echo "✅ Bundle OK"
```

## 📚 **NAVIGATION MAP**

```
📋 Quick Ref: copilot.quick-ref.md (this file)
🎯 Decisions: copilot.decisions.md
🧬 Patterns: copilot.patterns.md
🔒 Security: copilot.security.md
🧪 Testing: copilot.testing.md
🏗️ Architecture: copilot.architecture.md
⚡ Performance: copilot.performance.md
🚀 Deployment: copilot.deployment.md
🧭 Navigation: copilot.navigation.md
```
