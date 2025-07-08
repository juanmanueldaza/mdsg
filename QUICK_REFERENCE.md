# Quick Reference: Multi-Repository Management

This is your go-to reference for managing the daza.ar ecosystem efficiently.

## 🚀 Essential Commands

### Daily Workflow
```bash
./mr.sh sync              # Pull all repos + show status
./mr.sh status            # Quick status of all repositories
./mr.sh health            # Comprehensive health check
```

### Development
```bash
./mr.sh pull              # Pull latest from all repos
./mr.sh push              # Push changes to all repos
./mr.sh deploy            # Deploy all sites to GitHub Pages
./mr.sh commit "message"  # Commit to all repos with same message
```

### Branch Management
```bash
./mr.sh branch                    # Show current branches
./mr.sh checkout main             # Switch all repos to main
./mr.sh create-branch "feature"   # Create branch in all repos
./mr.sh delete-branch "feature"   # Delete branch from all repos
```

## 🎯 Site-Specific Commands

Target individual sites with `--site <name>`:

```bash
./mr.sh status --site cv         # Check only CV repository
./mr.sh pull --site navbar       # Pull only navbar repo
./mr.sh deploy --site data       # Deploy only data site
./mr.sh commit "fix" --site cv   # Commit only to CV
```

Available sites: `cv`, `onepager`, `start`, `navbar`, `mdsite`, `data`, `wallpapers`

## 🔧 Advanced Operations

### Run Custom Commands
```bash
./mr.sh foreach "npm install"    # Install deps in all repos
./mr.sh foreach "git log -5"     # Show recent commits
./mr.sh foreach "npm run build"  # Build all sites
```

### Safety & Maintenance
```bash
./mr.sh backup           # Create timestamped backup
./mr.sh restore          # Restore from last backup
./mr.sh clean            # Reset all repos (⚠️ destructive)
./mr.sh info             # Detailed repo information
```

## 🛡️ Safety Features

### Before Major Changes
```bash
./mr.sh backup           # Always backup first
./mr.sh health           # Check everything is healthy
```

### Testing Changes
```bash
./mr.sh deploy --dry-run # Test deployment without executing
./mr.sh status           # Check what would be affected
```

### Recovery
```bash
./mr.sh restore          # Restore from backup
./mr.sh clean            # Nuclear option: reset everything
```

## 📋 Common Workflows

### Starting Your Day
```bash
./mr.sh sync             # Get latest changes + status overview
./dev.sh                 # Start development servers
```

### Before Committing
```bash
./mr.sh status           # Check what's changed
./mr.sh health           # Ensure everything is healthy
./mr.sh backup           # Safety first
```

### Cross-Site Updates
```bash
./mr.sh commit "feat: update shared component"
./mr.sh push             # Push all changes
./mr.sh deploy           # Deploy all sites
```

### Feature Development
```bash
./mr.sh create-branch "feature/new-navbar"
# ... make changes ...
./mr.sh commit "feat: implement new navbar"
./mr.sh push
./mr.sh checkout main    # Switch back to main
./mr.sh delete-branch "feature/new-navbar"
```

## 🔍 Quick Diagnostics

### Check Everything
```bash
./mr.sh health           # Comprehensive health check
./mr.sh status           # Quick status overview
./mr.sh info             # Detailed repository information
```

### Branch Status
```bash
./mr.sh branch           # Current branches in all repos
```

### Recent Activity
```bash
./mr.sh foreach "git log --oneline -3"  # Last 3 commits per repo
```

## ⚡ Pro Tips

1. **Always backup before major operations**:
   ```bash
   ./mr.sh backup && ./mr.sh clean
   ```

2. **Use `--dry-run` for testing**:
   ```bash
   ./mr.sh deploy --dry-run
   ```

3. **Target specific sites for focused work**:
   ```bash
   ./mr.sh status --site cv --site navbar
   ```

4. **Chain commands for common workflows**:
   ```bash
   ./mr.sh sync && ./mr.sh health
   ```

5. **Use `foreach` for custom operations**:
   ```bash
   ./mr.sh foreach "npm audit fix"
   ```

## 🆘 Emergency Commands

### Something's Broken
```bash
./mr.sh health           # Diagnose issues
./mr.sh restore          # Restore from backup
```

### Clean Slate
```bash
./mr.sh clean            # Reset all repos (⚠️ loses changes)
./setup.sh               # Re-clone everything
```

### Repository Out of Sync
```bash
./mr.sh pull --site <name>  # Pull specific repo
./mr.sh sync                # Sync everything
```

---

**💡 Remember**: The `mr.sh` tool respects your current setup while making multi-repo management effortless. Use `./mr.sh --help` for complete options.