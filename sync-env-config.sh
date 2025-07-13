#!/bin/bash
# Script to copy environment configuration to all sites
# Usage: ./sync-env-config.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_FILE="$SCRIPT_DIR/lib/env-config.umd.js"
SITES_DIR="$SCRIPT_DIR/sites"

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if source file exists
if [[ ! -f "$SOURCE_FILE" ]]; then
    print_error "Source file not found: $SOURCE_FILE"
    exit 1
fi

# Check if sites directory exists
if [[ ! -d "$SITES_DIR" ]]; then
    print_error "Sites directory not found: $SITES_DIR"
    exit 1
fi

print_info "🚀 Syncing environment configuration to all sites"
print_info "Source: $SOURCE_FILE"
print_info "Target: $SITES_DIR"

# Get all site directories
SITES=($(find "$SITES_DIR" -mindepth 1 -maxdepth 1 -type d -printf '%f\n' | sort))

if [[ ${#SITES[@]} -eq 0 ]]; then
    print_warning "No site directories found in $SITES_DIR"
    exit 0
fi

echo
print_info "Found ${#SITES[@]} sites: ${SITES[*]}"
echo

# Counter for statistics
COPIED=0
ERRORS=0

# Copy to each site
for site in "${SITES[@]}"; do
    SITE_DIR="$SITES_DIR/$site"
    TARGET_FILE="$SITE_DIR/env-config.umd.js"

    print_info "Processing site: $site"

    if [[ ! -d "$SITE_DIR" ]]; then
        print_error "  Site directory not found: $SITE_DIR"
        ((ERRORS++))
        continue
    fi

    # Check if target file already exists and compare
    if [[ -f "$TARGET_FILE" ]]; then
        if cmp -s "$SOURCE_FILE" "$TARGET_FILE"; then
            print_success "  Already up to date"
            ((COPIED++))
            continue
        else
            print_info "  Updating existing file"
        fi
    else
        print_info "  Creating new file"
    fi

    # Copy the file
    if cp "$SOURCE_FILE" "$TARGET_FILE"; then
        print_success "  Copied successfully"
        ((COPIED++))
    else
        print_error "  Failed to copy"
        ((ERRORS++))
    fi
done

echo
print_info "📊 Summary:"
echo "  Total sites: ${#SITES[@]}"
echo "  Successfully copied: $COPIED"
echo "  Errors: $ERRORS"

if [[ $ERRORS -eq 0 ]]; then
    print_success "🎉 All sites updated successfully!"
else
    print_warning "⚠️  Some sites had errors. Please check the output above."
fi

echo
print_info "Next steps:"
echo "1. Test your sites locally with './dev.sh'"
echo "2. Verify environment detection works correctly"
echo "3. Check browser console for environment info"
echo "4. Update HTML files to use 'env-config.umd.js' instead of '../../lib/env-config.umd.js'"

# Show example usage
echo
print_info "Example HTML usage:"
echo '<script src="env-config.umd.js"></script>'
echo '<script type="module">'
echo '  const { getUrl } = window.DazaEnvConfig;'
echo '  const url = getUrl("https://mdsite.daza.ar/mdsite.js");'
echo '</script>'
