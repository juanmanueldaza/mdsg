# Pull Request

## 📋 **Description**

<!-- Provide a clear and concise description of your changes -->

**Type of Change:**

- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality
      to not work as expected)
- [ ] 📚 Documentation update
- [ ] 🧹 Code cleanup/refactoring
- [ ] 🔒 Security enhancement
- [ ] ⚡ Performance improvement

## 🎯 **Related Issues**

<!-- Link to related issues using "Closes #123", "Fixes #456", "Related to #789" -->

Closes # Related to #

## 🔍 **Changes Made**

<!-- List the specific changes made in this PR -->

-
-
-

## 🧪 **Testing**

<!-- Describe the testing performed -->

- [ ] All existing tests pass (`npm run test tests/basic.test.js`)
- [ ] New tests added for new functionality
- [ ] Manual testing completed
- [ ] Edge cases considered and tested

**Test Results:**

```bash
# Paste test output here
```

## 📊 **Bundle Impact Assessment**

<!-- CRITICAL: Verify bundle size impact -->

- [ ] Bundle size checked (`npm run build && npm run size`)
- [ ] Bundle remains ≤20KB (current: 20.80KB)
- [ ] No unnecessary dependencies added
- [ ] Code is optimized for size

**Bundle Analysis:**

```bash
# Paste bundle size output here
Before: X KB gzipped
After:  X KB gzipped
Delta:  +/- X KB
```

## 🔒 **Security Checklist**

<!-- Ensure security standards are maintained -->

- [ ] No XSS vulnerabilities introduced
- [ ] All user inputs properly sanitized using MinimalSecurity
- [ ] No direct innerHTML usage without sanitization
- [ ] CSP compliance maintained
- [ ] Security score remains 100/100

**Security Validation:**

- [ ] MinimalSecurity patterns used where applicable
- [ ] Input validation implemented
- [ ] Output encoding applied
- [ ] No security regressions

## ⚡ **Performance Checklist**

<!-- Verify performance impact -->

- [ ] No performance regressions
- [ ] Efficient algorithms used
- [ ] Minimal DOM manipulations
- [ ] Lighthouse scores maintained (if UI changes)

## 📝 **Documentation**

<!-- Documentation updates -->

- [ ] Code is self-documenting (no comments in .js files)
- [ ] README updated if needed
- [ ] Copilot instructions updated if architecture changes
- [ ] Examples updated if API changes

## 🎯 **MDSG Constraints Compliance**

<!-- Verify adherence to MDSG's core constraints -->

- [ ] **Bundle Size**: ≤20KB gzipped ✅
- [ ] **Tests**: 31/31 passing ✅
- [ ] **Security**: 100/100 score maintained ✅
- [ ] **Frontend-only**: No backend dependencies ✅
- [ ] **Zero Comments**: No comments in .js files ✅

## 🔗 **Additional Context**

<!-- Add any other context, screenshots, or relevant information -->

## 📋 **Reviewer Checklist**

<!-- For reviewers -->

- [ ] Code follows MDSG patterns and conventions
- [ ] Bundle size impact is acceptable
- [ ] Security standards maintained
- [ ] Tests are comprehensive
- [ ] Documentation is updated
- [ ] No breaking changes to existing functionality

---

**✨ Thank you for contributing to MDSG!**

Please ensure all checkboxes are completed before requesting review.
