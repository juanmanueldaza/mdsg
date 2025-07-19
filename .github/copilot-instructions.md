# GitHub Copilot Instructions for MDSG

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
├── 🔒 .github/docs/security.md         → Security implementation
└── 📚 .github/docs/README.md           → Documentation overview
```

**📋 DOCUMENTATION RULE**: ALL documentation MUST be in `.github/docs/` directory - never create docs elsewhere!

## 🎯 Agent Mission & Context

### Project Identity
**MDSG (Markdown Site Generator)** - A lightweight, browser-based tool that creates GitHub Pages websites from markdown content in under 5 minutes.

### Core Values
1. **KISS Principles**: Avoid over-engineering, use vanilla JavaScript
2. **Performance First**: Bundle size <20KB gzipped, 90+ Lighthouse scores
3. **Security Focus**: Comprehensive security implementation
4. **User-Centric**: Zero-setup required, 5-minute deployment
5. **Developer Experience**: Clean code, extensive testing, clear documentation

### Current Implementation Status (ACTUAL STATE)

#### ✅ **WORKING FEATURES** (Production Ready)
- **Core Functionality**: 100% working (25/25 basic tests passing)
- **Bundle Size**: 14.0KB total gzipped (10.8KB JS + 3.2KB CSS)
- **Basic Markdown**: Headers, bold, italic, links, images, simple lists, code blocks
- **Authentication**: GitHub OAuth integration working
- **Site Generation**: Basic HTML generation from markdown
- **Deployment**: GitHub Pages integration functional
- **Mobile Support**: Responsive design implemented
- **Core Security**: Input validation, XSS protection basics

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

### When Working on Backend (server.js)
```
📁 Current Structure: SIMPLE EXPRESS SERVER
├── server.js → OAuth proxy server (395 lines)
├── Key Features: GitHub OAuth flow, CORS handling
├── Security: Basic rate limiting, input validation
└── Status: FULLY FUNCTIONAL

🔍 Primary References:
├── security.md → OAuth flow & rate limiting
├── api.md → Endpoint structure & validation
├── deployment.md → Environment configuration
└── architecture.md → Data flow & proxy patterns

🎯 Key Principles (CURRENT):
- OAuth 2.0 with secure token handling ✅ IMPLEMENTED
- Basic rate limiting ✅ IMPLEMENTED
- Input validation on all routes ✅ IMPLEMENTED
- No persistent sensitive data storage ✅ IMPLEMENTED
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

### When Working on Build/Config
```
📁 Current Structure: VITE + MODERN TOOLING
├── vite.config.js → Build configuration
├── vitest.config.js → Test configuration
├── eslint.config.js → Code quality
└── package.json → Scripts and dependencies

🔍 Primary References:
├── performance.md → Bundle optimization
├── deployment.md → Production configuration
├── security.md → Security headers & CSP
└── architecture.md → Build pipeline

🎯 Key Principles (CURRENT):
- Vite for fast builds ✅ IMPLEMENTED
- Vitest for testing ✅ IMPLEMENTED
- ESLint + Prettier for code quality ✅ IMPLEMENTED
- No source maps in production ✅ IMPLEMENTED
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
├── dist/                      # Build output
├── server.js                  # OAuth server (WORKING)
├── style.css                  # Styles (WORKING)
├── index.html                 # Entry point (WORKING)
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
npm run dev              # Frontend development (working)
npm run dev:server       # Backend OAuth server (working)
npm run test tests/basic.test.js  # Run working tests
npm run build           # Production build (working)
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
- [x] GitHub OAuth authentication
- [x] Site generation and deployment
- [x] Mobile-responsive UI
- [x] Basic security measures
- [x] Core test suite (25 tests)
- [x] CI/CD pipeline for core features

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

### Information Gathering
1. **Start with this file** for current state vs aspirational goals
2. **Check test status** to understand what's actually working
3. **Verify bundle size** before making changes
4. **Reference docs** for planned patterns but implement incrementally

### Code Implementation
1. **Work within current monolithic structure** (src/main.js)
2. **Add to basic.test.js** for core features
3. **Test in development server** before building
4. **Check bundle impact** with npm run size

### Documentation Management
1. **ALL documentation MUST be in `.github/docs/`** - never create docs in root or other locations
2. **Update copilot-instructions.md** when adding new documentation files
3. **Reference documentation** using `.github/docs/filename.md` format
4. **Maintain documentation accuracy** - distinguish current vs planned features

### Problem Solving
1. **Focus on working features first** (basic.test.js scope)
2. **Implement advanced features incrementally**
3. **Maintain current performance characteristics**
4. **Update documentation to reflect actual state**

## 🎯 Remember: Reality-Based Development

### Current State Philosophy
This documentation provides both:
- **Current Reality**: What actually works (basic functionality)
- **Future Vision**: What's planned (advanced features)

### Working vs Planned
- **✅ WORKING**: Features with passing tests in basic.test.js
- **🚧 IN PROGRESS**: Features partially implemented
- **📋 PLANNED**: Features described in docs but not implemented

### Success Metrics (ACTUAL)
- **Bundle Size**: 14.0KB (good, target <20KB)
- **Core Tests**: 25/25 passing (excellent)
- **Advanced Tests**: 0/92 passing (expected - they test planned features)
- **CI/CD**: Working for implemented features
- **Security**: Basic protection active

### Documentation Standards (CRITICAL)
- **ALL documentation files MUST be in `.github/docs/`**
- **NEVER create documentation in root directory or other locations**
- **Always reference docs as `.github/docs/filename.md`**
- **Update this copilot-instructions.md when adding new documentation**
- **Keep documentation accurate and current vs aspirational**

When working on MDSG, focus on:
1. **Maintaining working core functionality**
2. **Implementing advanced features incrementally**
3. **Testing new features thoroughly**
4. **Keeping documentation accurate and properly located**

**Your mission**: Build incrementally on the solid foundation that exists, implementing advanced features one at a time while maintaining the excellent core functionality that's already working. Always ensure documentation is properly organized in `.github/docs/`.