## 🧹 MDSG ROOT CLEANUP EPIC - Project Structure Optimization

### 🎯 **Objective**

Clean up root directory clutter, migrate development/debug files to appropriate
locations, and establish a professional project structure following CLEAN
principles.

### 📋 **File Classification Analysis**

#### **🗑️ DELETE CANDIDATES (Temporary/Debug Files)**

- `debug-preview.js` - Browser console debug script (98 lines)
- `debug-preview-final.js` - Another debug script variant
- `test-debounce-fix.js` - Empty test file
- `test-flatmap-fix.js` - Temporary test fix
- `test-login-fix.js` - Temporary test fix
- `test-preview-fix.js` - Temporary test fix
- `test-security-fix.js` - Temporary test fix

#### **🔧 DEVELOPMENT TOOLS TO MIGRATE**

- `cleanup-comments.js` - Code cleanup utility → `scripts/`
- `check-workflows.sh` - CI/CD monitoring script → `scripts/`

#### **📁 CONFIG DUPLICATES TO CLEAN**

- `eslint.config.js.new` - Duplicate config file
- `package.json.new` - Duplicate package file
- `vite.config.js.new` - Duplicate vite config
- `.prettierrc.new` - Duplicate prettier config

#### **✅ KEEP (Core Files)**

- `package.json`, `package-lock.json` - Dependency management
- `index.html`, `style.css` - Frontend assets
- `server.js` - OAuth server
- `vite.config.js`, `vitest.config.js` - Build tools
- `eslint.config.js`, `.prettierrc` - Code quality
- `README.md`, `CNAME` - Documentation
- Directories: `src/`, `tests/`, `docs/`, `examples/`, `public/`, `dist/`

### 🏗️ **Proposed New Structure**

```
mdsg/
├── 📁 src/ (production code)
├── 📁 tests/ (test suites)
├── 📁 scripts/ (development utilities)
│   ├── cleanup-comments.js
│   ├── check-workflows.sh
│   └── debug/ (debug scripts)
│       ├── debug-preview.js
│       └── debug-preview-final.js
├── 📁 docs/ (documentation)
├── 📁 examples/ (code examples)
├── 📁 public/ (static assets)
├── 📁 dist/ (build output)
├── package.json
├── index.html
├── server.js
└── (other core config files)
```

### ✅ **CLEANUP COMPLETED!**

**Files Removed:**

- ❌ `debug-preview.js` → `scripts/debug/`
- ❌ `debug-preview-final.js` → `scripts/debug/`
- ❌ `test-debounce-fix.js` → DELETED (empty)
- ❌ `test-flatmap-fix.js` → DELETED
- ❌ `test-login-fix.js` → DELETED
- ❌ `test-preview-fix.js` → DELETED
- ❌ `test-security-fix.js` → DELETED
- ❌ `cleanup-comments.js` → `scripts/`
- ❌ `check-workflows.sh` → `scripts/`
- ❌ `*.new` config duplicates → DELETED

**New Structure Created:**

```
📁 scripts/
├── cleanup-comments.js    # Code cleanup utility
├── check-workflows.sh     # CI/CD monitoring
└── 📁 debug/
    ├── debug-preview.js
    └── debug-preview-final.js
```

**ESLint Configuration Updated:**

- Added `ignores: ['scripts/**']` to exclude development tools
- Removed deprecated `.eslintignore` file

### 🎯 **Results**

- **Root Directory**: Reduced from 25+ files to 15 core files
- **Organization**: Clear separation of production vs development code
- **Lint Status**: ✅ Clean (0 errors, 0 warnings in production code)
- **Test Status**: ✅ All tests passing (191/191)
- **CLEAN Principles**: Achieved clear, organized project structure
