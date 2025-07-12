#!/bin/bash

# MDSG Setup Validation Script
# Checks if repository setup was completed successfully

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
CHECKS_PASSED=0
CHECKS_FAILED=0
TOTAL_CHECKS=0

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
    ((CHECKS_PASSED++))
}

print_failure() {
    echo -e "${RED}❌ $1${NC}"
    ((CHECKS_FAILED++))
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

# Check if command exists
check_command() {
    local cmd=$1
    local name=$2
    ((TOTAL_CHECKS++))

    if command -v "$cmd" &> /dev/null; then
        print_success "$name is installed"
        return 0
    else
        print_failure "$name is not installed"
        return 1
    fi
}

# Check prerequisites
check_prerequisites() {
    print_header "Prerequisites Check"

    check_command "gh" "GitHub CLI"
    check_command "git" "Git"
    check_command "node" "Node.js"
    check_command "npm" "npm"

    # Check GitHub CLI authentication
    ((TOTAL_CHECKS++))
    if gh auth status &> /dev/null; then
        print_success "GitHub CLI is authenticated"
    else
        print_failure "GitHub CLI is not authenticated (run: gh auth login)"
    fi

    # Check Git configuration
    ((TOTAL_CHECKS++))
    if git config user.name &> /dev/null && git config user.email &> /dev/null; then
        print_success "Git is configured with user name and email"
    else
        print_failure "Git user configuration missing"
    fi

    # Check Node.js version
    ((TOTAL_CHECKS++))
    node_version=$(node --version 2>/dev/null | sed 's/v//' | cut -d. -f1)
    if [[ "$node_version" -ge 16 ]]; then
        print_success "Node.js version is compatible (v$(node --version | sed 's/v//'))"
    else
        print_failure "Node.js version too old (found v$(node --version | sed 's/v//'), need v16+)"
    fi
}

# Check repository status
check_repository() {
    print_header "Repository Check"

    # Check if we're in a git repository
    ((TOTAL_CHECKS++))
    if git rev-parse --git-dir > /dev/null 2>&1; then
        print_success "In a Git repository"
    else
        print_failure "Not in a Git repository"
        return
    fi

    # Check if repository is mdsg
    ((TOTAL_CHECKS++))
    repo_name=$(gh repo view --json name --jq .name 2>/dev/null || echo "")
    if [[ "$repo_name" == "mdsg" ]]; then
        print_success "Repository name is 'mdsg'"
    else
        print_warning "Repository name is not 'mdsg' (found: ${repo_name:-'unknown'})"
    fi

    # Check if repository is on GitHub
    ((TOTAL_CHECKS++))
    if gh repo view > /dev/null 2>&1; then
        print_success "Repository exists on GitHub"
        repo_url=$(gh repo view --json url --jq .url)
        print_info "Repository URL: $repo_url"
    else
        print_failure "Repository not found on GitHub"
    fi
}

# Check project files
check_project_files() {
    print_header "Project Files Check"

    # Essential files
    local files=(
        "package.json:Package configuration"
        "index.html:HTML entry point"
        "style.css:CSS styles"
        "src/main.js:Main JavaScript file"
        "server.js:OAuth backend server"
        "vite.config.js:Vite configuration"
        ".env.example:Environment variables example"
        "README.md:Project documentation"
        "SETUP_GUIDE.md:Setup instructions"
        ".gitignore:Git ignore rules"
    )

    for file_info in "${files[@]}"; do
        IFS=':' read -r file desc <<< "$file_info"
        ((TOTAL_CHECKS++))

        if [[ -f "$file" ]]; then
            print_success "$desc exists ($file)"
        else
            print_failure "$desc missing ($file)"
        fi
    done

    # Check if src directory exists
    ((TOTAL_CHECKS++))
    if [[ -d "src" ]]; then
        print_success "src/ directory exists"
    else
        print_failure "src/ directory missing"
    fi
}

# Check GitHub issues
check_github_issues() {
    print_header "GitHub Issues Check"

    # Check if issues exist
    ((TOTAL_CHECKS++))
    issue_count=$(gh issue list --state all --json number --jq length 2>/dev/null || echo "0")
    if [[ "$issue_count" -ge 10 ]]; then
        print_success "GitHub issues created ($issue_count issues found)"
    else
        print_failure "Insufficient GitHub issues (found $issue_count, expected 15+)"
    fi

    # Check for MVP issues
    ((TOTAL_CHECKS++))
    mvp_count=$(gh issue list --label mvp --json number --jq length 2>/dev/null || echo "0")
    if [[ "$mvp_count" -ge 3 ]]; then
        print_success "MVP issues labeled ($mvp_count MVP issues)"
    else
        print_warning "Few MVP issues found ($mvp_count), expected 5+"
    fi
}

# Check GitHub labels
check_github_labels() {
    print_header "GitHub Labels Check"

    # Expected labels
    local expected_labels=("mvp" "enhancement" "frontend" "backend" "oauth" "documentation")
    local found_labels=0

    for label in "${expected_labels[@]}"; do
        ((TOTAL_CHECKS++))
        if gh label list | grep -q "^$label"; then
            print_success "Label '$label' exists"
            ((found_labels++))
        else
            print_failure "Label '$label' missing"
        fi
    done

    print_info "Found $found_labels/${#expected_labels[@]} expected labels"
}

# Check GitHub milestones
check_github_milestones() {
    print_header "GitHub Milestones Check"

    ((TOTAL_CHECKS++))
    milestone_count=$(gh api repos/:owner/:repo/milestones --jq length 2>/dev/null || echo "0")
    if [[ "$milestone_count" -ge 3 ]]; then
        print_success "GitHub milestones created ($milestone_count milestones)"
    else
        print_failure "Insufficient milestones (found $milestone_count, expected 4)"
    fi

    # List milestones
    if [[ "$milestone_count" -gt 0 ]]; then
        print_info "Milestones:"
        gh api repos/:owner/:repo/milestones --jq '.[].title' 2>/dev/null | while read -r milestone; do
            echo "   • $milestone"
        done
    fi
}

# Check npm dependencies
check_npm_dependencies() {
    print_header "NPM Dependencies Check"

    # Check if package.json exists and is valid
    ((TOTAL_CHECKS++))
    if [[ -f "package.json" ]] && node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8'))" 2>/dev/null; then
        print_success "package.json is valid JSON"
    else
        print_failure "package.json is missing or invalid"
        return
    fi

    # Check if node_modules exists
    ((TOTAL_CHECKS++))
    if [[ -d "node_modules" ]]; then
        print_success "Dependencies installed (node_modules exists)"
    else
        print_warning "Dependencies not installed (run: npm install)"
    fi

    # Check key dependencies
    local deps=("express" "cors" "vite")
    for dep in "${deps[@]}"; do
        ((TOTAL_CHECKS++))
        if npm list "$dep" &> /dev/null || (npm list --production=false "$dep" &> /dev/null 2>&1); then
            print_success "Dependency '$dep' installed"
        else
            print_failure "Dependency '$dep' missing"
        fi
    done

    # Check if scripts work
    ((TOTAL_CHECKS++))
    if npm run build --silent > /dev/null 2>&1; then
        print_success "Build script works"
    else
        print_warning "Build script failed (may need npm install)"
    fi
}

# Check environment configuration
check_environment() {
    print_header "Environment Configuration Check"

    # Check if .env.example exists
    ((TOTAL_CHECKS++))
    if [[ -f ".env.example" ]]; then
        print_success ".env.example file exists"
    else
        print_failure ".env.example file missing"
    fi

    # Check if .env exists
    ((TOTAL_CHECKS++))
    if [[ -f ".env" ]]; then
        print_success ".env file exists"

        # Check if required variables are present
        if grep -q "GITHUB_CLIENT_ID" .env && grep -q "GITHUB_CLIENT_SECRET" .env; then
            print_success "GitHub OAuth variables configured in .env"
        else
            print_warning "GitHub OAuth variables not configured in .env"
        fi
    else
        print_warning ".env file not created (copy from .env.example)"
    fi
}

# Check project board (optional)
check_project_board() {
    print_header "Project Board Check (Optional)"

    ((TOTAL_CHECKS++))
    if gh project list --owner @me | grep -q "MDSG"; then
        print_success "MDSG project board exists"
    else
        print_warning "MDSG project board not found (run setup-project-board.sh)"
    fi
}

# Generate recommendations
generate_recommendations() {
    print_header "Recommendations"

    if [[ $CHECKS_FAILED -eq 0 ]]; then
        print_success "All critical checks passed! You're ready to start development."
        echo ""
        print_info "Next steps:"
        echo "   1. Configure GitHub OAuth (.env file)"
        echo "   2. Run: npm install"
        echo "   3. Run: npm run dev (Terminal 1)"
        echo "   4. Run: npm run server (Terminal 2)"
        echo "   5. Visit: http://localhost:3000"
        echo ""
        print_info "Start with MVP Core milestone issues:"
        gh issue list --milestone "MVP Core" 2>/dev/null | head -5 || echo "   Use: gh issue list --label mvp"
    else
        print_warning "Some checks failed. Address the issues above before starting development."
        echo ""
        print_info "Common fixes:"
        echo "   • Run setup scripts: ./setup-repository.sh"
        echo "   • Install dependencies: npm install"
        echo "   • Configure Git: git config --global user.name/email"
        echo "   • Authenticate GitHub CLI: gh auth login"
    fi
}

# Generate summary
generate_summary() {
    print_header "Validation Summary"

    local success_rate=$((CHECKS_PASSED * 100 / TOTAL_CHECKS))

    echo "📊 Results:"
    echo "   ✅ Passed: $CHECKS_PASSED"
    echo "   ❌ Failed: $CHECKS_FAILED"
    echo "   📈 Success Rate: $success_rate%"
    echo "   🎯 Total Checks: $TOTAL_CHECKS"
    echo ""

    if [[ $success_rate -ge 90 ]]; then
        echo -e "${GREEN}🎉 Excellent! Setup is complete and ready for development.${NC}"
    elif [[ $success_rate -ge 75 ]]; then
        echo -e "${YELLOW}🔧 Good! Minor issues to address before starting.${NC}"
    elif [[ $success_rate -ge 50 ]]; then
        echo -e "${YELLOW}⚠️  Partial setup. Several issues need attention.${NC}"
    else
        echo -e "${RED}🚨 Setup incomplete. Please run setup scripts first.${NC}"
    fi
}

# Main execution
main() {
    echo -e "${BLUE}🔍 MDSG Setup Validation${NC}"
    echo "Checking if your MDSG repository is properly configured..."
    echo ""

    check_prerequisites
    check_repository
    check_project_files
    check_github_issues
    check_github_labels
    check_github_milestones
    check_npm_dependencies
    check_environment
    check_project_board

    echo ""
    generate_recommendations
    echo ""
    generate_summary

    # Exit with appropriate code
    if [[ $CHECKS_FAILED -eq 0 ]]; then
        exit 0
    else
        exit 1
    fi
}

# Run the validation
main "$@"
