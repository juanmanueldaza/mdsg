#!/bin/bash
# Migration script to update sites to use environment configuration
# Usage: ./migrate-to-env-config.sh [--dry-run] [--site=SITE_NAME]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SITES_DIR="$SCRIPT_DIR/sites"
ENV_CONFIG_PATH="../../lib/env-config.umd.js"

# Default options
DRY_RUN=false
SPECIFIC_SITE=""
BACKUP_DIR="$SCRIPT_DIR/backup-$(date +%Y%m%d-%H%M%S)"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --site=*)
            SPECIFIC_SITE="${1#*=}"
            shift
            ;;
        --help)
            echo "Usage: $0 [--dry-run] [--site=SITE_NAME]"
            echo "  --dry-run    Show what would be changed without making changes"
            echo "  --site=NAME  Only process specific site"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

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

# Function to create backup
create_backup() {
    local file="$1"
    local backup_file="$BACKUP_DIR/$(realpath --relative-to="$SCRIPT_DIR" "$file")"
    local backup_dir="$(dirname "$backup_file")"

    mkdir -p "$backup_dir"
    cp "$file" "$backup_file"
    print_info "Backed up: $file"
}

# Function to check if file needs environment config
needs_env_config() {
    local file="$1"

    # Check if file contains daza.ar URLs
    if grep -q "https://[^/]*\.daza\.ar" "$file"; then
        return 0
    fi

    return 1
}

# Function to check if file already has environment config
has_env_config() {
    local file="$1"

    if grep -q "env-config\.umd\.js" "$file"; then
        return 0
    fi

    return 1
}

# Function to add environment config script to HTML
add_env_config_script() {
    local file="$1"
    local temp_file=$(mktemp)

    # Insert the script tag after <head> or <meta charset>
    if grep -q "<head>" "$file"; then
        sed '/<head>/a\    <script src="'"$ENV_CONFIG_PATH"'"></script>' "$file" > "$temp_file"
    elif grep -q '<meta charset=' "$file"; then
        sed '/<meta charset=/a\    <script src="'"$ENV_CONFIG_PATH"'"></script>' "$file" > "$temp_file"
    else
        print_warning "Could not find suitable place to insert environment config script in $file"
        rm "$temp_file"
        return 1
    fi

    mv "$temp_file" "$file"
    return 0
}

# Function to transform URLs in JavaScript
transform_js_urls() {
    local file="$1"
    local temp_file=$(mktemp)

    # Transform import statements
    sed -E 's/import \{([^}]+)\} from ['\''"]https:\/\/([^\/]+\.daza\.ar[^'\''"]*)['\''"];/const { getUrl } = window.DazaEnvConfig;\n      const { \1 } = await import(getUrl('\''https:\/\/\2'\''));/g' "$file" > "$temp_file"

    # Transform other URL references
    sed -E 's/['\''"]https:\/\/([^\/]+\.daza\.ar[^'\''"]*)['\''"];/getUrl('\''https:\/\/\1'\'');/g' "$temp_file" > "$temp_file.2"

    # Transform URL assignments
    sed -E 's/: ['\''"]https:\/\/([^\/]+\.daza\.ar[^'\''"]*)['\''"],/: getUrl('\''https:\/\/\1'\''),/g' "$temp_file.2" > "$temp_file.3"

    mv "$temp_file.3" "$file"
    rm -f "$temp_file" "$temp_file.2"
}

# Function to process a single file
process_file() {
    local file="$1"
    local relative_path="$(realpath --relative-to="$SCRIPT_DIR" "$file")"

    print_info "Processing: $relative_path"

    if ! needs_env_config "$file"; then
        print_info "  No daza.ar URLs found, skipping"
        return 0
    fi

    if has_env_config "$file"; then
        print_info "  Already has environment config, skipping script addition"
    else
        print_info "  Adding environment config script"
        if [[ "$DRY_RUN" == "false" ]]; then
            create_backup "$file"
            if add_env_config_script "$file"; then
                print_success "  Added environment config script"
            else
                print_error "  Failed to add environment config script"
                return 1
            fi
        else
            print_info "  [DRY RUN] Would add environment config script"
        fi
    fi

    # Show URLs that would be transformed
    print_info "  URLs to transform:"
    grep -o "https://[^/]*\.daza\.ar[^'\"]*" "$file" | sort -u | while read url; do
        echo "    $url"
    done

    if [[ "$DRY_RUN" == "false" ]]; then
        print_info "  Transforming JavaScript URLs"
        transform_js_urls "$file"
        print_success "  Transformed URLs"
    else
        print_info "  [DRY RUN] Would transform JavaScript URLs"
    fi
}

# Function to process all sites or specific site
process_sites() {
    if [[ -n "$SPECIFIC_SITE" ]]; then
        local site_dir="$SITES_DIR/$SPECIFIC_SITE"
        if [[ ! -d "$site_dir" ]]; then
            print_error "Site directory not found: $site_dir"
            exit 1
        fi

        print_info "Processing specific site: $SPECIFIC_SITE"
        find "$site_dir" -name "*.html" -type f | while read file; do
            process_file "$file"
        done
    else
        print_info "Processing all sites"
        find "$SITES_DIR" -name "*.html" -type f | while read file; do
            process_file "$file"
        done
    fi
}

# Function to show summary
show_summary() {
    local total_files=0
    local files_with_urls=0
    local files_with_config=0

    if [[ -n "$SPECIFIC_SITE" ]]; then
        local site_dir="$SITES_DIR/$SPECIFIC_SITE"
        total_files=$(find "$site_dir" -name "*.html" -type f | wc -l)
        files_with_urls=$(find "$site_dir" -name "*.html" -type f -exec grep -l "https://[^/]*\.daza\.ar" {} \; | wc -l)
        files_with_config=$(find "$site_dir" -name "*.html" -type f -exec grep -l "env-config\.umd\.js" {} \; | wc -l)
    else
        total_files=$(find "$SITES_DIR" -name "*.html" -type f | wc -l)
        files_with_urls=$(find "$SITES_DIR" -name "*.html" -type f -exec grep -l "https://[^/]*\.daza\.ar" {} \; | wc -l)
        files_with_config=$(find "$SITES_DIR" -name "*.html" -type f -exec grep -l "env-config\.umd\.js" {} \; | wc -l)
    fi

    echo
    print_info "Migration Summary:"
    echo "  Total HTML files: $total_files"
    echo "  Files with daza.ar URLs: $files_with_urls"
    echo "  Files with env config: $files_with_config"

    if [[ "$DRY_RUN" == "true" ]]; then
        print_warning "This was a dry run. No changes were made."
        print_info "Run without --dry-run to apply changes."
    else
        if [[ -d "$BACKUP_DIR" ]]; then
            print_info "Backups saved to: $BACKUP_DIR"
        fi
        print_success "Migration completed!"
    fi
}

# Function to validate environment
validate_environment() {
    if [[ ! -d "$SITES_DIR" ]]; then
        print_error "Sites directory not found: $SITES_DIR"
        exit 1
    fi

    if [[ ! -f "$SCRIPT_DIR/lib/env-config.umd.js" ]]; then
        print_error "Environment config file not found: $SCRIPT_DIR/lib/env-config.umd.js"
        print_info "Please ensure the environment configuration system is set up first."
        exit 1
    fi

    print_success "Environment validation passed"
}

# Function to show what URLs would be transformed
show_url_preview() {
    print_info "Preview of URL transformations:"

    local search_dir="$SITES_DIR"
    if [[ -n "$SPECIFIC_SITE" ]]; then
        search_dir="$SITES_DIR/$SPECIFIC_SITE"
    fi

    echo
    printf "%-50s | %-50s\n" "Production URL" "Development URL"
    printf "%-50s-+-%-50s\n" "$(printf '%*s' 50 '' | tr ' ' '-')" "$(printf '%*s' 50 '' | tr ' ' '-')"

    # Extract unique URLs and show their transformations
    find "$search_dir" -name "*.html" -type f -exec grep -ho "https://[^/]*\.daza\.ar[^'\"]*" {} \; | sort -u | while read url; do
        # Simple transformation preview (this is a simplified version)
        local transformed="$url"
        if [[ "$url" =~ https://([^/]+)\.daza\.ar(.*)$ ]]; then
            local subdomain="${BASH_REMATCH[1]}"
            local path="${BASH_REMATCH[2]}"

            # Map subdomains to ports (simplified)
            case "$subdomain" in
                "cv") transformed="http://cv.local:3001$path" ;;
                "onepager") transformed="http://onepager.local:3002$path" ;;
                "start") transformed="http://start.local:3003$path" ;;
                "navbar") transformed="http://navbar.local:3004$path" ;;
                "mdsite") transformed="http://mdsite.local:3005$path" ;;
                "data") transformed="http://data.local:3006$path" ;;
                "wallpapers") transformed="http://wallpapers.local:3007$path" ;;
                "laboratoriodeprogramacioncreativa") transformed="http://laboratoriodeprogramacioncreativa.local:3008$path" ;;
                "spanishlessons") transformed="http://spanishlessons.local:3009$path" ;;
                *) transformed="http://$subdomain.local:3000$path" ;;
            esac
        fi

        printf "%-50s | %-50s\n" "$url" "$transformed"
    done

    echo
}

# Main execution
main() {
    print_info "🚀 Starting migration to environment configuration system"

    if [[ "$DRY_RUN" == "true" ]]; then
        print_warning "Running in DRY RUN mode - no changes will be made"
    fi

    validate_environment
    show_url_preview

    if [[ "$DRY_RUN" == "false" ]]; then
        echo
        read -p "Do you want to proceed with the migration? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Migration cancelled"
            exit 0
        fi
    fi

    echo
    process_sites
    show_summary

    echo
    print_info "Next steps:"
    echo "1. Test your sites locally with './dev.sh'"
    echo "2. Verify URLs are correctly transformed"
    echo "3. Check console for environment information"
    echo "4. Deploy to production when ready"
    echo
    print_info "For more information, see: ENVIRONMENT_CONFIG.md"
}

# Run main function
main "$@"
