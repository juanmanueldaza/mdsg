# 🐞 MDSG Troubleshooting Guide

> Solutions for common issues and problems when using MDSG

## 🚨 Quick Fixes

### Site Not Loading

**Problem**: MDSG website won't load or shows blank page

**Solutions**:

1. **Check internet connection** - MDSG requires internet access
2. **Try a different browser** - Chrome, Firefox, Safari, or Edge
3. **Clear browser cache**:
   - Chrome: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Firefox: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
4. **Disable browser extensions** - Ad blockers may interfere
5. **Check GitHub status** - Visit
   [status.github.com](https://status.github.com)

### Authentication Issues

#### Token Not Working

**Problem**: "Invalid token" or authentication fails

**Solutions**:

1. **Check token format**:
   - Classic tokens: `ghp_` followed by 36 characters
   - Fine-grained tokens: `github_pat_` followed by long string
   - OAuth tokens: `gho_` followed by 36 characters

2. **Verify token scopes**:
   - ✅ `repo` - Required for creating repositories
   - ✅ `user` - Required for user information

3. **Check token expiration**:
   - Go to [GitHub token settings](https://github.com/settings/tokens)
   - Check if token is still active
   - Regenerate if expired

4. **Test token manually**:
   ```bash
   curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user
   ```

#### Can't Create Token

**Problem**: GitHub token creation page doesn't work

**Solutions**:

1. **Direct link**:
   [Create new token](https://github.com/settings/tokens/new?scopes=repo,user&description=MDSG%20-%20Markdown%20Site%20Generator)
2. **Manual navigation**:
   - Go to GitHub.com → Settings → Developer settings → Personal access tokens →
     Generate new token
3. **Required settings**:
   - Description: "MDSG - Markdown Site Generator"
   - Expiration: 90 days (recommended)
   - Scopes: `repo` and `user`

### Content Issues

#### Markdown Not Rendering

**Problem**: Markdown shows as plain text instead of formatted HTML

**Solutions**:

1. **Check markdown syntax**:

   ```markdown
   # Header (needs space after #)

   **Bold text** (needs double asterisks) [Link](url) (needs proper brackets)
   ```

2. **Common fixes**:
   - Add spaces after `#` for headers
   - Use blank lines between paragraphs
   - Check for unmatched brackets or parentheses

3. **Test with simple content**:

   ```markdown
   # Test Header

   This is a **bold** word and this is _italic_.

   - List item 1
   - List item 2
   ```

#### Images Not Displaying

**Problem**: Images show as broken links

**Solutions**:

1. **Use valid image URLs**:
   - `https://` protocol required
   - Direct links to image files (.jpg, .png, .gif, .svg)
   - Test URL in browser first

2. **Supported formats**:

   ```markdown
   ![Alt text](https://example.com/image.jpg)
   ![Alt text](https://example.com/image.png 'Optional title')
   ```

3. **Image hosting options**:
   - GitHub repository (upload to repo, use raw URL)
   - Imgur, Cloudinary, or other image hosts
   - Avoid Google Drive, Dropbox share links

### Deployment Problems

#### Site Not Deploying

**Problem**: "Deploy" button doesn't work or fails

**Solutions**:

1. **Check content length**:
   - Must have some content (not empty)
   - Try with simple test content first

2. **Verify authentication**:
   - Make sure you're signed in
   - Token must have `repo` scope

3. **Check GitHub API status**:
   - Visit [GitHub status page](https://status.github.com)
   - Wait if GitHub is experiencing issues

4. **Try manual deployment**:
   - Create repository manually on GitHub
   - Upload content through GitHub interface
   - Enable GitHub Pages in repository settings

#### Site Shows 404 Error

**Problem**: Deployed site shows "404 - Page not found"

**Solutions**:

1. **Wait for deployment**:
   - GitHub Pages can take 5-10 minutes to deploy
   - Check back in a few minutes

2. **Verify GitHub Pages settings**:
   - Go to repository → Settings → Pages
   - Source should be "Deploy from a branch"
   - Branch should be `main` or `master`
   - Folder should be `/ (root)`

3. **Check repository visibility**:
   - Repository must be public for free GitHub Pages
   - Or have GitHub Pro for private repository Pages

4. **Verify content exists**:
   - Check that `index.html` exists in repository
   - File should contain your converted markdown

#### Wrong Site URL

**Problem**: Site URL doesn't match expectations

**Solutions**:

1. **Standard URL format**:

   ```
   https://yourusername.github.io/repository-name/
   ```

2. **Check repository name**:
   - Repository names are auto-generated
   - Format: `mdsg-site-` followed by content hash
   - You can rename repository in GitHub settings

3. **Custom domain setup** (advanced):
   - Repository Settings → Pages → Custom domain
   - Add CNAME file with your domain
   - Configure DNS with your provider

### Performance Issues

#### Slow Loading

**Problem**: MDSG or sites load slowly

**Solutions**:

1. **Check internet speed**:
   - MDSG requires stable internet connection
   - Test with [speedtest.net](https://speedtest.net)

2. **Optimize content**:
   - Large images slow down sites
   - Compress images before using
   - Keep content focused and concise

3. **Browser optimization**:
   - Close unused tabs
   - Restart browser
   - Clear browser cache

#### Editor Lag

**Problem**: Typing in editor is slow or delayed

**Solutions**:

1. **Reduce content size**:
   - Very large documents (>50KB) may cause lag
   - Split into multiple smaller sites

2. **Browser performance**:
   - Close other applications
   - Use latest browser version
   - Try incognito/private mode

### Browser Compatibility

#### Feature Not Working

**Problem**: Specific features don't work in your browser

**Solutions**:

1. **Supported browsers**:
   - ✅ Chrome 90+
   - ✅ Firefox 88+
   - ✅ Safari 14+
   - ✅ Edge 90+

2. **Update browser**:
   - Use latest stable version
   - Enable JavaScript
   - Allow local storage

3. **Alternative browsers**:
   - Try Chrome or Firefox if using older browser
   - Mobile browsers: Chrome Mobile, Safari Mobile

### Mobile Issues

#### Touch Problems

**Problem**: Touch interface doesn't work properly

**Solutions**:

1. **Use mobile browser**:
   - Chrome Mobile or Safari Mobile recommended
   - Avoid in-app browsers (Facebook, Instagram, etc.)

2. **Viewport issues**:
   - Try landscape orientation
   - Zoom out if interface seems cut off

3. **Keyboard problems**:
   - Use device keyboard, not third-party keyboards
   - Turn off autocorrect for markdown editing

## 🔧 Advanced Troubleshooting

### Browser Console Errors

If you're comfortable with browser developer tools:

1. **Open developer tools**:
   - Chrome: `F12` or `Ctrl+Shift+I`
   - Firefox: `F12` or `Ctrl+Shift+I`
   - Safari: `Cmd+Option+I` (enable Developer menu first)

2. **Check Console tab**:
   - Look for red error messages
   - Note any network failures
   - Screenshot errors for support

3. **Common error patterns**:
   - `401 Unauthorized` → Token issues
   - `403 Forbidden` → Permission issues
   - `404 Not Found` → Repository/API issues
   - `500 Server Error` → GitHub API issues

### Network Issues

1. **Check requests**:
   - Network tab in developer tools
   - Look for failed requests to `api.github.com`
   - Check response codes and timing

2. **Firewall/proxy**:
   - Corporate networks may block GitHub API
   - Try from personal device/network
   - Contact IT if corporate firewall issue

### Data Recovery

1. **Lost content**:
   - Check browser's local storage
   - Look in GitHub repository if deployment started
   - Use browser's back button to recover text

2. **Export content**:
   - Copy text from editor before major changes
   - Download from GitHub repository
   - Keep local backups of important content

## 📞 Getting Help

### Self-Service Options

1. **Documentation**:
   - [Getting Started Guide](getting-started.md)
   - [Markdown Guide](markdown-guide.md)
   - [Site Management](site-management.md)

2. **GitHub Repository**:
   - [Search existing issues](https://github.com/juanmanueldaza/mdsg/issues)
   - [Check discussions](https://github.com/juanmanueldaza/mdsg/discussions)

### Community Support

1. **GitHub Discussions**:
   - [Ask questions](https://github.com/juanmanueldaza/mdsg/discussions/new)
   - Share tips and tricks
   - Help other users

2. **Bug Reports**:
   - [Report bugs](https://github.com/juanmanueldaza/mdsg/issues/new)
   - Include browser, OS, and steps to reproduce
   - Attach screenshots if helpful

### Information to Include

When asking for help, please provide:

- **Browser**: Chrome 90, Firefox 88, etc.
- **Operating System**: Windows 10, macOS 12, etc.
- **Error messages**: Copy exact text
- **Steps to reproduce**: What were you trying to do?
- **Screenshots**: If applicable
- **Network**: Home, corporate, mobile, etc.

## 🚀 Prevention Tips

### Avoid Common Issues

1. **Regular token renewal**:
   - Set calendar reminder before token expires
   - Keep backup tokens for important projects

2. **Content backup**:
   - Save important content locally
   - Use GitHub repository as backup
   - Export content before major edits

3. **Browser maintenance**:
   - Keep browser updated
   - Clear cache monthly
   - Disable problematic extensions

4. **Network stability**:
   - Use stable internet connection for deployments
   - Avoid mobile data for large content
   - Save work frequently

**Most issues are quick fixes!** 🛠️
