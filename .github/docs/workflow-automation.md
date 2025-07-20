# 🧪 MDSG Workflow Automation

## 🎯 **Automated CI/CD Monitoring**

MDSG now includes **automatic workflow checking** after every git push, ensuring you always know the health of your CI/CD pipeline.

### 🛠️ **Available Tools**

#### 1. **Workflow Checker Script**
```bash
./.github/scripts/check-workflows.sh
```
- 📋 Lists recent workflow runs with status
- ❌ Identifies failing workflows  
- ⏳ Shows in-progress workflows
- 💡 Provides helpful next steps

#### 2. **Smart Push Script** 
```bash
./.github/scripts/smart-push.sh [optional-commit-message]
```
- 🚀 Commits and pushes changes
- 🔍 Automatically monitors workflows afterward
- ⚡ One-command deployment with CI feedback

#### 3. **Automatic Post-Push Monitoring**
- 🪝 Git hook automatically runs after every `git push`
- 📊 Instant workflow status feedback
- 🎯 Zero-configuration monitoring

### ⚡ **Quick Usage**

**Check workflows manually:**
```bash
./.github/scripts/check-workflows.sh
```

**Smart push with auto-monitoring:**
```bash
./.github/scripts/smart-push.sh "feat: new feature"
```

**Regular git push (auto-monitors):**
```bash
git push origin main
# Automatically shows workflow status
```

### 🔧 **Setup Requirements**

1. **GitHub CLI** - Install if not present:
   ```bash
   # Ubuntu/Debian
   curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
   echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
   sudo apt update && sudo apt install gh
   
   # macOS
   brew install gh
   ```

2. **Authentication** - Login once:
   ```bash
   gh auth login
   ```

### 🎯 **Workflow Status Indicators**

- ✅ **Success** - All workflows passing
- ❌ **Failure** - One or more workflows failed  
- ⏳ **In Progress** - Workflows currently running
- 📋 **Complete** - All recent workflows finished

### 🧪 **MDSG Code Alchemy Integration**

This automation system follows MDSG's **Clean Code** principles:

- **Single Responsibility** - Each script has one focused purpose
- **Error Handling** - Graceful degradation if tools unavailable  
- **User Experience** - Clear, actionable feedback
- **Bundle Conscious** - Minimal overhead, maximum value

The system ensures **continuous quality** by making workflow monitoring frictionless and automatic, supporting MDSG's commitment to excellence.
