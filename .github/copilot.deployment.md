# 🚀 MDSG DEPLOYMENT REFERENCE
*Essential deployment patterns for GitHub Copilot*

## 🎯 **CURRENT DEPLOYMENT STATUS**
- **Live Site**: https://mdsg.daza.ar/ ✅
- **Platform**: GitHub Pages (static hosting)
- **Domain**: Custom domain configured
- **Auto-Deploy**: GitHub Actions workflow ✅

## 🚀 **DEPLOYMENT ARCHITECTURE**
```
Code Push → GitHub Actions → Build → GitHub Pages → Live Site
          ↓
      Run Tests (31/31)
          ↓
      Bundle Check (<20KB)
          ↓
      Deploy to mdsg.daza.ar
```

## ⚡ **DEPLOYMENT PATTERNS**

### **GitHub Pages Deployment**
```javascript
// Service pattern (deployment.js)
export class DeploymentService {
  async deployToGitHubPages(content, repoName, options = {}) {
    if (!content) throw new Error('Content required');
    
    const deployData = {
      message: options.message || 'Deploy MDSG site',
      content: btoa(this.generateSiteHTML(content)),
      branch: 'gh-pages'
    };
    
    return this.github.createOrUpdateFile(repoName, 'index.html', deployData);
  }
}
```

### **Site Generation**
```javascript
// HTML generation with security
generateSiteHTML(markdownContent) {
  const safeHTML = MinimalSecurity.sanitizeHTML(
    this.markdownToHTML(markdownContent)
  );
  
  return this.buildTemplate({
    title: this.extractTitle(markdownContent),
    content: safeHTML,
    styles: this.getGitHubMarkdownCSS()
  });
}
```

## 🔧 **DEPLOYMENT COMMANDS**
```bash
# Local build & test
npm run build                    # Create dist/
npm run test tests/basic.test.js # Verify 31/31 tests
npm run size                     # Check bundle size

# Auto-deployment (GitHub Actions)
git push origin main             # Triggers auto-deploy
curl -s https://mdsg.daza.ar/    # Verify live site

# Manual deployment check
gh workflow list                 # Check workflow status
gh workflow view deploy-pages    # View deployment details
```

## 🎯 **DEPLOYMENT VALIDATION**
```bash
# Pre-deployment checklist
npm run test tests/basic.test.js | grep "31 passed"
npm run build && npm run size | grep -E "KB.*gzipped"
curl -s -f https://mdsg.daza.ar/ > /dev/null && echo "✅ Site live"
```

## 🚨 **DEPLOYMENT RULES**
1. **31/31 tests** must pass before deployment
2. **Bundle ≤20KB** validated before push
3. **Live site** verified after deployment
4. **No manual** GitHub Pages config changes

## 🌐 **ENVIRONMENT STATUS**
- **Production**: https://mdsg.daza.ar/ (GitHub Pages)
- **Development**: http://localhost:3000/ (npm run dev)
- **Testing**: Automated in CI/CD pipeline
- **Staging**: Not needed (direct deploy from main)

*Condensed from 739-line deployment.md*
