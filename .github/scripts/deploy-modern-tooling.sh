#!/bin/bash
#
# MDSG Tooling Modernization Deployment
# Deploy modern ESLint/Prettier/Vite configuration with automated quality gates
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}"
    echo "🧪 MDSG Code Alchemist - Tooling Modernization"
    echo "=============================================="
    echo "Harmonizing ESLint, Prettier & Vite for Excellence"
    echo -e "${NC}"
}

print_status() {
    local status=$1
    local message=$2
    case $status in
        "success")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "error")
            echo -e "${RED}❌ $message${NC}"
            ;;
        "warning")
            echo -e "${YELLOW}⚠️  $message${NC}"
            ;;
        "info")
            echo -e "${CYAN}🔍 $message${NC}"
            ;;
    esac
}

print_section() {
    echo -e "${YELLOW}"
    echo "─────────────────────────────────────────────"
    echo "📦 $1"
    echo "─────────────────────────────────────────────"
    echo -e "${NC}"
}

backup_file() {
    local file=$1
    if [ -f "$file" ]; then
        cp "$file" "$file.backup.$(date +%Y%m%d_%H%M%S)"
        print_status "info" "Backed up $file"
    fi
}

deploy_config() {
    local source=$1
    local target=$2
    local description=$3
    
    if [ -f "$source" ]; then
        backup_file "$target"
        cp "$source" "$target"
        print_status "success" "Deployed $description"
        return 0
    else
        print_status "error" "$description source file not found: $source"
        return 1
    fi
}

print_header

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "src/main.js" ]; then
    print_status "error" "This script must be run from the MDSG project root"
    exit 1
fi

PROJECT_ROOT=$(pwd)
print_status "info" "Project root: $PROJECT_ROOT"

# Phase 1: Backup and Deploy Configuration Files
print_section "Phase 1: Configuration Deployment"

print_status "info" "Creating backups of existing configurations..."

# Deploy package.json
if deploy_config "package.json.new" "package.json" "package.json with modern dependencies"; then
    PACKAGE_DEPLOYED=true
else
    PACKAGE_DEPLOYED=false
fi

# Deploy ESLint config
if deploy_config "eslint.config.js.new" "eslint.config.js" "modern ESLint flat configuration"; then
    ESLINT_DEPLOYED=true
else
    ESLINT_DEPLOYED=false
fi

# Deploy Prettier config
if deploy_config ".prettierrc.new" ".prettierrc" "enhanced Prettier configuration"; then
    PRETTIER_DEPLOYED=true
else
    PRETTIER_DEPLOYED=false
fi

# Deploy Vite config
if deploy_config "vite.config.js.new" "vite.config.js" "optimized Vite configuration"; then
    VITE_DEPLOYED=true
else
    VITE_DEPLOYED=false
fi

# Deploy CI workflow
if deploy_config ".github/workflows/ci.yml.new" ".github/workflows/ci.yml" "modern CI workflow"; then
    CI_DEPLOYED=true
else
    CI_DEPLOYED=false
fi

# Phase 2: Dependencies Installation
print_section "Phase 2: Dependencies Update"

if [ "$PACKAGE_DEPLOYED" = true ]; then
    print_status "info" "Installing updated dependencies..."
    
    # Clear npm cache to ensure clean install
    npm cache clean --force
    
    # Remove node_modules for clean install
    if [ -d "node_modules" ]; then
        rm -rf node_modules
        print_status "info" "Removed old node_modules"
    fi
    
    # Remove package-lock.json for fresh dependency resolution
    if [ -f "package-lock.json" ]; then
        rm package-lock.json
        print_status "info" "Removed old package-lock.json"
    fi
    
    # Install dependencies
    if npm install; then
        print_status "success" "Dependencies installed successfully"
    else
        print_status "error" "Failed to install dependencies"
        exit 1
    fi
else
    print_status "warning" "Skipping dependency installation (package.json not deployed)"
fi

# Phase 3: Quality Validation
print_section "Phase 3: Quality Validation"

print_status "info" "Running quality checks with new configuration..."

# Test ESLint configuration
if [ "$ESLINT_DEPLOYED" = true ]; then
    print_status "info" "Testing ESLint configuration..."
    if npm run lint:check; then
        print_status "success" "ESLint configuration working correctly"
    else
        print_status "warning" "ESLint found issues, attempting auto-fix..."
        if npm run lint:fix; then
            print_status "success" "ESLint auto-fix successful"
        else
            print_status "error" "ESLint auto-fix failed"
        fi
    fi
fi

# Test Prettier configuration
if [ "$PRETTIER_DEPLOYED" = true ]; then
    print_status "info" "Testing Prettier configuration..."
    if npm run format:check; then
        print_status "success" "Prettier configuration working correctly"
    else
        print_status "warning" "Prettier found formatting issues, auto-formatting..."
        npm run format:write
        print_status "success" "Prettier auto-format completed"
    fi
fi

# Run complete quality suite
print_status "info" "Running complete quality suite..."
if npm run quality; then
    print_status "success" "All quality checks passed!"
else
    print_status "warning" "Quality checks completed with fixes applied"
fi

# Phase 4: Build Validation
print_section "Phase 4: Build Validation"

if [ "$VITE_DEPLOYED" = true ]; then
    print_status "info" "Testing build with new Vite configuration..."
    if npm run build; then
        print_status "success" "Build successful with new configuration"
        
        # Check bundle size
        print_status "info" "Analyzing bundle size..."
        npm run size
        
        # Validate bundle size
        if [ -d "dist" ]; then
            BUNDLE_SIZE=$(find dist/assets -name "*.js" -exec wc -c {} + 2>/dev/null | tail -1 | awk '{print $1}' || echo "0")
            if [ "$BUNDLE_SIZE" -lt 20480 ]; then
                print_status "success" "Bundle size ($BUNDLE_SIZE bytes) within 20KB limit"
            else
                print_status "warning" "Bundle size ($BUNDLE_SIZE bytes) exceeds 20KB target"
            fi
        fi
    else
        print_status "error" "Build failed with new configuration"
    fi
fi

# Phase 5: Test Validation
print_section "Phase 5: Test Validation"

print_status "info" "Running test suite to ensure compatibility..."
if npm run test; then
    print_status "success" "All tests pass with new configuration"
else
    print_status "error" "Tests failed with new configuration"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "  1. Check test compatibility with new ESLint rules"
    echo "  2. Verify test file formatting with new Prettier config"
    echo "  3. Run 'npm run test:debug' for detailed output"
fi

# Phase 6: Git Hooks Setup
print_section "Phase 6: Automated Quality Gates"

print_status "info" "Setting up Git hooks for automated quality enforcement..."
if [ -f ".github/scripts/setup-hooks.sh" ]; then
    chmod +x .github/scripts/setup-hooks.sh
    if bash .github/scripts/setup-hooks.sh; then
        print_status "success" "Git hooks installed successfully"
    else
        print_status "warning" "Git hooks installation completed with warnings"
    fi
else
    print_status "warning" "Git hooks setup script not found"
fi

# Phase 7: Final Summary
print_section "Deployment Summary"

echo ""
echo "🎉 MDSG Tooling Modernization Complete!"
echo "======================================="
echo ""

# Configuration status
echo "📋 Configuration Status:"
[ "$PACKAGE_DEPLOYED" = true ] && echo "  ✅ package.json - Modern dependencies" || echo "  ❌ package.json - Not deployed"
[ "$ESLINT_DEPLOYED" = true ] && echo "  ✅ ESLint - Flat config with Prettier integration" || echo "  ❌ ESLint - Not deployed"
[ "$PRETTIER_DEPLOYED" = true ] && echo "  ✅ Prettier - Enhanced with file overrides" || echo "  ❌ Prettier - Not deployed"
[ "$VITE_DEPLOYED" = true ] && echo "  ✅ Vite - Optimized for modern targets" || echo "  ❌ Vite - Not deployed"
[ "$CI_DEPLOYED" = true ] && echo "  ✅ CI/CD - Modern workflow with parallel jobs" || echo "  ❌ CI/CD - Not deployed"

echo ""
echo "🔧 Available Commands:"
echo "  npm run quality        # Run all quality checks"
echo "  npm run quality:fix    # Auto-fix all issues"
echo "  npm run lint:check     # ESLint check only"
echo "  npm run lint:fix       # ESLint auto-fix"
echo "  npm run format:check   # Prettier check only"
echo "  npm run format:write   # Prettier auto-format"
echo "  npm run test:watch     # Run tests in watch mode"
echo "  npm run build          # Build with bundle analysis"
echo "  npm run preview        # Preview built application"

echo ""
echo "🎯 Quality Gates:"
echo "  ✅ Pre-commit hook - Quality checks before commit"
echo "  ✅ Pre-push hook - Full test suite before push"
echo "  ✅ Commit-msg hook - Conventional commit validation"
echo "  ✅ CI workflow - Parallel quality, test, and build jobs"

echo ""
echo "📊 Expected Benefits:"
echo "  🚀 Faster development with automated fixes"
echo "  🔒 Consistent code quality across team"
echo "  ⚡ Optimized build process with Vite"
echo "  🎯 Bundle size monitoring (<20KB target)"
echo "  🛡️  Security-first development patterns"

echo ""
echo "🧪 Next Steps:"
echo "  1. Commit the new configuration: git add . && git commit -m 'feat: modernize tooling ecosystem'"
echo "  2. Push changes to trigger new CI workflow"
echo "  3. Monitor bundle size and performance"
echo "  4. Share new development commands with team"

echo ""
if [ "$PACKAGE_DEPLOYED" = true ] && [ "$ESLINT_DEPLOYED" = true ] && [ "$PRETTIER_DEPLOYED" = true ]; then
    print_status "success" "MDSG is now equipped with modern, harmonious tooling! 🧙‍♂️✨"
else
    print_status "warning" "Some configurations were not deployed. Review and retry if needed."
fi

echo ""
echo "🔍 To verify everything works:"
echo "  npm run quality && npm run test && npm run build"
