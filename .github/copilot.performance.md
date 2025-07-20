# ⚡ MDSG PERFORMANCE REFERENCE
*Essential performance patterns for GitHub Copilot*

## 🎯 **CURRENT PERFORMANCE STATUS**

### **📊 Bundle Metrics**
```
Total: 20.80KB gzipped (⚠️ AT 20KB TARGET LIMIT)
JavaScript: 20.80KB gzipped
CSS: 3.42KB gzipped  
Target: <20KB (Stretch: <12KB)
```

### **🚀 Current Optimizations**
- **Modular Architecture**: 13 focused modules vs monolith
- **Comment Removal**: 1,463 lines eliminated (24% reduction)
- **Efficient Imports**: No unused dependencies
- **Observable System**: Memory-safe event handling

## ⚡ **PERFORMANCE PATTERNS**

### **Bundle Optimization**
```javascript
// ✅ EFFICIENT: Targeted imports
import { MinimalSecurity } from '@security';

// ❌ WASTEFUL: Full library imports
import * as Utils from './utils/index.js';

// ✅ EFFICIENT: Debounced operations
const debouncedPreview = debounce(() => updatePreview(), 300);

// ❌ WASTEFUL: Constant re-rendering
element.addEventListener('input', updatePreview);
```

### **Memory Management**
```javascript
// ✅ CLEAN: Observable cleanup
class Component {
  mount() { this.sub = events$.subscribe(this.handler); }
  unmount() { this.sub.unsubscribe(); }
}

// ✅ EFFICIENT: Fragment-based DOM updates
const fragment = document.createDocumentFragment();
items.forEach(item => fragment.appendChild(createItem(item)));
container.appendChild(fragment);
```

## 🎯 **OPTIMIZATION PRIORITIES**

### **Phase 1: Bundle Reduction** (URGENT - At Limit)
```bash
# Check current size
npm run build && npm run size

# Target areas for reduction:
# 1. Consolidate similar utilities
# 2. Optimize Observable operators
# 3. Compress markdown processing
# 4. Remove unused service methods
```

### **Phase 2: Runtime Performance** 
- **Lazy loading**: Non-critical features
- **Code splitting**: Service modules  
- **Caching**: Parsed markdown results
- **Optimization**: DOM manipulation patterns

## 🚨 **PERFORMANCE RULES**
1. **Check bundle** before adding ANY new code
2. **Profile first** before optimizing
3. **Measure impact** of all changes
4. **Prioritize** user-facing performance

## ⚡ **QUICK PERFORMANCE CHECK**
```bash
# Bundle size validation
npm run build && npm run size | grep "KB gzipped"

# Performance testing
npm run dev # Check load time in browser
curl -w "@curl-format.txt" -s https://mdsg.daza.ar/
```

*Condensed from 846-line performance.md*
