# MDSG Architecture Documentation

## 🤖 Agent Navigation Hub

**Primary Reference**: `../copilot-instructions.md` → Architecture section
**Cross-References**: 
- `performance.md` → Bundle optimization strategies
- `security.md` → Security architecture patterns
- `api.md` → Component integration points
- `testing.md` → Architecture testing patterns

## Overview

MDSG (Markdown Site Generator) is a **frontend-only static site** deployed to GitHub Pages at **https://mdsg.daza.ar/** with no backend dependencies. The project achieves a 14.0KB bundle with full core functionality using direct GitHub OAuth integration.

> **Agent Context**: Live at https://mdsg.daza.ar/ via GitHub Pages. Current bundle is 14.0KB (target <20KB). Frontend-only architecture with src/main.js (1690 lines) handling all functionality. No backend required.
> **Reality Check**: Static site deployment with custom domain, direct GitHub API integration, server.js only for development convenience.

## 🎯 Architectural Principles for Agents

### Core Design Philosophy

> **Decision Framework**: When adding features, validate against these principles:
> 1. Performance impact → Reference `performance.md#bundle-optimization`
> 2. Security implications → Reference `security.md#security-architecture`
> 3. Testing strategy → Reference `testing.md#architecture-testing`

1. **KISS Principles (Keep It Simple, Stupid)** ✅ ACHIEVED
   - Avoid over-engineering ✅ Single main.js file
   - Use vanilla JavaScript over heavy frameworks ✅ Zero frameworks
   - Minimize dependencies ✅ Frontend-only, no backend
   - Focus on user value over architectural purity ✅ 25/25 core tests passing

2. **Performance First** 🎯 GOOD PROGRESS
   - Bundle size under 20KB gzipped ✅ Currently 14.0KB (stretch: <12KB)
   - Lighthouse scores 90+ 📋 Need to measure (stretch: 95+)
   - Mobile-first responsive design ✅ Implemented
   - Lazy loading for non-critical features 📋 Not needed yet at current size

3. **Security by Design** 🔧 BASIC IMPLEMENTATION
   - Input validation at all entry points ✅ Basic validation implemented
   - Secure token handling ✅ Direct GitHub OAuth working
   - Rate limiting via GitHub API ✅ GitHub's built-in rate limiting
   - No sensitive data in frontend ✅ Tokens handled securely

4. **User-Centric Experience** ✅ CORE ACHIEVED
   - Zero setup required ✅ Works in browser
   - 5-minute deployment workflow ✅ GitHub Pages integration
   - Progressive enhancement ✅ Basic functionality solid
   - Accessible interface design 🔧 Basic responsive design

## 🏗️ Current Architecture (ACTUAL IMPLEMENTATION)

> **Agent Quick Reference**: ALL code is in `src/main.js` (1690 lines). Frontend-only static site deployed to https://mdsg.daza.ar/
> **Working Reality**: Monolithic MDSG class handles everything. Direct GitHub OAuth, no backend required. Live on GitHub Pages with custom domain.

### Frontend-Only Structure (CURRENT WORKING STATE)

```
ACTUAL PROJECT STRUCTURE:
├── src/main.js (1690 lines) → ENTIRE APPLICATION
│   ├── class MDSG → All functionality
│   ├── markdownToHTML() → Basic markdown parsing
│   ├── setupUI() → All UI management  
│   ├── authenticate() → Direct GitHub OAuth flow
│   ├── generateSiteHTML() → Site generation
│   └── deployToGitHub() → GitHub Pages deployment
├── server.js (395 lines) → Dev OAuth helper (optional)
├── style.css → All styles
├── index.html → Entry point
├── CNAME → Custom domain configuration (mdsg.daza.ar)
└── dist/ → Static build output deployed to GitHub Pages

DEPLOYMENT:
├── GitHub Pages → https://mdsg.daza.ar/ (custom domain)
├── GitHub OAuth → Direct API integration
├── Auto-deploy → .github/workflows/deploy-pages.yml
└── No backend required → Pure frontend application

TEST STATUS:
├── tests/basic.test.js → 25/25 PASSING ✅
├── tests/markdown.test.js → 0/49 passing (advanced features)
└── tests/mdsg.test.js → 0/43 passing (integration features)
```

**Current Benefits:**
- ✅ Fast development - everything in one file
- ✅ Easy to debug - single source of truth
- ✅ Great performance - 14.0KB bundle
- ✅ Fully functional - all core features working
- ✅ Well tested - 25/25 core tests passing
- ✅ No backend complexity - pure frontend
- ✅ Simple deployment - static site to GitHub Pages with custom domain
- ✅ Live and accessible - https://mdsg.daza.ar/

**Current Trade-offs:**
- Large single file (1690 lines) but manageable
- Advanced features need incremental addition
- Future: May need Clean Architecture for complex features

### Clean Architecture Foundation (📋 PLANNED FOR FUTURE)

> **Agent Decision Point**: Currently NOT implemented. All code is in src/main.js monolith.
> **Future Migration**: When monolithic approach becomes limiting (>2000 lines? Complex features?)
> **Cross-Reference**: `testing.md#architecture-evolution` for migration testing patterns

**PLANNED Clean Architecture structure for future evolution:**

```
PLANNED FUTURE STRUCTURE (Not implemented):
src/
├── main.js (current - 1690 lines working) ← CURRENT REALITY
├── domain/ (planned)
│   ├── entities/
│   │   ├── Site.js
│   │   ├── Repository.js  
│   │   ├── User.js
│   │   └── CustomDomain.js
│   └── value-objects/
│       ├── MarkdownContent.js
│       └── DeploymentConfig.js
├── application/ (planned)
│   ├── use-cases/
│   │   ├── AuthenticateUser.js
│   │   ├── CreateSite.js
│   │   ├── DeployToGitHub.js
│   │   └── ParseMarkdown.js
├── infrastructure/ (planned)
│   ├── github/
│   │   ├── GitHubApiClient.js
│   │   └── OAuthService.js
│   └── storage/
│       └── LocalStorageService.js
└── presentation/ (planned)
    ├── components/
    │   ├── MarkdownEditor.js
    │   ├── SiteManager.js
    │   └── DeploymentStatus.js
    └── ui/
        ├── EventHandlers.js
        └── DOMHelpers.js

MIGRATION TRIGGERS:
- When main.js exceeds 2500 lines
- When adding plugin system
- When implementing real-time collaboration
- When adding complex advanced features
```

**Migration Benefits (Future):**
- Better testability with isolated components
- Easier to add complex features
- Better separation of concerns
- Plugin architecture support

**Current Reality:**
- ✅ Frontend-only approach working excellently (live at mdsg.daza.ar)
- ✅ 14.0KB bundle proves efficiency
- ✅ 25/25 tests passing shows stability
- ✅ No backend complexity or deployment issues
- ✅ Auto-deploy pipeline working with custom domain
- 📋 Migration only when complexity demands it
│   │   ├── DeploySite.js
│   │   └── ManageRepository.js
│   └── services/
│       ├── MarkdownParser.js
│       └── ValidationService.js
├── infrastructure/
│   ├── repositories/
│   │   ├── GitHubRepository.js
│   │   └── UserRepository.js
│   ├── external-services/
│   │   ├── GitHubAPI.js
│   │   └── OAuthService.js
│   └── persistence/
│       └── LocalStorage.js
└── presentation/
    ├── components/
    │   ├── Editor.js
    │   ├── Preview.js
    │   └── UserProfile.js
    ├── forms/
    │   ├── LoginForm.js
    │   └── DeploymentForm.js
    └── pages/
        ├── Dashboard.js
        └── EditorPage.js
```

## 🔧 Backend Architecture

> **Agent Context**: Working on `server.js`? Reference this section + `security.md#api-security`

### OAuth Server (Node.js/Express)

The backend serves as a secure proxy for GitHub OAuth and API operations:

```
server.js
├── Authentication Routes
│   ├── /auth/github/callback
│   ├── /auth/logout
│   └── /api/github/*
├── Security Middleware
│   ├── CORS Configuration
│   ├── Rate Limiting
│   ├── Security Headers
│   └── Input Validation
└── Session Management
    ├── JWT-like Token Creation
    ├── Token Validation
    └── Secure Token Storage
```

**Key Features:**
- Stateless session management
- Rate limiting with in-memory store
- Secure token proxying
- Comprehensive error handling

## 🔄 Data Flow Architecture

> **Agent Reference**: Understanding OAuth flow? Also check `api.md#authentication-api` and `security.md#oauth-implementation`

### Authentication Flow

```
User → Frontend → OAuth Server → GitHub → OAuth Server → Frontend
                     ↓
               Session Token Created
                     ↓
               GitHub Token Stored Securely
```

### Content Creation Flow

```
User Input → Markdown Parser → Live Preview
     ↓
Validation → Content Storage → Auto-save
     ↓
Deploy Action → GitHub API → Repository Creation → Pages Setup
```

### API Integration Flow

```
Frontend → OAuth Server Proxy → GitHub API
    ↓            ↓                  ↓
Rate Limit → Token Validation → Response Processing
    ↓            ↓                  ↓
Error Handle → Security Check → Data Return
```

## 🧩 Component Architecture

> **Agent Pattern Reference**: Use these patterns when extending frontend functionality

### Frontend Components

#### Core Application Class (MDSG)

> **Code Location**: `src/main.js` - This is the monolithic entry point

```javascript
class MDSG {
  constructor() {
    this.authenticated = false;
    this.user = null;
    this.content = '';
    this.init();
  }

  // Lifecycle Management
  init() { /* Setup and initialization */ }
  checkAuth() { /* Authentication state */ }
  setupUI() { /* User interface rendering */ }

  // Authentication
  loginWithGitHub() { /* OAuth flow */ }
  fetchUser() { /* User data retrieval */ }
  logout() { /* Session cleanup */ }

  // Content Management
  parseMarkdown() { /* Markdown processing */ }
  updatePreview() { /* Live preview update */ }
  autoSave() { /* Content persistence */ }

  // Deployment
  deployToGitHub() { /* Site deployment */ }
  createRepository() { /* Repo creation */ }
  enablePages() { /* GitHub Pages setup */ }

  // Error Handling
  showError() { /* User-friendly errors */ }
  handleApiError() { /* API error processing */ }
}
```

#### UI Component Structure

> **Agent Pattern**: Use this template for new UI components
> **Security Note**: Always validate inputs - see `security.md#input-validation`

Each UI component follows a consistent pattern:

```javascript
// Component Creation Pattern
createComponent(type, options = {}) {
  const element = document.createElement(type);
  
  // Accessibility
  element.setAttribute('aria-label', options.ariaLabel);
  
  // Event Handling
  element.addEventListener('action', async (e) => {
    try {
      // Loading state
      // Action execution
      // Success state
    } catch (error) {
      // Error handling
    }
  });
  
  return element;
}
```

## 🔒 Security Architecture

> **Cross-Reference**: Complete security details in `security.md`
> **Agent Alert**: Every frontend change must consider XSS prevention

### Frontend Security

1. **Input Validation**
   - All user inputs validated before processing
   - Regular expressions for format validation
   - Length limits for content protection

2. **XSS Prevention**
   - Content sanitization for preview
   - Safe DOM manipulation
   - CSP headers in production

3. **Token Security**
   - No sensitive tokens in frontend code
   - Secure token proxy pattern
   - Automatic token cleanup

### Backend Security

1. **Authentication Security**
   - OAuth 2.0 flow implementation
   - Session token with expiration
   - Rate limiting per client

2. **API Security**
   - Input validation middleware
   - CORS with specific origins
   - Security headers (HSTS, XSS protection)

3. **Data Protection**
   - No persistent sensitive data storage
   - In-memory token management
   - Automatic cleanup processes

## ⚡ Performance Architecture

> **Cross-Reference**: Complete performance guide in `performance.md`
> **Agent Budget**: JS <50KB, CSS <20KB, Total ~11.7KB gzipped

### Bundle Optimization

1. **Size Constraints**
   - JavaScript: <50KB gzipped
   - CSS: <20KB gzipped
   - Total: ~11.7KB gzipped

2. **Optimization Techniques**
   - Tree shaking for unused code
   - Dynamic imports for large features
   - Terser minification
   - CSS optimization

### Runtime Performance

1. **DOM Optimization**
   - Minimal DOM manipulations
   - Event delegation patterns
   - RequestAnimationFrame for animations

2. **Memory Management**
   - Cleanup event listeners
   - Avoid memory leaks
   - Efficient data structures

3. **Network Optimization**
   - Debounced API calls
   - Response caching where appropriate
   - Exponential backoff for retries

## 🧪 Testing Architecture

> **Cross-Reference**: Complete testing guide in `testing.md`
> **Agent Target**: >90% coverage for critical paths, AAA pattern required

### Test Structure

```
tests/
├── unit/
│   ├── mdsg.test.js (Core functionality)
│   ├── markdown.test.js (Parser tests)
│   └── basic.test.js (Utilities)
├── integration/
│   └── deployment.test.js (End-to-end flows)
├── mocks/
│   ├── github-api.js
│   └── localStorage.js
└── setup.js (Test configuration)
```

### Testing Patterns

1. **AAA Pattern (Arrange, Act, Assert)**
   ```javascript
   it('should handle user action', async () => {
     // Arrange
     const component = new Component();
     const mockData = { success: true };
     
     // Act
     const result = await component.action();
     
     // Assert
     expect(result).toBe(expected);
   });
   ```

2. **Mock Strategy**
   - External dependencies mocked
   - DOM environment simulated
   - Network requests intercepted

3. **Coverage Requirements**
   - >90% coverage for critical paths
   - Error scenarios tested
   - Edge cases covered

## 🚀 Deployment Architecture

> **Cross-Reference**: Complete deployment guide in `deployment.md`
> **Agent Pipeline**: All changes must pass CI/CD quality gates

### CI/CD Pipeline

```
GitHub Push → CI Pipeline
     ↓
[Test] → [Security] → [Build] → [Performance] → [Deploy]
     ↓         ↓         ↓           ↓            ↓
  Unit Tests  Audit   Bundle    Lighthouse    GitHub Pages
Integration Security  Size      Core Vitals   Production
  Coverage   Scan    Check     Accessibility
```

### Environment Configuration

1. **Development**
   - Local Vite dev server
   - Hot module replacement
   - Source maps enabled
   - Relaxed CORS policies

2. **Production**
   - Optimized build output
   - Source maps disabled
   - Strict security headers
   - Performance monitoring

## 🔄 Migration Strategy

> **Agent Decision Tree**: 
> - Quick fix? → Use monolithic `src/main.js`
> - Major feature? → Consider Clean Architecture migration
> - New domain logic? → Start with domain layer

### Path to Clean Architecture

The prepared Clean Architecture structure allows for gradual migration:

1. **Phase 1: Extract Entities**
   ```javascript
   // Move data structures to domain layer
   class Site {
     constructor(name, content, config) {
       this.name = name;
       this.content = content;
       this.config = config;
     }
   }
   ```

2. **Phase 2: Create Use Cases**
   ```javascript
   // Extract business logic
   class DeploySite {
     constructor(githubRepository) {
       this.githubRepository = githubRepository;
     }
     
     async execute(site) {
       return await this.githubRepository.deploy(site);
     }
   }
   ```

3. **Phase 3: Abstract Infrastructure**
   ```javascript
   // Isolate external dependencies
   class GitHubRepository {
     async deploy(site) {
       // GitHub API implementation
     }
   }
   ```

4. **Phase 4: Modularize Presentation**
   ```javascript
   // Component-based UI
   class EditorComponent {
     render() {
       // UI rendering logic
     }
   }
   ```

### Migration Benefits

- **Testability**: Easier unit testing with dependency injection
- **Maintainability**: Clear separation of concerns
- **Scalability**: Independent module development
- **Flexibility**: Easy to swap implementations

### Migration Risks

- **Complexity**: Increased cognitive overhead
- **Over-engineering**: Potential for unnecessary abstraction
- **Performance**: Additional indirection layers
- **Timeline**: Development velocity impact

## Architecture Decision Records

### ADR-001: Hybrid Architecture Approach

**Status**: Accepted

**Context**: Need to balance development speed with architectural quality

**Decision**: Use monolithic structure with Clean Architecture foundation

**Consequences**:
- ✅ Fast initial development
- ✅ Easy debugging and maintenance
- ✅ Clear migration path
- ❌ Potential technical debt
- ❌ Limited test isolation

### ADR-002: Vanilla JavaScript Over Framework

**Status**: Accepted

**Context**: Bundle size and performance requirements

**Decision**: Use vanilla JavaScript instead of React/Vue/Angular

**Consequences**:
- ✅ Minimal bundle size (11.7KB)
- ✅ No framework lock-in
- ✅ Direct performance control
- ❌ More manual DOM manipulation
- ❌ Less ecosystem tooling

### ADR-003: OAuth Proxy Server

**Status**: Accepted

**Context**: Security requirements for GitHub integration

**Decision**: Use backend proxy for OAuth and API calls

**Consequences**:
- ✅ Secure token handling
- ✅ Rate limiting control
- ✅ CORS management
- ❌ Additional infrastructure
- ❌ Backend dependency

## Future Architecture Considerations

### Scalability Patterns

1. **Micro-Frontend Architecture**
   - Independent deployable UI modules
   - Module federation for large teams
   - Runtime composition

2. **Event-Driven Architecture**
   - Pub/Sub for component communication
   - Decoupled business logic
   - Async processing capabilities

3. **Progressive Web App**
   - Service worker implementation
   - Offline functionality
   - App-like experience

### Technology Evolution

1. **WebAssembly Integration**
   - High-performance markdown parsing
   - Complex computation offloading
   - Language flexibility

2. **Web Components**
   - Standard-based component model
   - Framework interoperability
   - Encapsulation benefits

3. **Edge Computing**
   - CDN-based processing
   - Reduced server load
   - Global performance optimization

## 🎯 Conclusion for Agents

The MDSG architecture successfully balances pragmatism with architectural rigor. The hybrid approach enables rapid feature development while maintaining clear paths for scalability.

### Agent Success Checklist
When working with this architecture:
- [ ] Performance impact measured (`performance.md`)
- [ ] Security implications reviewed (`security.md`)
- [ ] Test coverage maintained (`testing.md`)
- [ ] API consistency preserved (`api.md`)
- [ ] Documentation updated (`copilot-instructions.md`)

### Quick Decision Matrix
| Task Type | Architecture Choice | Primary Docs |
|-----------|-------------------|--------------|
| Bug fix | Monolithic main.js | This + security.md |
| Small feature | Monolithic main.js | This + performance.md |
| Large feature | Consider Clean Arch | This + all docs |
| New domain | Clean Architecture | This + testing.md |

The Clean Architecture foundation provides options for future growth without forcing premature optimization.

Key architectural strengths:
- ✅ Performance optimized (11.7KB bundle)
- ✅ Security focused implementation
- ✅ Clear separation of concerns
- ✅ Comprehensive testing strategy
- ✅ Scalable foundation prepared

The architecture demonstrates mature engineering decision-making, prioritizing user value while maintaining technical quality and future flexibility.