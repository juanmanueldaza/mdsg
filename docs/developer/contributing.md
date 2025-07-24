# 🤝 Contributing to MDSG

> Help make MDSG even better! This guide covers everything you need to know to
> contribute effectively.

## 🎯 Ways to Contribute

### 🐞 Bug Reports

- Found a bug?
  [Report it here](https://github.com/juanmanueldaza/mdsg/issues/new?template=bug_report.md)
- Include browser, OS, and steps to reproduce
- Screenshots help immensely

### 💡 Feature Requests

- Have an idea?
  [Suggest it here](https://github.com/juanmanueldaza/mdsg/discussions/new?category=ideas)
- Explain the use case and benefit
- Consider implementation complexity

### 📝 Documentation

- Fix typos or improve clarity
- Add examples or tutorials
- Translate to other languages

### 💻 Code Contributions

- Fix bugs or implement features
- Improve performance or security
- Add tests or refactor code

## 🚀 Getting Started

### 1. Fork & Clone

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/mdsg.git
cd mdsg

# Add upstream remote
git remote add upstream https://github.com/juanmanueldaza/mdsg.git
```

### 2. Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Check code quality
npm run lint
```

See [Setup Guide](../../SETUP_GUIDE.md) for detailed environment setup.

### 3. Create a Branch

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Or bug fix branch
git checkout -b fix/bug-description
```

## 📋 Development Guidelines

### 🏗️ Code Standards

#### MDSG Quality Principles

- **KISS** - Keep it Simple, Stupid
- **SOLID** - Single responsibility, Open/closed, etc.
- **DRY** - Don't repeat yourself
- **CLEAN** - Readable, intention-revealing code

#### Code Quality Requirements

- ✅ **All tests pass** (191/191 tests must pass)
- ✅ **Zero lint errors** (ESLint + Prettier)
- ✅ **Bundle ≤ 20KB** (currently at limit - optimize before adding)
- ✅ **No console statements** in production code
- ✅ **Security-first** - XSS prevention, input validation

#### File Organization

```javascript
// ✅ Good: Clear module structure
src/
├── main.js              # Core MDSG class
├── services/            # Business logic
├── events/              # Event system
├── utils/               # Utilities
└── components/          # UI components

// ❌ Avoid: Dumping everything in one place
```

### 🧪 Testing Requirements

#### Test Coverage

- **New features** - Must include tests
- **Bug fixes** - Must include regression tests
- **Refactoring** - Existing tests must pass

#### Test Categories

```bash
# Run specific test suites
npm test basic.test.js      # Core functionality
npm test security.test.js   # Security features
npm test markdown.test.js   # Markdown processing
```

#### Writing Tests

```javascript
// ✅ Good test structure
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup
  });

  it('should handle specific scenario', () => {
    // Arrange
    const input = 'test data';

    // Act
    const result = functionUnderTest(input);

    // Assert
    expect(result).toBe('expected output');
  });
});
```

### 🔒 Security Guidelines

#### Input Validation

```javascript
// ✅ Always validate inputs
function processContent(content) {
  if (!content || typeof content !== 'string') {
    throw new Error('Content must be a non-empty string');
  }

  return MinimalSecurity.sanitizeHTML(content);
}

// ❌ Never trust user input
function processContent(content) {
  return content; // Dangerous!
}
```

#### XSS Prevention

- Use `MinimalSecurity.sanitizeHTML()` for user content
- Escape text with `MinimalSecurity.escapeText()`
- Validate URLs with `MinimalSecurity.isValidURL()`

#### Token Security

- Store tokens securely (sessionStorage only)
- Validate token format before use
- Clear tokens on logout

### 📦 Bundle Size Management

#### Current Status

```
Bundle Size: 20.80KB gzipped (AT LIMIT!)
Target: ≤ 20KB gzipped
```

#### Before Adding Features

```bash
# Check current size
npm run build
npx bundlesize

# If over limit, optimize first:
# - Remove unused dependencies
# - Use tree shaking
# - Minimize new code
```

#### Bundle Optimization

- Prefer native browser APIs over libraries
- Use dynamic imports for large features
- Tree-shake unused code
- Compress and minify

## 🔄 Development Workflow

### 1. Planning Phase

- **Discuss first** - Use GitHub Discussions for big changes
- **Check existing issues** - Avoid duplicate work
- **Design approach** - Consider KISS and SOLID principles

### 2. Implementation Phase

```bash
# Stay up to date
git fetch upstream
git rebase upstream/main

# Make changes
# Write tests
# Ensure quality gates pass

# Commit with conventional format
git add .
git commit -m "feat: add new authentication method"
```

### 3. Testing Phase

```bash
# Run full test suite
npm test

# Check code quality
npm run lint
npm run format

# Build and check bundle size
npm run build
```

### 4. Documentation Phase

- Update relevant documentation
- Add JSDoc comments for new APIs
- Include usage examples
- Update README if needed

## 📝 Commit Guidelines

### Conventional Commits

Use [Conventional Commits](https://conventionalcommits.org/) format:

```
type(scope): description

[optional body]

[optional footer]
```

#### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `perf` - Performance improvements
- `chore` - Maintenance tasks

#### Examples

```bash
git commit -m "feat: add GitHub OAuth integration"
git commit -m "fix: resolve deployment timeout issue"
git commit -m "docs: update API documentation"
git commit -m "test: add edge case coverage for markdown parser"
```

## 🔍 Pull Request Process

### 1. Before Submitting

- [ ] All tests pass locally
- [ ] Code follows style guidelines
- [ ] Bundle size is within limits
- [ ] Documentation is updated
- [ ] Commits follow conventional format

### 2. PR Description Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement

## Testing

- [ ] Added new tests
- [ ] All existing tests pass
- [ ] Manual testing completed

## Bundle Impact

- Current size: XXkB
- Impact: +/-XXkB

## Breaking Changes

- [ ] No breaking changes
- [ ] Has breaking changes (describe below)
```

### 3. Review Process

1. **Automated checks** - CI/CD must pass
2. **Code review** - Maintainer review required
3. **Testing** - Manual testing if needed
4. **Documentation** - Docs review if applicable

### 4. After Approval

```bash
# Maintainer will merge using squash merge
# Delete your feature branch after merge
git branch -d feature/your-feature-name
```

## 🏷️ Release Process

### Version Numbering

MDSG follows [Semantic Versioning](https://semver.org/):

- `MAJOR.MINOR.PATCH` (e.g., 1.2.3)
- **MAJOR** - Breaking changes
- **MINOR** - New features, backward compatible
- **PATCH** - Bug fixes, backward compatible

### Release Types

- **Patch** (1.0.1) - Bug fixes, small improvements
- **Minor** (1.1.0) - New features, enhancements
- **Major** (2.0.0) - Breaking changes, major rewrites

## 🎯 Contribution Areas

### 🔥 High Priority

- **Security improvements** - XSS prevention, validation
- **Performance optimization** - Bundle size, speed
- **Mobile experience** - Touch interface, responsive design
- **Accessibility** - Screen readers, keyboard navigation

### 📝 Documentation

- **User guides** - Tutorials, examples
- **API documentation** - JSDoc comments, examples
- **Troubleshooting** - Common issues, solutions
- **Translations** - Multiple language support

### 🚀 Features

- **GitHub integration** - Advanced repository management
- **Markdown features** - Tables, charts, advanced syntax
- **Template system** - Site templates, themes
- **Export options** - PDF, static files

### 🧪 Testing

- **Edge cases** - Unusual inputs, error conditions
- **Browser compatibility** - Different browsers/versions
- **Performance tests** - Load testing, memory usage
- **Security tests** - Penetration testing, vulnerability scanning

## 🆘 Getting Help

### Communication Channels

- **GitHub Discussions** - General questions, ideas
- **GitHub Issues** - Bug reports, specific problems
- **Code Review** - Ask questions in PR comments
- **Email** - Contact maintainers for urgent issues

### Resources

- [Setup Guide](../../SETUP_GUIDE.md) - Development environment
- [API Reference](api-reference.md) - Complete API docs
- [Architecture Guide](architecture.md) - System design
- [Security Guide](../operations/security.md) - Security practices

## 🏆 Recognition

### Contributors

All contributors are recognized in:

- GitHub contributors page
- Release notes
- Annual contributor acknowledgments

### Types of Recognition

- **First-time contributors** - Welcome and guidance
- **Regular contributors** - Community recognition
- **Major contributors** - Special acknowledgment
- **Maintainer invitation** - For exceptional contributors

## 📜 Code of Conduct

### Our Standards

- **Be respectful** - Treat everyone with kindness
- **Be constructive** - Provide helpful feedback
- **Be patient** - Help newcomers learn
- **Be inclusive** - Welcome diverse perspectives

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Publishing others' private information
- Other unprofessional conduct

### Enforcement

- Issues will be addressed promptly
- Violations may result in temporary or permanent bans
- Contact maintainers for serious issues

## 🚀 Ready to Contribute?

1. **Start small** - Fix a typo, improve documentation
2. **Read the code** - Understand existing patterns
3. **Ask questions** - We're here to help!
4. **Be patient** - Reviews take time
5. **Have fun** - Enjoy making MDSG better!

### Quick Start Checklist

- [ ] Read this contributing guide
- [ ] Set up development environment
- [ ] Run tests locally
- [ ] Find an issue to work on
- [ ] Submit your first PR

**Thank you for contributing to MDSG!** 🎉

Your contributions make MDSG better for thousands of users worldwide. Every bug
fix, feature, and documentation improvement matters.

**Let's build something amazing together!** 🚀
