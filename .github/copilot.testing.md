# 🧪 TESTING QUICK REFERENCE  
*Essential testing patterns for MDSG*

## ✅ **CURRENT STATUS: 31/31 CORE TESTS PASSING**

## 🎯 **INSTANT TEST COMMANDS**
```bash
# CORE TESTS (MUST ALWAYS PASS)
npm run test tests/basic.test.js --run    # 31/31 ✅

# SECURITY TESTS (Import issues - needs fix)  
npm run test tests/security.test.js --run

# CSP TESTS (Working)
npm run test tests/csp-simple.test.js --run

# BUILD VALIDATION
npm run build && echo "✅ Build successful"
```

## 🧪 **TEST PATTERNS**
```javascript
// AAA Pattern (Arrange, Act, Assert)
it('should sanitize malicious HTML', () => {
  // Arrange
  const maliciousInput = '<script>alert("xss")</script>';
  
  // Act  
  const result = MinimalSecurity.sanitizeHTML(maliciousInput);
  
  // Assert
  expect(result).not.toContain('<script>');
});

// Observable testing
it('should debounce input events', async () => {
  const input$ = new Observable(obs => obs.next('test'));
  const debounced = input$.debounce(100);
  // Test implementation...
});
```

## 🎯 **TEST CATEGORIES**

### **Core Tests** (31/31 ✅)
- MDSG class initialization
- Markdown processing
- Authentication flow
- UI component rendering
- GitHub API integration

### **Security Tests** (Import issues ❌)
- XSS prevention  
- Input validation
- Token security
- CSP compliance

### **Advanced Tests** (Planned)
- Performance benchmarks
- Integration scenarios
- Error handling

## 🚨 **TEST REQUIREMENTS**
- **31/31 core tests** must pass before ANY commit
- **No regressions** allowed in basic functionality
- **Security tests** must pass after import fixes
- **Bundle size** verified after changes

## ⚡ **QUICK TEST DEBUGGING**
```bash
# Find failing tests
npm run test tests/basic.test.js | grep -E "(FAIL|✗)"

# Check specific test file
npm run test tests/basic.test.js --reporter=verbose

# Test single function
npm run test tests/basic.test.js -t "should process markdown"
```

*Condensed from 900+ lines of testing docs*
