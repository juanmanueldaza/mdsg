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
echo "🔗 Checking /etc/hosts for custom .local domains..."
SITES=(cv onepager data wallpapers start navbar mdsite)
MISSING=()
for SITE in "${SITES[@]}"; do
    DOMAIN="$SITE.local"
    if ! grep -q "$DOMAIN" /etc/hosts; then
        MISSING+=("$DOMAIN")
    fi
done

if [ ${#MISSING[@]} -gt 0 ]; then
    echo "The following domains are missing from /etc/hosts:"
    for DOMAIN in "${MISSING[@]}"; do
        echo "  127.0.0.1   $DOMAIN"
    done
    echo "Add them now? (requires sudo) [y/N]"
    read -r REPLY
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        for DOMAIN in "${MISSING[@]}"; do
            echo "127.0.0.1   $DOMAIN" | sudo tee -a /etc/hosts
        done
        echo "Domains added. You may need to restart your browser."
    else
        echo "Aborting domain setup. Please add the domains manually to /etc/hosts."
    fi
else
    echo "All custom .local domains are already present in /etc/hosts."
fi

echo ""
echo "🎉 Setup completed successfully!"
echo "📍 All repositories are now available in the 'sites' directory:"
ls -la

echo ""
echo "💡 Next steps:"
echo "   - cd sites"
echo "   - Explore the cloned repositories"
echo "   - Follow individual repository setup instructions if needed"