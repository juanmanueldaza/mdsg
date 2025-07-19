# GitHub Copilot Instructions for MDSG

## 🤖 AI Agent Handbook & Memory System

This file serves as the **primary knowledge base and navigation hub** for AI agents working on MDSG. All documentation is interconnected and should be referenced together for comprehensive understanding.

## 📍 Navigation Map

Use this as your knowledge navigation system:

```
🎯 ENTRY POINT: copilot-instructions.md (this file)
├── 🏗️ docs/architecture.md     → System design & patterns
├── 🔌 docs/api.md              → API reference & integration
├── 🧪 docs/testing.md          → Testing strategy & implementation
├── 🚀 docs/deployment.md       → Production deployment guide
├── ⚡ docs/performance.md       → Performance optimization
├── 🔒 docs/security.md         → Security implementation
└── 📚 docs/README.md           → Documentation overview
```

## 🎯 Agent Mission & Context

### Project Identity
**MDSG (Markdown Site Generator)** - A lightweight, browser-based tool that creates GitHub Pages websites from markdown content in under 5 minutes.

### Core Values
1. **KISS Principles**: Avoid over-engineering, use vanilla JavaScript
2. **Performance First**: Bundle size <12KB gzipped, 95+ Lighthouse scores
3. **Security Focus**: Comprehensive security implementation
4. **User-Centric**: Zero-setup required, 5-minute deployment
5. **Developer Experience**: Clean code, extensive testing, clear documentation

### Current Metrics (Your Success Baseline)
- **Bundle Size**: 11.7KB gzipped (Target: <12KB)
- **Lighthouse Performance**: 98/100 (Target: 95+)
- **Test Coverage**: 55+ tests (Target: >90% critical paths)
- **Security Score**: A+ rating
- **Initialization**: <100ms (Target: <200ms)

## 🧠 Mental Model for Navigation

### When Working on Frontend (src/main.js)
```
🔍 Primary References:
├── architecture.md → Component patterns & UI structure
├── performance.md → Bundle optimization & runtime efficiency
├── security.md → XSS prevention & input validation
└── testing.md → Unit test patterns & coverage

🎯 Key Principles:
- Vanilla JavaScript only (no frameworks)
- Mobile-first responsive design
- Debounced input handling
- XSS-safe markdown parsing
```

### When Working on Backend (server.js)
```
🔍 Primary References:
├── security.md → OAuth flow & rate limiting
├── api.md → Endpoint structure & validation
├── deployment.md → Environment configuration
└── architecture.md → Data flow & proxy patterns

🎯 Key Principles:
- OAuth 2.0 with PKCE-like protection
- Rate limiting per client/endpoint
- Input validation on all routes
- No persistent sensitive data storage
```

### When Working on Tests (tests/)
```
🔍 Primary References:
├── testing.md → Test structure & patterns
├── security.md → Security test scenarios
├── performance.md → Performance benchmarks
└── api.md → Integration test flows

🎯 Key Principles:
- AAA pattern (Arrange, Act, Assert)
- Mock external dependencies
- Test error scenarios
- Performance budget validation
```

### When Working on Build/Config
```
🔍 Primary References:
├── performance.md → Bundle optimization
├── deployment.md → Production configuration
├── security.md → Security headers & CSP
└── architecture.md → Build pipeline

🎯 Key Principles:
- Aggressive tree shaking
- Minification without source maps
- ES2020 target for modern browsers
- Security headers in production
```

## 📖 Code Patterns & Standards

### File Structure Understanding
```
src/
├── main.js                 # Monolithic MDSG class (current approach)
├── domain/                 # Clean Architecture (prepared structure)
├── application/           # Use cases (prepared structure)
├── infrastructure/        # External services (prepared structure)
└── presentation/          # UI components (prepared structure)
```

### Coding Standards
```javascript
// ✅ Preferred Pattern
class ComponentName {
  constructor() {
    this.property = null;
    this.init();
  }

  async init() {
    try {
      await this.setupComponent();
    } catch (error) {
      this.handleError(error);
    }
  }

  handleError(error) {
    console.error('Component error:', error.message);
    this.showUserFriendlyError();
  }
}

// ✅ Input Validation Pattern
validateInput(input, type) {
  const validators = {
    github_token: (token) => /^[a-zA-Z0-9_]+$/.test(token) && token.length >= 20,
    repository_name: (name) => /^[a-zA-Z0-9._-]+$/.test(name) && name.length <= 100
  };
  return validators[type] ? validators[type](input) : false;
}

// ✅ Secure Markdown Parsing
parseMarkdown(markdown) {
  return markdown
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Always sanitize output
}
```

### Performance Patterns
```javascript
// ✅ Debouncing for Performance
const debouncedUpdate = debounce(() => {
  this.updatePreview();
  this.autoSave();
}, 300);

// ✅ Efficient DOM Operations
const fragment = document.createDocumentFragment();
items.forEach(item => fragment.appendChild(createItemElement(item)));
container.appendChild(fragment);

// ✅ Memory Management
class Component {
  mount() {
    this.element.addEventListener('click', this.handleClick);
  }
  unmount() {
    this.element.removeEventListener('click', this.handleClick);
  }
}
```

### Security Patterns
```javascript
// ✅ Input Sanitization
sanitizeHTML(html) {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

// ✅ Rate Limiting Check
if (clientData.count >= limit.max) {
  return res.status(429).json({
    error: 'Rate limit exceeded',
    retryAfter: Math.ceil((resetTime - now) / 1000)
  });
}
```

## 🎯 Decision Making Framework

### When Adding New Features
1. **Check Performance Impact** → Reference `docs/performance.md`
2. **Validate Security** → Reference `docs/security.md`
3. **Design API** → Reference `docs/api.md`
4. **Plan Tests** → Reference `docs/testing.md`
5. **Consider Architecture** → Reference `docs/architecture.md`

### When Fixing Bugs
1. **Reproduce with Test** → Use patterns from `docs/testing.md`
2. **Check Security Implications** → Reference `docs/security.md`
3. **Validate Performance** → Ensure no regression per `docs/performance.md`
4. **Update Documentation** → Maintain consistency across docs

### When Optimizing
1. **Measure First** → Use tools from `docs/performance.md`
2. **Security Review** → Ensure no vulnerabilities per `docs/security.md`
3. **Test Coverage** → Maintain standards from `docs/testing.md`
4. **Architecture Alignment** → Follow patterns from `docs/architecture.md`

## 🚀 Quick Action References

### Adding a New Component
```bash
# 1. Reference architecture patterns
→ docs/architecture.md#component-architecture

# 2. Implement with security
→ docs/security.md#input-validation-sanitization

# 3. Add comprehensive tests
→ docs/testing.md#unit-testing

# 4. Check performance impact
→ docs/performance.md#runtime-optimizations
```

### Debugging Performance Issues
```bash
# 1. Use performance analyzer
npm run analyze

# 2. Check against benchmarks
→ docs/performance.md#performance-metrics

# 3. Apply optimization techniques
→ docs/performance.md#optimization-techniques
```

### Implementing Security Features
```bash
# 1. Follow security architecture
→ docs/security.md#security-architecture

# 2. Implement validation patterns
→ docs/security.md#input-validation-sanitization

# 3. Add security tests
→ docs/testing.md#security-testing
```

### Deploying to Production
```bash
# 1. Follow deployment checklist
→ docs/deployment.md#production-checklist

# 2. Configure security headers
→ docs/security.md#security-headers

# 3. Set performance monitoring
→ docs/performance.md#performance-monitoring
```

## 🔄 Working with Architecture Evolution

### Current State: Hybrid Approach
- **Primary**: Monolithic `src/main.js` for rapid development
- **Prepared**: Clean Architecture structure for future scaling
- **Decision Point**: Use main.js for quick fixes, consider Clean Architecture for major features

### Migration Strategy
```javascript
// When adding complex features, consider:
// 1. Will this be >100 lines? → Consider Clean Architecture
// 2. Does it involve new external services? → Use infrastructure layer
// 3. Is it a new business process? → Create use case
// 4. Is it UI-heavy? → Consider presentation layer

// Reference: docs/architecture.md#migration-strategy
```

## 🎯 Agent Success Criteria

### Code Quality Gates
- [ ] All inputs validated using security patterns
- [ ] Performance impact measured and within budgets
- [ ] Tests added for new functionality
- [ ] Documentation updated if architecture changes
- [ ] Security review completed for sensitive operations

### Performance Gates
- [ ] Bundle size impact assessed
- [ ] Lighthouse score maintained (95+)
- [ ] No memory leaks introduced
- [ ] API response times within SLA

### Security Gates
- [ ] XSS prevention implemented
- [ ] Input validation on all entry points
- [ ] Rate limiting considered for new endpoints
- [ ] No sensitive data exposure

## 🔧 Development Commands Quick Reference

```bash
# Development
npm run dev              # Frontend development server
npm run dev:server       # Backend OAuth server

# Testing
npm run test            # Interactive test runner
npm run test:run        # Single test run
npm run test:coverage   # Coverage report
npm run test:ui         # Visual test interface

# Performance
npm run build           # Production build
npm run analyze         # Bundle analysis
npm run size            # Bundle size check
npm run perf            # Lighthouse audit

# Quality
npm run lint            # Code linting
npm run format          # Code formatting
npm audit               # Security audit
```

## 💡 Agent Best Practices

### Information Gathering
1. **Always start with** this file for context
2. **Reference specific docs** for detailed implementation
3. **Check current metrics** before making changes
4. **Validate assumptions** against existing patterns

### Code Implementation
1. **Follow established patterns** from the documentation
2. **Maintain performance budgets** as defined in docs
3. **Implement security by default** using provided patterns
4. **Test thoroughly** using documented strategies

### Problem Solving
1. **Check documentation first** for existing solutions
2. **Measure before optimizing** using provided tools
3. **Consider security implications** for all changes
4. **Update documentation** when adding new patterns

## 🎯 Remember: You Are The Expert

This documentation system is your extended memory. Use it to:
- **Navigate confidently** across all parts of the application
- **Make informed decisions** based on established patterns
- **Maintain consistency** with existing architecture
- **Preserve quality** through documented standards

When in doubt, reference the specific documentation sections. When making significant changes, ensure they align with the overall project philosophy documented across all sections.

**Your mission**: Build upon the excellent foundation documented here while maintaining the high standards of performance, security, and user experience that define MDSG.

## 🎯 Final Agent Empowerment

### You Have Complete Knowledge Access
This documentation system gives you:
- **Complete Context**: Current metrics, targets, and success criteria
- **Established Patterns**: Proven code patterns for all scenarios
- **Decision Frameworks**: Clear guidance for complex choices
- **Cross-References**: Interconnected knowledge for comprehensive understanding
- **Quality Gates**: Performance, security, and testing standards

### Your Operational Excellence
When working on MDSG, you can:
1. **Navigate Confidently** - This knowledge base covers every aspect
2. **Make Informed Decisions** - All patterns and trade-offs are documented
3. **Maintain Quality** - Standards and metrics are clearly defined
4. **Work Efficiently** - Quick reference guides for common tasks
5. **Preserve Architecture** - Clear guidance on evolution vs. stability

### Agent Success Formula
```
Context (copilot-instructions.md) + 
Detailed Knowledge (docs/) + 
Established Patterns + 
Quality Standards = 
Confident, High-Quality Development
```

Remember: You are not just coding - you are maintaining and enhancing a carefully crafted system that achieves exceptional performance (11.7KB bundle, 98 Lighthouse score) while maintaining security (A+ rating) and developer experience. Use this knowledge base as your extended memory to work at the same level of excellence as the original creators.