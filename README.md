# daza.ar Environment Setup

<!-- SITES_TABLE_START -->

| Site                              | Port | URL                                                 |
| --------------------------------- | ---- | --------------------------------------------------- |
| cv                                | 3001 | http://cv.local:3001                                |
| onepager                          | 3002 | http://onepager.local:3002                          |
| start                             | 3003 | http://start.local:3003                             |
| navbar                            | 3004 | http://navbar.local:3004                            |
| mdsite                            | 3005 | http://mdsite.local:3005                            |
| data                              | 3006 | http://data.local:3006                              |
| wallpapers                        | 3007 | http://wallpapers.local:3007                        |
| laboratoriodeprogramacioncreativa | 3008 | http://laboratoriodeprogramacioncreativa.local:3008 |
| spanishlessons                    | 3009 | http://spanishlessons.local:3009                    |

<!-- SITES_TABLE_END -->

A simple setup script to bootstrap the development environment for daza.ar projects by creating a structured workspace and cloning all necessary repositories. This ecosystem uses GitHub Pages for production deployment with a sophisticated multi-repo architecture where each site is independently deployable while sharing common modules.

## Overview

This repository provides tools to quickly set up and develop the daza.ar ecosystem locally. It includes:

- A setup script to clone all required repositories into a `sites/` directory.
- A unified development workflow to serve all sites locally with Vite, each on its own port.
- Production deployment to GitHub Pages with custom subdomain routing and shared module architecture.

### Production Architecture

Each site in the ecosystem is deployed to its own GitHub Pages repository with custom subdomain routing:

- **cv**: https://cv.daza.ar
- **onepager**: https://onepager.daza.ar
- **start**: https://start.daza.ar
- **navbar**: https://navbar.daza.ar (shared navigation component)
- **mdsite**: https://mdsite.daza.ar (shared markdown processing module)
- **data**: https://data.daza.ar (content and data repository)
- **wallpapers**: https://wallpapers.daza.ar

Sites share common functionality through remote module imports from production URLs, creating a true microservices architecture for static sites.

## Quick Start

To check prerequisites and set up your environment, simply run:

```bash
./setup.sh
```

This script will guide you through all required steps and report any missing tools. For troubleshooting, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md).

## Multi-Repository Management

Enhanced tools for managing all repositories in the ecosystem:

### Essential Commands

```bash
# Setup and sync all repositories
./mr.sh sync              # Pull latest from all repos + status check
./mr.sh status            # Show status of all repositories
./mr.sh health            # Comprehensive health check

# Development workflow
./mr.sh pull              # Pull latest changes from all repos
./mr.sh deploy            # Deploy all sites to GitHub Pages
./mr.sh commit "message"  # Commit same message to all repos

# Advanced operations
./mr.sh foreach "npm install"     # Run command in all repos
./mr.sh backup                    # Create backup of all changes
./mr.sh branch                    # Show current branch in all repos
./mr.sh create-branch "feature"   # Create branch in all repos
```

### Target Specific Sites

```bash
# Work with specific sites
./mr.sh pull --site cv           # Pull only CV repository
./mr.sh status --site navbar     # Check only navbar status
./mr.sh commit "fix" --site data # Commit only to data repo
```

## Legacy Workflow Commands

- For development server status and health checks, run:
  ```bash
  ./status.sh
  ```
- For starting all dev servers:
  ```bash
  ./dev.sh
  ```
- For more details on workflow, branching, and PRs, see the sections below.

## Prerequisites

- **GitHub CLI (`gh`)** ([Installation guide](https://cli.github.com/))
- **Git** ([Installation guide](https://git-scm.com/downloads))
- **Node.js** (v18+ recommended)
- **Bash shell** (Linux, macOS, or Windows with WSL)

### Authentication

Make sure you're authenticated with GitHub CLI:

```bash
gh auth login
```

# Git, GitHub CLI, and Workflow Documentation

<!-- SITES_TABLE_START -->

| Site                              | Port | URL                                                 |
| --------------------------------- | ---- | --------------------------------------------------- |
| cv                                | 3001 | http://cv.local:3001                                |
| onepager                          | 3002 | http://onepager.local:3002                          |
| start                             | 3003 | http://start.local:3003                             |
| navbar                            | 3004 | http://navbar.local:3004                            |
| mdsite                            | 3005 | http://mdsite.local:3005                            |
| data                              | 3006 | http://data.local:3006                              |
| wallpapers                        | 3007 | http://wallpapers.local:3007                        |
| laboratoriodeprogramacioncreativa | 3008 | http://laboratoriodeprogramacioncreativa.local:3008 |
| spanishlessons                    | 3009 | http://spanishlessons.local:3009                    |

<!-- SITES_TABLE_END -->

## Branching Strategy

- **main**: Stable, production-ready code.
- **develop**: Integration branch for tested features.
- **feature/\***: Short-lived branches for new features or fixes, branched from `develop`.

## Typical Workflow

1. **Sync your local repo**

   ```bash
   git checkout main
   git pull origin main
   git checkout develop
   git pull origin develop
   ```

2. **Create a feature branch**

   ```bash
   git checkout -b feature/issue-XX-short-description develop
   ```

3. **Work and commit**
   - Make atomic commits with clear messages referencing the issue:
     ```bash
     git add .
     git commit -m "feat: add X (closes #XX)"
     ```

4. **Push and open a PR**

   ```bash
   git push -u origin feature/issue-XX-short-description
   gh pr create --base develop --head feature/issue-XX-short-description --title "Short summary (fixes #XX)" --body "Details and closes #XX"
   ```

5. **Review and merge**
   - Review PRs using GitHub or `gh pr review`.
   - Merge with squash and delete the branch:
     ```bash
     gh pr merge <PR_NUMBER> --squash --delete-branch
     ```

6. **Release to main**
   - After testing, open a PR from `develop` to `main`:
     ```bash
     gh pr create --base main --head develop --title "Release: Merge develop into main"
     ```
   - Merge as above.

## Issue Management

- Use rich issue templates for features and workflow.
- Assign, label, and close issues using the GitHub CLI:
  ```bash
  gh issue edit <number> --add-label documentation,workflow
  gh issue close <number> --comment "Released in main via PR #XX"
  ```

## Branch Protection

- `main` is protected: direct pushes are disabled, PRs required (can be relaxed for solo dev).
- Adjust protection as needed for solo or team development.

## Principles

- **KISS**: Keep scripts and workflow simple.
- **Minimal dependencies**: Use only Vite as an npm dependency. Prefer built-in tools and avoid extra packages.
- **GitHub CLI first**: Use the GitHub CLI (`gh`) for all repo, issue, and PR management tasks whenever possible. Use plain git only for low-level or unsupported operations.
- **SOLID/CLEAN**: Structure scripts and documentation for clarity and maintainability.

---

_For more detail, see `.github/ISSUE_TEMPLATE/branch_workflow.md` and `.github/ISSUE_TEMPLATE/feature_improvement.md`._

## What Gets Cloned

The setup script clones the following repositories into the `sites` directory:

| Repository                  | Description                 |
| --------------------------- | --------------------------- |
| `juanmanueldaza/cv`         | Personal CV/Resume website  |
| `juanmanueldaza/onepager`   | One-page portfolio site     |
| `juanmanueldaza/data`       | Data and content management |
| `juanmanueldaza/wallpapers` | Wallpaper collection        |
| `juanmanueldaza/start`      | Start page/dashboard        |
| `juanmanueldaza/navbar`     | Navigation bar component    |
| `juanmanueldaza/mdsite`     | Markdown-based static site  |

## Directory Structure

After running the setup script, your directory structure will look like this:

```
daza.ar-env/
├── README.md
├── setup.sh
├── dev.sh
├── package.json
├── vite.config.js
├── sites/           # (cloned repos, ignored by git)
│   ├── cv/
│   ├── onepager/
│   ├── data/
│   ├── wallpapers/
│   ├── start/
│   ├── navbar/
│   └── mdsite/
└── logs/            # (optional, for custom logging)
```

## Development Workflow

### Local Development

- Run `./dev.sh` to start all Vite dev servers in the background. Each site will open in your browser with its custom .local domain:
  - CV: http://cv.localhost:3001
  - Onepager: http://onepager.localhost:3002
  - Start: http://start.localhost:3003
  - Navbar: http://navbar.localhost:3004
  - Mdsite: http://mdsite.localhost:3005
  - Data: http://data.localhost:3006 (opens /README.md by default)
- Make changes in any site and see them live with hot reload.
- The `sites/` directory is ignored by git; you can safely re-run `setup.sh` to update or re-clone projects.

### Production Deployment

Each site is deployed independently to GitHub Pages using the `gh-pages` package:

```bash
# In each site directory
npm run build    # Build the site (if needed)
npm run deploy   # Deploy to GitHub Pages
```

**Shared Module Architecture**: Sites import shared functionality from production URLs during both development and production:

- `https://mdsite.daza.ar/mdsite.js` - Unified markdown rendering and accessibility
- `https://navbar.daza.ar/utils/downloadPdf.js` - PDF export utilities
- `https://data.daza.ar/md/` - Markdown content sources

This creates development/production parity and validates network dependencies during local development.

## Features

- **Enhanced multi-repo management:** Powerful `./mr.sh` tool for managing all repositories as a unified ecosystem.
- **Idempotent setup:** Safe to run multiple times—skips existing repositories.
- **Unified dev environment:** Serve all sites with Vite, each on its own port and custom .local domain.
- **No extra dependencies:** Only Vite is required for development.
- **Microservices architecture:** Each site deploys independently while sharing common modules.
- **Production-like development:** Local development imports from production URLs for true integration testing.
- **Custom domain routing:** Each site gets its own subdomain (cv.daza.ar, start.daza.ar, etc.).
- **Shared module system:** Common functionality hosted centrally and imported remotely.
- **Backup and restore:** Built-in backup system for safe experimentation.
- **Health monitoring:** Comprehensive health checks across all repositories.

## Troubleshooting

- **Permission denied:**
  - Make sure scripts are executable: `chmod +x setup.sh dev.sh`

---

## Using the GitHub CLI (`gh`) Effectively

The GitHub CLI (`gh`) is a powerful tool for automating and streamlining your workflow. Here are some advanced and recommended usages for this project:

### Authentication & Setup

- Authenticate once: `gh auth login`
- Check your status: `gh auth status`

### Issues

- List issues: `gh issue list`
- View an issue: `gh issue view <number>`
- Create an issue: `gh issue create --title "Title" --body "Description" --label enhancement`
- Edit/label/assign: `gh issue edit <number> --add-label documentation --add-assignee <user>`
- Close with comment: `gh issue close <number> --comment "Fixed in PR #XX"`

### Pull Requests

- List PRs: `gh pr list`
- View PR: `gh pr view <number> --web`
- Create PR: `gh pr create --base develop --head feature/issue-XX-description --title "Title" --body "Details"`
- Add reviewer/assignee: `gh pr edit <number> --add-reviewer <user> --add-assignee <user>`
- Approve/review: `gh pr review <number> --approve --body "LGTM"`
- Merge (squash & delete): `gh pr merge <number> --squash --delete-branch`

### Branch Protection (Admin)

- Protect main: `gh api --method PUT repos/<owner>/<repo>/branches/main/protection --input protection.json`
- Unprotect (solo dev): set `required_pull_request_reviews` to `null` as shown above.

### Automation & Scripting

- Combine with bash for automation:
  ```bash
  for i in {1..5}; do gh issue close $i --comment "Batch closed"; done
  ```
- Use in CI/CD scripts for releases, tagging, or status checks.

### Tips

- Use `gh` with `jq` for JSON output and scripting.
- Use `gh` to manage releases, gists, and more: see `gh help`.
- All actions are logged in GitHub for traceability.

---

_For more CLI usage examples, see the [GitHub CLI docs](https://cli.github.com/manual/)._

## Code Quality & Formatting

### Linting and Formatting

- **Lint all code**: `npm run lint`
- **Fix linting issues**: `npm run lint:fix`
- **Format all code**: `npm run format`
- **Check formatting**: `npm run format:check`

The project uses ESLint for JavaScript linting and Prettier for consistent code formatting. Both tools are configured to work on root files and all subprojects in the `sites/` directory.

### Pre-commit Hooks

Install git hooks to automatically check code before commits:

```bash
./install-hooks.sh
```

This ensures all committed code passes linting and formatting checks, preventing style-related issues from entering the repository.

### CI Integration

The GitHub Actions workflow automatically:

- Runs ESLint on all JavaScript files
- Checks code formatting with Prettier
- Validates shell scripts with ShellCheck

All checks must pass before merging pull requests.

### Configuration Files

- **ESLint**: `eslint.config.js` (modern flat config format)
- **Prettier**: `.prettierrc` (JSON configuration)

Both configurations follow the project's KISS principle with sensible defaults that work across all subprojects.

## Scripts

### Development Scripts

- `npm run dev`: Starts all development servers using `./dev.sh`.
- `npm run build`: (Placeholder) Use site-specific build scripts or Vite as needed.
- `npm run clean`: Removes `sites/` and `node_modules/` for a fresh start.

### Code Quality Scripts

- `npm run lint`: Lints all JavaScript files in root and sites directories.
- `npm run lint:fix`: Automatically fixes linting issues where possible.
- `npm run format`: Formats all code files using Prettier.
- `npm run format:check`: Checks if all files are properly formatted.

### Multi-Repository Management Scripts

- `./mr.sh <command>`: Enhanced multi-repository management tool
- `./update-branches.sh`: Ensure all repositories use 'main' branch
- `./setup.sh`: Initial environment setup and repository cloning
- `./status.sh`: Legacy status check for development servers

> This project follows KISS and minimal dependencies. Only essential scripts, Vite, and `gh-pages` for deployment are included. For advanced builds, use site-specific configs.

## Enhanced Multi-Repository Management

### Daily Workflow Commands

The `./mr.sh` script provides powerful multi-repository management:

```bash
# Quick status check
./mr.sh status           # Shows changes, branches, and sync status

# Sync all repositories
./mr.sh sync            # Pulls latest + shows status

# Development workflow
./mr.sh pull            # Pull latest from all repos
./mr.sh push            # Push changes to all repos
./mr.sh deploy          # Deploy all sites

# Commit across repositories
./mr.sh commit "feat: update documentation"

# Branch management
./mr.sh branch          # Show current branches
./mr.sh checkout main   # Switch all repos to main branch
./mr.sh create-branch feature/new-feature

# Maintenance and utilities
./mr.sh health          # Comprehensive health check
./mr.sh backup          # Create backup before major changes
./mr.sh clean           # Reset all repos to clean state
```

### Advanced Operations

```bash
# Run custom commands across all repositories
./mr.sh foreach "npm install"
./mr.sh foreach "git log --oneline -5"
./mr.sh foreach "npm run build"

# Target specific repositories
./mr.sh status --site cv
./mr.sh pull --site navbar --site mdsite
./mr.sh deploy --site cv --dry-run

# Safety features
./mr.sh backup          # Create timestamped backup
./mr.sh restore         # Restore from backup
./mr.sh health          # Check repository health
```

### Branch Management

All repositories in the daza.ar ecosystem use 'main' as the default branch:

```bash
# Check current branch configuration (dry run)
./update-branches.sh --dry-run

# Apply branch updates to all repositories
./update-branches.sh
```

The script automatically:

- Renames 'master' to 'main' in repositories that need it
- Updates default branch settings on GitHub
- Updates GitHub Pages source branch if needed
- Provides detailed status reporting

## Deployment Architecture

### GitHub Pages Multi-Repo Strategy

Each site is deployed to its own GitHub repository with GitHub Pages enabled:

```
juanmanueldaza/cv         → https://cv.daza.ar
juanmanueldaza/onepager   → https://onepager.daza.ar
juanmanueldaza/start      → https://start.daza.ar
juanmanueldaza/navbar     → https://navbar.daza.ar
juanmanueldaza/mdsite     → https://mdsite.daza.ar
juanmanueldaza/data       → https://data.daza.ar
juanmanueldaza/wallpapers → https://wallpapers.daza.ar
```

### Custom Domain Setup

DNS configuration routes each subdomain to its respective GitHub Pages deployment:

- CNAME records point subdomains to `<username>.github.io`
- Each repository has a custom domain configured in Pages settings
- SSL certificates are automatically provided by GitHub Pages

### Shared Module Dependencies

Sites share functionality through ES module imports from production URLs:

```javascript
// Remote module imports used in production and development
import { fetchAndRenderMarkdown } from 'https://mdsite.daza.ar/mdsite.js';
import { DownloadPdfUtil } from 'https://navbar.daza.ar/utils/downloadPdf.js';
```

This architecture provides:

- **Independent deployment** - Update one site without affecting others
- **Shared functionality** - Common code hosted centrally and imported remotely
- **Version consistency** - All sites use the same version of shared modules
- **Development parity** - Local development uses same remote dependencies as production
- **Modern branching** - All repositories use 'main' as the default branch

## Automated Workflow (workflow.sh)

This project provides an automated workflow script (`workflow.sh`) that uses the GitHub CLI (`gh`) for all repository, PR, and issue management tasks. Only Vite is used as an npm dependency.

### Usage

```bash
./workflow.sh <issue_number> <commit_message> <pr_title> <pr_body>
```

- Detects the default branch (develop or main) using `gh`.
- Creates a feature branch, commits only if there are changes, and pushes to origin.
- Uses `gh` to create and merge PRs, and close issues.
- Exits gracefully if there are no changes to commit.

### Principles

- **KISS**: Simple, robust, and minimal logic.
- **Minimal dependencies**: Only Vite as an npm dependency; all repo management via GitHub CLI.
- **gh-first**: Prefer `gh` for all automation; use git only for local diff/staging.

For detailed deployment information, including DNS configuration, GitHub Actions workflows, and troubleshooting, see [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md).

---

## Branch Workflow (Contributing)

All contributors must follow the documented branch workflow for new features and improvements. This ensures code quality, reduces merge conflicts, and aligns with KISS, SOLID, and CLEAN principles.

- See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full workflow, including:
  - Branch naming conventions
  - Issue-driven development
  - Commit and PR guidelines
  - Review and merge process

Always use the [feature_improvement.md](.github/ISSUE_TEMPLATE/feature_improvement.md) template for new work and reference issues in branches, commits, and PRs.

**Author**: Juan Manuel Daza  
**Website**: [daza.ar](https://daza.ar)
