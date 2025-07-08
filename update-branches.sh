#!/bin/bash

# Script to ensure all repositories in the daza.ar ecosystem use 'main' as the default branch
# Usage: ./update-branches.sh [--dry-run]

set -e

# shellcheck source=./lib.sh
source "$(dirname "$0")/lib.sh"

# Configuration
REPOS=(
    "juanmanueldaza/cv"
    "juanmanueldaza/onepager"
    "juanmanueldaza/start"
    "juanmanueldaza/navbar"
    "juanmanueldaza/mdsite"
    "juanmanueldaza/data"
    "juanmanueldaza/wallpapers"
)

DRY_RUN=false
if [[ "$1" == "--dry-run" ]]; then
    DRY_RUN=true
    echo -e "${INFO} Running in dry-run mode - no changes will be made"
fi

# Function to check if a repository exists
repo_exists() {
    local repo="$1"
    gh repo view "$repo" &>/dev/null
}

# Function to get current default branch
get_default_branch() {
    local repo="$1"
    gh repo view "$repo" --json defaultBranchRef -q .defaultBranchRef.name 2>/dev/null || echo "unknown"
}

# Function to check if branch exists
branch_exists() {
    local repo="$1"
    local branch="$2"
    gh api "repos/$repo/branches/$branch" &>/dev/null
}

# Function to update default branch
update_default_branch() {
    local repo="$1"
    local new_branch="$2"

    if [[ "$DRY_RUN" == true ]]; then
        echo -e "${INFO} [DRY RUN] Would update default branch for $repo to $new_branch"
        return 0
    fi

    if gh repo edit "$repo" --default-branch "$new_branch"; then
        echo -e "${CHECK} Updated default branch for $repo to $new_branch"
        return 0
    else
        echo -e "${CROSS} Failed to update default branch for $repo"
        return 1
    fi
}

# Function to rename branch via API (for repositories with content)
rename_branch() {
    local repo="$1"
    local old_branch="$2"
    local new_branch="$3"

    if [[ "$DRY_RUN" == true ]]; then
        echo -e "${INFO} [DRY RUN] Would rename branch $old_branch to $new_branch in $repo"
        return 0
    fi

    # Use GitHub API to rename branch
    if gh api "repos/$repo/branches/$old_branch/rename" \
        --method POST \
        --field new_name="$new_branch" &>/dev/null; then
        echo -e "${CHECK} Renamed branch $old_branch to $new_branch in $repo"
        return 0
    else
        echo -e "${CROSS} Failed to rename branch $old_branch to $new_branch in $repo"
        return 1
    fi
}

# Function to update GitHub Pages source if needed
update_pages_source() {
    local repo="$1"
    local branch="$2"

    # Check if Pages is enabled
    if ! gh api "repos/$repo/pages" &>/dev/null; then
        echo -e "${INFO} GitHub Pages not enabled for $repo, skipping"
        return 0
    fi

    # Get current Pages configuration
    local current_source
    current_source=$(gh api "repos/$repo/pages" --jq .source.branch 2>/dev/null || echo "unknown")

    if [[ "$current_source" == "master" ]]; then
        if [[ "$DRY_RUN" == true ]]; then
            echo -e "${INFO} [DRY RUN] Would update Pages source for $repo from master to $branch"
            return 0
        fi

        if gh api "repos/$repo/pages" \
            --method PATCH \
            --field source="{\"branch\":\"$branch\",\"path\":\"/\"}" &>/dev/null; then
            echo -e "${CHECK} Updated Pages source for $repo to $branch"
        else
            echo -e "${WARNING} Failed to update Pages source for $repo"
        fi
    else
        echo -e "${INFO} Pages source for $repo is already set to $current_source"
    fi
}

# Function to process a single repository
process_repository() {
    local repo="$1"
    echo -e "\n${INFO} Processing repository: $repo"

    # Check if repository exists
    if ! repo_exists "$repo"; then
        echo -e "${CROSS} Repository $repo does not exist or is not accessible"
        return 1
    fi

    # Get current default branch
    local current_default
    current_default=$(get_default_branch "$repo")

    if [[ "$current_default" == "main" ]]; then
        echo -e "${CHECK} Repository $repo already uses 'main' as default branch"
        update_pages_source "$repo" "main"
        return 0
    fi

    if [[ "$current_default" == "master" ]]; then
        echo -e "${WARNING} Repository $repo uses 'master' as default branch"

        # Check if main branch already exists
        if branch_exists "$repo" "main"; then
            echo -e "${INFO} Branch 'main' already exists in $repo"
            # Just update the default branch setting
            update_default_branch "$repo" "main"
        else
            # Rename master to main
            echo -e "${INFO} Renaming 'master' to 'main' in $repo"
            if rename_branch "$repo" "master" "main"; then
                # Update default branch setting
                update_default_branch "$repo" "main"
            else
                return 1
            fi
        fi

        update_pages_source "$repo" "main"
    else
        echo -e "${INFO} Repository $repo uses '$current_default' as default branch (not master or main)"
        echo -e "${INFO} No action needed for this repository"
    fi
}

# Main execution
main() {
    echo -e "${INFO} Starting branch migration for daza.ar ecosystem"
    echo -e "${INFO} Target: Ensure all repositories use 'main' as default branch"

    # Check prerequisites
    if ! command_exists gh; then
        echo -e "${CROSS} GitHub CLI (gh) is required but not installed"
        echo -e "${INFO} Install it from: https://cli.github.com/"
        exit 1
    fi

    # Check authentication
    if ! gh auth status &>/dev/null; then
        echo -e "${CROSS} GitHub CLI not authenticated"
        echo -e "${INFO} Please run: gh auth login"
        exit 1
    fi

    local failed_repos=()

    # Process each repository
    for repo in "${REPOS[@]}"; do
        if ! process_repository "$repo"; then
            failed_repos+=("$repo")
        fi
    done

    # Summary
    echo -e "\n${INFO} Branch migration summary:"

    if [[ ${#failed_repos[@]} -eq 0 ]]; then
        echo -e "${CHECK} All repositories processed successfully!"
        echo -e "${INFO} All repositories in the daza.ar ecosystem now use 'main' as default branch"
    else
        echo -e "${WARNING} Some repositories had issues:"
        for repo in "${failed_repos[@]}"; do
            echo -e "  ${CROSS} $repo"
        done
        echo -e "\n${INFO} Please review the failed repositories manually"
        return 1
    fi

    if [[ "$DRY_RUN" == true ]]; then
        echo -e "\n${INFO} This was a dry run. Run without --dry-run to apply changes."
    fi
}

# Check for help flag
if [[ "$1" == "-h" ]] || [[ "$1" == "--help" ]]; then
    echo "Usage: $0 [--dry-run]"
    echo ""
    echo "Ensures all repositories in the daza.ar ecosystem use 'main' as the default branch."
    echo ""
    echo "Options:"
    echo "  --dry-run    Show what would be done without making changes"
    echo "  -h, --help   Show this help message"
    echo ""
    echo "Prerequisites:"
    echo "  - GitHub CLI (gh) must be installed and authenticated"
    echo "  - Must have admin access to all repositories"
    echo ""
    echo "Repositories processed:"
    for repo in "${REPOS[@]}"; do
        echo "  - $repo"
    done
    exit 0
fi

# Run main function
main "$@"
