// MDSG - Markdown Site Generator
// Simple entry point

import { SecureHTML } from './utils/security.js';
import { tokenManager } from './utils/token-manager.js';

class MDSG {
  constructor() {
    this.authenticated = false;
    this.user = null;
    this.token = null;
    this.content = '';
    this.repoName = '';
    this.existingSites = [];
    this.isMobile = this.detectMobile();
    this.init();
  }

  detectMobile() {
    // Handle testing environment
    if (
      typeof global !== 'undefined' &&
      global.window &&
      global.window.navigator
    ) {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        global.window.navigator.userAgent,
      );
    }

    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return false;
    }
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );
  }

  init() {
    this.setupUI();
    this.checkAuth();
  }

  setupUI() {
    const app = document.getElementById('app');
    const safeHTML = `
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
    SecureHTML.sanitizeAndRender(safeHTML, app);
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
              <span class="github-icon">🔑</span>
              Login with GitHub
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
    SecureHTML.sanitizeAndRender(successHTML, mainContent);
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
    SecureHTML.sanitizeAndRender(tokenInputHTML, mainContent);
  }

  checkAuth() {
    // Enhanced authentication check with secure token storage
    // First, try to migrate any old localStorage tokens
    tokenManager.migrateFromLocalStorage();

    const token = tokenManager.getTokenString();
    const userInfo = tokenManager.getUserInfo();

    if (token && this.isValidToken(token)) {
      console.log('Valid secure authentication token found');
      this.token = token;
      this.user = userInfo; // Use cached user info if available

      // Check if token is expiring soon
      if (tokenManager.isTokenExpiringSoon()) {
        console.warn('Token expires soon, consider refreshing');
        this.showExpiryWarning();
      }

      if (userInfo) {
        // Use cached user info
        this.authenticated = true;
        this.showEditor();
      } else {
        // Fetch fresh user info
        this.fetchUser(token);
      }
      return true;
    } else {
      console.log('No valid authentication found');
      this.clearAuthenticationState();
      this.setupLoginHandler();
      return false;
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
    // Clear all authentication-related data using secure token manager
    tokenManager.clearToken();

    // Also clear any remaining localStorage items (migration cleanup)
    try {
      localStorage.removeItem('github_token');
      localStorage.removeItem('github_token_type');
      localStorage.removeItem('github_token_scope');
      localStorage.removeItem('oauth_state');
    } catch (e) {
      // Ignore localStorage errors
    }

    // Reset internal state
    this.authenticated = false;
    this.user = null;
    this.token = null;
  }

  setupLoginHandler() {
    document.getElementById('login-btn')?.addEventListener('click', () => {
      this.loginWithGitHub();
    });

    document.getElementById('demo-btn')?.addEventListener('click', () => {
      this.startDemoMode();
    });
  }

  loginWithGitHub() {
    // Check if we're already authenticated
    if (this.authenticated) {
      console.log('User already authenticated');
      return;
    }

    console.log('Starting GitHub Personal Access Token authentication...');
    this.showTokenInput();
  }

  showTokenInput() {
    const mainContent = document.getElementById('main-content');
    const tokenInputHTML = `
      <div class="token-input-section">
        <div class="token-header">
          <h2>🔐 Sign in to GitHub</h2>
          <p>Authenticate securely with your GitHub account</p>
        </div>

        <div class="auth-explanation">
          <div class="why-token">
            <h3>🔒 Secure Authentication</h3>
            <p>For your security, GitHub requires a Personal Access Token instead of passwords for applications like MDSG.</p>
            <p><strong>Don't worry - it's quick and easy!</strong></p>
          </div>
        </div>

        <div class="token-instructions">
          <div class="step step-1">
            <div class="step-number">1</div>
            <div class="step-content">
              <h3>Create your access token</h3>
              <p>Click the button below to open GitHub's token creation page (opens in new tab)</p>
              <a href="https://github.com/settings/tokens/new?scopes=repo,user&description=MDSG%20-%20Markdown%20Site%20Generator" target="_blank" class="primary-btn token-create-btn">
                🔗 Create Token on GitHub
              </a>
            </div>
          </div>

          <div class="step step-2">
            <div class="step-number">2</div>
            <div class="step-content">
              <h3>Configure the token</h3>
              <p>On the GitHub page:</p>
              <ul>
                <li>✅ Ensure <strong>repo</strong> and <strong>user</strong> scopes are selected</li>
                <li>📅 Set expiration (recommend 90 days)</li>
                <li>💾 Click "Generate token"</li>
              </ul>
            </div>
          </div>

          <div class="step step-3">
            <div class="step-number">3</div>
            <div class="step-content">
              <h3>Enter your token</h3>
              <p>Copy the token from GitHub and paste it below:</p>
              <div class="token-input">
                <input type="password" id="token-input" placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" />
                <button id="save-token" class="primary-btn">🚀 Continue</button>
              </div>
              <p class="security-note">🔒 Your token is stored locally in your browser only</p>
            </div>
          </div>
        </div>

        <div class="auth-benefits">
          <h4>✨ What you can do once signed in:</h4>
          <div class="benefits-grid">
            <div class="benefit">📝 Create markdown sites</div>
            <div class="benefit">🚀 Deploy to GitHub Pages</div>
            <div class="benefit">🔧 Manage your repositories</div>
            <div class="benefit">👀 Live preview editing</div>
          </div>
        </div>

        <div class="token-actions">
          <button id="cancel-token" class="secondary-btn">← Back to Home</button>
        </div>
      </div>
    `;

    // Setup event handlers
    document.getElementById('save-token')?.addEventListener('click', () => {
      this.savePersonalToken();
    });

    document.getElementById('cancel-token')?.addEventListener('click', () => {
      this.cancelAuthentication();
    });

    // Enter key to save
    document.getElementById('token-input')?.addEventListener('keypress', e => {
      if (e.key === 'Enter') {
        this.savePersonalToken();
      }
    });
  }

  async savePersonalToken() {
    const tokenInput = document.getElementById('token-input');
    const saveButton = document.getElementById('save-token');
    const token = tokenInput?.value.trim();

    // Enhanced form validation
    if (!token) {
      this.showError('Please enter a valid GitHub token');
      tokenInput?.focus();
      return;
    }

    if (token.length < 20) {
      this.showError(
        'GitHub tokens are typically longer than 20 characters. Please check your token.',
      );
      tokenInput?.focus();
      return;
    }

    if (
      !token.startsWith('ghp_') &&
      !token.startsWith('github_pat_') &&
      !token.startsWith('gho_')
    ) {
      this.showError(
        'Invalid token format. Please copy the complete token from GitHub (starts with "ghp_", "github_pat_", or "gho_")',
      );
      tokenInput?.focus();
      return;
    }

    // Disable button during validation
    if (saveButton) {
      saveButton.disabled = true;
      saveButton.textContent = '🔄 Validating...';
    }

    try {
      // Test the token by fetching user data
      this.showLoading('Signing you in...');

      // Fetch user data first to validate token
      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github+json',
        },
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status}`);
      }

      const userData = await response.json();

      // Store token securely with user info
      const stored = tokenManager.storeToken(token, userData);
      if (!stored) {
        throw new Error('Failed to store authentication token securely');
      }

      this.token = token;
      this.user = userData;
      this.authenticated = true;
      this.showEditor();
    } catch (error) {
      // Clear any potentially stored token on error
      tokenManager.clearToken();

      // Enhanced error handling with retry option
      const errorMsg = this.getTokenErrorMessage(error);
      this.showErrorWithRetry(errorMsg, () => {
        this.showTokenInput();
      });
    } finally {
      // Re-enable button
      if (saveButton) {
        saveButton.disabled = false;
        saveButton.textContent = '🚀 Continue';
      }
    }
  }

  getTokenErrorMessage(error) {
    if (error.message && error.message.includes('401')) {
      return 'Invalid token. Please check that you copied the complete token from GitHub.';
    } else if (error.message && error.message.includes('403')) {
      return 'Token lacks required permissions. Please ensure "repo" and "user" scopes are selected.';
    } else if (error.message && error.message.includes('rate limit')) {
      return 'GitHub API rate limit exceeded. Please wait a few minutes and try again.';
    } else {
      return 'Unable to sign in. Please check that your token is valid and has "repo" and "user" permissions.';
    }
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
            'Authentication token expired. Please login again.',
          );
        } else if (response.status === 403) {
          this.handleAuthError(
            'GitHub API rate limit exceeded. Please try again later.',
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
    const mainContent = document.getElementById('main-content');
    SecureHTML.sanitizeAndRender(this.getEditorUI(), mainContent);
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

    // Main editor input handler with debouncing and validation
    let inputTimer;
    let validationTimer;
    editor?.addEventListener('input', e => {
      this.content = e.target.value;
      this.updateWordCount();
      this.updatePreview();

      // Real-time validation with debouncing
      clearTimeout(validationTimer);
      validationTimer = setTimeout(() => {
        this.validateContent();
      }, 500);

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
      // Enhanced confirmation with content length check
      const contentLength = this.content.trim().length;
      const confirmMessage =
        contentLength > 100
          ? `Are you sure you want to clear ${contentLength} characters of content? This cannot be undone.`
          : 'Are you sure you want to clear all content?';

      if (confirm(confirmMessage)) {
        this.content = '';
        editor.value = '';
        this.updatePreview();
        this.updateWordCount();

        // Show success feedback
        this.showError('Content cleared successfully', 'success');
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
        const emptyHTML = `
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
        SecureHTML.sanitizeAndRender(emptyHTML, preview);
      } else {
        const sanitizedHTML = SecureHTML.sanitize(
          this.markdownToHTML(this.content),
        );
        preview.innerHTML = sanitizedHTML;
      }

      // Scroll preview to match editor scroll position
      this.syncPreviewScroll();
    }
  }

  markdownToHTML(markdown) {
    if (!markdown) return '';

    // Note: We'll sanitize the HTML output, not the markdown input
    // This allows DOMPurify to properly handle mixed content

    // Enhanced markdown parsing with better regex patterns
    let html = markdown;

    // Code blocks (must be processed first)
    html = html.replace(/```([^`]*?)```/gs, '<pre><code>$1</code></pre>');

    // Headers (with ID generation for links)
    html = html.replace(/^### (.*$)/gm, (match, text) => {
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      return `<h3 id="${id}">${text}</h3>`;
    });
    html = html.replace(/^## (.*$)/gm, (match, text) => {
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      return `<h2 id="${id}">${text}</h2>`;
    });
    html = html.replace(/^# (.*$)/gm, (match, text) => {
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      return `<h1 id="${id}">${text}</h1>`;
    });

    // Horizontal rules
    html = html.replace(/^---$/gm, '<hr>');

    // Blockquotes
    html = html.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>');

    // Lists (improved handling)
    html = html.replace(/^[*\-+] (.+$)/gm, '<li>$1</li>');
    html = html.replace(/^(\d+)\. (.+$)/gm, '<oli>$2</oli>');

    // Group consecutive list items
    html = html.replace(/(<li>.*?<\/li>)(\n<li>.*?<\/li>)*/gs, '<ul>$&</ul>');
    html = html.replace(
      /(<oli>.*?<\/oli>)(\n<oli>.*?<\/oli>)*/gs,
      '<ol>$&</ol>',
    );
    html = html.replace(/<oli>/g, '<li>').replace(/<\/oli>/g, '</li>');

    // Text formatting
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
    html = html.replace(/~~(.*?)~~/g, '<del>$1</del>');
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Links and images (process before paragraphs to avoid nesting)
    html = html.replace(
      /!\[([^\]]*)\]\(([^)]+)\)/g,
      '<img src="$2" alt="$1" />',
    );
    html = html.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener">$1</a>',
    );

    // Auto-link standalone URLs (simple approach)
    html = html.replace(
      /\b(https?:\/\/[^\s<]+)(?![^<]*<\/a>)/g,
      '<a href="$1" target="_blank" rel="noopener">$1</a>',
    );

    // Email links (simple approach)
    html = html.replace(
      /\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b(?![^<]*<\/a>)/g,
      '<a href="mailto:$1">$1</a>',
    );

    // Paragraphs (process after links)
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

    // Final security check - ensure all attributes are safe
    html = html.replace(/(<img[^>]+)(?=\s)/g, match => {
      // Ensure images have loading="lazy" and safe attributes only
      if (!match.includes('loading=')) {
        return match + ' loading="lazy"';
      }
      return match;
    });

    // Ensure all external links have proper security attributes
    html = html.replace(
      /(<a[^>]+href=["']https?:\/\/[^"']*["'][^>]*)/g,
      '$1 target="_blank" rel="noopener noreferrer"',
    );

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

  validateContent() {
    const statusElement = document.getElementById('auto-save-status');
    if (!statusElement) return true;

    // Basic content validation
    if (typeof this.content !== 'string') {
      return false;
    }

    // Check for minimum content length
    if (this.content.trim().length === 0) {
      return false;
    }

    return true;

    const contentLength = this.content.length;
    const wordCount = this.content
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0).length;

    // Content validation
    if (contentLength === 0) {
      this.showValidationStatus('Write some content to get started', 'info');
    } else if (contentLength > 100000) {
      this.showValidationStatus('Content too large (>100KB)', 'warning');
    } else if (wordCount < 10) {
      this.showValidationStatus('Consider adding more content', 'info');
    } else if (wordCount > 10000) {
      this.showValidationStatus(
        'Very long content - may take time to deploy',
        'warning',
      );
    } else {
      this.showValidationStatus('Content looks good!', 'success');
    }
  }

  showValidationStatus(message, type) {
    const statusElement = document.getElementById('auto-save-status');
    if (!statusElement) return;

    statusElement.textContent = message;

    // Remove existing validation classes
    statusElement.classList.remove(
      'validation-info',
      'validation-warning',
      'validation-success',
    );

    // Add appropriate class
    switch (type) {
      case 'info':
        statusElement.classList.add('validation-info');
        break;
      case 'warning':
        statusElement.classList.add('validation-warning');
        break;
      case 'success':
        statusElement.classList.add('validation-success');
        break;
    }

    // Reset to auto-save status after 3 seconds
    setTimeout(() => {
      if (statusElement.textContent === message) {
        statusElement.textContent = 'Auto-save: Ready';
        statusElement.classList.remove(
          'validation-info',
          'validation-warning',
          'validation-success',
        );
      }
    }, 3000);
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
      this.showErrorWithRetry('Please write some content first', () => {
        const editor = document.getElementById('markdown-editor');
        editor?.focus();
      });
      return;
    }

    // Additional validation
    if (this.content.length > 100000) {
      this.showError(
        'Content is too large. Please reduce the content size to under 100KB.',
      );
      return;
    }

    // Prompt for repository name if not set
    if (!this.repoName) {
      const timestamp = Date.now().toString().slice(-6);
      const defaultName = `mdsg-site-${timestamp}`;
      const repoName = prompt(
        'Enter a name for your GitHub repository:',
        defaultName,
      );

      if (!repoName) {
        return; // User cancelled
      }

      // Validate repository name
      if (!/^[a-zA-Z0-9._-]+$/.test(repoName)) {
        this.showError(
          'Repository name can only contain letters, numbers, dots, underscores, and hyphens.',
        );
        return;
      }

      this.repoName = repoName.trim();
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
    const token = tokenManager.getTokenString();
    if (!token) {
      throw new Error('No authentication token available');
    }
    const baseRepoName = this.repoName || 'mdsg-site';
    let attempt = 0;
    const maxAttempts = 10;

    while (attempt < maxAttempts) {
      const currentRepoName =
        attempt === 0 ? baseRepoName : `${baseRepoName}-${attempt}`;

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
          description: `My markdown site created with MDSG on ${new Date().toLocaleDateString()}`,
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
      console.log('Repository creation error:', {
        status: response.status,
        statusText: response.statusText,
        errorData: errorData,
      });

      // Handle specific error cases for repository name conflicts
      if (response.status === 422) {
        // Check for repository already exists error
        if (errorData.errors) {
          const nameError = errorData.errors.find(
            err => err.resource === 'Repository' && err.field === 'name',
          );
          if (nameError && nameError.code === 'already_exists') {
            console.log(
              `Repository ${currentRepoName} already exists, trying next name...`,
            );
            attempt++;
            continue;
          }
        }

        // Check for error message indicating repository exists
        if (
          errorData.message &&
          (errorData.message.includes('already exists') ||
            errorData.message.includes('name already exists'))
        ) {
          console.log(
            `Repository ${currentRepoName} already exists, trying next name...`,
          );
          attempt++;
          continue;
        }

        // Other 422 errors - provide more detailed feedback
        const message = errorData.message || 'Invalid repository configuration';
        const details = errorData.errors
          ? JSON.stringify(errorData.errors)
          : '';
        throw new Error(
          `Repository creation failed: ${message}${details ? '. Details: ' + details : ''}`,
        );
      }

      // Handle other errors
      if (response.status === 401) {
        throw new Error('Authentication failed. Please login again.');
      } else if (response.status === 403) {
        throw new Error(
          'Permission denied. You may have reached your repository limit.',
        );
      } else {
        const message = errorData.message || response.statusText;
        throw new Error(
          `Failed to create repository (${response.status}): ${message}`,
        );
      }
    }

    throw new Error(
      `Unable to create repository after ${maxAttempts} attempts. Please try a different name.`,
    );
  }

  async uploadContent(repoName) {
    const token = tokenManager.getTokenString();
    if (!token) {
      throw new Error('No authentication token available');
    }

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
          content: this.encodeBase64Unicode(htmlContent),
          committer: {
            name: this.user.name || this.user.login,
            email:
              this.user.email || `${this.user.login}@users.noreply.github.com`,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 401) {
        throw new Error('Authentication failed. Please login again.');
      } else if (response.status === 403) {
        throw new Error(
          'Permission denied. You may not have write access to this repository.',
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
    // Extract title from content or use repo name
    const titleMatch = this.content.match(/^#\s+(.+)$/m);
    const siteTitle = this.repoName || (titleMatch ? titleMatch[1] : 'My Site');

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${SecureHTML.escapeText(siteTitle)}</title>
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
        <h1>${SecureHTML.escapeText(siteTitle)}</h1>
        <p>Created with ❤️ using MDSG</p>
    </div>

    <article class="markdown-body">
        ${this.markdownToHTML(this.content)}
    </article>

    <footer class="site-footer">
        <p>
            Generated with <a href="https://mdsg.daza.ar" target="_blank" rel="noopener">MDSG</a> •
            <a href="https://github.com/${this.user?.login || 'unknown'}" target="_blank" rel="noopener">${this.user?.login || 'Unknown User'}</a> •
            ${new Date().toLocaleDateString()}
        </p>
    </footer>
</body>
</html>`;
  }

  // Legacy escapeHtml method - now using SecureHTML.escapeText
  escapeHtml(text) {
    return SecureHTML.escapeText(text);
  }

  encodeBase64Unicode(str) {
    // Handle Unicode characters by converting to UTF-8 bytes first
    return btoa(
      encodeURIComponent(str).replace(
        /%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
          return String.fromCharCode('0x' + p1);
        },
      ),
    );
  }

  async enableGitHubPages(repoName) {
    const token = tokenManager.getTokenString();
    if (!token) {
      throw new Error('No authentication token available');
    }
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
      },
    );

    if (!response.ok && response.status !== 409) {
      // 409 means already enabled
      const errorData = await response.json();
      throw new Error(
        `Failed to enable GitHub Pages: ${errorData.message || response.status}`,
      );
    }
  }

  showDeploymentProgress(message) {
    const mainContent = document.getElementById('main-content');
    const progressHTML = `
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
    SecureHTML.sanitizeAndRender(progressHTML, mainContent);
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
    const successHTML = `
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
    // Handle testing environment where DOM may not exist
    if (typeof document === 'undefined') {
      console.error('Error:', message);
      return;
    }

    const mainContent = document.getElementById('main-content');
    if (!mainContent) {
      console.error('Error (no main-content):', message);
      return;
    }

    try {
      const existingError = document.querySelector(
        '.error-banner, .success-banner',
      );

      if (existingError) {
        existingError.remove();
      }

      const bannerClass =
        type === 'success' ? 'success-banner' : 'error-banner';
      const icon = type === 'success' ? '✅' : '⚠️';

      const errorBanner = document.createElement('div');
      errorBanner.className = bannerClass;
      const bannerHTML = `
      <span>${SecureHTML.escapeText(icon)} ${SecureHTML.escapeText(message)}</span>
      <button onclick="this.parentElement.remove()">×</button>
    `;
      SecureHTML.sanitizeAndRender(bannerHTML, errorBanner);

      if (
        mainContent.insertBefore &&
        typeof mainContent.insertBefore === 'function'
      ) {
        mainContent.insertBefore(errorBanner, mainContent.firstChild);

        // Auto-remove after 10 seconds
        setTimeout(() => {
          if (errorBanner.parentElement) {
            errorBanner.remove();
          }
        }, 10000);
      }
    } catch (error) {
      console.error('Error showing error banner:', error.message);
    }
  }

  showErrorWithRetry(message, retryCallback) {
    // Handle testing environment where DOM may not exist
    if (typeof document === 'undefined') {
      console.error('Error with retry:', message);
      return;
    }

    const mainContent = document.getElementById('main-content');
    if (!mainContent) {
      console.error('Error with retry (no main-content):', message);
      return;
    }

    const existingError = document.querySelector(
      '.error-banner, .success-banner',
    );

    if (existingError) {
      existingError.remove();
    }

    const errorBanner = document.createElement('div');
    errorBanner.className = 'error-banner';
    const retryHTML = `
      <div class="error-content">
        <span>⚠️ ${SecureHTML.escapeText(message)}</span>
        <div class="error-actions">
          <button class="retry-btn" onclick="this.closest('.error-banner').remove()">Try Again</button>
          <button onclick="this.closest('.error-banner').remove()">×</button>
        </div>
      </div>
    `;
    SecureHTML.sanitizeAndRender(retryHTML, errorBanner);

    // Add retry functionality
    const retryBtn = errorBanner.querySelector('.retry-btn');
    if (retryBtn && retryCallback) {
      retryBtn.addEventListener('click', () => {
        errorBanner.remove();
        retryCallback();
      });
    }

    mainContent.insertBefore(errorBanner, mainContent.firstChild);

    // Auto-remove after 15 seconds (longer for retry)
    setTimeout(() => {
      if (errorBanner.parentElement) {
        errorBanner.remove();
      }
    }, 15000);
  }

  showLoading(message) {
    const mainContent = document.getElementById('main-content');
    const loadingHTML = `
      <div class="loading-section">
        <div class="spinner"></div>
        <p>${SecureHTML.escapeText(message)}</p>
        <div class="loading-progress">
          <div class="progress-dots">
            <span class="dot active"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
        </div>
      </div>
    `;
    SecureHTML.sanitizeAndRender(loadingHTML, mainContent);
  }

  showExpiryWarning() {
    const timeUntilExpiry = tokenManager.getTimeUntilExpiry();
    const minutesLeft = Math.floor(timeUntilExpiry / (60 * 1000));

    this.showError(
      `⚠️ Your session expires in ${minutesLeft} minutes. Please save your work.`,
      'warning',
    );
  }

  animateLoadingDots() {
    const dots = document.querySelectorAll('.progress-dots .dot');
    let currentDot = 0;

    const interval = setInterval(() => {
      // Remove active class from all dots
      dots.forEach(dot => dot.classList.remove('active'));

      // Add active class to current dot
      if (dots[currentDot]) {
        dots[currentDot].classList.add('active');
      }

      currentDot = (currentDot + 1) % dots.length;

      // Stop animation if loading section is removed
      if (!document.querySelector('.loading-section')) {
        clearInterval(interval);
      }
    }, 500);
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

    // Show login UI only if we're in a browser environment
    if (typeof document !== 'undefined') {
      this.setupUI();
    }

    // Show error to user
    this.showError(message);
  }
}

// Start the app (no OAuth callback needed with PAT flow)
// Only start if not in test environment
if (typeof process === 'undefined' || process.env.NODE_ENV !== 'test') {
  new MDSG();
}

// Export MDSG class for testing
export default MDSG;
