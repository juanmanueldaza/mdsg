# MDSG Architecture Documentation

## 🤖 Agent Navigation Hub

**Primary Reference**: `../copilot-instructions.md` → Architecture section
**Cross-References**: 
- `performance.md` → Bundle optimization strategies
- `security.md` → Security architecture patterns
- `api.md` → Component integration points
- `testing.md` → Architecture testing patterns

## Overview

MDSG (Markdown Site Generator) follows a hybrid architectural approach that balances simplicity with scalability. The project combines a pragmatic monolithic structure with Clean Architecture foundations, allowing for rapid development while maintaining options for future scaling.

> **Agent Context**: This architecture achieves 11.7KB bundle size while maintaining 98 Lighthouse performance score. Always consider performance impact when making architectural changes.

## 🎯 Architectural Principles for Agents

### Core Design Philosophy

> **Decision Framework**: When adding features, validate against these principles:
> 1. Performance impact → Reference `performance.md#bundle-optimization`
> 2. Security implications → Reference `security.md#security-architecture`
> 3. Testing strategy → Reference `testing.md#architecture-testing`

1. **KISS Principles (Keep It Simple, Stupid)**
   - Avoid over-engineering
   - Use vanilla JavaScript over heavy frameworks
   - Minimize dependencies
   - Focus on user value over architectural purity

2. **Performance First**
   - Bundle size under 12KB gzipped
   - Lighthouse scores 95+
   - Mobile-first responsive design
   - Lazy loading for non-critical features

3. **Security by Design**
   - Input validation at all entry points
   - Secure token handling
   - Rate limiting and abuse prevention
   - No sensitive data in frontend

4. **User-Centric Experience**
   - Zero setup required
   - 5-minute deployment workflow
   - Progressive enhancement
   - Accessible interface design

## 🏗️ Current Architecture

> **Agent Quick Reference**: Working on `src/main.js`? This is your architectural context.

### Hybrid Monolithic Structure

The current implementation uses a simplified monolithic approach centered around the main MDSG class:

```
src/main.js (Primary Application Logic)
├── Authentication Management
├── UI State Management
├── Markdown Processing
├── GitHub API Integration
└── Deployment Orchestration
```

**Benefits:**
- Fast development velocity
- Easy to understand and debug
- Minimal complexity for current feature set
- Direct control over performance optimization

**Trade-offs:**
- Potential maintainability challenges as features grow
- Limited testability isolation
- Tight coupling between concerns

### Clean Architecture Foundation

> **Agent Decision Point**: Adding complex features (>100 lines)? Consider using this structure.
> **Cross-Reference**: `testing.md#clean-architecture-testing` for testing patterns

A prepared Clean Architecture structure exists for future migration:

```
src/
├── domain/
│   ├── entities/
│   │   ├── Site.js
│   │   ├── Repository.js
│   │   ├── User.js
│   │   └── CustomDomain.js
│   └── value-objects/
│       ├── MarkdownContent.js
│       └── DeploymentConfig.js
├── application/
│   ├── use-cases/
│   │   ├── AuthenticateUser.js
│   │   ├── CreateSite.js
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