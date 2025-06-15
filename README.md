# daza.ar Environment Setup

A simple setup script to bootstrap the development environment for daza.ar projects by creating a structured workspace and cloning all necessary repositories.

## Overview

This setup script automatically creates a `sites` directory and clones all the required repositories for the daza.ar ecosystem, providing a consistent development environment setup.

## Prerequisites

Before running the setup script, ensure you have the following installed:

- **GitHub CLI (`gh`)** - [Installation guide](https://cli.github.com/)
- **Git** - [Installation guide](https://git-scm.com/downloads)
- **Bash shell** (available on Linux, macOS, and Windows with WSL)

### Authentication

Make sure you're authenticated with GitHub CLI:

```bash
gh auth login
```

## Quick Start

1. Clone this repository:
   ```bash
   git clone <this-repository-url>
   cd daza.ar-env
   ```

2. Run the setup script:
   ```bash
   ./setup.sh
   ```

3. Navigate to the sites directory:
   ```bash
   cd sites
   ```

## What Gets Cloned

The setup script clones the following repositories into the `sites` directory:

| Repository | Description |
|------------|-------------|
| `juanmanueldaza/cv` | Personal CV/Resume website |
| `juanmanueldaza/onepager` | One-page portfolio site |
| `juanmanueldaza/data` | Data and content management |
| `juanmanueldaza/wallpapers` | Wallpaper collection |
| `juanmanueldaza/start` | Start page/dashboard |

## Directory Structure

After running the setup script, your directory structure will look like this:

```
daza.ar-env/
├── README.md
├── setup.sh
└── sites/
    ├── cv/
    ├── onepager/
    ├── data/
    ├── wallpapers/
    └── start/
```

## Features

- **Idempotent**: Safe to run multiple times - skips existing repositories
- **Error handling**: Stops on errors and provides clear feedback
- **Progress indicators**: Shows what's happening during setup
- **Validation**: Checks for existing directories before cloning

## Troubleshooting

### Common Issues

**Error: `gh: command not found`**
- Install GitHub CLI: https://cli.github.com/

**Error: `gh auth login required`**
- Run `gh auth login` and follow the prompts

**Permission denied errors**
- Make sure the script is executable: `chmod +x setup.sh`

**Repository already exists**
- This is normal behavior - the script will skip existing repositories

### Manual Setup

If you prefer to set up manually:

```bash
mkdir sites
cd sites
gh repo clone juanmanueldaza/cv
gh repo clone juanmanueldaza/onepager
gh repo clone juanmanueldaza/data
gh repo clone juanmanueldaza/wallpapers
gh repo clone juanmanueldaza/start
```

## Development Workflow

After setup, you can:

1. Navigate to any project: `cd sites/<project-name>`
2. Follow individual repository setup instructions
3. Start developing!

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the [MIT License](LICENSE).

---

**Author**: Juan Manuel Daza  
**Website**: [daza.ar](https://daza.ar)