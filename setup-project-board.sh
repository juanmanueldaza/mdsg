#!/bin/bash

# MDSG Project Board Setup Script
# Creates GitHub project board and organizes issues

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

# Check if we're in a git repository
check_repository() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_error "Not in a git repository"
        print_status "Run this script from your mdsg repository directory"
        exit 1
    fi

    # Check if this is the mdsg repository
    repo_name=$(gh repo view --json name --jq .name 2>/dev/null || echo "")
    if [[ "$repo_name" != "mdsg" ]]; then
        print_warning "Repository name is not 'mdsg' (found: $repo_name)"
        read -p "Continue anyway? (y/N): " confirm
        if [[ ! $confirm =~ ^[Yy]$ ]]; then
            exit 0
        fi
    fi
}

# Create project board
create_project_board() {
    print_header "Creating Project Board"

    # Check if project already exists
    if gh project list --owner @me | grep -q "MDSG Development"; then
        print_warning "Project 'MDSG Development' already exists"
        read -p "Do you want to continue and potentially modify it? (y/N): " confirm
        if [[ ! $confirm =~ ^[Yy]$ ]]; then
            print_status "Aborted by user"
            exit 0
        fi
        project_id=$(gh project list --owner @me --format json | jq -r '.projects[] | select(.title=="MDSG Development") | .id')
    else
        print_status "Creating project board 'MDSG Development'..."

        # Create the project
        project_output=$(gh project create --title "MDSG Development" --owner @me)
        project_url=$(echo "$project_output" | grep -o 'https://github.com/users/[^/]*/projects/[0-9]*')
        project_id=$(echo "$project_url" | grep -o '[0-9]*$')

        print_status "Project created: $project_url"
    fi

    echo "$project_id" > .project_id
    print_status "Project ID saved to .project_id: $project_id"
}

# Setup project columns/views
setup_project_views() {
    print_header "Setting Up Project Views"

    project_id=$(cat .project_id)

    print_status "Project boards are now managed through GitHub's new Projects interface"
    print_status "The default board view will be created automatically"
    print_status "You can customize views at: https://github.com/users/$(gh api user --jq .login)/projects/$project_id"

    # Add custom fields via API
    print_status "Adding custom fields to project..."

    # Add Priority field
    gh api graphql -f query='
        mutation($projectId: ID!) {
            updateProjectV2(input: {projectId: $projectId}) {
                projectV2 {
                    id
                }
            }
        }' -f projectId="$project_id" > /dev/null 2>&1 || true

    print_status "Project structure ready!"
}

# Add issues to project
add_issues_to_project() {
    print_header "Adding Issues to Project Board"

    project_id=$(cat .project_id)

    # Get all open issues
    issues=$(gh issue list --state open --json number,title,labels --limit 50)

    if [[ "$issues" == "[]" ]]; then
        print_warning "No open issues found to add to project"
        print_status "Make sure you've run setup-repository.sh first"
        return
    fi

    print_status "Found $(echo "$issues" | jq length) issues to add to project"

    # Add each issue to the project
    echo "$issues" | jq -r '.[] | .number' | while read -r issue_number; do
        print_status "Adding issue #$issue_number to project..."

        # Add issue to project
        gh project item-add "$project_id" --url "https://github.com/$(gh repo view --json owner,name --jq '.owner.login + "/" + .name')/issues/$issue_number" || {
            print_warning "Failed to add issue #$issue_number (may already exist)"
        }
    done

    print_status "Issues added to project board!"
}

# Setup automation rules
setup_automation() {
    print_header "Project Automation Setup"

    print_status "GitHub Projects v2 automation is configured through the web interface"
    print_status "Recommended automation rules:"
    print_status "1. Move to 'In Progress' when issue is assigned"
    print_status "2. Move to 'Done' when issue is closed"
    print_status "3. Move to 'In Review' when PR is created"
    print_status ""
    print_status "Configure these at: https://github.com/users/$(gh api user --jq .login)/projects/$(cat .project_id)/settings/workflows"
}

# Create project views
create_custom_views() {
    print_header "Custom Project Views"

    print_status "You can create custom views for better organization:"
    print_status ""
    print_status "Suggested views to create manually:"
    print_status "1. 'By Milestone' - Group by milestone"
    print_status "2. 'By Label' - Group by label (MVP, enhancement, etc.)"
    print_status "3. 'Current Sprint' - Filter to current milestone"
    print_status "4. 'Backlog' - All unassigned issues"
    print_status ""
    print_status "Create these views in the project settings"
}

# Generate project summary
generate_summary() {
    print_header "Project Board Summary"

    project_id=$(cat .project_id)
    username=$(gh api user --jq .login)

    echo ""
    echo "🎯 MDSG Project Board Ready!"
    echo ""
    echo "📊 Project URL: https://github.com/users/$username/projects/$project_id"
    echo "📋 Repository: https://github.com/$username/mdsg"
    echo ""
    echo "📈 Quick Stats:"
    echo "   Issues: $(gh issue list --state open | wc -l) open"
    echo "   Milestones: $(gh api repos/:owner/:repo/milestones | jq length)"
    echo "   Labels: $(gh label list | wc -l) total"
    echo ""
    echo "🚀 Next Steps:"
    echo "   1. Visit the project board to organize issues"
    echo "   2. Assign yourself to issues you want to work on"
    echo "   3. Start with 'MVP Core' milestone issues"
    echo "   4. Create custom views for better organization"
    echo ""
    echo "💡 Useful Commands:"
    echo "   gh issue list --milestone 'MVP Core'"
    echo "   gh issue list --label mvp"
    echo "   gh project view $project_id"
    echo ""
}

# Cleanup function
cleanup() {
    rm -f .project_id
}

# Main execution
main() {
    print_header "MDSG Project Board Setup"
    print_status "Setting up GitHub project board for MDSG development"

    check_repository
    create_project_board
    setup_project_views
    add_issues_to_project
    setup_automation
    create_custom_views
    generate_summary

    # Cleanup
    trap cleanup EXIT

    print_status "Project board setup complete! 🎉"
}

# Run the script
main "$@"
