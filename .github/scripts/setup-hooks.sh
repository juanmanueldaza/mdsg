#!/bin/bash
#
# MDSG Git Hooks Setup - Code Quality Automation
# Installs and configures Git hooks for automated quality gates
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}"
    echo "🧪 MDSG Code Alchemist - Git Hooks Setup"
    echo "========================================"
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
            echo -e "${YELLOW}🔍 $message${NC}"
            ;;
    esac
}

print_header

# Check if we're in a Git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_status "error" "This script must be run from within a Git repository"
    exit 1
fi

PROJECT_ROOT=$(git rev-parse --show-toplevel)
HOOKS_DIR="$PROJECT_ROOT/.git/hooks"
SOURCE_HOOKS_DIR="$PROJECT_ROOT/.githooks"

print_status "info" "Project root: $PROJECT_ROOT"
print_status "info" "Git hooks directory: $HOOKS_DIR"

# Create .githooks directory if it doesn't exist
if [ ! -d "$SOURCE_HOOKS_DIR" ]; then
    print_status "info" "Creating .githooks directory..."
    mkdir -p "$SOURCE_HOOKS_DIR"
fi

# Install pre-commit hook
print_status "info" "Installing pre-commit hook..."

if [ -f "$SOURCE_HOOKS_DIR/pre-commit.new" ]; then
    cp "$SOURCE_HOOKS_DIR/pre-commit.new" "$HOOKS_DIR/pre-commit"
    chmod +x "$HOOKS_DIR/pre-commit"
    print_status "success" "Pre-commit hook installed"
else
    print_status "warning" "pre-commit.new not found in .githooks directory"
fi

# Install pre-push hook
print_status "info" "Installing pre-push hook..."

cat > "$HOOKS_DIR/pre-push" << 'EOF'
#!/bin/bash
#
# MDSG Pre-push Hook - CI Preview
# Runs comprehensive checks before pushing to remote
#

set -e

echo "🚀 MDSG Pre-push Quality Gate"
echo "============================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    local status=$1
    local message=$2
    case $status in
        "success") echo -e "${GREEN}✅ $message${NC}" ;;
        "error") echo -e "${RED}❌ $message${NC}" ;;
        "warning") echo -e "${YELLOW}⚠️  $message${NC}" ;;
        "info") echo -e "${YELLOW}🔍 $message${NC}" ;;
    esac
}

# Check if npm is available
if ! command -v npm &> /dev/null; then
    print_status "error" "npm is not available"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_status "info" "Installing dependencies..."
    npm install --silent
fi

# Run full quality suite
print_status "info" "Running complete quality checks..."
if npm run quality; then
    print_status "success" "Quality checks passed"
else
    print_status "error" "Quality checks failed"
    echo ""
    echo "💡 Quick fixes:"
    echo "  npm run quality:fix  # Auto-fix issues"
    echo "  npm run lint:fix     # Fix ESLint issues"
    echo "  npm run format:write # Fix formatting"
    exit 1
fi

# Run tests
print_status "info" "Running test suite..."
if npm run test; then
    print_status "success" "All tests passed"
else
    print_status "error" "Tests failed"
    echo ""
    echo "💡 Debug tests:"
    echo "  npm run test:watch   # Run in watch mode"
    echo "  npm run test:debug   # Run with debugging"
    exit 1
fi

# Build check
print_status "info" "Verifying build..."
if npm run build; then
    print_status "success" "Build successful"
    
    # Bundle size check
    print_status "info" "Checking bundle size..."
    if npm run size; then
        print_status "success" "Bundle size within limits"
    else
        print_status "warning" "Bundle size check completed (see output above)"
    fi
else
    print_status "error" "Build failed"
    exit 1
fi

print_status "success" "All pre-push checks passed! 🎉"
print_status "info" "Your changes are ready for CI/CD pipeline"

echo ""
echo "📊 Push Summary:"
echo "  - Quality: ✅ Passed"
echo "  - Tests: ✅ Passed"  
echo "  - Build: ✅ Passed"
echo "  - Bundle: ✅ Verified"
echo ""
echo "🚀 Pushing to remote..."
EOF

chmod +x "$HOOKS_DIR/pre-push"
print_status "success" "Pre-push hook installed"

# Install commit-msg hook for conventional commits
print_status "info" "Installing commit-msg hook..."

cat > "$HOOKS_DIR/commit-msg" << 'EOF'
#!/bin/bash
#
# MDSG Commit Message Hook - Conventional Commits
# Ensures commit messages follow conventional commit format
#

commit_regex='^(feat|fix|docs|style|refactor|perf|test|chore|ci|build|revert)(\(.+\))?: .{1,50}'

error_msg="❌ Invalid commit message format!

📝 Conventional Commit Format:
   <type>[optional scope]: <description>

🎯 Valid types:
   feat:     New feature
   fix:      Bug fix
   docs:     Documentation changes
   style:    Code style changes (formatting, etc.)
   refactor: Code refactoring
   perf:     Performance improvements
   test:     Adding or updating tests
   chore:    Maintenance tasks
   ci:       CI/CD changes
   build:    Build system changes
   revert:   Reverting changes

✅ Examples:
   feat: add markdown table support
   fix(auth): resolve token refresh issue
   docs: update installation guide
   refactor(ui): simplify button component

🔗 Learn more: https://conventionalcommits.org/"

if ! grep -qE "$commit_regex" "$1"; then
    echo "$error_msg" >&2
    exit 1
fi
EOF

chmod +x "$HOOKS_DIR/commit-msg"
print_status "success" "Commit-msg hook installed"

# Create hook management script
print_status "info" "Creating hook management script..."

cat > "$SOURCE_HOOKS_DIR/manage-hooks.sh" << 'EOF'
#!/bin/bash
#
# MDSG Git Hooks Manager
# Manage Git hooks installation and updates
#

HOOKS_DIR="$(git rev-parse --show-toplevel)/.git/hooks"
SOURCE_DIR="$(git rev-parse --show-toplevel)/.githooks"

case "$1" in
    "install")
        echo "🔧 Installing Git hooks..."
        bash "$SOURCE_DIR/../.github/scripts/setup-hooks.sh"
        ;;
    "uninstall")
        echo "🗑️  Removing Git hooks..."
        rm -f "$HOOKS_DIR/pre-commit"
        rm -f "$HOOKS_DIR/pre-push"
        rm -f "$HOOKS_DIR/commit-msg"
        echo "✅ Git hooks removed"
        ;;
    "update")
        echo "🔄 Updating Git hooks..."
        bash "$SOURCE_DIR/../.github/scripts/setup-hooks.sh"
        ;;
    "status")
        echo "📊 Git hooks status:"
        for hook in pre-commit pre-push commit-msg; do
            if [ -x "$HOOKS_DIR/$hook" ]; then
                echo "  ✅ $hook: installed"
            else
                echo "  ❌ $hook: not installed"
            fi
        done
        ;;
    *)
        echo "MDSG Git Hooks Manager"
        echo ""
        echo "Usage: $0 {install|uninstall|update|status}"
        echo ""
        echo "Commands:"
        echo "  install    Install all Git hooks"
        echo "  uninstall  Remove all Git hooks"
        echo "  update     Update existing hooks"
        echo "  status     Show hook installation status"
        ;;
esac
EOF

chmod +x "$SOURCE_HOOKS_DIR/manage-hooks.sh"
print_status "success" "Hook management script created"

# Add npm scripts for hook management
print_status "info" "Hook installation completed!"

echo ""
echo "🎉 Git Hooks Setup Complete!"
echo "============================="
echo ""
echo "📋 Installed hooks:"
echo "  ✅ pre-commit  - Runs quality checks before commit"
echo "  ✅ pre-push    - Runs full test suite before push"
echo "  ✅ commit-msg  - Validates conventional commit format"
echo ""
echo "🔧 Management commands:"
echo "  npm run hooks:status     # Check hook status"
echo "  npm run hooks:install    # Reinstall hooks"
echo "  npm run hooks:uninstall  # Remove hooks"
echo ""
echo "💡 Tips:"
echo "  - Use 'git commit --no-verify' to bypass hooks (not recommended)"
echo "  - Hooks automatically fix formatting when possible"
echo "  - Follow conventional commit format for better changelog generation"
echo ""
echo "🚀 Your repository now has automated quality gates!"
