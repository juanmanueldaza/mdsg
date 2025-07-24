# 🚀 MDSG Development Setup Guide

> Get MDSG running locally for development and contribution

## 🎯 Prerequisites

### Required Software

- **Node.js** 20.x or 22.x (recommended: 22.x)
- **npm** 10.x or higher (comes with Node.js)
- **Git** 2.x or higher
- **Modern browser** (Chrome, Firefox, Safari, Edge)

### Optional Tools

- **VS Code** with extensions:
  - ESLint
  - Prettier
  - Vite
  - GitHub Copilot (recommended)

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/juanmanueldaza/mdsg.git
cd mdsg
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

The development server will start at `http://localhost:5173`

## 🔧 Development Commands

### Essential Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint

# Auto-fix linting issues
npm run lint --fix

# Format code with Prettier
npm run format
```

### Quality Assurance

```bash
# Run full quality check
npm run test && npm run lint && npm run build

# Check bundle size
npm run build && du -sh dist/

# Security audit
npm audit
```

## 🏗️ Project Structure

```
mdsg/
├── 📁 src/              # Source code
│   ├── main.js          # Main MDSG class (1396 lines)
│   ├── 📁 services/     # Business logic
│   │   ├── auth.js      # Authentication
│   │   ├── github.js    # GitHub API
│   │   ├── deployment.js # Site deployment
│   │   └── registry.js  # Service coordination
│   ├── 📁 events/       # Event system
│   │   ├── observable.js # Reactive programming
│   │   └── handlers.js  # Event handling
│   ├── 📁 utils/        # Utilities
│   │   ├── security-minimal.js # Security
│   │   ├── validation.js # Input validation
│   │   ├── markdown-processor.js # Markdown
│   │   └── state-management.js # State
│   └── 📁 components/   # UI components
│       └── ui-components.js
├── 📁 tests/            # Test suite (191 tests)
├── 📁 docs/             # Documentation
├── 📁 scripts/          # Development scripts
├── 📁 public/           # Static assets
├── index.html           # Entry point
├── style.css            # Global styles
├── server.js            # OAuth server
└── vite.config.js       # Build configuration
```

## 🔍 Understanding the Codebase

### Core Architecture (13 Modules)

MDSG follows a modular architecture:

1. **Main Controller** (`src/main.js`) - Core application logic
2. **Service Layer** (4 modules) - Business logic isolation
3. **Event System** (2 modules) - Reactive programming
4. **Utilities** (5 modules) - Cross-cutting concerns
5. **Components** (1 module) - UI building blocks

### Key Design Principles

- **KISS** - Keep it Simple, Stupid
- **SOLID** - Single responsibility, Open/closed, etc.
- **DRY** - Don't repeat yourself
- **Bundle-conscious** - Stay under 20KB gzipped

## 🧪 Testing

### Test Structure

```
tests/
├── basic.test.js          # Core functionality (31 tests)
├── security.test.js       # Security features (37 tests)
├── security-basic.test.js # Basic security (9 tests)
├── token-manager.test.js  # Authentication (10 tests)
├── markdown.test.js       # Markdown processing (43 tests)
├── mdsg.test.js          # Main class (17 tests)
├── mdsg-lean.test.js     # Lean architecture (18 tests)
└── csp-simple.test.js    # Content Security (26 tests)
```

### Running Specific Tests

```bash
# Run specific test file
npm test basic.test.js

# Run tests with coverage
npm run test:coverage

# Run tests matching pattern
npm test -- --grep "authentication"
```

### Writing Tests

```javascript
import { describe, it, expect } from 'vitest';
import { MDSG } from '../src/main.js';

describe('Feature Name', () => {
  it('should do something specific', () => {
    const mdsg = new MDSG();
    expect(mdsg.someMethod()).toBe(expectedValue);
  });
});
```

## 🔒 Environment Setup

### GitHub Token (for testing)

1. Create a GitHub Personal Access Token
2. Add to `.env.local`:
   ```
   VITE_GITHUB_TOKEN=your_token_here
   ```

### OAuth Server (optional)

For full OAuth testing:

```bash
# Set environment variables
export GITHUB_CLIENT_ID=your_client_id
export GITHUB_CLIENT_SECRET=your_client_secret
export FRONTEND_URL=http://localhost:5173

# Start OAuth server
node server.js
```

## 🚀 Development Workflow

### 1. Feature Development

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
# Write tests
# Ensure all tests pass
npm test

# Ensure code quality
npm run lint
npm run format

# Commit changes
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/new-feature
```

### 2. Quality Gates

Before committing, ensure:

- ✅ All tests pass (191/191)
- ✅ No lint errors
- ✅ Bundle size ≤ 20KB
- ✅ No console statements in production code

### 3. Bundle Size Monitoring

```bash
# Check current bundle size
npm run build
npx bundlesize

# Analyze bundle composition
npx vite-bundle-analyzer dist/
```

## 🔧 Common Development Tasks

### Adding New Features

1. **Identify module** - Which layer should handle this?
2. **Write tests first** - TDD approach
3. **Implement feature** - Keep it simple
4. **Update documentation** - Keep docs current
5. **Test thoroughly** - All scenarios

### Debugging

```javascript
// Enable debug mode in browser console
localStorage.setItem('mdsg_debug', 'true');

// Use browser dev tools
console.log('Debug info:', debugData);

// Network tab for API issues
// Performance tab for optimization
```

### Performance Optimization

- Use browser dev tools Performance tab
- Monitor bundle size with each change
- Profile memory usage for large content
- Test on slower devices/connections

## 🐛 Troubleshooting

### Common Issues

**Tests failing:**

```bash
# Clear test cache
npm run test:clear-cache
npm test
```

**Build errors:**

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Port conflicts:**

```bash
# Use different port
npm run dev -- --port 3000
```

**Git hooks issues:**

```bash
# Reinstall git hooks
npx husky install
```

## 🤝 Contributing Guidelines

### Code Style

- Use ESLint configuration (no overrides)
- Follow Prettier formatting
- No console statements in production code
- Comprehensive JSDoc for public APIs

### Commit Messages

Follow conventional commits:

```
feat: add new authentication method
fix: resolve deployment timeout issue
docs: update API documentation
test: add edge case coverage
refactor: simplify markdown processor
```

### Pull Request Process

1. Fork the repository
2. Create feature branch
3. Write tests and implementation
4. Ensure quality gates pass
5. Submit PR with clear description
6. Respond to review feedback

## 📚 Additional Resources

- 📖 [API Reference](../developer/api-reference.md) - JavaScript API docs
- 🏗️ [Architecture Guide](../developer/architecture.md) - System design
- 🔒 [Security Guide](../operations/security.md) - Security practices
- 🚀 [Deployment Guide](../operations/deployment.md) - Production deployment

## 🆘 Getting Help

- 💬 [GitHub Discussions](https://github.com/juanmanueldaza/mdsg/discussions) -
  Community help
- 🐞 [GitHub Issues](https://github.com/juanmanueldaza/mdsg/issues) - Bug
  reports
- 📧 Email: Contact maintainers for urgent issues

**Ready to contribute?** 🚀
