# MDSG Performance Documentation

## 🤖 Agent Navigation Hub

**Primary Reference**: `../copilot-instructions.md` → Performance section
**Cross-References**: 
- `architecture.md` → Performance architecture patterns
- `security.md` → Security vs performance trade-offs
- `testing.md` → Performance testing strategies
- `deployment.md` → Production optimization

## Overview

MDSG is designed with performance as a core principle, achieving exceptional metrics while maintaining full functionality. This document covers performance optimization strategies, monitoring, and maintenance practices.

> **Agent Alert**: Current bundle is 14.0KB gzipped. Target: <20KB (stretch: <12KB)
> **Performance Budget**: JS <50KB, CSS <20KB, Lighthouse 90+ (stretch: 95+)

## 🎯 Performance Metrics for Agents

> **Quick Reference**: These are your success targets. Check impact before implementing changes.

### Current Performance Benchmarks

#### Bundle Size (Good - Within Target)
- **JavaScript**: 10.8KB gzipped (38.0KB uncompressed)
- **CSS**: 3.2KB gzipped (12.8KB uncompressed)  
- **Total Bundle**: 14.0KB gzipped (Target: <20KB ✅, Stretch: <12KB)
- **Compression Ratio**: 72% (Original: ~50KB)

#### Lighthouse Scores (To Be Measured)
- **Performance**: TBD (Target: 90+, Stretch: 95+)
- **Accessibility**: TBD (Target: 90+)
- **Best Practices**: TBD (Target: 90+)
- **SEO**: TBD (Target: 90+)
- **Status**: Need to implement `npm run perf` command

#### Core Web Vitals (To Be Measured)
- **First Contentful Paint (FCP)**: TBD (Target: <1.8s)
- **Largest Contentful Paint (LCP)**: TBD (Target: <2.5s) 
- **First Input Delay (FID)**: TBD (Target: <100ms)
- **Cumulative Layout Shift (CLS)**: TBD (Target: <0.1)

#### Runtime Performance (Estimated)
- **Application Initialization**: <200ms (estimated, target: <200ms)
- **Markdown Parsing (1000 words)**: <100ms (basic parser, target: <50ms for advanced)
- **UI Update Cycle**: <16ms (60fps with debouncing)
- **Memory Usage**: <15MB peak (estimated)

## 🏗️ Performance Architecture

> **Agent Context**: Current implementation is monolithic but efficient. Clean Architecture planned.
> **Reality Check**: Working within 1690-line src/main.js, optimizations are incremental.
> **Cross-Reference**: `architecture.md#performance-architecture` for future patterns.

### Design Principles for Agents

#### 1. Minimal Dependencies (✅ ACHIEVED)

> **Agent Rule**: Current bundle proves this works. Check `npm run size` before adding dependencies.
> **Current Status**: Only express + cors for server, vite for build - excellent dependency hygiene.

```javascript
// ✅ IMPLEMENTED: Zero client-side framework dependencies
// ✅ IMPLEMENTED: Vanilla JavaScript for maximum control  
// ✅ IMPLEMENTED: Custom markdown parser (basic but working)

// Current working implementation in src/main.js
markdownToHTML(markdown) {
  if (!markdown) return '';
  let html = markdown;
  
  // ✅ Code blocks, headers, formatting, lists implemented
  html = html.replace(/```([^`]*?)```/gs, '<pre><code>$1</code></pre>');
  html = html.replace(/^### (.*$)/gm, (match, text) => {
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    return `<h3 id="${id}">${text}</h3>`;
  });
  // ... more working rules (25 tests passing)
}
```

#### 2. Lazy Loading Strategy (📋 PLANNED)

> **Current Reality**: Monolithic approach works well at 14.0KB. Lazy loading not yet needed.
> **Future Planning**: When implementing syntax highlighting, tables, advanced features.

```javascript
// 📋 PLANNED: For future advanced features like syntax highlighting
const loadSyntaxHighlighter = async () => {
  if (!window.syntaxHighlighterLoaded) {
    // Future implementation when advanced markdown features are added
    const { SyntaxHighlighter } = await import('./syntax-highlighter.js');
    window.syntaxHighlighterLoaded = true;
    return new SyntaxHighlighter();
  }
};

// ✅ CURRENT: All features in main bundle, still within target
```

#### 3. Efficient DOM Operations (✅ IMPLEMENTED)

> **Agent Rule**: Current implementation uses debouncing and efficient patterns.
> **Security Note**: XSS protection via escapeHtml() method implemented.

```javascript
// ✅ IMPLEMENTED: Debounced updates for performance
const debouncedUpdate = debounce(() => {
  this.updatePreview();
  this.autoSave();
}, 300);

// ✅ IMPLEMENTED: Batch DOM updates pattern
const fragment = document.createDocumentFragment();
items.forEach(item => {
  const element = createItemElement(item);
  fragment.appendChild(element);
});
container.appendChild(fragment);

// Use requestAnimationFrame for smooth animations
const animateProgress = (progress) => {
  requestAnimationFrame(() => {
    progressBar.style.width = `${progress}%`;
  });
};
```

#### 4. Memory Management

> **Agent Critical**: Every addEventListener MUST have corresponding removeEventListener
> **Testing**: Add memory leak tests per `testing.md#memory-testing`

```javascript
// Clean up event listeners
class Component {
  constructor() {
    this.handleClick = this.handleClick.bind(this);
  }
  
  mount() {
    this.element.addEventListener('click', this.handleClick);
  }
  
  unmount() {
    this.element.removeEventListener('click', this.handleClick);
  }
}
```

## 🏗️ Build Optimization

> **Agent Target**: Maintain current 11.7KB gzipped bundle size
> **Cross-Reference**: `deployment.md#build-configuration` for production settings

### Vite Configuration
```javascript
// vite.config.js - Production optimizations
export default defineConfig({
  build: {
    target: 'es2020',
    minify: 'terser',
    sourcemap: false,
    chunkSizeWarningLimit: 500,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log']
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor code if needed
          vendor: ['dependency-name']
        }
      }
    }
  }
});
```

### CSS Optimization
```css
/* Critical CSS inlined in HTML */
/* Non-critical CSS loaded asynchronously */

/* Use CSS custom properties for theming */
:root {
  --primary-color: #24292e;
  --secondary-color: #f6f8fa;
  --transition-speed: 0.2s;
}

/* Optimize for mobile-first */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

@media (min-width: 768px) {
  .container {
    padding: 2rem;
  }
}
```

### Tree Shaking
```javascript
// Export only what's needed
export { MDSG } from './mdsg.js';

// Import only specific functions
import { parseMarkdown } from './utils/markdown.js';

// Avoid default exports of large objects
// ❌ export default { util1, util2, util3, ... }
// ✅ export { util1, util2, util3 }
```

## ⚡ Runtime Optimizations

> **Agent Pattern**: Apply these patterns to all user input handlers
> **Performance Test**: Measure before/after with `performance.mark()`

### Debouncing and Throttling
```javascript
// Debounce rapid input events
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Apply to markdown editor
const debouncedUpdate = debounce(() => {
  this.updatePreview();
  this.autoSave();
}, 300);

editor.addEventListener('input', debouncedUpdate);
```

### Efficient Markdown Parsing

> **Agent Performance**: This parser must handle 1000 words in <50ms
> **Security Integration**: Always sanitize output per `security.md#markdown-sanitization`

```javascript
// Optimized regex patterns
const markdownPatterns = {
  headers: /^(#{1,6})\s+(.+)$/gm,
  bold: /\*\*(.*?)\*\*/g,
  italic: /\*(.*?)\*/g,
  code: /`([^`]+)`/g,
  links: /\[([^\]]+)\]\(([^)]+)\)/g
};

// Cache compiled patterns
const compiledPatterns = Object.entries(markdownPatterns)
  .reduce((acc, [key, pattern]) => {
    acc[key] = new RegExp(pattern.source, pattern.flags);
    return acc;
  }, {});
```

### Virtual Scrolling (For Large Content)
```javascript
// Implement virtual scrolling for large lists
class VirtualList {
  constructor(container, itemHeight, items) {
    this.container = container;
    this.itemHeight = itemHeight;
    this.items = items;
    this.startIndex = 0;
    this.endIndex = 0;
    this.visibleCount = Math.ceil(container.clientHeight / itemHeight);
    
    this.render();
    this.setupScrollListener();
  }
  
  render() {
    // Only render visible items + buffer
    const buffer = 5;
    const start = Math.max(0, this.startIndex - buffer);
    const end = Math.min(this.items.length, this.endIndex + buffer);
    
    // Update DOM with only visible items
  }
}
```

### Caching Strategies
```javascript
// Cache API responses
class APICache {
  constructor(maxAge = 5 * 60 * 1000) { // 5 minutes
    this.cache = new Map();
    this.maxAge = maxAge;
  }
  
  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }
  
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
}

// Cache GitHub API responses
const apiCache = new APICache();
```

## 📊 Performance Monitoring

> **Agent Tool**: Use `npm run size` for bundle analysis and `npm run build` for performance checks
> **CI Integration**: Performance tests run automatically per `testing.md#performance-testing`

### Bundle Size Monitoring
```bash
# Check current bundle size
npm run size
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      loadTime: 0,
      renderTime: 0,
      apiCalls: [],
      memoryUsage: 0
    };
  }
  
  startTiming(label) {
    performance.mark(`${label}-start`);
  }
  
  endTiming(label) {
    performance.mark(`${label}-end`);
    performance.measure(label, `${label}-start`, `${label}-end`);
    
    const measure = performance.getEntriesByName(label)[0];
    return measure.duration;
  }
  
  trackAPICall(url, startTime, endTime) {
    this.metrics.apiCalls.push({
      url,
      duration: endTime - startTime,
      timestamp: Date.now()
    });
  }
  
  getMemoryUsage() {
    if (performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      };
    }
    return null;
  }
}
```

### Real User Monitoring (RUM)
```javascript
// Track real user performance metrics
window.addEventListener('load', () => {
  setTimeout(() => {
    const navigation = performance.getEntriesByType('navigation')[0];
    const paintEntries = performance.getEntriesByType('paint');
    
    const metrics = {
      // Navigation timing
      dns: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcp: navigation.connectEnd - navigation.connectStart,
      request: navigation.responseStart - navigation.requestStart,
      response: navigation.responseEnd - navigation.responseStart,
      dom: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      load: navigation.loadEventEnd - navigation.loadEventStart,
      
      // Paint metrics
      fcp: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime,
      
      // Custom metrics
      appInit: window.appInitTime || 0
    };
    
    // Send to analytics (if implemented)
    console.log('Performance Metrics:', metrics);
  }, 0);
});
```

### Bundle Analysis
```bash
# Analyze bundle composition
npm run analyze

# Check individual file sizes
npm run bundle-size

# Generate size report
npm run size
```

## 🧪 Performance Testing

> **Agent Requirement**: All performance changes need corresponding tests
> **Cross-Reference**: `testing.md#performance-testing` for complete test patterns

### Automated Performance Tests
```javascript
// tests/performance/bundle-size.test.js
describe('Bundle Size Performance', () => {
  it('should maintain JavaScript bundle under 50KB gzipped', () => {
    const bundleSize = getBundleSize('js');
    expect(bundleSize).toBeLessThan(50 * 1024);
  });
  
  it('should maintain CSS bundle under 20KB gzipped', () => {
    const bundleSize = getBundleSize('css');
    expect(bundleSize).toBeLessThan(20 * 1024);
  });
});

// tests/performance/runtime.test.js
describe('Runtime Performance', () => {
  it('should initialize app under 100ms', async () => {
    const start = performance.now();
    const MDSG = await import('../../src/main.js');
    new MDSG.default();
    const end = performance.now();
    
    expect(end - start).toBeLessThan(100);
  });
  
  it('should parse large markdown under 50ms', () => {
    const largeMarkdown = generateLargeMarkdown(1000); // 1000 words
    const start = performance.now();
    mdsg.parseMarkdown(largeMarkdown);
    const end = performance.now();
    
    expect(end - start).toBeLessThan(50);
  });
});
```

### Lighthouse CI Integration
```yaml
# .github/workflows/performance.yml
- name: Run Lighthouse CI
  run: |
    npm install -g @lhci/cli
    lhci autorun --config='{
      "ci": {
        "collect": {
          "numberOfRuns": 3,
          "url": ["http://localhost:3000"]
        },
        "assert": {
          "assertions": {
            "categories:performance": ["error", {"minScore": 0.95}],
            "categories:accessibility": ["error", {"minScore": 0.90}],
            "first-contentful-paint": ["error", {"maxNumericValue": 2000}],
            "largest-contentful-paint": ["error", {"maxNumericValue": 3000}]
          }
        }
      }
    }'
```

## 🔧 Optimization Techniques

> **Agent Toolkit**: Apply these techniques systematically for performance gains
> **Security Note**: Validate all optimizations don't introduce vulnerabilities

### Image Optimization
```html
<!-- Use WebP with fallback -->
<picture>
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Description" loading="lazy">
</picture>

<!-- Responsive images -->
<img 
  src="image-400w.jpg"
  srcset="image-400w.jpg 400w, image-800w.jpg 800w, image-1200w.jpg 1200w"
  sizes="(max-width: 400px) 400px, (max-width: 800px) 800px, 1200px"
  alt="Description"
  loading="lazy"
>
```

### Font Optimization
```css
/* Preload critical fonts */
/* In HTML: <link rel="preload" href="font.woff2" as="font" type="font/woff2" crossorigin> */

/* Use font-display for better loading */
@font-face {
  font-family: 'CustomFont';
  src: url('font.woff2') format('woff2');
  font-display: swap; /* Show fallback immediately */
}

/* System font stack for better performance */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Code Splitting
```javascript
// Dynamic imports for route-based splitting
const loadPage = async (page) => {
  switch (page) {
    case 'editor':
      return import('./pages/Editor.js');
    case 'dashboard':
      return import('./pages/Dashboard.js');
    default:
      return import('./pages/Home.js');
  }
};

// Component-based splitting
const loadComponent = async (componentName) => {
  const components = {
    'advanced-editor': () => import('./components/AdvancedEditor.js'),
    'file-manager': () => import('./components/FileManager.js')
  };
  
  return components[componentName]?.();
};
```

### Service Worker (Future Enhancement)
```javascript
// sw.js - Service worker for caching
const CACHE_NAME = 'mdsg-v1';
const urlsToCache = [
  '/',
  '/styles.css',
  '/main.js',
  '/offline.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});
```

## 💰 Performance Budget

> **Agent Enforcement**: These budgets are HARD LIMITS. CI will fail if exceeded.
> **Alert System**: Set up monitoring per `deployment.md#performance-monitoring`

### Size Budgets
```javascript
// performance-budget.config.js
module.exports = {
  budgets: [
    {
      path: '/dist/**/*.js',
      maxSize: '50kb',
      maxSizeCompressed: '15kb'
    },
    {
      path: '/dist/**/*.css',
      maxSize: '20kb',
      maxSizeCompressed: '5kb'
    },
    {
      path: '/dist/index.html',
      maxSize: '10kb'
    }
  ],
  
  // Runtime budgets
  timing: {
    fcp: 1800,        // First Contentful Paint
    lcp: 2500,        // Largest Contentful Paint
    fid: 100,         // First Input Delay
    cls: 0.1,         // Cumulative Layout Shift
    ttfb: 800         // Time to First Byte
  }
};
```

### Monitoring Alerts
```javascript
// Set up performance monitoring alerts
const performanceThresholds = {
  bundleSize: {
    js: 50 * 1024,      // 50KB
    css: 20 * 1024,     // 20KB
    total: 70 * 1024    // 70KB
  },
  
  lighthouse: {
    performance: 90,
    accessibility: 90,
    bestPractices: 90,
    seo: 80
  },
  
  coreWebVitals: {
    fcp: 1800,
    lcp: 2500,
    fid: 100,
    cls: 0.1
  }
};

// Alert if thresholds exceeded
function checkPerformance(metrics) {
  Object.entries(performanceThresholds).forEach(([category, thresholds]) => {
    Object.entries(thresholds).forEach(([metric, threshold]) => {
      if (metrics[category]?.[metric] > threshold) {
        console.warn(`Performance threshold exceeded: ${category}.${metric}`);
        // Send alert to monitoring system
      }
    });
  });
}
```

## Best Practices

### Development Guidelines for Agents

> **Agent Mindset**: Every change impacts performance. Measure and optimize continuously.

#### 1. Performance-First Mindset
```javascript
// Always consider performance impact
// ❌ Avoid unnecessary operations in hot paths
for (let i = 0; i < items.length; i++) {
  const expensiveCalculation = performHeavyOperation(items[i]);
  // Called on every iteration
}

// ✅ Cache expensive operations
const cache = new Map();
for (let i = 0; i < items.length; i++) {
  const key = getKey(items[i]);
  if (!cache.has(key)) {
    cache.set(key, performHeavyOperation(items[i]));
  }
  const result = cache.get(key);
}
```

#### 2. Measure Before Optimizing
```javascript
// Use performance.mark and performance.measure
function optimizeFunction() {
  performance.mark('optimize-start');
  
  // Your optimization here
  
  performance.mark('optimize-end');
  performance.measure('optimize', 'optimize-start', 'optimize-end');
  
  const measure = performance.getEntriesByName('optimize')[0];
  console.log(`Optimization took: ${measure.duration}ms`);
}
```

#### 3. Progressive Enhancement
```javascript
// Build for baseline, enhance for capabilities
class Editor {
  constructor() {
    // Basic functionality works everywhere
    this.setupBasicEditor();
    
    // Enhanced features for modern browsers
    if ('IntersectionObserver' in window) {
      this.setupLazyLoading();
    }
    
    if ('ResizeObserver' in window) {
      this.setupResponsiveLayout();
    }
  }
}
```

### Code Review Checklist

#### Performance Considerations
- [ ] Bundle size impact assessed
- [ ] No unnecessary dependencies added
- [ ] Loops and iterations optimized
- [ ] Event listeners cleaned up
- [ ] Images optimized and lazy loaded
- [ ] API calls debounced/throttled
- [ ] Memory leaks prevented
- [ ] Critical path optimized

## Performance Roadmap

### Short Term (Next Release)
- [ ] Implement virtual scrolling for large content
- [ ] Add compression for API responses
- [ ] Optimize CSS delivery (critical vs non-critical)
- [ ] Implement better error boundaries

### Medium Term (3-6 months)
- [ ] Service Worker for offline functionality
- [ ] Advanced caching strategies
- [ ] Code splitting for advanced features
- [ ] Image optimization pipeline

### Long Term (6+ months)
- [ ] WebAssembly for heavy computations
- [ ] HTTP/3 support
- [ ] Edge computing optimizations
- [ ] Progressive Web App features

## Troubleshooting Performance Issues

### Common Performance Problems

#### 1. Large Bundle Size
```bash
# Analyze bundle composition
npm run analyze

# Check for duplicate dependencies
npm ls --depth=0

# Remove unused dependencies
npm uninstall unused-package
```

#### 2. Slow Runtime Performance
```javascript
// Profile with browser DevTools
// Use Performance tab to identify bottlenecks

// Add performance marks
performance.mark('function-start');
expensiveFunction();
performance.mark('function-end');
performance.measure('function', 'function-start', 'function-end');
```

#### 3. Memory Leaks
```javascript
// Check for memory leaks
// 1. Event listeners not removed
// 2. Circular references
// 3. Global variables not cleaned

// Use WeakMap/WeakSet for automatic cleanup
const cache = new WeakMap();
cache.set(object, data); // Automatically cleaned when object is GC'd
```

### Performance Debugging Tools

#### Browser DevTools
- Performance tab for runtime analysis
- Network tab for loading performance
- Memory tab for leak detection
- Lighthouse for comprehensive audit

#### Command Line Tools
```bash
# Bundle analyzer
npm run analyze

# Lighthouse CLI
npx lighthouse https://your-site.com

# Performance budget
npm run perf-budget
```

## 🎯 Conclusion for Agents

MDSG's exceptional performance (11.7KB gzipped, 98 Lighthouse score) demonstrates that modern web applications can be both feature-rich and performant.

### Agent Performance Principles
1. **Minimize dependencies** - Use vanilla JavaScript where possible
2. **Optimize build process** - Aggressive minification and tree shaking
3. **Lazy load features** - Load only what's needed when needed
4. **Monitor continuously** - Set budgets and track metrics
5. **Measure everything** - Data-driven optimization decisions

### Agent Success Checklist
Before completing any performance-related task:
- [ ] Bundle size impact measured (`npm run size`)
- [ ] Lighthouse score maintained (95+)
- [ ] Performance tests added (`testing.md`)
- [ ] Memory usage validated
- [ ] Security implications reviewed (`security.md`)

### Quick Performance Decision Matrix
| Change Type | Required Actions | Key Metrics |
|-------------|------------------|-------------|
| New feature | Size check + lazy loading | Bundle impact |
| Optimization | Before/after measurement | Load time, FCP |
| Dependency | Security + size audit | Bundle analysis |
| UI change | DOM efficiency check | Runtime performance |

Performance is not just about initial load time, but about creating a smooth, responsive user experience throughout the entire application lifecycle. By following these guidelines and continuously monitoring metrics, MDSG maintains its performance excellence while adding new features.

**Remember**: You are the performance guardian. Every decision impacts user experience.