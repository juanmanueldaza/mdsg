#!/bin/bash

# Multi-Repository Management Tool for daza.ar ecosystem
# Enhanced tools to make working with multiple repositories easier
# Usage: ./mr.sh <command> [options]

set -e

# shellcheck source=./lib.sh
source "$(dirname "$0")/lib.sh"

# Configuration
SITES_CONFIG="$(dirname "$0")/sites.config.json"
REPOS=(
    "juanmanueldaza/cv"
    "juanmanueldaza/onepager"
    "juanmanueldaza/start"
    "juanmanueldaza/navbar"
    "juanmanueldaza/mdsite"
    "juanmanueldaza/data"
    "juanmanueldaza/wallpapers"
)

# Function to show usage
show_usage() {
    cat << EOF
Multi-Repository Management Tool for daza.ar ecosystem

Usage: $0 <command> [options]

Commands:
  status              Show status of all repositories
  pull               Pull latest changes from all repositories
  push               Push changes to all repositories
  checkout <branch>  Checkout branch in all repositories
  branch             Show current branch of all repositories
  clean              Clean all repositories (reset to clean state)
  sync               Sync all repositories (pull + status)
  deploy             Deploy all sites to GitHub Pages
  commit <msg>       Commit changes in all repositories with same message
  create-branch <name> Create new branch in all repositories
  delete-branch <name> Delete branch in all repositories
  foreach <cmd>      Run custom command in each repository
  health             Check health of all repositories and dependencies
  backup             Create backup of all local changes
  restore <backup>   Restore from backup
  info               Show detailed information about each repository

Options:
  --site <name>      Target specific site only
  --dry-run          Show what would be done without executing
  --parallel         Execute commands in parallel (where safe)
  --verbose          Show detailed output
  --help             Show this help message

Examples:
  ./mr.sh status                    # Show status of all repos
  ./mr.sh pull --site cv            # Pull only CV repository
  ./mr.sh commit "fix: update docs" # Commit same message to all repos
  ./mr.sh foreach "npm install"     # Run npm install in all repos
  ./mr.sh deploy --dry-run          # Test deployment without executing

EOF
}

# Function to get list of sites
get_sites() {
    if [ -f "$SITES_CONFIG" ]; then
        jq -r '.[].name' "$SITES_CONFIG"
    else
        echo "cv onepager start navbar mdsite data wallpapers"
    fi
}

# Function to check if site exists locally
site_exists() {
    local site="$1"
    [ -d "sites/$site" ]
}

# Function to execute command in repository
execute_in_repo() {
    local site="$1"
    local cmd="$2"
    local show_output="${3:-true}"

    if ! site_exists "$site"; then
        echo -e "${CROSS} Site $site not found locally"
        return 1
    fi

    if [ "$show_output" = "true" ]; then
        echo -e "${INFO} [$site] $cmd"
    fi

    (
        cd "sites/$site" || exit 1
        eval "$cmd"
    )
}

# Function to run command on all or specific sites
run_on_sites() {
    local cmd="$1"
    local target_site="$2"
    local parallel="${3:-false}"
    local show_output="${4:-true}"

    if [ -n "$target_site" ]; then
        execute_in_repo "$target_site" "$cmd" "$show_output"
        return $?
    fi

    local sites
    sites=$(get_sites)
    local failed_sites=()

    if [ "$parallel" = "true" ]; then
        # Parallel execution for safe commands
        for site in $sites; do
            if site_exists "$site"; then
                (execute_in_repo "$site" "$cmd" "$show_output") &
            fi
        done
        wait
    else
        # Sequential execution
        for site in $sites; do
            if site_exists "$site"; then
                if ! execute_in_repo "$site" "$cmd" "$show_output"; then
                    failed_sites+=("$site")
                fi
            fi
        done
    fi

    if [ ${#failed_sites[@]} -gt 0 ]; then
        echo -e "${WARNING} Failed sites: ${failed_sites[*]}"
        return 1
    fi
}

# Command implementations
cmd_status() {
    echo -e "${INFO} Repository Status Summary"
    echo "================================"

    run_on_sites "echo -n ''; git status --porcelain | wc -l | tr -d ' ' | xargs -I {} echo 'Changes: {}'; git rev-parse --abbrev-ref HEAD | xargs -I {} echo 'Branch: {}'; echo ''" "" false true
}

cmd_pull() {
    local target_site="$1"
    echo -e "${INFO} Pulling latest changes..."
    run_on_sites "git pull --ff-only" "$target_site"
}

cmd_push() {
    local target_site="$1"
    echo -e "${INFO} Pushing changes..."
    run_on_sites "git push" "$target_site"
}

cmd_checkout() {
    local branch="$1"
    local target_site="$2"

    if [ -z "$branch" ]; then
        echo -e "${CROSS} Branch name required"
        return 1
    fi

    echo -e "${INFO} Checking out branch: $branch"
    run_on_sites "git checkout '$branch'" "$target_site"
}

cmd_branch() {
    echo -e "${INFO} Current Branches"
    echo "=================="
    run_on_sites "git rev-parse --abbrev-ref HEAD" ""
}

cmd_clean() {
    echo -e "${WARNING} This will reset all repositories to clean state!"
    echo -e "${WARNING} All uncommitted changes will be lost!"
    read -p "Are you sure? (y/N): " -r
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${INFO} Cancelled"
        return 0
    fi

    echo -e "${INFO} Cleaning repositories..."
    run_on_sites "git reset --hard HEAD && git clean -fd" ""
}

cmd_sync() {
    echo -e "${INFO} Syncing all repositories..."
    cmd_pull ""
    cmd_status
}

cmd_deploy() {
    local dry_run="$1"

    if [ "$dry_run" = "--dry-run" ]; then
        echo -e "${INFO} [DRY RUN] Would deploy all sites"
        run_on_sites "echo 'Would run: npm run deploy || gh-pages -d .'" ""
    else
        echo -e "${INFO} Deploying all sites..."
        run_on_sites "npm run deploy 2>/dev/null || gh-pages -d . 2>/dev/null || echo 'No deployment script found'" ""
    fi
}

cmd_commit() {
    local message="$1"
    local target_site="$2"

    if [ -z "$message" ]; then
        echo -e "${CROSS} Commit message required"
        return 1
    fi

    echo -e "${INFO} Committing with message: $message"
    run_on_sites "git add . && git commit -m '$message' || echo 'Nothing to commit'" "$target_site"
}

cmd_create_branch() {
    local branch="$1"
    local target_site="$2"

    if [ -z "$branch" ]; then
        echo -e "${CROSS} Branch name required"
        return 1
    fi

    echo -e "${INFO} Creating branch: $branch"
    run_on_sites "git checkout -b '$branch'" "$target_site"
}

cmd_delete_branch() {
    local branch="$1"
    local target_site="$2"

    if [ -z "$branch" ]; then
        echo -e "${CROSS} Branch name required"
        return 1
    fi

    echo -e "${WARNING} Deleting branch: $branch"
    run_on_sites "git branch -d '$branch'" "$target_site"
}

cmd_foreach() {
    local command="$1"
    local target_site="$2"

    if [ -z "$command" ]; then
        echo -e "${CROSS} Command required"
        return 1
    fi

    echo -e "${INFO} Running command: $command"
    run_on_sites "$command" "$target_site"
}

cmd_health() {
    echo -e "${INFO} Health Check Report"
    echo "==================="

    # Check if sites directory exists
    if [ ! -d "sites" ]; then
        echo -e "${CROSS} Sites directory not found. Run ./setup.sh first."
        return 1
    fi

    # Check each repository
    local sites
    sites=$(get_sites)
    local healthy=0
    local total=0

    for site in $sites; do
        total=$((total + 1))
        echo -e "\n${INFO} Checking $site..."

        if ! site_exists "$site"; then
            echo -e "${CROSS} Repository not found locally"
            continue
        fi

        # Check git status
        local git_status
        git_status=$(execute_in_repo "$site" "git status --porcelain" false 2>/dev/null || echo "ERROR")

        if [ "$git_status" = "ERROR" ]; then
            echo -e "${CROSS} Not a git repository"
            continue
        fi

        # Check for uncommitted changes
        if [ -n "$git_status" ]; then
            echo -e "${WARNING} Has uncommitted changes"
        else
            echo -e "${CHECK} Clean working directory"
        fi

        # Check current branch
        local branch
        branch=$(execute_in_repo "$site" "git rev-parse --abbrev-ref HEAD" false 2>/dev/null || echo "unknown")
        echo -e "${INFO} Current branch: $branch"

        # Check remote status
        local remote_status
        remote_status=$(execute_in_repo "$site" "git status --porcelain -b" false 2>/dev/null | head -1 || echo "")
        if echo "$remote_status" | grep -q "ahead"; then
            echo -e "${WARNING} Has unpushed commits"
        elif echo "$remote_status" | grep -q "behind"; then
            echo -e "${WARNING} Behind remote"
        else
            echo -e "${CHECK} Up to date with remote"
        fi

        healthy=$((healthy + 1))
    done

    echo -e "\n${INFO} Health Summary: $healthy/$total repositories are accessible"
}

cmd_backup() {
    local timestamp
    timestamp=$(date +"%Y%m%d_%H%M%S")
    local backup_dir="backups/backup_$timestamp"

    echo -e "${INFO} Creating backup: $backup_dir"
    mkdir -p "$backup_dir"

    # Backup each repository's changes
    local sites
    sites=$(get_sites)

    for site in $sites; do
        if site_exists "$site"; then
            echo -e "${INFO} Backing up $site..."

            # Create git bundle of current state
            execute_in_repo "$site" "git bundle create '../../$backup_dir/${site}.bundle' --all" false

            # Save uncommitted changes if any
            local changes
            changes=$(execute_in_repo "$site" "git status --porcelain" false)
            if [ -n "$changes" ]; then
                execute_in_repo "$site" "git stash push -u -m 'mr.sh backup $timestamp'" false
                echo "stashed" > "$backup_dir/${site}.stash"
            fi
        fi
    done

    echo -e "${CHECK} Backup created: $backup_dir"
    echo "$backup_dir" > .last_backup
}

cmd_restore() {
    local backup="$1"

    if [ -z "$backup" ]; then
        if [ -f ".last_backup" ]; then
            backup=$(cat .last_backup)
            echo -e "${INFO} Using last backup: $backup"
        else
            echo -e "${CROSS} Backup path required"
            return 1
        fi
    fi

    if [ ! -d "$backup" ]; then
        echo -e "${CROSS} Backup not found: $backup"
        return 1
    fi

    echo -e "${WARNING} This will restore from backup and may overwrite current changes!"
    read -p "Are you sure? (y/N): " -r
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${INFO} Cancelled"
        return 0
    fi

    echo -e "${INFO} Restoring from backup: $backup"

    # Restore each repository
    for bundle in "$backup"/*.bundle; do
        if [ -f "$bundle" ]; then
            local site
            site=$(basename "$bundle" .bundle)
            echo -e "${INFO} Restoring $site..."

            if site_exists "$site"; then
                execute_in_repo "$site" "git fetch '../../$bundle'" false

                # Restore stashed changes if they exist
                if [ -f "$backup/${site}.stash" ]; then
                    execute_in_repo "$site" "git stash pop" false || true
                fi
            fi
        fi
    done

    echo -e "${CHECK} Restore completed"
}

cmd_info() {
    echo -e "${INFO} Repository Information"
    echo "======================"

    local sites
    sites=$(get_sites)

    for site in $sites; do
        echo -e "\n${INFO} $site"
        echo "$(printf '=%.0s' {1..20})"

        if ! site_exists "$site"; then
            echo -e "${CROSS} Not found locally"
            continue
        fi

        # Repository information
        local url
        url=$(execute_in_repo "$site" "git remote get-url origin" false 2>/dev/null || echo "No remote")
        echo -e "Remote: $url"

        local branch
        branch=$(execute_in_repo "$site" "git rev-parse --abbrev-ref HEAD" false 2>/dev/null || echo "unknown")
        echo -e "Branch: $branch"

        local commit
        commit=$(execute_in_repo "$site" "git log -1 --format='%h - %s (%cr)'" false 2>/dev/null || echo "No commits")
        echo -e "Last commit: $commit"

        local changes
        changes=$(execute_in_repo "$site" "git status --porcelain | wc -l" false 2>/dev/null || echo "0")
        echo -e "Uncommitted changes: $changes"

        # Check if package.json exists
        if [ -f "sites/$site/package.json" ]; then
            local version
            version=$(execute_in_repo "$site" "jq -r .version package.json" false 2>/dev/null || echo "unknown")
            echo -e "Package version: $version"
        fi
    done
}

# Parse arguments
COMMAND="$1"
shift || true

# Parse options
TARGET_SITE=""
DRY_RUN=false
PARALLEL=false
VERBOSE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --site)
            TARGET_SITE="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --parallel)
            PARALLEL=true
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        --help)
            show_usage
            exit 0
            ;;
        *)
            # Assume it's a parameter for the command
            break
            ;;
    esac
done

# Execute command
case "$COMMAND" in
    status)
        cmd_status
        ;;
    pull)
        cmd_pull "$TARGET_SITE"
        ;;
    push)
        cmd_push "$TARGET_SITE"
        ;;
    checkout)
        cmd_checkout "$1" "$TARGET_SITE"
        ;;
    branch)
        cmd_branch
        ;;
    clean)
        cmd_clean
        ;;
    sync)
        cmd_sync
        ;;
    deploy)
        if [ "$DRY_RUN" = "true" ]; then
            cmd_deploy "--dry-run"
        else
            cmd_deploy
        fi
        ;;
    commit)
        cmd_commit "$1" "$TARGET_SITE"
        ;;
    create-branch)
        cmd_create_branch "$1" "$TARGET_SITE"
        ;;
    delete-branch)
        cmd_delete_branch "$1" "$TARGET_SITE"
        ;;
    foreach)
        cmd_foreach "$1" "$TARGET_SITE"
        ;;
    health)
        cmd_health
        ;;
    backup)
        cmd_backup
        ;;
    restore)
        cmd_restore "$1"
        ;;
    info)
        cmd_info
        ;;
    help|--help|-h)
        show_usage
        ;;
    "")
        echo -e "${CROSS} No command specified"
        show_usage
        exit 1
        ;;
    *)
        echo -e "${CROSS} Unknown command: $COMMAND"
        show_usage
        exit 1
        ;;
esac
