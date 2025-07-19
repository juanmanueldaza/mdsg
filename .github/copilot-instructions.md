# GitHub Copilot Instructions for MDSG

> **🌐 Live Site**: https://mdsg.daza.ar/ (GitHub Pages)

## 📊 Live Project Dashboard
*Last Updated: 2025-01-19 | Next Review: Weekly*

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| **Bundle Size** | 14.0KB gzipped | <20KB (stretch: <12KB) | ✅ Excellent |
| **Core Tests** | 25/25 passing | 100% core features | ✅ Complete |
| **Advanced Tests** | 0/64 passing | Future implementation | 📋 Planned |
| **CI/CD Status** | All workflows ✅ | All passing | ✅ Healthy |
| **Architecture** | Frontend-only static site | No backend required | ✅ Simple |

## 🔧 Quick Commands Reference

```bash
# 🏃 Development (Most Used)
npm run dev              # Frontend dev server ✅
npm run dev:server       # Dev OAuth helper (optional) ✅
npm run test tests/basic.test.js  # Core tests (25/25 ✅)

# 📦 Build & Deploy
npm run build           # Production build → 14.0KB ✅
npm run size            # Check bundle size
npm run lint            # Code quality ✅

# 🧪 Testing Strategy
npm run test:run tests/basic.test.js     # ✅ RELIABLE (25/25)
npm run test:run tests/markdown.test.js  # 📋 PLANNED (0/49)  
npm run test:run tests/mdsg.test.js      # 📋 PLANNED (0/43)

# 🔍 Status Verification (AI Agent Validation)
npm run size            # Verify bundle size (expect: ~14.0KB total)
npm run test tests/basic.test.js --reporter=verbose  # Verify core tests (expect: 25/25 ✅)
npm run lint --quiet    # Verify code quality (expect: no errors)
npm run build > /dev/null 2>&1 && echo "✅ Build Success" || echo "❌ Build Failed"
curl -s -o /dev/null -w "%{http_code}" https://mdsg.daza.ar/ | grep -q "200" && echo "✅ Site Live" || echo "❌ Site Down"
```

## 🤖 AI Agent Handbook & Memory System

This file serves as the **primary knowledge base and navigation hub** for AI agents working on MDSG. All documentation is interconnected and should be referenced together for comprehensive understanding.

## 📍 Navigation Map

Use this as your knowledge navigation system:

```
🎯 ENTRY POINT: copilot-instructions.md (this file)
├── 🏗️ .github/docs/architecture.md     → System design & patterns
├── 🔌 .github/docs/api.md              → API reference & integration
├── 🧪 .github/docs/testing.md          → Testing strategy & implementation
├── 🚀 .github/docs/deployment.md       → Production deployment guide
├── ⚡ .github/docs/performance.md       → Performance optimization
└── 🔒 .github/docs/security.md         → Security implementation
```

**📋 DOCUMENTATION RULE**: ALL documentation MUST be in `.github/docs/` directory - never create docs elsewhere!

## 🎯 Agent Mission & Context

### Project Identity
**MDSG (Markdown Site Generator)** - A lightweight, browser-based tool that creates GitHub Pages websites from markdown content in under 5 minutes.

**🌐 Live Application**: https://mdsg.daza.ar/  
**🏗️ Hosting**: GitHub Pages (static site deployment)  
**📦 Repository**: https://github.com/juanmanueldaza/mdsg

### Core Values & Current Status
1. **KISS Principles** ✅ **ACHIEVED**: Vanilla JavaScript, single main.js (1690 lines)
2. **Performance First** ✅ **ACHIEVED**: 14.0KB bundle (<20KB target), mobile-responsive
3. **Security Focus** 🔧 **BASIC**: OAuth working, input validation, rate limiting
4. **User-Centric** ✅ **ACHIEVED**: Zero-setup, 5-minute deployment working
5. **Developer Experience** ✅ **ACHIEVED**: 25/25 core tests, clear documentation

### Development Phase Status
- **Phase 1 (Core)**: ✅ **COMPLETE** - All basic functionality working
- **Phase 2 (Enhanced)**: 🚧 **IN PROGRESS** - Advanced markdown features
- **Phase 3 (Performance)**: 📋 **PLANNED** - <12KB target, 95+ Lighthouse
- **Phase 4 (Architecture)**: 📋 **PLANNED** - Clean Architecture migration

### Current Implementation Status (ACTUAL STATE)

#### ✅ **WORKING FEATURES** (Production Ready)
- **Core Functionality**: 100% working (25/25 basic tests passing)
- **Bundle Size**: 14.0KB total gzipped (10.8KB JS + 3.2KB CSS)
- **Basic Markdown**: Headers, bold, italic, links, images, simple lists, code blocks
- **Authentication**: GitHub OAuth integration working
- **Site Generation**: Basic HTML generation from markdown
- **Deployment**: GitHub Pages integration functional (live at mdsg.daza.ar)
- **Mobile Support**: Responsive design implemented
- **Core Security**: Input validation, XSS protection, direct GitHub OAuth

#### 🚧 **IN DEVELOPMENT** (Partially Implemented)
- **Advanced Markdown**: Syntax highlighting, tables, nested lists, emojis
- **UI/UX**: Mobile optimizations, advanced editor features
- **Performance**: Bundle optimization, lighthouse score improvements
- **Testing**: Advanced feature test coverage (64 tests pending)

#### 📋 **PLANNED FEATURES** (Roadmap)
- **Clean Architecture**: Domain/Application/Infrastructure layers
- **Advanced Security**: Complete A+ security audit compliance
- **Performance**: <12KB bundle target, 95+ Lighthouse scores
- **Full Markdown**: Complete CommonMark + GFM support
- **Advanced Features**: Real-time collaboration, themes, plugins

### Current Metrics (VERIFIED STATUS)
- **Bundle Size**: 14.0KB total gzipped (Target: <20KB - ✅ ACHIEVED, Stretch: <12KB)
  - JavaScript: 10.8KB gzipped  
  - CSS: 3.2KB gzipped
- **Lighthouse Performance**: Not measured (Target: 90+, Stretch: 95+)
- **Test Coverage**: 25/25 core tests passing (Target: 100% core features - ✅ ACHIEVED)
- **Security Score**: Basic protection implemented (Target: A+ comprehensive)
- **Initialization**: <200ms estimated (Target: <200ms)
- **CI/CD Status**: ✅ ALL CORE WORKFLOWS PASSING

### AI Agent Pre-Flight Checklist (MANDATORY)
Before making ANY changes, AI agents MUST verify:
```bash
# 1. Core tests are passing
npm run test tests/basic.test.js --run | grep -q "25 passed" || exit 1

# 2. Bundle size is within limits  
npm run size 2>/dev/null | grep -q "gzipped" && echo "✅ Bundle check passed"

# 3. Live site is accessible
curl -s -f https://mdsg.daza.ar/ > /dev/null && echo "✅ Site accessible"

# 4. No linting errors
npm run lint --quiet && echo "✅ Code quality verified"
```
**⚠️ RULE**: If ANY check fails, investigate BEFORE proceeding with changes.

## 🧠 Mental Model for Navigation

### When Working on Frontend (src/main.js)
```
📁 Current Structure: MONOLITHIC IMPLEMENTATION
├── src/main.js → Single 1690-line file with all functionality
├── Key Classes: MDSG (main class)
├── Core Methods: markdownToHTML(), setupUI(), authenticate()
└── Status: FULLY FUNCTIONAL for basic features

🔍 Primary References:
├── architecture.md → Future patterns & planned UI structure
├── performance.md → Bundle optimization & runtime efficiency
├── security.md → XSS prevention & input validation
└── testing.md → Unit test patterns & coverage

🎯 Key Principles (CURRENT):
- Vanilla JavaScript only (no frameworks) ✅ IMPLEMENTED
- Mobile-first responsive design ✅ IMPLEMENTED
- Debounced input handling ✅ IMPLEMENTED
- XSS-safe markdown parsing ✅ BASIC IMPLEMENTATION
```

### When Working on GitHub OAuth Integration
```
📁 Current Structure: FRONTEND-ONLY STATIC SITE
├── Live Site: https://mdsg.daza.ar/ (GitHub Pages)
├── Direct GitHub OAuth (no backend required)
├── Personal Access Token flow
├── Local storage for token management
└── Status: FULLY FUNCTIONAL

🔍 Primary References:
├── security.md → OAuth security patterns
├── api.md → GitHub API integration
├── deployment.md → Static site deployment
└── architecture.md → Frontend-only patterns

🎯 Key Principles (CURRENT):
- Direct GitHub OAuth 2.0 ✅ IMPLEMENTED
- Client-side token management ✅ IMPLEMENTED
- No backend dependencies ✅ IMPLEMENTED
- GitHub Pages deployment ✅ IMPLEMENTED

Note: server.js exists for development convenience only
```

### When Working on Tests (tests/)
```
📁 Current Structure: TIERED TESTING APPROACH
├── tests/basic.test.js → 25 core tests (✅ ALL PASSING)
├── tests/markdown.test.js → Advanced markdown (❌ MOST FAILING)
├── tests/mdsg.test.js → Integration tests (❌ MOST FAILING)
└── tests/setup.js → Test utilities (✅ WORKING)

🔍 Primary References:
├── testing.md → Test structure & patterns
├── security.md → Security test scenarios
├── performance.md → Performance benchmarks
└── api.md → Integration test flows

🎯 Key Principles (CURRENT):
- AAA pattern (Arrange, Act, Assert) ✅ IMPLEMENTED
- Mock external dependencies using setup.js utilities ✅ IMPLEMENTED
- Test error scenarios with DOM-safe implementations ✅ IMPLEMENTED
- Separate core tests (REQUIRED) from advanced tests (ASPIRATIONAL) ✅ IMPLEMENTED

📊 Test Status:
├── Core Functionality: 25/25 tests PASSING ✅
├── Advanced Markdown: 0/49 tests passing (planned features)
├── Integration Tests: 0/43 tests passing (planned features)
└── Total Coverage: 25/117 tests (21% - focused on working features)
```

### When Working on Build/Deploy (Static Site)
```
📁 Current Structure: VITE + GITHUB PAGES
├── vite.config.js → Build configuration
├── vitest.config.js → Test configuration
├── .github/workflows/deploy-pages.yml → Auto-deployment
└── dist/ → Static build output

🔍 Primary References:
├── performance.md → Bundle optimization
├── deployment.md → GitHub Pages deployment
├── security.md → Client-side security
└── architecture.md → Static site architecture

🎯 Key Principles (CURRENT):
- Vite static build ✅ IMPLEMENTED
- GitHub Pages auto-deploy ✅ IMPLEMENTED
- No backend dependencies ✅ IMPLEMENTED
- CDN-ready assets ✅ IMPLEMENTED
```

## 📖 Code Patterns & Standards

### Current File Structure (ACTUAL)
```
mdsg/
├── src/
│   └── main.js                 # Monolithic MDSG class (1690 lines, FULLY WORKING)
├── tests/
│   ├── basic.test.js          # Core functionality (25/25 PASSING)
│   ├── markdown.test.js       # Advanced features (0/49 passing)
│   ├── mdsg.test.js          # Integration tests (0/43 passing)
│   └── setup.js              # Test utilities (WORKING)
├── .github/
│   ├── docs/                  # Documentation (aspirational + current)
│   └── workflows/             # CI/CD (WORKING for core features)
├── dist/                      # Build output → deployed to mdsg.daza.ar
├── server.js                  # Dev OAuth helper (optional)
├── style.css                  # Styles (WORKING)
├── index.html                 # Entry point (WORKING)
├── CNAME                      # GitHub Pages custom domain (mdsg.daza.ar)
└── package.json               # Dependencies & scripts (WORKING)
```

### Coding Standards (CURRENT IMPLEMENTATION)
```javascript
// ✅ Current Working Pattern (MDSG Implementation)
class MDSG {
  constructor() {
    this.authenticated = false;
    this.user = null;
    this.token = null;
    this.content = '';
    this.repoName = '';
    this.existingSites = [];
    this.isMobile = this.detectMobile();
    this.init();
  }

  // ✅ WORKING: Basic markdown parsing
  markdownToHTML(markdown) {
    if (!markdown) return '';
    let html = markdown;

    // ✅ IMPLEMENTED: Code blocks
    html = html.replace(/```([^`]*?)```/gs, '<pre><code>$1</code></pre>');

    // ✅ IMPLEMENTED: Headers with IDs
    html = html.replace(/^### (.*$)/gm, (match, text) => {
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      return `<h3 id="${id}">${text}</h3>`;
    });

    // ✅ IMPLEMENTED: Basic text formatting
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // ✅ IMPLEMENTED: Simple lists (basic)
    html = html.replace(/^[*\-+] (.+$)/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*?<\/li>)(\n<li>.*?<\/li>)*/gs, '<ul>$&</ul>');

    // ❌ NOT IMPLEMENTED: Syntax highlighting
    // ❌ NOT IMPLEMENTED: Tables
    // ❌ NOT IMPLEMENTED: Nested lists
    // ❌ NOT IMPLEMENTED: Emojis

    return html;
  }

  // ✅ WORKING: Input validation
  validateInput(input, type) {
    const validators = {
      github_token: (token) => /^[a-zA-Z0-9_]+$/.test(token) && token.length >= 20,
      repository_name: (name) => /^[a-zA-Z0-9._-]+$/.test(name) && name.length <= 100
    };
    return validators[type] ? validators[type](input) : false;
  }

  // ✅ WORKING: Content validation
  validateContent() {
    if (typeof this.content !== 'string') return false;
    if (this.content.trim().length === 0) return false;
    return true;
  }

  // ✅ WORKING: HTML escaping
  escapeHtml(text) {
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

### Performance Patterns (CURRENT)
```javascript
// ✅ IMPLEMENTED: Debouncing for Performance
const debouncedUpdate = debounce(() => {
  this.updatePreview();
  this.autoSave();
}, 300);

// ✅ IMPLEMENTED: Efficient DOM Operations
const fragment = document.createDocumentFragment();
items.forEach(item => fragment.appendChild(createItemElement(item)));
container.appendChild(fragment);

// ✅ IMPLEMENTED: Memory Management
class Component {
  mount() {
    this.element.addEventListener('click', this.handleClick);
  }
  unmount() {
    this.element.removeEventListener('click', this.handleClick);
  }
}
```

## 🎯 Decision Making Framework

### When Adding New Features
1. **Check Current Implementation** → Is this feature already working?
2. **Reference Documentation** → What's the planned approach in docs?
3. **Update Tests First** → Add to basic.test.js if core, or advanced files if optional
4. **Implement Incrementally** → Start with basic version, enhance later
5. **Update Metrics** → Verify bundle size and performance impact

### When Fixing Bugs
1. **Check Test Status** → Is there a test that should catch this?
2. **Fix in basic.test.js scope first** → Keep core functionality stable
3. **Consider Advanced Features** → Can this wait for the advanced implementation?
4. **Validate with Current Tools** → Use existing CI/CD pipeline

### When Optimizing
1. **Measure Current State** → Use npm run size, npm run perf
2. **Focus on Core Features** → Don't break working functionality
3. **Test Incrementally** → Use basic.test.js as regression test
4. **Document Changes** → Update metrics in this file

## 🚀 Quick Action References

### Working with Current Codebase
```bash
# ✅ WORKING: Core development workflow
# ✅ WORKING: Development
npm run dev              # Frontend development (working)
npm run dev:server       # Dev OAuth helper (optional, not needed in production)
npm run test tests/basic.test.js  # Run working tests
npm run build           # Static site production build → deploys to mdsg.daza.ar
npm run size            # Check current bundle size

# ❌ PARTIAL: Advanced features
npm run test tests/markdown.test.js  # Will fail (planned features)
npm run test tests/mdsg.test.js      # Will fail (planned features)
```

### Current Bundle Analysis
```bash
# Check current size (14.0KB total)
npm run size
# Expected output:
# index-*.css: 12.8KB (3.2KB gzipped)  
# index-*.js: 38.0KB (10.8KB gzipped)
```

### Testing Strategy
```bash
# ✅ RELIABLE: Core functionality tests
npm run test:run tests/basic.test.js

# 🚧 DEVELOPMENT: Advanced feature tests (will fail)
npm run test:run tests/markdown.test.js
npm run test:run tests/mdsg.test.js

# ✅ WORKING: Coverage for implemented features
npm run test:coverage tests/basic.test.js
```

## 🔄 Implementation Roadmap

### Phase 1: Core Functionality ✅ COMPLETE
- [x] Basic markdown parsing (headers, text formatting, simple lists)
- [x] Direct GitHub OAuth authentication (frontend-only)
- [x] Static site generation and GitHub Pages deployment (live at mdsg.daza.ar)
- [x] Mobile-responsive UI
- [x] Client-side security measures
- [x] Core test suite (25 tests)
- [x] GitHub Pages CI/CD pipeline with custom domain

### Phase 2: Enhanced Markdown 🚧 IN PROGRESS
- [ ] Syntax highlighting for code blocks
- [ ] Table parsing and rendering
- [ ] Nested lists with proper indentation
- [ ] Emoji support
- [ ] Advanced link handling
- [ ] Blockquote improvements

### Phase 3: Performance & UX 📋 PLANNED
- [ ] Bundle size optimization (<12KB target)
- [ ] Lighthouse score optimization (95+ target)
- [ ] Advanced editor features
- [ ] Real-time collaboration
- [ ] Theme system

### Phase 4: Architecture Evolution 📋 PLANNED
- [ ] Clean Architecture implementation
- [ ] Domain/Application/Infrastructure layers
- [ ] Plugin system
- [ ] Advanced security audit (A+ target)
- [ ] Comprehensive test coverage (90%+)

## 🎯 Agent Success Criteria

### Current Working Standards ✅
- [x] All basic tests passing (25/25)
- [x] Bundle size reasonable (<20KB - currently 14.0KB)
- [x] Core functionality stable
- [x] CI/CD working for implemented features
- [x] Basic security measures active

### Development Standards 🎯
- [ ] Implement new features incrementally
- [ ] Add tests to basic.test.js for core functionality
- [ ] Keep bundle size under 20KB (stretch: 12KB)
- [ ] Maintain backward compatibility
- [ ] Update documentation when adding features

### Quality Gates (CURRENT)
- [x] Core functionality tests pass ✅
- [x] Bundle builds successfully ✅
- [x] Basic security validation ✅
- [ ] Advanced feature tests (aspirational)
- [ ] Performance benchmarks (aspirational)

## 🔧 Development Commands (CURRENT STATUS)

```bash
# ✅ WORKING: Development
npm run dev              # Frontend development server (working)
npm run dev:server       # Backend OAuth server (working)

# ✅ WORKING: Testing
npm run test tests/basic.test.js  # Core tests (25/25 passing)
npm run test:coverage tests/basic.test.js  # Coverage for working features
npm run test:ui         # Visual test interface (working)

# ✅ WORKING: Build & Deploy
npm run build           # Production build (working)
npm run size            # Bundle size check (14.0KB total)

# ✅ WORKING: Quality
npm run lint            # Code linting (working)
npm run format          # Code formatting (working)
npm audit               # Security audit (working)

# 🚧 PARTIAL: Performance
npm run perf            # Lighthouse audit (needs implementation)
npm run analyze         # Bundle analysis (needs implementation)
```

## 💡 Agent Best Practices

### Information Gathering (Decision Tree)
```
🔍 STARTING A TASK?
├── Run Pre-Flight Checklist → Verify current system health
├── Check Dashboard Above → Current metrics & status
├── Identify Domain → Frontend/Backend/Testing/Docs
├── Verify Bundle Impact → npm run size (target: <20KB)
└── Reference Cross-Docs → Use navigation map

🎯 IMPLEMENTING FEATURES?
├── Pre-Flight Check → Ensure 25/25 tests passing baseline
├── Core Feature? → Add to basic.test.js (25/25 ✅)
├── Advanced Feature? → Check planned tests (64 pending)
├── Bundle Impact? → Monitor 14.0KB baseline
└── Architecture Change? → Consider Clean Architecture triggers

🔧 POST-IMPLEMENTATION VALIDATION?
├── Run full test suite → npm run test tests/basic.test.js
├── Check bundle impact → npm run size (must stay <20KB)
├── Verify site builds → npm run build
├── Test live deployment → curl -s https://mdsg.daza.ar/
└── Update metrics if changed → Modify dashboard above
```

### Code Implementation (Current Reality)
1. **Work within monolithic structure** → src/main.js (1690 lines working ✅)
2. **Test-driven approach** → basic.test.js for core, advanced files for roadmap
3. **Performance monitoring** → Bundle size check before commits
4. **Incremental delivery** → Build on 25/25 stable foundation

### Documentation Management (Enforced Standards)
1. **ALL documentation MUST be in `.github/docs/`** - never create docs elsewhere!
2. **Update this file** when adding new documentation files
3. **Reference format** → Always use `.github/docs/filename.md`
4. **Accuracy requirement** → Distinguish current vs planned features
5. **Timestamp updates** → Track documentation freshness

### Problem Solving (Escalation Path)
```
🐛 ISSUE ENCOUNTERED?
├── Core Functionality? → Check basic.test.js (25/25 should pass)
├── Advanced Feature? → Expected if not implemented yet
├── Bundle Size? → Target <20KB, investigate if exceeded
├── Architecture? → Stay monolithic until complexity demands change
└── Documentation? → Update to reflect actual state
```

### Quality Gates (Pre-Action Checklist)
**BEFORE ANY CHANGES:**
- [ ] Pre-flight checklist commands executed successfully
- [ ] Core tests baseline verified (25/25)
- [ ] Bundle size baseline confirmed (<20KB)
- [ ] Live site accessibility verified

**DURING DEVELOPMENT:**
- [ ] Incremental testing after each change
- [ ] Bundle size monitoring if modifying assets
- [ ] Documentation updated if needed
- [ ] Changes follow KISS principles

**AFTER IMPLEMENTATION:**
- [ ] Full test suite passes (25/25 maintained)
- [ ] Bundle size within limits (<20KB confirmed)
- [ ] Live site still functional
- [ ] Security implications considered
- [ ] Metrics updated in dashboard if changed

## 🎯 Agent Success Framework

### Decision Support System
```
🤔 MAKING A DECISION?
├── Performance Impact? → Reference dashboard metrics above
├── Security Implications? → Check .github/docs/security.md
├── Testing Strategy? → Use tiered approach (core → advanced)
├── Architecture Change? → Evaluate against current 1690-line baseline
└── Documentation Update? → Must be in .github/docs/
```

### Reality-Based Development Philosophy
This documentation provides both:
- **✅ CURRENT REALITY**: What actually works (25/25 core tests)
- **📋 FUTURE VISION**: What's planned (64 advanced features)
- **🎯 CLEAR TARGETS**: Measurable goals with current baselines

### Feature Status Legend
- **✅ WORKING**: Features with passing tests in basic.test.js (25/25)
- **🚧 IN PROGRESS**: Features partially implemented or being developed
- **📋 PLANNED**: Features described in docs/tests but not implemented
- **🔧 BASIC**: Features with minimal implementation, needs enhancement

### Success Metrics Tracking (Auto-Update Target)
```
📊 CURRENT BASELINE (Update when changed)
- Bundle Size: 14.0KB gzipped (target: <20KB ✅, stretch: <12KB)
- Core Tests: 25/25 passing (target: 100% core ✅)
- Advanced Tests: 0/64 passing (target: incremental implementation)
- CI/CD Health: All workflows passing ✅
- Architecture: Frontend-only static site (target: maintain simplicity)
```

### Quality Gates (Pre-Action Checklist)
**BEFORE ANY CHANGES:**
- [ ] Pre-flight checklist commands executed successfully
- [ ] Core tests baseline verified (25/25)
- [ ] Bundle size baseline confirmed (<20KB)
- [ ] Live site accessibility verified

**DURING DEVELOPMENT:**
- [ ] Incremental testing after each change
- [ ] Bundle size monitoring if modifying assets
- [ ] Documentation updated if needed
- [ ] Changes follow KISS principles

**AFTER IMPLEMENTATION:**
- [ ] Full test suite passes (25/25 maintained)
- [ ] Bundle size within limits (<20KB confirmed)
- [ ] Live site still functional
- [ ] Security implications considered
- [ ] Metrics updated in dashboard if changed

## 🎯 Agent Success Framework

### Decision Support System
```
🤔 MAKING A DECISION?
├── Performance Impact? → Reference dashboard metrics above
├── Security Implications? → Check .github/docs/security.md
├── Testing Strategy? → Use tiered approach (core → advanced)
├── Architecture Change? → Evaluate against current 1690-line baseline
└── Documentation Update? → Must be in .github/docs/
```

### Reality-Based Development Philosophy
This documentation provides both:
- **✅ CURRENT REALITY**: What actually works (25/25 core tests)
- **📋 FUTURE VISION**: What's planned (64 advanced features)
- **🎯 CLEAR TARGETS**: Measurable goals with current baselines

### Feature Status Legend
- **✅ WORKING**: Features with passing tests in basic.test.js (25/25)
- **🚧 IN PROGRESS**: Features partially implemented or being developed
- **📋 PLANNED**: Features described in docs/tests but not implemented
- **🔧 BASIC**: Features with minimal implementation, needs enhancement

### Success Metrics Tracking (Auto-Update Target)
```
📊 CURRENT BASELINE (Update when changed)
- Bundle Size: 14.0KB gzipped (target: <20KB ✅, stretch: <12KB)
- Core Tests: 25/25 passing (target: 100% core ✅)
- Advanced Tests: 0/64 passing (target: incremental implementation)
- CI/CD Health: All workflows passing ✅
- Architecture: Frontend-only static site (target: maintain simplicity)
```

### Documentation Quality Assurance
- **Location Standard**: `.github/docs/` directory ONLY
- **Cross-Reference Integrity**: All links verified and working
- **Currency Requirement**: Distinguish current implementation from roadmap
- **Update Protocol**: Timestamp and track all changes
- **Validation**: Pre-commit checks for doc-code consistency

### Agent Operating Principles
1. **🎯 Start with Dashboard**: Check current status before proceeding
2. **🔍 Verify Reality**: Test assumptions against actual implementation
3. **📦 Monitor Impact**: Bundle size and performance implications
4. **🧪 Test-Driven**: Core features must maintain 25/25 passing status
5. **📚 Document Changes**: Update relevant docs when implementation changes
6. **🔄 Feedback Loop**: Track what guidance was helpful vs needs improvement

### Mission Statement
**Build incrementally on the proven foundation** (14.0KB bundle, 25/25 tests) **while implementing advanced features systematically**. Always ensure documentation accuracy and proper organization in `.github/docs/`.

### Emergency Protocols
```
🚨 IF CORE TESTS FAIL (25/25 status broken):
1. Stop all feature development
2. Investigate regression immediately  
3. Restore working state
4. Update documentation if needed

🚨 IF BUNDLE SIZE EXCEEDS 20KB:
1. Analyze bundle composition (npm run size)
2. Identify size regression source
3. Optimize or revert changes
4. Update performance documentation

🚨 IF DOCUMENTATION BECOMES INACCURATE:
1. Identify gap between docs and reality
2. Update affected documentation files
3. Verify cross-references still work
4. Add timestamp and change log
```