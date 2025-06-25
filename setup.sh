#!/bin/bash

# Setup script for daza.ar environment
# Creates sites folder and clones required repositories

set -e  # Exit on any error

echo "🚀 Starting daza.ar environment setup..."

# Create sites directory if it doesn't exist
if [ ! -d "sites" ]; then
    echo "📁 Creating sites directory..."
    mkdir sites
else
    echo "📁 Sites directory already exists"
fi

# Change to sites directory
cd sites

# List of repositories to clone
repos=(
    "juanmanueldaza/cv"
    "juanmanueldaza/onepager"
    "juanmanueldaza/data"
    "juanmanueldaza/wallpapers"
    "juanmanueldaza/start"
    "juanmanueldaza/navbar"
    "juanmanueldaza/mdsite"
)

# Clone each repository
for repo in "${repos[@]}"; do
    repo_name=$(basename "$repo")
    
    if [ -d "$repo_name" ]; then
        echo "⏭️  Repository $repo_name already exists, skipping..."
    else
        echo "📦 Cloning $repo..."
        if gh repo clone "$repo"; then
            echo "✅ Successfully cloned $repo"
        else
            echo "❌ Failed to clone $repo"
            exit 1
        fi
    fi
done

echo ""
echo "🎉 Setup completed successfully!"
echo "📍 All repositories are now available in the 'sites' directory:"
ls -la

echo ""
echo "💡 Next steps:"
echo "   - cd sites"
echo "   - Explore the cloned repositories"
echo "   - Follow individual repository setup instructions if needed"