#!/bin/bash

# 🧪 MDSG Smart Push - Git Push with Automatic Workflow Monitoring
# Enhanced git push that automatically checks CI/CD status afterward

set -e  # Exit on any error

echo "🧪 MDSG Smart Push - Pushing with workflow monitoring..."
echo "======================================================="

# Validate we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  Warning: You have uncommitted changes"
    echo "📝 Staging and committing all changes..."
    
    git add .
    
    # Prompt for commit message if none provided
    if [ -z "$1" ]; then
        echo "📝 Enter commit message:"
        read -r COMMIT_MESSAGE
    else
        COMMIT_MESSAGE="$1"
    fi
    
    git commit -m "$COMMIT_MESSAGE"
fi

# Get current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "🌿 Current branch: $CURRENT_BRANCH"

# Push to remote
echo "⬆️  Pushing to origin/$CURRENT_BRANCH..."
git push origin "$CURRENT_BRANCH"

# Check if push was successful
if [ $? -eq 0 ]; then
    echo "✅ Push completed successfully!"
    echo ""
    
    # Automatic workflow monitoring
    echo "🔍 Monitoring GitHub workflows..."
    if [ -f ".github/scripts/check-workflows.sh" ]; then
        sleep 5  # Give GitHub a moment to register the push
        ./.github/scripts/check-workflows.sh
    else
        echo "📋 Manual workflow check:"
        echo "   gh run list --limit 5"
    fi
else
    echo "❌ Push failed!"
    exit 1
fi

echo ""
echo "🎯 MDSG Smart Push complete!"
