# 🏗️ GITHUB WORKFLOWS & AUTOMATION

_Copilot guidance for GitHub Actions, automation, and CI/CD_

## 🎯 **CURRENT WORKFLOW ARCHITECTURE**

**Active Workflows:**

- **`ci.yml`** → Main CI workflow (275 lines)
- **`ci-alchemical.yml`** → Specialized workflow
- **`deploy-pages.yml`** → GitHub Pages deployment

**Automation Scripts:**

- **`check-workflows.sh`** → Monitor workflow status
- **`smart-push.sh`** → Automated push with monitoring
- **`setup-hooks.sh`** → Git hooks configuration
- **`deploy-modern-tooling.sh`** → Deployment automation

## ⚡ **WORKFLOW AUTOMATION TOOLS**

### **Workflow Monitoring**

```bash
# Check recent workflow runs with status
./.github/scripts/check-workflows.sh

# Smart push with automatic CI monitoring
./.github/scripts/smart-push.sh [commit-message]
```

**Features:**

- 📋 Lists recent workflow runs with status
- ❌ Identifies failing workflows
- ⏳ Shows in-progress workflows
- 💡 Provides helpful next steps
- 🪝 Git hook automatically runs after every `git push`

### **Post-Push Monitoring**

```bash
# Automatic workflow checking after push
git push  # Automatically triggers workflow monitoring
```

## 🚨 **WORKFLOW CONSTRAINTS & REQUIREMENTS**

**MDSG-Specific Requirements:**

- **Bundle Size**: All workflows must verify ≤20KB constraint
- **Test Suite**: 31/31 tests must pass before deployment
- **Security**: 100/100 security score validation required
- **Performance**: Workflow execution time ≤5 minutes target
- **Zero Comments**: Automated comment detection in .js files

**Quality Gates:**

```yaml
# Example quality gate pattern
- name: Bundle Size Check
  run: npm run build && npm run size | grep -E "(KB.*gzipped)"

- name: Test Validation
  run: npm run test tests/basic.test.js | grep "31 passed"

- name: Security Validation
  run: npm run test:security # Verify 100/100 score
```

## 🔧 **WORKFLOW OPTIMIZATION PATTERNS**

**Fast-Failing Workflows:**

```yaml
# Optimized job structure
jobs:
  validate:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test tests/basic.test.js
      - run: npm run build
      - run: npm run size
```

**Conditional Execution:**

```yaml
# Run workflows efficiently
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

## 📋 **WORKFLOW MAINTENANCE**

**Regular Tasks:**

- Monitor workflow execution times
- Update Node.js versions in actions
- Clean up old workflow runs
- Optimize caching strategies
- Review security implications

**Troubleshooting:**

```bash
# Check workflow status
gh run list --limit 10

# View specific workflow run
gh run view [run-id]

# Re-run failed workflows
gh run rerun [run-id]
```

## 🎯 **GITHUB ACTIONS BEST PRACTICES**

**Security:**

- Use pinned action versions (@v4, not @main)
- Limit token permissions (read-only where possible)
- Validate all inputs and environment variables
- Use encrypted secrets for sensitive data

**Performance:**

- Cache dependencies aggressively
- Use parallel jobs where possible
- Fail fast on first error
- Minimize checkout operations

**Reliability:**

- Set appropriate timeouts
- Handle transient failures gracefully
- Use matrix builds for multi-environment testing
- Monitor workflow success rates

## 🔗 **INTEGRATION WITH COPILOT INSTRUCTIONS**

**Related Files:**

- `copilot.deployment.md` → Release and deployment procedures
- `copilot.testing.md` → Test automation and validation
- `copilot.security.md` → Security automation patterns
- `copilot.performance.md` → Bundle optimization in CI

**Decision Support:**

- Use `copilot.decisions.md` for workflow change decisions
- Validate against MDSG constraints before workflow updates
- Consider bundle impact for any new CI steps
