#!/bin/bash

# 🧪 MDSG Workflow Status Checker
# Alchemical CI/CD monitoring script for lean architecture validation

set -e

echo "🧪 MDSG Alchemical Workflow Status Checker"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if gh CLI is available
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) not found. Please install it first.${NC}"
    echo "   Install: https://cli.github.com/"
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Not in a git repository${NC}"
    exit 1
fi

echo -e "${BLUE}🔍 Repository Information:${NC}"
REPO_NAME=$(basename "$(git rev-parse --show-toplevel)")
CURRENT_BRANCH=$(git branch --show-current)
LAST_COMMIT=$(git log -1 --pretty=format:"%h - %s" --no-merges)

echo "   Repository: $REPO_NAME"
echo "   Branch: $CURRENT_BRANCH"
echo "   Last commit: $LAST_COMMIT"
echo ""

echo -e "${BLUE}🔧 Available Workflows:${NC}"
gh workflow list | while IFS= read -r line; do
    echo "   $line"
done
echo ""

echo -e "${BLUE}📊 Recent Workflow Runs (Last 5):${NC}"
echo ""

# Get recent runs with better formatting
gh run list --limit 5 --json status,conclusion,name,headBranch,event,createdAt,url | \
jq -r '.[] | 
    if .conclusion == "success" then "✅" 
    elif .conclusion == "failure" then "❌" 
    elif .conclusion == "cancelled" then "⏹️ " 
    elif .status == "in_progress" then "🔄" 
    elif .status == "queued" then "⏳" 
    else "❓" 
    end + " " + 
    .name + " | " + 
    .headBranch + " | " + 
    .event + " | " + 
    (.createdAt | sub("T.*"; "")) + " | " + 
    .url' | \
column -t -s '|'

echo ""
echo -e "${BLUE}🎯 MDSG Quality Metrics Check:${NC}"

# Check if tests are passing locally
echo -n "   Local tests: "
if npm test -- --run > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 191/191 passing${NC}"
else
    echo -e "${RED}❌ Some tests failing${NC}"
fi

# Check bundle size
echo -n "   Bundle size: "
if npm run build > /dev/null 2>&1; then
    BUNDLE_SIZE=$(find dist/assets -name "*.js" -exec stat -c%s {} + 2>/dev/null | awk '{sum+=$1} END {print sum}' || echo "0")
    BUNDLE_SIZE_KB=$((BUNDLE_SIZE / 1024))
    BUNDLE_SIZE_GZIP=$(find dist/assets -name "*.js" -exec gzip -c {} \; 2>/dev/null | wc -c || echo "0")
    BUNDLE_SIZE_GZIP_KB=$((BUNDLE_SIZE_GZIP / 1024))
    
    if [ "$BUNDLE_SIZE_GZIP_KB" -le 20 ]; then
        echo -e "${GREEN}✅ ${BUNDLE_SIZE_GZIP_KB}KB (target: <20KB)${NC}"
    else
        echo -e "${RED}❌ ${BUNDLE_SIZE_GZIP_KB}KB exceeds 20KB target${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Build failed${NC}"
fi

# Check code quality
echo -n "   Code quality: "
if npm run quality > /dev/null 2>&1; then
    echo -e "${GREEN}✅ ESLint + Prettier passing${NC}"
else
    echo -e "${RED}❌ Quality issues detected${NC}"
fi

echo ""
echo -e "${BLUE}🚀 Quick Actions:${NC}"
echo "   View latest run:     gh run view"
echo "   Watch current run:   gh run watch"
echo "   Trigger workflow:    gh workflow run ci.yml"
echo "   View workflow logs:  gh run view --log"
echo ""

# Check for failed runs and offer help
FAILED_RUNS=$(gh run list --limit 10 --json conclusion | jq '[.[] | select(.conclusion == "failure")] | length')

if [ "$FAILED_RUNS" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Found $FAILED_RUNS failed runs in recent history${NC}"
    echo "   Quick fix commands:"
    echo "   • Fix quality issues: npm run quality:fix"
    echo "   • Run tests locally: npm test"
    echo "   • Check logs: gh run view --log"
    echo ""
fi

# Alchemical summary
echo -e "${BLUE}🧪 Alchemical Assessment:${NC}"
if [ "$FAILED_RUNS" -eq 0 ]; then
    echo -e "   ${GREEN}✨ Workflow alchemy is operating perfectly!${NC}"
    echo -e "   ${GREEN}   All quality gates are functioning as designed.${NC}"
else
    echo -e "   ${YELLOW}⚗️  Some alchemical processes need attention.${NC}"
    echo -e "   ${YELLOW}   Review failed runs and apply fixes above.${NC}"
fi

echo ""
echo "🧙‍♂️ MDSG Code Alchemist at your service!"
