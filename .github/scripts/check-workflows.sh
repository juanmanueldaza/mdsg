#!/bin/bash

# 🧪 MDSG Workflow Monitor - Auto-check GitHub Actions after push
# This script automatically checks workflow status after git push
# Usage: Run this script after any git push to verify CI/CD health

echo "🔍 Checking GitHub workflow status..."
echo "============================================"

# Check if gh CLI is available
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) not found. Please install it first."
    echo "   Visit: https://cli.github.com/"
    exit 1
fi

# Check authentication
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub CLI."
    echo "   Run: gh auth login"
    exit 1
fi

# Get latest workflow runs
echo "📋 Recent workflow runs:"
gh run list --limit 5 --json status,name,conclusion,createdAt,url \
    --template '{{range .}}{{.status}} {{.name}} - {{.conclusion}} ({{timeago .createdAt}}) {{.url}}{{"\n"}}{{end}}'

echo ""
echo "🔍 Checking for any failing workflows..."

# Check if any recent workflows are failing
FAILING_RUNS=$(gh run list --limit 10 --json status,conclusion \
    --jq '.[] | select(.status == "completed" and .conclusion == "failure") | .conclusion' | wc -l)

if [ "$FAILING_RUNS" -gt 0 ]; then
    echo "❌ Found $FAILING_RUNS failing workflow(s)"
    echo ""
    echo "🔧 Failed workflow details:"
    gh run list --limit 5 --json status,name,conclusion,url \
        --template '{{range .}}{{if eq .conclusion "failure"}}❌ {{.name}} - FAILED {{.url}}{{"\n"}}{{end}}{{end}}'
    
    echo ""
    echo "💡 To view detailed logs for the most recent failure:"
    echo "   gh run view --log-failed"
    
    exit 1
else
    echo "✅ No failing workflows detected"
fi

# Check for in-progress workflows
IN_PROGRESS=$(gh run list --limit 5 --json status \
    --jq '.[] | select(.status == "in_progress" or .status == "queued") | .status' | wc -l)

if [ "$IN_PROGRESS" -gt 0 ]; then
    echo "⏳ Found $IN_PROGRESS workflow(s) still running"
    echo "   Check back in a few minutes for final results"
else
    echo "✅ All recent workflows completed"
fi

echo ""
echo "🎯 Workflow monitoring complete!"
