# MDSG Setup Guide

Complete setup guide for creating and managing the MDSG (Markdown Site Generator) project on GitHub.

## Prerequisites

Before you begin, ensure you have:

1. **GitHub CLI installed and authenticated**
   ```bash
   # Install GitHub CLI
   # macOS: brew install gh
   # Windows: winget install --id GitHub.cli
   # Linux: See https://github.com/cli/cli/blob/trunk/docs/install_linux.md
   
   # Authenticate with GitHub
   gh auth login
   ```

2. **Git configured**
   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```

3. **Node.js (v16 or later)**
   ```bash
   node --version  # Should be v16+
   npm --version
   ```

## Quick Start (Automated Setup)

### Step 1: Create Repository and Issues

```bash
# Make the setup script executable
chmod +x setup-repository.sh

# Run the setup script
./setup-repository.sh
```

This script will:
- ✅ Create GitHub repository named `mdsg`
- ✅ Setup 10 issue labels for organization
- ✅ Create 4 project milestones (2-week sprints)
- ✅ Generate 15 detailed issues covering all development tasks
- ✅ Clone repository locally

### Step 2: Setup Project Board (Optional)

```bash
# Navigate to the cloned repository
cd mdsg

# Setup project board
chmod +x setup-project-board.sh
./setup-project-board.sh
```

This script will:
- ✅ Create GitHub project board "MDSG Development"
- ✅ Add all issues to the project board
- ✅ Setup recommended project views
- ✅ Configure automation suggestions

### Step 3: Start Development

```bash
# Install dependencies
npm install

# Start development servers
npm run dev        # Frontend (Terminal 1)
npm run server     # Backend (Terminal 2)
```

## Manual Setup (Alternative)

If you prefer to set things up manually:

### 1. Create Repository

```bash
gh repo create mdsg \
  --description "Simple markdown site generator for GitHub Pages" \
  --public \
  --clone

cd mdsg
```

### 2. Create Labels

```bash
gh label create "mvp" --description "Priority MVP features" --color "b60205"
gh label create "enhancement" --description "Feature enhancements" --color "a2eeef"
gh label create "frontend" --description "Frontend/UI work" --color "7057ff"
gh label create "backend" --description "Backend/API work" --color "008672"
gh label create "documentation" --description "Documentation updates" --color "0075ca"
gh label create "oauth" --description "GitHub OAuth integration" --color "f9d0c4"
# ... (see setup-repository.sh for complete list)
```

### 3. Create Milestones

```bash
# Calculate dates and create milestones
gh api repos/:owner/:repo/milestones \
  --method POST \
  --field title="MVP Core" \
  --field description="Basic working application"
# ... (repeat for other milestones)
```

### 4. Create Issues

Use the GitHub web interface or `gh issue create` commands as shown in the setup script.

## Understanding the Project Structure

### Milestones (Development Phases)

1. **MVP Core** (2 weeks)
   - Basic authentication
   - Markdown editor
   - GitHub deployment
   - Core functionality

2. **Enhanced UX** (2 weeks)
   - Error handling
   - Responsive design
   - Content management
   - User experience improvements

3. **Polish & Features** (2 weeks)
   - Advanced markdown support
   - Code quality improvements
   - Performance optimization
   - Additional features

4. **Production Ready** (2 weeks)
   - Documentation
   - Testing
   - Production deployment
   - Security review

### Issue Labels

- **mvp**: Critical features for minimum viable product
- **enhancement**: Nice-to-have improvements
- **frontend**: UI/UX and client-side work
- **backend**: Server-side and API work
- **oauth**: GitHub authentication features
- **documentation**: User and developer docs
- **testing**: Test coverage and quality assurance
- **deployment**: Setup and hosting
- **ui/ux**: User interface and experience
- **bug**: Bug fixes and corrections

### Key Issues to Start With

1. **#1**: Setup development environment
2. **#2**: Implement GitHub OAuth backend
3. **#3**: Frontend authentication flow
4. **#4**: Markdown editor with preview
5. **#5**: GitHub repository operations
6. **#6**: GitHub Pages integration

## Development Workflow

### Working with Issues

```bash
# View issues by milestone
gh issue list --milestone "MVP Core"

# View issues by label
gh issue list --label mvp

# Assign issue to yourself
gh issue edit 1 --add-assignee @me

# Create branch for issue
git checkout -b feature/issue-1-setup

# Close issue when done
gh issue close 1 --comment "Completed setup"
```

### Using the Project Board

1. Visit your project board: `https://github.com/users/YOUR_USERNAME/projects/PROJECT_ID`
2. Drag issues between columns: Backlog → In Progress → Done
3. Create custom views for better organization
4. Set up automation rules for automatic card movement

## GitHub OAuth Configuration

For the application to work, you'll need to setup GitHub OAuth:

1. Go to [GitHub Developer Settings](https://github.com/settings/applications/new)
2. Create new OAuth App:
   - **Application name**: `MDSG Local Dev`
   - **Homepage URL**: `http://localhost:3001`
   - **Authorization callback URL**: `http://localhost:3001`
3. Copy Client ID and Client Secret
4. Create `.env` file:
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

## Project Goals and Architecture

### KISS Principles Applied

This project follows Keep It Simple, Stupid (KISS) principles:

- **Single JavaScript class** handling core functionality
- **Minimal dependencies** (Express, Vite, CORS only)
- **Simple architecture** without over-engineering
- **Clear, readable code** without unnecessary abstractions
- **Focus on core value** (login → edit → deploy)

### Core Features

1. **GitHub OAuth Login** - Secure authentication
2. **Markdown Editor** - Live preview editing
3. **One-Click Deployment** - Creates GitHub Pages site
4. **Repository Management** - Handles GitHub API operations
5. **Error Handling** - User-friendly error messages
6. **Responsive Design** - Works on all devices

## Troubleshooting

### Common Setup Issues

**"gh: command not found"**
- Install GitHub CLI from https://cli.github.com/

**"authentication required"**
- Run `gh auth login` and follow prompts

**"repository already exists"**
- Delete existing repository or choose different name
- Or continue with existing repository when prompted

**Permission denied on scripts**
- Run `chmod +x setup-repository.sh setup-project-board.sh`

### Development Issues

**OAuth not working**
- Check GitHub app configuration
- Verify .env file has correct credentials
- Ensure both frontend and backend servers are running

**Build failures**
- Run `npm install` to ensure dependencies are installed
- Check Node.js version (requires v16+)
- Clear node_modules and reinstall if needed

## Next Steps

After setup completion:

1. **Review Created Issues**: Understand the development roadmap
2. **Start with MVP**: Begin with "MVP Core" milestone
3. **Setup OAuth**: Configure GitHub OAuth for authentication
4. **Begin Development**: Start with issue #1 (project setup)
5. **Use Project Board**: Track progress and organize work

## Success Metrics

Setup is successful when:

- ✅ Repository created on GitHub
- ✅ 15 issues created with proper labels and milestones
- ✅ Project board setup and populated
- ✅ Local development environment ready
- ✅ GitHub OAuth app configured
- ✅ npm scripts working (`dev`, `build`, `server`)

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review issue descriptions for detailed requirements
3. Visit [GitHub CLI documentation](https://cli.github.com/manual/)
4. Open a discussion in the repository
5. Check existing issues for similar problems

## Project Timeline

**Total Duration**: ~8 weeks
**Sprint Length**: 2 weeks each
**Issues per Sprint**: 3-5 issues
**Expected Effort**: 10-15 hours per week

This timeline assumes part-time development. Adjust based on your availability and experience level.

---

Happy coding! 🚀

The MDSG project is designed to be a learning experience that demonstrates modern web development practices while maintaining simplicity and focusing on core value delivery.