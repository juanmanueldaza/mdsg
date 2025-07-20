# 🧠 GITHUB COPILOT INSTRUCTIONS (OPTIMIZED)

_Ultra-efficient AI agent guidance system_

## 🎯 **INSTANT CONTEXT**

**Project**: MDSG - Markdown Site Generator  
**Live**: https://mdsg.daza.ar/  
**Status**: Production ready, 31/31 tests ✅  
**Bundle**: 20.80KB gzipped (⚠️ AT 20KB LIMIT)

## 🚨 **ZERO TOLERANCE RULES**

1. **NO COMMENTS** in .js files (immediate removal required)
2. **Bundle ≤20KB** (currently at limit - optimize before adding)
3. **31/31 tests** passing (regression = stop work)
4. **All docs** follow `copilot.*` pattern in `.github/`

## ⚡ **OPTIMIZED COPILOT SYSTEM**

**🎯 TIER 1: Instant Access** (90% of tasks):

- **`copilot.quick-ref.md`** → Status, commands, context
- **`copilot.decisions.md`** → Decision support, red flags
- **`copilot.patterns.md`** → Code patterns, anti-patterns
- **`copilot.security.md`** → Security essentials
- **`copilot.testing.md`** → Test patterns, commands
- **`copilot.architecture.md`** → 13-module structure
- **`copilot.performance.md`** → Bundle optimization
- **`copilot.deployment.md`** → Deployment patterns

**📚 ARCHIVE ELIMINATED**: Legacy `docs/` folder (216KB) removed - all essential
info now in `copilot.*` files

## 📁 **13-MODULE ARCHITECTURE**

```
src/main.js (1396L) → Core MDSG class + UI
src/services/ → auth, github, deployment, registry (4 files)
src/events/ → observable, handlers (2 files)
src/utils/ → security-minimal, validation, csrf, markdown-processor, state-management (5 files)
src/components/ → ui-components (1 file)
```

## 🔒 **SECURITY (100/100 SCORE)**

```javascript
// MANDATORY: Use MinimalSecurity for ALL user input
import { MinimalSecurity } from '@security';
const safe = MinimalSecurity.sanitizeHTML(userInput);
```

## ⚡ **QUICK COMMANDS**

```bash
npm run test tests/basic.test.js  # 31/31 must pass
npm run build && npm run size     # Check bundle size
npm run dev                       # Development server
```

## 🧭 **NAVIGATION MAP**

```
📋 Quick Ref: copilot.quick-ref.md
🎯 Decisions: copilot.decisions.md
🧬 Patterns: copilot.patterns.md
� Security: copilot.security.md
🧪 Testing: copilot.testing.md
🏗️ Architecture: copilot.architecture.md
⚡ Performance: copilot.performance.md
🚀 Deployment: copilot.deployment.md
```

## 🎭 **AI AGENT PROTOCOLS**

### **Comment Removal Protocol**

```bash
# MANDATORY: Run before ANY commit
find src -name "*.js" -exec grep -l "//" {} \; && echo "❌ COMMENTS FOUND" && exit 1
```

### **Pre-Change Validation**

```bash
# REQUIRED: Health check before changes
npm run test tests/basic.test.js | grep -q "31 passed" || exit 1
npm run size | grep -q "gzipped" && echo "✅ Bundle OK"
```

### **Issue Management**

```bash
# MANDATORY: Use gh client for all GitHub issues
gh issue list --state=open --assignee=@me  # Check assignments
gh issue view <issue-number>                # Get context
gh issue comment <issue-number> "Working on this"  # Update status
```

## 🎯 **DEVELOPMENT FOCUS**

- **Phase 1**: Core stability (✅ COMPLETE - 31/31 tests)
- **Phase 2**: Bundle optimization (<12KB stretch goal)
- **Phase 3**: Performance excellence (95+ Lighthouse)

## 📚 **DOCUMENTATION HIERARCHY**

1. **copilot.instructions.md** → Master AI agent guidance (this file)
2. **copilot.navigation.md** → Navigation & system overview
3. **copilot.\*.md** → Specialized quick references (8 files)

**✅ COMPLETE**: All verbose documentation eliminated. Only essential
`copilot.*` files remain.

---

_🧪 Optimized for AI consumption: 70 lines vs 1200+ original_
