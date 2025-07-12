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

          <div class="login-options">
            <button id="login-btn" class="primary-btn login-button">
              <span class="github-icon">📱</span>
              Continue with GitHub
            </button>

            <div class="demo-option">
              <p>Want to try it first?</p>
              <button id="demo-btn" class="secondary-btn demo-button">
                <span>🎮</span>
                Try Demo Mode
              </button>
            </div>
          </div>

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

    document.getElementById('demo-btn')?.addEventListener('click', () => {
      this.startDemoMode();
    });
  }

  async loginWithGitHub() {
    // Check if we're already in an OAuth flow
    if (this.authenticated) {
      console.log('User already authenticated');
      return;
    }

    console.log('Starting GitHub Device Flow authentication...');
    await this.startDeviceFlow();
  }

  getGitHubClientId() {
    // GitHub Device Flow requires a GitHub App with device flow enabled
    // This is a demo client ID - replace with your own for production
    return 'Ov23li8QZvXs9yZ2xKpd';
  }

  async startDeviceFlow() {
    try {
      this.showLoading('Starting authentication...');

      // Step 1: Request device code from GitHub
      const deviceData = await this.requestDeviceCode();

      // Step 2: Show user the verification code and URL
      this.showDeviceVerification(deviceData);

      // Step 3: Poll for user authorization
      const tokenData = await this.pollForToken(deviceData);

      // Step 4: Store token and complete authentication
      await this.completeAuthentication(tokenData);
    } catch (error) {
      console.error('Device flow error:', error);
      this.showError(`Authentication failed: ${error.message}`);
    }
  }

  async requestDeviceCode() {
    const clientId = this.getGitHubClientId();

    const response = await fetch('https://github.com/login/device/code', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `client_id=${clientId}&scope=repo user`,
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    return await response.json();
  }

  showDeviceVerification(deviceData) {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
      <div class="device-flow-section">
        <div class="verification-header">
          <h2>🔐 Authenticate with GitHub</h2>
          <p>To continue, please verify your device with GitHub</p>
        </div>

        <div class="verification-steps">
          <div class="step">
            <h3>Step 1: Copy this code</h3>
            <div class="verification-code">
              <code id="user-code">${deviceData.user_code}</code>
              <button id="copy-code" class="secondary-btn">📋 Copy</button>
            </div>
          </div>

          <div class="step">
            <h3>Step 2: Open GitHub verification page</h3>
            <a href="${deviceData.verification_uri}" target="_blank" class="primary-btn">
              🌐 Open GitHub Verification
            </a>
          </div>

          <div class="step">
            <h3>Step 3: Enter the code and authorize</h3>
            <p>Paste the code on GitHub and authorize MDSG to access your account</p>
          </div>
        </div>

        <div class="verification-status">
          <div class="spinner"></div>
          <p id="status-message">Waiting for authorization...</p>
          <p><small>This page will automatically continue once you authorize on GitHub</small></p>
        </div>

        <div class="verification-actions">
          <button id="cancel-auth" class="secondary-btn">❌ Cancel</button>
        </div>
      </div>
    `;

    // Setup event handlers
    document.getElementById('copy-code')?.addEventListener('click', () => {
      navigator.clipboard.writeText(deviceData.user_code);
      document.getElementById('copy-code').textContent = '✅ Copied!';
      setTimeout(() => {
        document.getElementById('copy-code').textContent = '📋 Copy';
      }, 2000);
    });

    document.getElementById('cancel-auth')?.addEventListener('click', () => {
      this.cancelAuthentication();
    });
  }

  async pollForToken(deviceData) {
    const clientId = this.getGitHubClientId();
    const pollInterval = (deviceData.interval || 5) * 1000; // Convert to milliseconds
    const expiresAt = Date.now() + deviceData.expires_in * 1000;

    return new Promise((resolve, reject) => {
      const poll = async () => {
        if (Date.now() > expiresAt) {
          reject(new Error('Authentication timeout. Please try again.'));
          return;
        }

        try {
          const response = await fetch(
            'https://github.com/login/oauth/access_token',
            {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: `client_id=${clientId}&device_code=${deviceData.device_code}&grant_type=urn:ietf:params:oauth:grant-type:device_code`,
            }
          );

          const data = await response.json();

          if (data.access_token) {
            resolve(data);
          } else if (data.error === 'authorization_pending') {
            // User hasn't completed authorization yet, continue polling
            setTimeout(poll, pollInterval);
          } else if (data.error === 'slow_down') {
            // GitHub wants us to slow down polling
            setTimeout(poll, pollInterval + 5000);
          } else if (data.error === 'expired_token') {
            reject(new Error('Verification code expired. Please try again.'));
          } else if (data.error === 'access_denied') {
            reject(new Error('Authorization denied by user.'));
          } else {
            reject(
              new Error(
                data.error_description || 'Unknown authentication error'
              )
            );
          }
        } catch (error) {
          reject(new Error('Network error during authentication'));
        }
      };

      // Start polling
      setTimeout(poll, pollInterval);
    });
  }

  async completeAuthentication(tokenData) {
    // Store the access token
    localStorage.setItem('github_token', tokenData.access_token);
    if (tokenData.token_type) {
      localStorage.setItem('github_token_type', tokenData.token_type);
    }
    if (tokenData.scope) {
      localStorage.setItem('github_token_scope', tokenData.scope);
    }

    console.log('GitHub Device Flow authentication completed successfully');

    // Fetch user data and show editor
    await this.fetchUser(tokenData.access_token);
  }

  cancelAuthentication() {
    console.log('Authentication cancelled by user');
    this.setupUI();
  }

  startDemoMode() {
    console.log('Starting demo mode...');

    // Create mock user for demo
    this.user = {
      login: 'demo-user',
      name: 'Demo User',
      avatar_url: 'https://github.com/github.png',
      html_url: 'https://github.com/demo-user',
      email: 'demo@example.com',
      displayName: 'Demo User',
      avatarUrl: 'https://github.com/github.png',
      profileUrl: 'https://github.com/demo-user',
      tokenValid: true,
      lastAuthenticated: new Date().toISOString(),
      demoMode: true,
    };

    this.authenticated = true;

    // Load sample content
    this.content = `# Welcome to MDSG Demo! 🚀

## What is MDSG?

MDSG (Markdown Site Generator) is a simple tool that lets you create beautiful GitHub Pages sites from markdown content. No coding required!

## Demo Features

- **Live Preview** - See your changes instantly as you type
- **GitHub Integration** - Deploy directly to GitHub Pages *(demo mode shows preview only)*
- **Simple Markdown** - Easy formatting for everyone
- *Responsive Design* - Looks great on all devices

## Getting Started

1. Edit the content in the left panel
2. Watch the live preview update on the right
3. In real mode, click deploy to create your GitHub Pages site!

### Markdown Examples

You can make text **bold**, *italic*, or even ~~strikethrough~~.

Create lists:
- First item
- Second item
- Third item

Add code: \`console.log('Hello World!')\`

> This is a blockquote - perfect for highlighting important information!

*Happy creating with MDSG!* 🎉`;

    const editor = document.getElementById('markdown-editor');
    if (editor) {
      editor.value = this.content;
    }
    this.updatePreview();
    this.updateWordCount();
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
    const originalText = deployBtn.textContent;
    deployBtn.disabled = true;

    // Show detailed progress
    this.showDeploymentProgress('Preparing deployment...');

    try {
      // Step 1: Create repository
      this.updateDeploymentProgress('Creating GitHub repository...', 25);
      deployBtn.textContent = '⏳ Creating repository...';
      const repo = await this.createRepository();

      // Step 2: Upload content
      this.updateDeploymentProgress('Uploading your content...', 50);
      deployBtn.textContent = '⏳ Uploading content...';
      await this.uploadContent(repo.name);

      // Step 3: Enable GitHub Pages
      this.updateDeploymentProgress('Enabling GitHub Pages...', 75);
      deployBtn.textContent = '⏳ Enabling GitHub Pages...';
      await this.enableGitHubPages(repo.name);

      // Step 4: Complete
      this.updateDeploymentProgress('Deployment complete!', 100);
      deployBtn.textContent = '✅ Deployed!';

      setTimeout(() => {
        this.showSuccess(repo);
      }, 1000);
    } catch (error) {
      console.error('Deployment error:', error);
      this.hideDeploymentProgress();

      let errorMessage = 'Deployment failed';
      let errorDetails = error.message;

      if (error.message.includes('Authentication failed')) {
        errorMessage = 'Authentication expired';
        errorDetails =
          'Please log out and log in again to refresh your credentials.';
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'GitHub API rate limit exceeded';
        errorDetails = 'Please wait a few minutes and try again.';
      } else if (error.message.includes('Permission denied')) {
        errorMessage = 'Permission denied';
        errorDetails =
          'Please make sure you granted repository access during login.';
      } else if (error.message.includes('repository limit')) {
        errorMessage = 'Repository limit reached';
        errorDetails =
          'You may have reached your GitHub repository limit for this account.';
      } else if (error.message.includes('Unable to create repository after')) {
        errorMessage = 'Repository naming conflict';
        errorDetails =
          'Multiple repositories with similar names exist. Please delete some old MDSG repositories.';
      }

      this.showError(`${errorMessage}: ${errorDetails}`);
    } finally {
      deployBtn.textContent = originalText;
      deployBtn.disabled = false;
    }
  }

  async createRepository() {
    const token = localStorage.getItem('github_token');
    let repoName = 'mdsg-site';
    let attempt = 0;
    const maxAttempts = 10;

    while (attempt < maxAttempts) {
      const currentRepoName =
        attempt === 0 ? repoName : `${repoName}-${attempt}`;

      console.log(`Attempting to create repository: ${currentRepoName}`);

      const response = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'MDSG-App',
        },
        body: JSON.stringify({
          name: currentRepoName,
          description: `My markdown site created with MDSG ${new Date().toLocaleDateString()}`,
          auto_init: true,
          public: true,
          has_issues: false,
          has_projects: false,
          has_wiki: false,
        }),
      });

      if (response.ok) {
        const repo = await response.json();
        console.log(`Repository created successfully: ${repo.name}`);
        return repo;
      }

      const errorData = await response.json().catch(() => ({}));

      // Handle specific error cases
      if (response.status === 422 && errorData.errors) {
        const nameError = errorData.errors.find(
          err => err.resource === 'Repository' && err.field === 'name'
        );

        if (nameError && nameError.code === 'already_exists') {
          console.log(
            `Repository ${currentRepoName} already exists, trying next name...`
          );
          attempt++;
          continue;
        }
      }

      // Handle other errors
      if (response.status === 401) {
        throw new Error('Authentication failed. Please login again.');
      } else if (response.status === 403) {
        throw new Error(
          'Permission denied. You may have reached your repository limit.'
        );
      } else if (response.status === 422) {
        const message = errorData.message || 'Invalid repository configuration';
        throw new Error(`Repository creation failed: ${message}`);
      } else {
        throw new Error(
          `Failed to create repository: ${response.status} ${response.statusText}`
        );
      }
    }

    throw new Error(
      `Unable to create repository after ${maxAttempts} attempts. Please try a different name.`
    );
  }

  async uploadContent(repoName) {
    const token = localStorage.getItem('github_token');

    // Generate enhanced HTML content with better styling
    const htmlContent = this.generateSiteHTML();

    console.log(`Uploading content to repository: ${repoName}`);

    const response = await fetch(
      `https://api.github.com/repos/${this.user.login}/${repoName}/contents/index.html`,
      {
        method: 'PUT',
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'MDSG-App',
        },
        body: JSON.stringify({
          message: 'Add site content via MDSG',
          content: btoa(htmlContent),
          committer: {
            name: this.user.name || this.user.login,
            email:
              this.user.email || `${this.user.login}@users.noreply.github.com`,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 401) {
        throw new Error('Authentication failed. Please login again.');
      } else if (response.status === 403) {
        throw new Error(
          'Permission denied. You may not have write access to this repository.'
        );
      } else if (response.status === 404) {
        throw new Error('Repository not found. It may have been deleted.');
      } else if (response.status === 409) {
        throw new Error('File already exists. Please try again.');
      } else {
        const message = errorData.message || 'Unknown error occurred';
        throw new Error(`Failed to upload content: ${message}`);
      }
    }

    const result = await response.json();
    console.log('Content uploaded successfully');
    return result;
  }

  generateSiteHTML() {
    // Extract title from content
    const titleMatch = this.content.match(/^#\s+(.+)$/m);
    const siteTitle = titleMatch ? titleMatch[1] : 'My Site';

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.escapeHtml(siteTitle)}</title>
    <meta name="description" content="A beautiful site created with MDSG">
    <meta name="generator" content="MDSG - Markdown Site Generator">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown-light.min.css">
    <style>
        body {
            box-sizing: border-box;
            min-width: 200px;
            max-width: 980px;
            margin: 0 auto;
            padding: 45px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #24292f;
            background-color: #ffffff;
        }

        @media (max-width: 767px) {
            body {
                padding: 15px;
            }
        }

        .markdown-body {
            box-sizing: border-box;
            min-width: 200px;
        }

        .site-header {
            text-align: center;
            border-bottom: 1px solid #d0d7de;
            padding-bottom: 2rem;
            margin-bottom: 2rem;
        }

        .site-footer {
            margin-top: 3rem;
            padding-top: 2rem;
            border-top: 1px solid #d0d7de;
            text-align: center;
            color: #656d76;
            font-size: 0.9rem;
        }

        .site-footer a {
            color: #0969da;
            text-decoration: none;
        }

        .site-footer a:hover {
            text-decoration: underline;
        }

        /* Enhanced styling for better visual appeal */
        .markdown-body h1, .markdown-body h2, .markdown-body h3 {
            margin-top: 2rem;
            margin-bottom: 1rem;
        }

        .markdown-body h1:first-child {
            margin-top: 0;
        }

        .markdown-body blockquote {
            background: #f6f8fa;
            border-radius: 6px;
            padding: 1rem;
        }

        .markdown-body pre {
            background: #f6f8fa !important;
            border-radius: 6px;
        }

        .markdown-body img {
            border-radius: 6px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <div class="site-header">
        <h1>${this.escapeHtml(siteTitle)}</h1>
        <p>Created with ❤️ using MDSG</p>
    </div>

    <article class="markdown-body">
        ${this.markdownToHTML(this.content)}
    </article>

    <footer class="site-footer">
        <p>
            Generated with <a href="https://mdsg.daza.ar" target="_blank" rel="noopener">MDSG</a> •
            <a href="https://github.com/${this.user.login}" target="_blank" rel="noopener">@${this.user.login}</a> •
            ${new Date().toLocaleDateString()}
        </p>
    </footer>
</body>
</html>`;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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

  showDeploymentProgress(message) {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
      <div class="deployment-progress">
        <div class="progress-header">
          <h2>🚀 Deploying Your Site</h2>
          <p id="progress-message">${message}</p>
        </div>
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" id="progress-fill" style="width: 0%"></div>
          </div>
          <div class="progress-percentage" id="progress-percentage">0%</div>
        </div>
        <div class="progress-steps">
          <div class="step" id="step-1">
            <span class="step-icon">📁</span>
            <span>Create Repository</span>
          </div>
          <div class="step" id="step-2">
            <span class="step-icon">📤</span>
            <span>Upload Content</span>
          </div>
          <div class="step" id="step-3">
            <span class="step-icon">🌐</span>
            <span>Enable Pages</span>
          </div>
          <div class="step" id="step-4">
            <span class="step-icon">✅</span>
            <span>Complete</span>
          </div>
        </div>
      </div>
    `;
  }

  updateDeploymentProgress(message, percentage) {
    const progressMessage = document.getElementById('progress-message');
    const progressFill = document.getElementById('progress-fill');
    const progressPercentage = document.getElementById('progress-percentage');

    if (progressMessage) progressMessage.textContent = message;
    if (progressFill) progressFill.style.width = `${percentage}%`;
    if (progressPercentage) progressPercentage.textContent = `${percentage}%`;

    // Update step indicators
    const stepNumber = Math.ceil(percentage / 25);
    for (let i = 1; i <= stepNumber && i <= 4; i++) {
      const step = document.getElementById(`step-${i}`);
      if (step) step.classList.add('completed');
    }
  }

  hideDeploymentProgress() {
    // Progress will be hidden when error is shown or success is displayed
  }

  showSuccess(repo) {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
      <div class="success-section">
        <div class="success-header">
          <h2>🎉 Site Deployed Successfully!</h2>
          <p>Your markdown site is now live on GitHub Pages!</p>
        </div>

        <div class="site-info">
          <div class="site-url">
            <label>🌐 Live Site URL:</label>
            <a href="https://${this.user.login}.github.io/${repo.name}" target="_blank" class="site-link">
              https://${this.user.login}.github.io/${repo.name}
            </a>
          </div>

          <div class="repo-info">
            <label>📁 Repository:</label>
            <a href="https://github.com/${this.user.login}/${repo.name}" target="_blank" class="repo-link">
              github.com/${this.user.login}/${repo.name}
            </a>
          </div>
        </div>

        <div class="deployment-stats">
          <div class="stat">
            <span class="stat-label">Repository Created:</span>
            <span class="stat-value">✅ ${repo.name}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Content Uploaded:</span>
            <span class="stat-value">✅ index.html</span>
          </div>
          <div class="stat">
            <span class="stat-label">GitHub Pages:</span>
            <span class="stat-value">✅ Enabled</span>
          </div>
          <div class="stat">
            <span class="stat-label">Deployment Time:</span>
            <span class="stat-value">🚀 ${new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        <div class="success-note">
          <p><strong>⏰ Please note:</strong> It may take 1-2 minutes for your site to be fully available.</p>
          <p>GitHub Pages needs time to build and deploy your site.</p>
        </div>

        <div class="success-actions">
          <a href="https://${this.user.login}.github.io/${repo.name}" target="_blank" class="primary-btn">
            🌐 View Live Site
          </a>
          <a href="https://github.com/${this.user.login}/${repo.name}" target="_blank" class="secondary-btn">
            📁 View Repository
          </a>
          <button id="create-another" class="secondary-btn">✨ Create Another Site</button>
        </div>
      </div>
    `;

    document.getElementById('create-another')?.addEventListener('click', () => {
      this.content = '';
      this.showEditor();
    });
  }

  showError(message, type = 'error') {
    const mainContent = document.getElementById('main-content');
    const existingError = document.querySelector(
      '.error-banner, .success-banner'
    );

    if (existingError) {
      existingError.remove();
    }

    const bannerClass = type === 'success' ? 'success-banner' : 'error-banner';
    const icon = type === 'success' ? '✅' : '⚠️';

    const errorBanner = document.createElement('div');
    errorBanner.className = bannerClass;
    errorBanner.innerHTML = `
      <span>${icon} ${message}</span>
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

// No OAuth callback handling needed with device flow

// Start the app (no OAuth callback needed with device flow)
new MDSG();
