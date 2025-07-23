# 🎯 MDSG DECISION MATRIX

_Instant decision support for GitHub Copilot_

## 🎯 **ARCHITECTURAL DECISIONS**

### **GitHub Structure Changes?**

```
📁 .github/ structure → Check Epic #26 progress
Instruction files → Use copilot.* naming pattern
New chatmode → Follow *.chatmode.md pattern
Workflow changes → Validate bundle/security impact
Documentation → Archive legacy, use copilot.* hierarchy
```

### **File Management?**

```
Empty files → Delete immediately (completed: 6 files)
Redundant content → Consolidate into hierarchy tiers
Backup files → Clean from workflows/ directory
Templates missing → Create comprehensive issue/PR templates
```

### **Naming Standards?**

```
Instructions → copilot.{topic}.md (lowercase, dots)
Chatmodes → {project}-{specialty}.chatmode.md
Workflows → {purpose}.yml (descriptive names)
Scripts → {action}-{target}.sh (kebab-case)
```

## ⚡ **CODE DECISIONS**

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

**GitHub Structure:**

- Mixed naming patterns (COPILOT\__ vs copilot._)
- Empty files cluttering directories
- Redundant documentation content
- Missing essential templates
- Backup files in workflows/

**Code Quality:**

- Comments in .js files
- Bundle >20KB
- Tests failing
- Direct innerHTML usage
- Unvalidated user input

## ✅ **GREEN PATTERNS** (Approved)

**GitHub Excellence:**

- Unified copilot.\* naming for instructions
- Clear tier hierarchy (Daily/Weekly/Monthly)
- Comprehensive issue/PR templates
- Clean workflow directories
- Self-documenting chatmodes

**Code Quality:**

- Self-documenting function names
- MinimalSecurity usage
- Observable event patterns
- Module separation
- Test-driven changes

## 📊 **VALIDATION CHECKLIST**

**GitHub Structure Health:**

```bash
# Check instruction file count (target: 9)
ls .github/instructions/copilot.*.md | wc -l

# Verify no empty files
find .github/instructions -name "*.md" -empty

# Check naming consistency
ls .github/instructions/ | grep -v "^copilot\."
```

**Code Health:**

```bash
# Standard health check (run before any change)
npm run test tests/basic.test.js | grep "31 passed"
npm run size | grep -E "KB.*gzipped"
curl -s https://mdsg.daza.ar/ | grep -q "MDSG"
```
