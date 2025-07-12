#!/bin/bash

# MDSG Repository Setup Script
# Creates GitHub repository and issues following KISS principles

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

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"

    # Check if gh is installed
    if ! command -v gh &> /dev/null; then
        print_error "GitHub CLI (gh) is not installed"
        print_status "Install it from: https://cli.github.com/"
        exit 1
    fi

    # Check if user is authenticated
    if ! gh auth status &> /dev/null; then
        print_error "Not authenticated with GitHub CLI"
        print_status "Run: gh auth login"
        exit 1
    fi

    # Check if git is configured
    if ! git config user.name &> /dev/null; then
        print_error "Git user.name not configured"
        print_status "Run: git config --global user.name 'Your Name'"
        exit 1
    fi

    if ! git config user.email &> /dev/null; then
        print_error "Git user.email not configured"
        print_status "Run: git config --global user.email 'your.email@example.com'"
        exit 1
    fi

    print_status "All prerequisites met!"
}

# Create GitHub repository
create_repository() {
    print_header "Creating GitHub Repository"

    # Check if repository already exists
    if gh repo view mdsg &> /dev/null; then
        print_warning "Repository 'mdsg' already exists"
        read -p "Do you want to continue with existing repo? (y/N): " confirm
        if [[ ! $confirm =~ ^[Yy]$ ]]; then
            print_status "Aborted by user"
            exit 0
        fi
    else
        print_status "Creating repository 'mdsg'..."
        gh repo create mdsg \
            --description "Simple markdown site generator for GitHub Pages" \
            --public \
            --clone \
            --gitignore Node

        cd mdsg
        print_status "Repository created and cloned!"
    fi
}

# Create labels for issue organization
create_labels() {
    print_header "Creating Issue Labels"

    # Define labels with colors
    declare -A labels=(
        ["mvp"]="Priority MVP features|b60205"
        ["enhancement"]="Feature enhancements|a2eeef"
        ["frontend"]="Frontend/UI work|7057ff"
        ["backend"]="Backend/API work|008672"
        ["documentation"]="Documentation updates|0075ca"
        ["bug"]="Bug fixes|d73a4a"
        ["testing"]="Testing related|cfd3d7"
        ["deployment"]="Deployment and setup|e4e669"
        ["oauth"]="GitHub OAuth integration|f9d0c4"
        ["ui/ux"]="User interface and experience|fef2c0"
    )

    for label in "${!labels[@]}"; do
        IFS='|' read -r desc color <<< "${labels[$label]}"

        # Check if label exists
        if gh label list | grep -q "^$label"; then
            print_warning "Label '$label' already exists, skipping"
        else
            gh label create "$label" --description "$desc" --color "$color"
            print_status "Created label: $label"
        fi
    done
}

# Create project milestones
create_milestones() {
    print_header "Creating Project Milestones"

    # Calculate dates (roughly 2-week sprints)
    milestone1_date=$(date -d "+2 weeks" +%Y-%m-%d)
    milestone2_date=$(date -d "+4 weeks" +%Y-%m-%d)
    milestone3_date=$(date -d "+6 weeks" +%Y-%m-%d)
    milestone4_date=$(date -d "+8 weeks" +%Y-%m-%d)

    # Define milestones
    declare -A milestones=(
        ["MVP Core"]="Basic working application with OAuth and deployment|$milestone1_date"
        ["Enhanced UX"]="Improved user experience and error handling|$milestone2_date"
        ["Polish & Features"]="Additional features and code quality improvements|$milestone3_date"
        ["Production Ready"]="Documentation, testing, and production deployment|$milestone4_date"
    )

    for milestone in "${!milestones[@]}"; do
        IFS='|' read -r desc due_date <<< "${milestones[$milestone]}"

        # Check if milestone exists
        if gh api repos/:owner/:repo/milestones --jq '.[].title' | grep -q "^$milestone$"; then
            print_warning "Milestone '$milestone' already exists, skipping"
        else
            gh api repos/:owner/:repo/milestones \
                --method POST \
                --field title="$milestone" \
                --field description="$desc" \
                --field due_on="${due_date}T23:59:59Z"
            print_status "Created milestone: $milestone"
        fi
    done
}

# Create project issues
create_issues() {
    print_header "Creating Project Issues"

    # Issue 1: Project Setup
    gh issue create \
        --title "Setup development environment and basic project structure" \
        --body "## Overview
Setup the basic project structure and development environment for MDSG.

## Tasks
- [ ] Initialize Node.js project with package.json
- [ ] Setup Vite for development and building
- [ ] Create basic HTML, CSS, and JS files
- [ ] Configure development scripts
- [ ] Setup .gitignore and basic Git configuration
- [ ] Create README with basic project information

## Acceptance Criteria
- [ ] \`npm install\` works without errors
- [ ] \`npm run dev\` starts development server
- [ ] \`npm run build\` creates production build
- [ ] Basic app loads in browser

## Files to Create
- package.json
- vite.config.js
- index.html
- style.css
- src/main.js
- .gitignore" \
        --label "mvp,frontend,deployment" \
        --milestone "MVP Core"

    # Issue 2: GitHub OAuth Backend
    gh issue create \
        --title "Implement GitHub OAuth backend server" \
        --body "## Overview
Create a simple Express server to handle GitHub OAuth token exchange securely.

## Tasks
- [ ] Setup Express server with CORS
- [ ] Create OAuth token exchange endpoint
- [ ] Add environment variable configuration
- [ ] Implement error handling for OAuth flow
- [ ] Add health check endpoint

## Acceptance Criteria
- [ ] Server runs on configurable port
- [ ] \`POST /auth/github\` exchanges code for token
- [ ] Environment variables properly configured
- [ ] Error responses are user-friendly
- [ ] CORS configured for frontend

## Files to Create/Modify
- server.js
- .env.example
- package.json (add dependencies)" \
        --label "mvp,backend,oauth" \
        --milestone "MVP Core"

    # Issue 3: Frontend Authentication
    gh issue create \
        --title "Implement GitHub OAuth frontend flow" \
        --body "## Overview
Create the frontend authentication system that integrates with GitHub OAuth.

## Tasks
- [ ] Implement OAuth redirect to GitHub
- [ ] Handle OAuth callback and token exchange
- [ ] Store authentication state securely
- [ ] Create login/logout UI components
- [ ] Add user profile display

## Acceptance Criteria
- [ ] Users can click \"Login with GitHub\" button
- [ ] OAuth flow redirects to GitHub and back
- [ ] Access token is obtained and stored
- [ ] User information is displayed after login
- [ ] Logout clears authentication state

## Dependencies
- Requires GitHub OAuth backend (#2)" \
        --label "mvp,frontend,oauth" \
        --milestone "MVP Core"

    # Issue 4: Markdown Editor
    gh issue create \
        --title "Build markdown editor with live preview" \
        --body "## Overview
Create a markdown editor with real-time preview functionality.

## Tasks
- [ ] Create textarea for markdown input
- [ ] Implement basic markdown to HTML conversion
- [ ] Setup side-by-side editor/preview layout
- [ ] Add responsive design for mobile
- [ ] Implement auto-save to localStorage

## Acceptance Criteria
- [ ] Users can type markdown in editor
- [ ] Preview updates in real-time
- [ ] Layout works on desktop and mobile
- [ ] Basic markdown syntax supported (headers, bold, italic, links, lists)
- [ ] Content persists during session

## Markdown Features to Support
- Headers (h1, h2, h3)
- Bold and italic text
- Links
- Lists
- Code blocks
- Blockquotes" \
        --label "mvp,frontend,ui/ux" \
        --milestone "MVP Core"

    # Issue 5: GitHub Repository Operations
    gh issue create \
        --title "Implement GitHub repository creation and file upload" \
        --body "## Overview
Implement the core functionality to create GitHub repositories and upload generated content.

## Tasks
- [ ] Create new GitHub repository via API
- [ ] Generate HTML from markdown content
- [ ] Upload HTML file to repository
- [ ] Add basic styling to generated site
- [ ] Handle repository naming conflicts

## Acceptance Criteria
- [ ] Creates repository named 'mdsg-site' (or variant)
- [ ] Uploads index.html with converted markdown
- [ ] Generated site has basic styling
- [ ] Handles errors gracefully (duplicate names, permissions)
- [ ] Returns repository URL and status

## API Endpoints Used
- POST /user/repos (create repository)
- PUT /repos/{owner}/{repo}/contents/{path} (upload files)" \
        --label "mvp,backend,deployment" \
        --milestone "MVP Core"

    # Issue 6: GitHub Pages Integration
    gh issue create \
        --title "Enable GitHub Pages deployment" \
        --body "## Overview
Automatically enable GitHub Pages for created repositories and provide users with live site URLs.

## Tasks
- [ ] Enable GitHub Pages via API
- [ ] Configure Pages to use main branch
- [ ] Provide user with site URL
- [ ] Add deployment status feedback
- [ ] Handle Pages setup errors

## Acceptance Criteria
- [ ] GitHub Pages is automatically enabled
- [ ] Users receive live site URL
- [ ] Site is accessible within a few minutes
- [ ] Clear feedback during deployment process
- [ ] Error handling for Pages configuration

## Dependencies
- Requires repository creation (#5)" \
        --label "mvp,deployment" \
        --milestone "MVP Core"

    # Issue 7: Error Handling and UX
    gh issue create \
        --title "Improve error handling and user feedback" \
        --body "## Overview
Add comprehensive error handling and improve user experience with better feedback.

## Tasks
- [ ] Add loading states for all operations
- [ ] Implement user-friendly error messages
- [ ] Add success confirmations
- [ ] Create error recovery mechanisms
- [ ] Add form validation

## Acceptance Criteria
- [ ] Loading spinners during operations
- [ ] Clear error messages for common issues
- [ ] Success states with next steps
- [ ] Users can retry failed operations
- [ ] Form validation prevents invalid submissions

## Common Errors to Handle
- GitHub API rate limits
- Repository name conflicts
- Permission denied
- Network errors
- Invalid markdown content" \
        --label "enhancement,frontend,ui/ux" \
        --milestone "Enhanced UX"

    # Issue 8: Responsive Design
    gh issue create \
        --title "Implement responsive design and mobile support" \
        --body "## Overview
Ensure the application works well on all device sizes and improve the mobile experience.

## Tasks
- [ ] Optimize editor layout for mobile
- [ ] Add touch-friendly UI elements
- [ ] Implement collapsible sections
- [ ] Test on various screen sizes
- [ ] Add mobile-specific interactions

## Acceptance Criteria
- [ ] App works on phones (320px+)
- [ ] Editor is usable on tablets
- [ ] Touch interactions work properly
- [ ] Layout adapts to screen size
- [ ] Text remains readable on all devices

## Design Considerations
- Stack editor/preview on mobile
- Larger touch targets
- Readable font sizes
- Appropriate spacing" \
        --label "enhancement,frontend,ui/ux" \
        --milestone "Enhanced UX"

    # Issue 9: Content Management
    gh issue create \
        --title "Add ability to edit existing sites" \
        --body "## Overview
Allow users to return and edit their previously created sites.

## Tasks
- [ ] Detect existing mdsg-site repositories
- [ ] Load existing content from repository
- [ ] Update existing sites with new content
- [ ] Show list of user's sites
- [ ] Implement site management dashboard

## Acceptance Criteria
- [ ] Users can edit existing sites
- [ ] Content loads from existing repositories
- [ ] Updates are committed to repository
- [ ] Users can manage multiple sites
- [ ] Dashboard shows site status

## Features
- Site detection on login
- Content loading from GitHub
- Update workflow
- Site list/dashboard" \
        --label "enhancement,frontend,backend" \
        --milestone "Enhanced UX"

    # Issue 10: Improved Markdown Support
    gh issue create \
        --title "Enhance markdown parsing and preview" \
        --body "## Overview
Improve markdown parsing to support more features and better match GitHub's rendering.

## Tasks
- [ ] Add support for tables
- [ ] Implement syntax highlighting for code blocks
- [ ] Add image support
- [ ] Support for nested lists
- [ ] Add emoji support
- [ ] Implement strikethrough text

## Acceptance Criteria
- [ ] Tables render correctly
- [ ] Code blocks have syntax highlighting
- [ ] Images display properly
- [ ] Nested lists work
- [ ] Emojis render
- [ ] Strikethrough text supported

## Additional Features
- Line numbers for code blocks
- Copy button for code blocks
- Image drag & drop
- Live word count" \
        --label "enhancement,frontend" \
        --milestone "Polish & Features"

    # Issue 11: Code Quality and Testing
    gh issue create \
        --title "Add testing and improve code quality" \
        --body "## Overview
Implement testing strategy and improve overall code quality.

## Tasks
- [ ] Setup testing framework (Vitest)
- [ ] Write unit tests for core functions
- [ ] Add integration tests for GitHub API
- [ ] Setup ESLint for code quality
- [ ] Add Prettier for code formatting
- [ ] Implement GitHub Actions CI

## Acceptance Criteria
- [ ] Test coverage > 70%
- [ ] All tests pass in CI
- [ ] Code follows consistent style
- [ ] ESLint passes without errors
- [ ] Automated testing on PRs

## Test Coverage Areas
- Markdown parsing
- GitHub API integration
- OAuth flow
- Error handling
- UI interactions" \
        --label "testing,enhancement" \
        --milestone "Polish & Features"

    # Issue 12: Performance Optimization
    gh issue create \
        --title "Optimize application performance" \
        --body "## Overview
Improve application performance and loading times.

## Tasks
- [ ] Optimize bundle size
- [ ] Implement lazy loading
- [ ] Add service worker for caching
- [ ] Optimize images and assets
- [ ] Implement request debouncing
- [ ] Add performance monitoring

## Acceptance Criteria
- [ ] Initial load time < 2 seconds
- [ ] Bundle size < 50KB gzipped
- [ ] Smooth preview updates
- [ ] Offline functionality (basic)
- [ ] Performance metrics tracked

## Optimization Areas
- Code splitting
- Asset compression
- API request optimization
- Preview update debouncing
- Caching strategies" \
        --label "enhancement,frontend" \
        --milestone "Polish & Features"

    # Issue 13: Documentation
    gh issue create \
        --title "Create comprehensive documentation" \
        --body "## Overview
Create user and developer documentation for the project.

## Tasks
- [ ] Write user guide with screenshots
- [ ] Create API documentation
- [ ] Add deployment guide
- [ ] Write contribution guidelines
- [ ] Create troubleshooting guide
- [ ] Add video tutorials

## Acceptance Criteria
- [ ] Clear user onboarding flow
- [ ] Complete API reference
- [ ] Step-by-step deployment guide
- [ ] Contribution process documented
- [ ] Common issues covered

## Documentation Sections
- Getting started
- User manual
- Developer guide
- API reference
- Deployment instructions
- Troubleshooting" \
        --label "documentation" \
        --milestone "Production Ready"

    # Issue 14: Production Deployment
    gh issue create \
        --title "Setup production deployment" \
        --body "## Overview
Deploy the application to production and setup monitoring.

## Tasks
- [ ] Setup production OAuth app
- [ ] Deploy backend to cloud service
- [ ] Setup domain and SSL
- [ ] Configure environment variables
- [ ] Setup error monitoring
- [ ] Add analytics

## Acceptance Criteria
- [ ] Application accessible at production URL
- [ ] SSL certificate configured
- [ ] Environment variables secure
- [ ] Error monitoring active
- [ ] Analytics tracking user flow

## Production Services
- Backend hosting (Railway, Heroku, etc.)
- Frontend hosting (Vercel, Netlify)
- Error monitoring (Sentry)
- Analytics (Simple Analytics)" \
        --label "deployment,backend" \
        --milestone "Production Ready"

    # Issue 15: Security Review
    gh issue create \
        --title "Conduct security review and hardening" \
        --body "## Overview
Review application security and implement necessary hardening measures.

## Tasks
- [ ] Review OAuth implementation
- [ ] Audit GitHub token handling
- [ ] Implement rate limiting
- [ ] Add input validation
- [ ] Review CORS configuration
- [ ] Security headers implementation

## Acceptance Criteria
- [ ] OAuth flow follows best practices
- [ ] Tokens never exposed in frontend
- [ ] Rate limiting prevents abuse
- [ ] All inputs validated
- [ ] Security headers configured

## Security Checklist
- Token storage security
- HTTPS enforcement
- Input sanitization
- API rate limiting
- Error message security
- Dependency security audit" \
        --label "mvp,backend,testing" \
        --milestone "Production Ready"

    print_status "Created 15 project issues!"
}

# Main execution
main() {
    print_header "MDSG Repository Setup"
    print_status "Setting up GitHub repository for MDSG (Markdown Site Generator)"

    check_prerequisites
    create_repository
    create_labels
    create_milestones
    create_issues

    print_header "Setup Complete!"
    print_status "Repository: https://github.com/$(gh api user --jq .login)/mdsg"
    print_status "Issues created: 15"
    print_status "Milestones created: 4"
    print_status "Labels created: 10"
    print_status ""
    print_status "Next steps:"
    print_status "1. Review the created issues"
    print_status "2. Start with MVP Core milestone"
    print_status "3. Run: gh issue list --milestone 'MVP Core'"
    print_status ""
    print_status "Happy coding! 🚀"
}

# Run the script
main
