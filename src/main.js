// MDSG - Markdown Site Generator
// Simple entry point

class MDSG {
  constructor() {
    this.authenticated = false;
    this.user = null;
    this.content = '';
    this.init();
  }

  init() {
    this.setupUI();
    this.checkAuth();
  }

  setupUI() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="container">
        <header>
          <h1>📝 MDSG</h1>
          <p>Create GitHub Pages sites from markdown</p>
        </header>
        <main id="main-content">
          ${this.getLoginUI()}
        </main>
      </div>
    `;
  }

  getLoginUI() {
    return `
      <div class="login-section">
        <div class="login-header">
          <h2>🚀 Welcome to MDSG</h2>
          <p>Create beautiful GitHub Pages sites from markdown</p>
        </div>

        <div class="login-content">
          <div class="features-list">
            <div class="feature-item">
              <span class="feature-icon">✨</span>
              <span>Live markdown preview</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">🔧</span>
              <span>One-click deployment</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">🌐</span>
              <span>Your own GitHub Pages site</span>
            </div>
          </div>

          <button id="login-btn" class="primary-btn login-button">
            <span class="github-icon">📱</span>
            Continue with GitHub
          </button>

          <p class="login-description">
            Sign in to create your markdown site in minutes
          </p>

          <div class="security-note">
            <small>🔒 Secure OAuth authentication • No passwords stored</small>
          </div>
        </div>
      </div>
    `;
  }

  getEditorUI() {
    return `
      <div class="editor-section">
        <div class="user-info">
          <div class="user-profile">
            <img src="${this.user.avatar_url}" alt="${this.user.login}" class="user-avatar">
            <div class="user-details">
              <span class="user-greeting">👋 Hello, <strong>${this.user.name || this.user.login}</strong></span>
              <span class="user-login">@${this.user.login}</span>
            </div>
          </div>
          <div class="header-actions">
            <button id="logout-btn" class="secondary-btn logout-button">
              <span>🚪</span> Logout
            </button>
          </div>
        </div>

        <div class="editor-container">
          <div class="editor-pane">
            <div class="editor-header">
              <h3>📝 Write your markdown</h3>
              <div class="editor-tools">
                <button id="clear-btn" class="tool-btn" title="Clear content">🗑️</button>
                <button id="sample-btn" class="tool-btn" title="Load sample content">📄</button>
                <span class="word-count" id="word-count">0 words</span>
              </div>
            </div>
            <textarea id="markdown-editor"
              placeholder="# My Awesome Site

Welcome to my site! This is where you can write your content in markdown.

## Features
- **Easy editing** with live preview
- *Markdown* support for formatting
- \`Code snippets\` and links
- Lists and much more!

## About Me
Write something interesting about yourself here...

## Contact
- Email: your.email@example.com
- GitHub: [yourusername](https://github.com/yourusername)
- Website: https://yoursite.com

> Start typing to see the live preview! ✨"
              spellcheck="true"
              autocomplete="off"
              rows="20">${this.content}</textarea>
            <div class="editor-status">
              <span class="char-count" id="char-count">0 characters</span>
              <span class="auto-save-status" id="auto-save-status">Auto-save: Ready</span>
            </div>
          </div>

          <div class="preview-pane">
            <div class="preview-header">
              <h3>👁️ Live Preview</h3>
              <div class="preview-tools">
                <button id="preview-mode" class="tool-btn active" title="Toggle preview mode">📱</button>
                <button id="fullscreen-preview" class="tool-btn" title="Fullscreen preview">🔍</button>
              </div>
            </div>
            <div id="preview" class="preview-content"></div>
          </div>
        </div>

        <div class="actions">
          <button id="deploy-btn" class="primary-btn">
            🚀 Deploy to GitHub Pages
          </button>
        </div>
      </div>
    `;
  }

  checkAuth() {
    // Enhanced authentication check
    const token = localStorage.getItem('github_token');
    const tokenType = localStorage.getItem('github_token_type');
    const tokenScope = localStorage.getItem('github_token_scope');

    if (token && this.isValidToken(token)) {
      console.log('Valid authentication token found');
      this.fetchUser(token);
    } else {
      console.log('No valid authentication found');
      this.clearAuthenticationState();
      this.setupLoginHandler();
    }
  }

  isValidToken(token) {
    // Basic token validation
    if (!token || typeof token !== 'string') {
      return false;
    }

    // Check token format (GitHub tokens are typically 40 characters)
    if (token.length < 20 || token.length > 255) {
      return false;
    }

    // Check for basic token format
    if (!/^[a-zA-Z0-9_]+$/.test(token)) {
      return false;
    }

    return true;
  }

  clearAuthenticationState() {
    // Clear all authentication-related data
    localStorage.removeItem('github_token');
    localStorage.removeItem('github_token_type');
    localStorage.removeItem('github_token_scope');
    localStorage.removeItem('oauth_state');

    // Reset internal state
    this.authenticated = false;
    this.user = null;
  }

  setupLoginHandler() {
    document.getElementById('login-btn')?.addEventListener('click', () => {
      this.loginWithGitHub();
    });
  }

  loginWithGitHub() {
    // Check if we're already in an OAuth flow
    if (this.authenticated) {
      console.log('User already authenticated');
      return;
    }

    // GitHub OAuth configuration
    const clientId = this.getGitHubClientId();
    if (!clientId) {
      this.showError('GitHub OAuth is not configured. Please check the setup.');
      return;
    }

    // Build OAuth URL with proper parameters
    const redirectUri = encodeURIComponent(window.location.origin);
    const scope = 'repo user';
    const state = this.generateOAuthState();

    // Store state for verification
    localStorage.setItem('oauth_state', state);

    const authUrl =
      `https://github.com/login/oauth/authorize?` +
      `client_id=${clientId}&` +
      `redirect_uri=${redirectUri}&` +
      `scope=${scope}&` +
      `state=${state}`;

    console.log('Redirecting to GitHub OAuth...');
    window.location.href = authUrl;
  }

  getGitHubClientId() {
    // Try to get client ID from environment or use default for demo
    // In production, this should come from environment variables
    return 'Ov23liKZ8KgfLQDZFGSR'; // Default demo client ID
  }

  generateOAuthState() {
    // Generate a random state for OAuth security
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  async fetchUser(token) {
    try {
      this.showLoading('Fetching user profile...');

      // Fetch user profile from GitHub API
      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'MDSG-App',
        },
      });

      if (response.ok) {
        const userData = await response.json();

        // Enhance user data with additional information
        this.user = {
          ...userData,
          // Add computed properties for easier access
          displayName: userData.name || userData.login,
          avatarUrl: userData.avatar_url,
          profileUrl: userData.html_url,
          // Token information
          tokenValid: true,
          lastAuthenticated: new Date().toISOString(),
        };

        console.log('User authenticated successfully:', this.user.login);
        this.authenticated = true;
        this.showEditor();
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('GitHub API error:', response.status, errorData);

        if (response.status === 401) {
          this.handleAuthError(
            'Authentication token expired. Please login again.'
          );
        } else if (response.status === 403) {
          this.handleAuthError(
            'GitHub API rate limit exceeded. Please try again later.'
          );
        } else {
          this.handleAuthError('Failed to authenticate with GitHub');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      this.handleAuthError('Network error during authentication');
    }
  }

  showEditor() {
    document.getElementById('main-content').innerHTML = this.getEditorUI();
    this.setupEditorHandlers();
    this.updatePreview();
  }

  setupEditorHandlers() {
    const editor = document.getElementById('markdown-editor');
    const deployBtn = document.getElementById('deploy-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const clearBtn = document.getElementById('clear-btn');
    const sampleBtn = document.getElementById('sample-btn');
    const previewMode = document.getElementById('preview-mode');
    const fullscreenPreview = document.getElementById('fullscreen-preview');

    // Main editor input handler with debouncing
    let inputTimer;
    editor?.addEventListener('input', e => {
      this.content = e.target.value;
      this.updateWordCount();
      this.updatePreview();

      // Auto-save with debouncing
      clearTimeout(inputTimer);
      inputTimer = setTimeout(() => {
        this.autoSave();
      }, 1000);
    });

    // Keyboard shortcuts
    editor?.addEventListener('keydown', e => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            this.autoSave();
            break;
          case 'b':
            e.preventDefault();
            this.insertMarkdown('**', '**', 'bold text');
            break;
          case 'i':
            e.preventDefault();
            this.insertMarkdown('*', '*', 'italic text');
            break;
        }
      }

      // Tab handling for code blocks
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = e.target.selectionStart;
        const end = e.target.selectionEnd;
        e.target.value =
          e.target.value.substring(0, start) +
          '    ' +
          e.target.value.substring(end);
        e.target.selectionStart = e.target.selectionEnd = start + 4;
        this.content = e.target.value;
        this.updatePreview();
      }
    });

    // Tool buttons
    clearBtn?.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all content?')) {
        this.content = '';
        editor.value = '';
        this.updatePreview();
        this.updateWordCount();
      }
    });

    sampleBtn?.addEventListener('click', () => {
      this.loadSampleContent();
    });

    previewMode?.addEventListener('click', () => {
      this.togglePreviewMode();
    });

    fullscreenPreview?.addEventListener('click', () => {
      this.toggleFullscreenPreview();
    });

    deployBtn?.addEventListener('click', () => {
      this.deployToGitHub();
    });

    logoutBtn?.addEventListener('click', () => {
      this.logout();
    });

    // Load saved content if available
    this.loadSavedContent();
  }

  updatePreview() {
    const preview = document.getElementById('preview');
    if (preview) {
      if (this.content.trim() === '') {
        preview.innerHTML = `
          <div class="preview-empty">
            <p>✨ Start typing in the editor to see your markdown come to life!</p>
            <p>Try some basic formatting:</p>
            <ul>
              <li><strong>**bold text**</strong></li>
              <li><em>*italic text*</em></li>
              <li><code>\`code\`</code></li>
              <li><a href="#">[links](https://example.com)</a></li>
            </ul>
          </div>
        `;
      } else {
        preview.innerHTML = this.markdownToHTML(this.content);
      }

      // Scroll preview to match editor scroll position
      this.syncPreviewScroll();
    }
  }

  markdownToHTML(markdown) {
    if (!markdown) return '';

    // Enhanced markdown parsing with better regex patterns
    let html = markdown;

    // Code blocks (must be processed first)
    html = html.replace(/```([^`]*?)```/gs, '<pre><code>$1</code></pre>');

    // Headers (with ID generation for links)
    html = html.replace(/^### (.*$)/gm, (match, text) => {
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      return `<h3 id="${id}">${text}</h3>`;
    });
    html = html.replace(/^## (.*$)/gm, (match, text) => {
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      return `<h2 id="${id}">${text}</h2>`;
    });
    html = html.replace(/^# (.*$)/gm, (match, text) => {
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      return `<h1 id="${id}">${text}</h1>`;
    });

    // Horizontal rules
    html = html.replace(/^---$/gm, '<hr>');

    // Blockquotes
    html = html.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>');

    // Lists (improved handling)
    html = html.replace(/^[\*\-\+] (.+$)/gm, '<li>$1</li>');
    html = html.replace(/^(\d+)\. (.+$)/gm, '<oli>$2</oli>');

    // Group consecutive list items
    html = html.replace(/(<li>.*?<\/li>)(\n<li>.*?<\/li>)*/gs, '<ul>$&</ul>');
    html = html.replace(
      /(<oli>.*?<\/oli>)(\n<oli>.*?<\/oli>)*/gs,
      '<ol>$&</ol>'
    );
    html = html.replace(/<oli>/g, '<li>').replace(/<\/oli>/g, '</li>');

    // Text formatting
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
    html = html.replace(/~~(.*?)~~/g, '<del>$1</del>');
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Links and images
    html = html.replace(
      /!\[([^\]]*)\]\(([^)]+)\)/g,
      '<img src="$2" alt="$1" />'
    );
    html = html.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener">$1</a>'
    );

    // Email links
    html = html.replace(
      /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
      '<a href="mailto:$1">$1</a>'
    );

    // Auto-link URLs
    html = html.replace(
      /(https?:\/\/[^\s<]+)/g,
      '<a href="$1" target="_blank" rel="noopener">$1</a>'
    );

    // Paragraphs
    html = html.replace(/\n\s*\n/g, '</p><p>');
    html = html.replace(/^(.)/gm, '<p>$1');
    html = html.replace(/(.*)$/gm, '$1</p>');

    // Clean up
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>(<h[1-6][^>]*>.*?<\/h[1-6]>)<\/p>/g, '$1');
    html = html.replace(/<p>(<ul>.*?<\/ul>)<\/p>/gs, '$1');
    html = html.replace(/<p>(<ol>.*?<\/ol>)<\/p>/gs, '$1');
    html = html.replace(/<p>(<blockquote>.*?<\/blockquote>)<\/p>/g, '$1');
    html = html.replace(/<p>(<pre>.*?<\/pre>)<\/p>/gs, '$1');
    html = html.replace(/<p>(<hr>)<\/p>/g, '$1');

    return html;
  }

  updateWordCount() {
    const wordCount = document.getElementById('word-count');
    const charCount = document.getElementById('char-count');

    if (wordCount) {
      const words = this.content
        .trim()
        .split(/\s+/)
        .filter(word => word.length > 0).length;
      wordCount.textContent = `${words} word${words !== 1 ? 's' : ''}`;
    }

    if (charCount) {
      charCount.textContent = `${this.content.length} character${this.content.length !== 1 ? 's' : ''}`;
    }
  }

  autoSave() {
    try {
      localStorage.setItem('mdsg_content', this.content);
      localStorage.setItem('mdsg_last_save', new Date().toISOString());

      const status = document.getElementById('auto-save-status');
      if (status) {
        status.textContent = 'Auto-save: Saved';
        status.style.color = '#28a745';
        setTimeout(() => {
          status.textContent = 'Auto-save: Ready';
          status.style.color = '#666';
        }, 2000);
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
      const status = document.getElementById('auto-save-status');
      if (status) {
        status.textContent = 'Auto-save: Failed';
        status.style.color = '#dc3545';
      }
    }
  }

  loadSavedContent() {
    try {
      const savedContent = localStorage.getItem('mdsg_content');
      if (savedContent && savedContent !== this.content) {
        this.content = savedContent;
        const editor = document.getElementById('markdown-editor');
        if (editor) {
          editor.value = this.content;
        }
        this.updatePreview();
        this.updateWordCount();
      }
    } catch (error) {
      console.error('Failed to load saved content:', error);
    }
  }

  loadSampleContent() {
    const sampleContent = `# Welcome to MDSG! 🚀

## What is MDSG?

MDSG (Markdown Site Generator) is a simple tool that lets you create beautiful GitHub Pages sites from markdown content. No coding required!

## Features

- **Live Preview** - See your changes instantly
- **GitHub Integration** - Deploy directly to GitHub Pages
- **Simple Markdown** - Easy formatting for everyone
- *Responsive Design* - Looks great on all devices

## Getting Started

1. Write your content in markdown (like this!)
2. Watch the live preview update
3. Click deploy when you're ready
4. Your site goes live instantly! ✨

## Markdown Examples

### Text Formatting

You can make text **bold**, *italic*, or even ~~strikethrough~~.

### Code

Inline \`code\` looks like this, and code blocks:

\`\`\`javascript
function hello() {
    console.log("Hello, world!");
}
\`\`\`

### Lists

Unordered lists:
- First item
- Second item
- Third item

Ordered lists:
1. First step
2. Second step
3. Third step

### Links and More

Check out [GitHub](https://github.com) or email me at hello@example.com

> This is a blockquote. Perfect for highlighting important information!

---

## Ready to Build?

Start editing this content to create your own site. The preview updates as you type!

*Happy building!* 🎉`;

    this.content = sampleContent;
    const editor = document.getElementById('markdown-editor');
    if (editor) {
      editor.value = this.content;
    }
    this.updatePreview();
    this.updateWordCount();
  }

  insertMarkdown(before, after, placeholder) {
    const editor = document.getElementById('markdown-editor');
    if (!editor) return;

    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selectedText = editor.value.substring(start, end);
    const replacement = selectedText || placeholder;

    const newText = before + replacement + after;
    editor.value =
      editor.value.substring(0, start) + newText + editor.value.substring(end);

    // Set cursor position
    const newCursorPos = start + before.length + replacement.length;
    editor.selectionStart = editor.selectionEnd = newCursorPos;

    this.content = editor.value;
    this.updatePreview();
    editor.focus();
  }

  syncPreviewScroll() {
    const editor = document.getElementById('markdown-editor');
    const preview = document.getElementById('preview');

    if (editor && preview) {
      const scrollPercentage =
        editor.scrollTop / (editor.scrollHeight - editor.clientHeight);
      preview.scrollTop =
        scrollPercentage * (preview.scrollHeight - preview.clientHeight);
    }
  }

  togglePreviewMode() {
    const editorContainer = document.querySelector('.editor-container');
    const previewModeBtn = document.getElementById('preview-mode');

    if (editorContainer && previewModeBtn) {
      editorContainer.classList.toggle('preview-only');
      previewModeBtn.classList.toggle('active');
    }
  }

  toggleFullscreenPreview() {
    const preview = document.getElementById('preview');
    if (preview) {
      if (preview.requestFullscreen) {
        preview.requestFullscreen();
      } else if (preview.webkitRequestFullscreen) {
        preview.webkitRequestFullscreen();
      } else if (preview.msRequestFullscreen) {
        preview.msRequestFullscreen();
      }
    }
  }

  async deployToGitHub() {
    if (!this.authenticated) {
      this.showError('Please log in first');
      return;
    }

    if (!this.content.trim()) {
      this.showError('Please write some content first');
      return;
    }

    const deployBtn = document.getElementById('deploy-btn');
    deployBtn.textContent = '⏳ Creating repository...';
    deployBtn.disabled = true;

    try {
      // Create repository
      deployBtn.textContent = '⏳ Creating repository...';
      const repo = await this.createRepository();

      // Upload content
      deployBtn.textContent = '⏳ Uploading content...';
      await this.uploadContent(repo.name);

      // Enable GitHub Pages
      deployBtn.textContent = '⏳ Enabling GitHub Pages...';
      await this.enableGitHubPages(repo.name);

      this.showSuccess(repo);
    } catch (error) {
      console.error('Deployment error:', error);
      let errorMessage = 'Deployment failed';

      if (error.message.includes('name already exists')) {
        errorMessage =
          'Repository name already exists. Please delete the existing "mdsg-site" repository or rename it.';
      } else if (error.message.includes('rate limit')) {
        errorMessage =
          'GitHub API rate limit exceeded. Please try again later.';
      } else if (error.message.includes('permission')) {
        errorMessage =
          'Permission denied. Please make sure you granted repository access.';
      }

      this.showError(errorMessage);
    } finally {
      deployBtn.textContent = '🚀 Deploy to GitHub Pages';
      deployBtn.disabled = false;
    }
  }

  async createRepository() {
    const token = localStorage.getItem('github_token');
    const response = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'mdsg-site',
        description: 'My markdown site created with MDSG',
        auto_init: true,
        public: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.errors && errorData.errors[0]?.message) {
        throw new Error(errorData.errors[0].message);
      }
      throw new Error(`Failed to create repository: ${response.status}`);
    }

    return await response.json();
  }

  async uploadContent(repoName) {
    const token = localStorage.getItem('github_token');

    // Create index.html with the markdown content
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Site</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        h1, h2, h3 { color: #333; margin-top: 2rem; margin-bottom: 1rem; }
        h1 { border-bottom: 1px solid #eee; padding-bottom: 0.5rem; }
        p { margin-bottom: 1rem; }
        code { background: #f6f8fa; padding: 2px 4px; border-radius: 3px; }
        blockquote { border-left: 4px solid #dfe2e5; margin: 0; padding-left: 1rem; color: #6a737d; }
    </style>
</head>
<body>
    ${this.markdownToHTML(this.content)}
    <footer style="margin-top: 3rem; padding-top: 2rem; border-top: 1px solid #eee; color: #666; font-size: 0.9rem;">
        <p>Generated with <a href="https://mdsg.daza.ar" target="_blank">MDSG</a></p>
    </footer>
</body>
</html>`;

    const response = await fetch(
      `https://api.github.com/repos/${this.user.login}/${repoName}/contents/index.html`,
      {
        method: 'PUT',
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Add site content',
          content: btoa(htmlContent),
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to upload content: ${errorData.message || response.status}`
      );
    }
  }

  async enableGitHubPages(repoName) {
    const token = localStorage.getItem('github_token');
    const response = await fetch(
      `https://api.github.com/repos/${this.user.login}/${repoName}/pages`,
      {
        method: 'POST',
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: {
            branch: 'main',
            path: '/',
          },
        }),
      }
    );

    if (!response.ok && response.status !== 409) {
      // 409 means already enabled
      const errorData = await response.json();
      throw new Error(
        `Failed to enable GitHub Pages: ${errorData.message || response.status}`
      );
    }
  }

  showSuccess(repo) {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
      <div class="success-section">
        <h2>🎉 Site Deployed Successfully!</h2>
        <p>Your site is now live at:</p>
        <a href="https://${this.user.login}.github.io/${repo.name}" target="_blank" class="site-link">
          https://${this.user.login}.github.io/${repo.name}
        </a>
        <p><small>Note: It may take a few minutes for your site to be available.</small></p>

        <div class="success-actions">
          <a href="https://github.com/${this.user.login}/${repo.name}" target="_blank" class="secondary-btn">
            📁 View Repository
          </a>
          <button id="create-another" class="primary-btn">Create Another Site</button>
        </div>
      </div>
    `;

    document.getElementById('create-another')?.addEventListener('click', () => {
      this.content = '';
      this.showEditor();
    });
  }

  showError(message) {
    const mainContent = document.getElementById('main-content');
    const existingError = document.querySelector('.error-banner');

    if (existingError) {
      existingError.remove();
    }

    const errorBanner = document.createElement('div');
    errorBanner.className = 'error-banner';
    errorBanner.innerHTML = `
      <span>⚠️ ${message}</span>
      <button onclick="this.parentElement.remove()">×</button>
    `;

    mainContent.insertBefore(errorBanner, mainContent.firstChild);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (errorBanner.parentElement) {
        errorBanner.remove();
      }
    }, 10000);
  }

  showLoading(message) {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
      <div class="loading-section">
        <div class="spinner"></div>
        <p>${message}</p>
      </div>
    `;
  }

  logout() {
    console.log('User logging out...');

    // Clear all authentication state
    this.clearAuthenticationState();

    // Reset content
    this.content = '';

    // Show login UI
    this.setupUI();

    console.log('Logout completed');
  }

  handleAuthError(message = 'Authentication failed') {
    console.error('Authentication error:', message);

    // Clear all authentication state
    this.clearAuthenticationState();

    // Show login UI
    this.setupUI();

    // Show error to user
    this.showError(message);
  }
}

// Enhanced OAuth callback handling
function handleOAuthCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const state = urlParams.get('state');
  const error = urlParams.get('error');
  const errorDescription = urlParams.get('error_description');

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, errorDescription);
    const errorMessage =
      errorDescription || 'GitHub OAuth authorization failed';

    // Clean URL and show error
    window.history.replaceState({}, document.title, window.location.pathname);

    // Show user-friendly error
    setTimeout(() => {
      const app = new MDSG();
      app.showError(`Authentication failed: ${errorMessage}`);
    }, 100);
    return;
  }

  // Handle successful callback
  if (code) {
    console.log('OAuth code received, processing...');

    // Verify state parameter for security
    const storedState = localStorage.getItem('oauth_state');
    if (!state || state !== storedState) {
      console.error('OAuth state mismatch - possible CSRF attack');
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(() => {
        const app = new MDSG();
        app.showError(
          'Authentication security check failed. Please try again.'
        );
      }, 100);
      return;
    }

    // Clean up state
    localStorage.removeItem('oauth_state');

    // Remove OAuth parameters from URL immediately
    window.history.replaceState({}, document.title, window.location.pathname);

    // Exchange code for token
    exchangeCodeForToken(code);
  }
}

async function exchangeCodeForToken(code) {
  try {
    console.log('Exchanging authorization code for access token...');

    // Show loading state
    const app = document.getElementById('app');
    if (app) {
      app.innerHTML = `
        <div class="container">
          <div class="loading-section">
            <div class="spinner"></div>
            <p>Completing authentication...</p>
          </div>
        </div>
      `;
    }

    const response = await fetch('/auth/github', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    const data = await response.json();

    if (response.ok) {
      // Store token securely
      localStorage.setItem('github_token', data.access_token);

      // Store additional token info if available
      if (data.token_type) {
        localStorage.setItem('github_token_type', data.token_type);
      }
      if (data.scope) {
        localStorage.setItem('github_token_scope', data.scope);
      }

      console.log('OAuth token exchange successful');

      // Reload to trigger auth check and start the app
      window.location.reload();
    } else {
      // Handle API errors
      console.error('OAuth token exchange failed:', data);
      const errorMessage =
        data.details || data.error || 'Authentication failed';

      // Initialize app and show error
      const mdsgApp = new MDSG();
      mdsgApp.showError(`Authentication failed: ${errorMessage}`);
    }
  } catch (error) {
    console.error('OAuth token exchange error:', error);

    // Initialize app and show error
    const mdsgApp = new MDSG();
    mdsgApp.showError(
      'Network error during authentication. Please check your connection and try again.'
    );
  }
}

// Handle OAuth callback if present
handleOAuthCallback();

// Start the app
new MDSG();
