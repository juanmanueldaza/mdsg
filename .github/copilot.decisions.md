# 🎯 MDSG DECISION MATRIX
*Instant decision support for GitHub Copilot*

## ⚡ **INSTANT DECISIONS**

### **Adding Features?**
```
Bundle impact? → npm run size (stay <20KB)
Core feature? → Add to basic.test.js  
Advanced? → Document for Phase 2
Security risk? → Use MinimalSecurity patterns
```

### **Fixing Bugs?**
```
Core broken? → Check basic.test.js (31/31 required)
Import error? → Check module paths in src/
Security issue? → Apply sanitization patterns
Performance? → Profile with npm run size
```

### **Code Patterns?**
```
Comments found? → Remove immediately (zero tolerance)
New module? → Follow src/ structure (services/events/utils)
Event handling? → Use Observable patterns (src/events/)
User input? → MinimalSecurity.sanitizeHTML() 
```

## 🚨 **RED FLAGS** (Stop immediately)
- Comments in .js files
- Bundle >20KB  
- Tests failing
- Direct innerHTML usage
- Unvalidated user input

## ✅ **GREEN PATTERNS** (Approved)
- Self-documenting function names
- MinimalSecurity usage
- Observable event patterns  
- Module separation
- Test-driven changes

## 📊 **QUICK METRICS**
```bash
# Health check (run before any change)
npm run test tests/basic.test.js | grep "31 passed"
npm run size | grep -E "KB.*gzipped"
curl -s https://mdsg.daza.ar/ | grep -q "MDSG"
```
