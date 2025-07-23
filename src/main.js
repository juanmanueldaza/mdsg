// Import styles for Vite processing
import '../style.css';

import { MinimalSecurity } from '@security';
import { MarkdownProcessor } from '@markdown';
import { UIComponentBuilder } from '@ui';
import { AuthenticationState, ContentState } from '@state';
import {
  serviceRegistry,
  getAuthService,
  getGitHubService,
  getDeploymentService,
} from '@registry';
import { EventHandlerService, eventBus, MDSG_EVENTS } from '@handlers';

class MDSG {
  constructor() {
    this.services = serviceRegistry;
    this.services.initialize();

    this.auth = new AuthenticationState();
    this.contentState = new ContentState();

    this.eventHandler = null;

    this.existingSites = [];
    this.currentSite = null;
    this.isMobile = this.detectMobile();
    this.isTouch = this.detectTouch();
    this.csrfToken = this.generateCSRFToken();

    this.services.setProgressCallback((message, percentage) => {
      this.updateDeploymentProgress(message, percentage);
    });

    this.init();
  }

  get authenticated() {
    return this.auth.authenticated;
  }
  get user() {
    return this.auth.user;
  }
  get token() {
    return this.auth.token;
  }
  get content() {
    return this.contentState.content;
  }
  get repoName() {
    return this.contentState.repoName;
  }

  set authenticated(value) {
    if (value) {
      // Authentication state already handled by auth service
    } else {
      this.auth.clearAuthentication();
    }
  }
  set user(value) {
    this.auth.user = value;
  }
  set token(value) {
    this.auth.token = value;
  }
  set content(value) {
    this.contentState.setContent(value);
  }
  set repoName(value) {
    this.contentState.setRepoName(value);
  }

  detectMobile() {
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

  detectTouch() {
    if (typeof global !== 'undefined' && global.window) {
      return 'ontouchstart' in global.window;
    }

    if (typeof window === 'undefined') {
      return false;
    }
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  init() {
    try {
      this.setupUI();
      this.checkAuth();
      this.setupErrorHandling();
    } catch (error) {
      this.showFallbackUI();
    }
  }

  setupErrorHandling() {
    window.addEventListener('error', event => {
      if (
        event.filename &&
        (event.filename.includes('extension://') ||
          event.filename.includes('chrome-extension://') ||
          event.filename.includes('moz-extension://'))
      ) {
        event.preventDefault();
        return false;
      }
    });
  }

  showFallbackUI() {
    const app = document.getElementById('app');
    if (app) {
      app.innerHTML = `
        <div class="container">
          <div class="error-fallback">
            <h2>⚠️ Loading Error</h2>
            <p>Please refresh the page to try again.</p>
            <button onclick="window.location.reload()">Refresh Page</button>
          </div>
        </div>
      `;
    }
  }

  setupUI() {
    const app = document.getElementById('app');
    const interfaceHTML = UIComponentBuilder.buildMainInterface();
    MinimalSecurity.sanitizeAndRender(interfaceHTML, app);

    this.initializeEventSystem();
  }

  initializeEventSystem() {
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
      return;
    }

    if (this.eventHandler) {
      this.eventHandler.cleanup();
    }

    try {
      this.eventHandler = new EventHandlerService(
        getAuthService(),
        getGitHubService(),
        getDeploymentService(),
        this.contentState,
        this,
      );

      this.eventHandler.initialize();

      this.setupEventBusSubscriptions();
    } catch (error) {
      this.setupFallbackEventHandlers();
    }
  }

  setupFallbackEventHandlers() {
    document.getElementById('login-btn')?.addEventListener('click', () => {
      this.loginWithGitHub();
    });

    document.getElementById('demo-btn')?.addEventListener('click', () => {
      this.startDemoMode();
    });

    // Add fallback for save-token button
    document.getElementById('save-token')?.addEventListener('click', () => {
      this.savePersonalToken();
    });

    // Add fallback for cancel-token button
    document.getElementById('cancel-token')?.addEventListener('click', () => {
      this.showWelcomeScreen();
    });
  }

  setupEventBusSubscriptions() {
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
      return;
    }

    eventBus.on(MDSG_EVENTS.AUTH_LOGIN_SUCCESS, event => {
      this.handleAuthenticationSuccess(event);
    });

    eventBus.on(MDSG_EVENTS.AUTH_LOGOUT, event => {
      this.handleLogout(event);
    });

    eventBus.on(MDSG_EVENTS.CONTENT_UPDATED, event => {
      console.log(
        '📨 CONTENT_UPDATED event received:',
        event.content?.substring(0, 50),
      );
      this.handleContentUpdate(event);
    });

    eventBus.on(MDSG_EVENTS.PREVIEW_UPDATE, _event => {
      console.log('📨 PREVIEW_UPDATE event received');
      this.updatePreview();
    });

    eventBus.on(MDSG_EVENTS.AUTOSAVE_REQUESTED, _event => {
      this.autoSave();
    });

    eventBus.on(MDSG_EVENTS.DEPLOYMENT_START, event => {
      this.handleDeploymentStart(event);
    });

    eventBus.on(MDSG_EVENTS.DEPLOYMENT_SUCCESS, event => {
      this.handleDeploymentSuccess(event);
    });

    eventBus.on(MDSG_EVENTS.DEPLOYMENT_ERROR, event => {
      this.handleDeploymentError(event);
    });

    eventBus.on(MDSG_EVENTS.GLOBAL_ERROR, event => {
      this.handleGlobalError(event);
    });
  }

  handleAuthenticationSuccess(_event) {
    this.showEditor();
  }

  handleLogout(_event) {
    this.clearAuthenticationState();
    this.setupUI();
  }

  handleContentUpdate(event) {
    console.log(
      '📝 handleContentUpdate() called, new content:',
      event.content?.substring(0, 50),
    );
    this.content = event.content;
    this.updateWordCount();
  }

  handleDeploymentStart(_event) {
    console.log('📡 handleDeploymentStart called!', _event);
    this.showError('Deploying to GitHub Pages...', 'info');
  }

  handleDeploymentSuccess(_event) {
    console.log('✅ handleDeploymentSuccess called!', _event);
    this.showError('Site deployed successfully!', 'success');
  }

  handleDeploymentError(event) {
    console.log('❌ handleDeploymentError called!', event);
    this.showError(`Deployment failed: ${event.error}`, 'error');
  }

  handleGlobalError(_event) {
    this.showError('An unexpected error occurred', 'error');
  }

  showMainInterface() {
    this.showEditor();
  }

  showWelcomeScreen() {
    this.setupUI();
  }

  clearEditor() {
    const editor = document.getElementById('markdown-editor');
    if (editor) {
      editor.value = '';
      this.content = '';
      this.updatePreview();
      this.updateWordCount();
    }
  }

  updateEditorContent() {
    const editor = document.getElementById('markdown-editor');
    if (editor) {
      editor.value = this.contentState.content;
      this.content = this.contentState.content;
      this.updatePreview();
      this.updateWordCount();
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

  resetForNewSite() {
    this.content = '';
    this.clearEditor();
    this.setupUI();
  }

  showErrorMessage(message, type = 'error', duration = 5000) {
    this.showError(message, type, duration);
  }

  getLoginUI() {
    return UIComponentBuilder.buildLoginInterface();
  }

  getEditorUI() {
    return UIComponentBuilder.buildEditorInterface(
      this.auth.user,
      this.contentState.content,
    );
  }

  checkAuth() {
    const authService = getAuthService();

    if (authService.isAuthenticated()) {
      const user = authService.getCurrentUser();
      const token = authService.getCurrentToken();

      this.auth.setAuthenticated(user, token);
      this.authenticated = true;
      this.user = user;
      this.token = token;

      this.showEditor();
      return true;
    } else {
      this.clearAuthenticationState();
      this.setupLoginHandler();
      return false;
    }
  }

  isValidToken(token) {
    const authService = getAuthService();
    return authService.isValidToken(token);
  }

  clearAuthenticationState() {
    const authService = getAuthService();
    authService.logout();

    this.auth.clearAuthentication();
    this.authenticated = false;
  }

  generateCSRFToken() {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  setupLoginHandler() {}

  loginWithGitHub() {
    if (this.authenticated) {
      return;
    }

    this.showTokenInput();
  }

  showTokenInput() {
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

    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      MinimalSecurity.sanitizeAndRender(tokenInputHTML, mainContent, {
        trusted: true,
      });
    }

    if (this.eventHandler) {
      this.eventHandler.reinitialize();
    }
  }

  async savePersonalToken() {
    const tokenInput = document.getElementById('token-input');
    const saveButton = document.getElementById('save-token');
    const token = tokenInput?.value.trim();

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

    if (saveButton) {
      saveButton.disabled = true;
      saveButton.textContent = '🔄 Validating...';
    }

    try {
      this.showLoading('Signing you in...');

      const authService = getAuthService();
      const userData = await authService.validateTokenWithGitHub(token);

      authService.setAuthenticated(userData, token);

      this.auth.setAuthenticated(userData, token);
      this.token = token;
      this.user = userData;
      this.authenticated = true;

      this.showEditor();
    } catch (error) {
      const authService = getAuthService();
      const errorMsg = authService.getAuthenticationErrorMessage(error);

      this.showErrorWithRetry(errorMsg, () => {
        this.showTokenInput();
      });
    } finally {
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
    this.setupUI();
  }

  startDemoMode() {
    const authService = getAuthService();
    const demoUser = authService.setDemoMode();

    this.auth.setAuthenticated(demoUser, 'demo-token');
    this.user = demoUser;
    this.authenticated = true;

    const sampleContent = `# Welcome to MDSG Demo! 🚀

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
> This is a blockquote - perfect for highlighting important information!

*Happy creating with MDSG!* 🎉`;

    this.contentState.setContent(sampleContent);
    this.content = sampleContent;

    this.showEditor();
    this.updatePreview();
    this.updateWordCount();
  }

  async fetchUser(token) {
    try {
      this.showLoading('Fetching user profile...');

      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'MDSG-App',
        },
      });

      if (response.ok) {
        const userData = await response.json();

        this.user = {
          ...userData,
          displayName: userData.name || userData.login,
          avatarUrl: userData.avatar_url,
          profileUrl: userData.html_url,
          tokenValid: true,
          lastAuthenticated: new Date().toISOString(),
        };

        this.authenticated = true;
        this.showEditor();
      } else {
        const _errorData = await response.json().catch(() => ({}));

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
      this.handleAuthError('Network error during authentication');
    }
  }

  showEditor() {
    const mainContent = document.getElementById('main-content');
    MinimalSecurity.sanitizeAndRender(this.getEditorUI(), mainContent);
    this.setupEditorHandlers();
    this.updatePreview();

    // Reinitialize event handlers for new DOM elements
    if (this.eventHandler) {
      this.eventHandler.reinitialize();
    }
  }

  setupEditorHandlers() {
    this.loadSavedContent();
  }

  updatePreview() {
    console.log(
      '🔄 updatePreview() called, content:',
      this.content?.substring(0, 50),
    );
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
        MinimalSecurity.sanitizeAndRender(emptyHTML, preview);
      } else {
        const sanitizedHTML = MinimalSecurity.sanitizeHTML(
          this.markdownToHTML(this.content),
        );
        preview.innerHTML = sanitizedHTML;
      }

      this.syncPreviewScroll();
    }
  }

  markdownToHTML(markdown) {
    if (!markdown) return '';

    const processedHTML = MarkdownProcessor.process(markdown);

    return MinimalSecurity.sanitizeHTML(processedHTML);
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
      if (MinimalSecurity.storeContent(this.content)) {
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
      } else {
        throw new Error('Content validation failed');
      }
    } catch (error) {
      const status = document.getElementById('auto-save-status');
      if (status) {
        status.textContent = 'Auto-save: Failed';
        status.style.color = '#dc3545';
      }
    }
  }

  loadSavedContent() {
    try {
      const savedContent = MinimalSecurity.getStoredContent();
      if (savedContent && savedContent !== this.content) {
        this.content = savedContent;
        const editor = document.getElementById('markdown-editor');
        if (editor) {
          editor.value = this.content;
        }
        this.updatePreview();
        this.updateWordCount();
      }
    } catch (error) {}
  }

  validateContent() {
    const statusElement = document.getElementById('auto-save-status');
    if (!statusElement) return true;

    const isValid = MinimalSecurity.validateContent(this.content);

    if (!isValid) {
      this.showValidationStatus(
        'Content validation failed: Content contains dangerous patterns',
        'error',
      );
      return false;
    }

    if (this.content.length === 0) {
      this.showValidationStatus('Write some content to get started', 'info');
    } else if (this.content.length > 500000) {
      this.showValidationStatus(
        'Large content - may take time to deploy',
        'warning',
      );
    } else {
      this.showValidationStatus(
        `Content looks good! (${(this.content.length / 1024).toFixed(1)}KB)`,
        'success',
      );
    }

    return true;
  }

  showValidationStatus(message, type) {
    const statusElement = document.getElementById('auto-save-status');
    if (!statusElement) return;

    statusElement.textContent = message;

    statusElement.classList.remove(
      'validation-info',
      'validation-warning',
      'validation-success',
      'validation-error',
    );

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
      case 'error':
        statusElement.classList.add('validation-error');
        break;
    }

    const resetTime = type === 'error' ? 5000 : 3000;
    setTimeout(() => {
      if (statusElement.textContent === message) {
        statusElement.textContent = 'Auto-save: Ready';
        statusElement.classList.remove(
          'validation-info',
          'validation-warning',
          'validation-success',
          'validation-error',
        );
      }
    }, resetTime);
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

    if (this.content.length > 100000) {
      this.showError(
        'Content is too large. Please reduce the content size to under 100KB.',
      );
      return;
    }

    if (!this.repoName) {
      const timestamp = Date.now().toString().slice(-6);
      const defaultName = `mdsg-site-${timestamp}`;
      const repoName = prompt(
        'Enter a name for your GitHub repository:',
        defaultName,
      );

      if (!repoName) {
        return;
      }

      if (!MinimalSecurity.validateRepoName(repoName)) {
        this.showError(
          'Repository name validation failed: Invalid characters or length',
        );
        return;
      }

      this.repoName = repoName;
    }

    const deployBtn = document.getElementById('deploy-btn');
    const originalText = deployBtn.textContent;
    deployBtn.disabled = true;

    this.showDeploymentProgress('Preparing deployment...');

    try {
      const deploymentService = getDeploymentService();

      const siteInfo = await deploymentService.deployToGitHubPages(
        this.content,
        this.repoName,
        {
          description: `My markdown site created with MDSG on ${new Date().toLocaleDateString()}`,
          autoNaming: true,
        },
      );

      deployBtn.textContent = '✅ Deployed!';
      setTimeout(() => {
        this.showSuccessFromSiteInfo(siteInfo);
      }, 1000);
    } catch (error) {
      this.hideDeploymentProgress();

      this.showError(error.message);
    } finally {
      deployBtn.textContent = originalText;
      deployBtn.disabled = false;
    }
  }
  escapeHtml(text) {
    return MinimalSecurity.escapeText(text);
  }

  generateSiteHTML() {
    try {
      const deploymentService = getDeploymentService();
      return deploymentService.generateSiteHTML(this.content);
    } catch (error) {
      if (error.message.includes('User information required')) {
        return this.generateBasicHTML();
      }
      throw error;
    }
  }

  generateBasicHTML() {
    const titleMatch = this.content.match(/^#\s+(.+)$/m);
    const siteTitle = this.repoName || (titleMatch ? titleMatch[1] : 'My Site');

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${MinimalSecurity.escapeText(siteTitle)}</title>
</head>
<body>
<article class="markdown-body">
${this.markdownToHTML(this.content)}
</article>
</body>
</html>`;
  }

  encodeBase64Unicode(str) {
    return btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
        return String.fromCharCode(`0x${p1}`);
      }),
    );
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
    MinimalSecurity.sanitizeAndRender(progressHTML, mainContent);
  }

  updateDeploymentProgress(message, percentage) {
    const progressMessage = document.getElementById('progress-message');
    const progressFill = document.getElementById('progress-fill');
    const progressPercentage = document.getElementById('progress-percentage');

    if (progressMessage) progressMessage.textContent = message;
    if (progressFill) progressFill.style.width = `${percentage}%`;
    if (progressPercentage) progressPercentage.textContent = `${percentage}%`;

    const stepNumber = Math.ceil(percentage / 25);
    for (let i = 1; i <= stepNumber && i <= 4; i++) {
      const step = document.getElementById(`step-${i}`);
      if (step) step.classList.add('completed');
    }
  }

  hideDeploymentProgress() {}

  showSuccess(repo) {
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

    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      MinimalSecurity.sanitizeAndRender(successHTML, mainContent);
    }

    if (this.eventHandler) {
      this.eventHandler.reinitialize();
    }
  }

  showSuccessFromSiteInfo(siteInfo) {
    const successHTML = `
      <div class="success-section">
        <div class="success-header">
          <h2>🎉 Site Deployed Successfully!</h2>
          <p>Your markdown site is now live on GitHub Pages!</p>
        </div>

        <div class="site-info">
          <div class="site-url">
            <label>🌐 Live Site URL:</label>
            <a href="${siteInfo.url}" target="_blank" class="site-link">
              ${siteInfo.url}
            </a>
          </div>

          <div class="repo-info">
            <label>📁 Repository:</label>
            <a href="${siteInfo.repoUrl}" target="_blank" class="repo-link">
              ${siteInfo.repoUrl.replace('https://github.com/', '')}
            </a>
          </div>
        </div>

        <div class="deployment-stats">
          <div class="stat">
            <span class="stat-label">Repository Created:</span>
            <span class="stat-value">✅ ${siteInfo.name}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Deployment Time:</span>
            <span class="stat-value">🚀 ${new Date(siteInfo.deployedAt).toLocaleTimeString()}</span>
          </div>
        </div>

        <div class="success-note">
          <p><strong>⏰ Please note:</strong> It may take 1-2 minutes for your site to be fully available.</p>
          <p>GitHub Pages needs time to build and deploy your site.</p>
        </div>

        <div class="success-actions">
          <a href="${siteInfo.url}" target="_blank" class="primary-btn">
            🌐 View Live Site
          </a>
          <a href="${siteInfo.repoUrl}" target="_blank" class="secondary-btn">
            📁 View Repository
          </a>
          <button id="create-another" class="secondary-btn">✨ Create Another Site</button>
        </div>
      </div>
    `;

    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      MinimalSecurity.sanitizeAndRender(successHTML, mainContent);
    }

    if (this.eventHandler) {
      this.eventHandler.reinitialize();
    }
  }

  showError(message, type = 'error') {
    if (typeof document === 'undefined') {
      return;
    }

    const mainContent = document.getElementById('main-content');
    if (!mainContent) {
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
      <span>${MinimalSecurity.escapeText(icon)} ${MinimalSecurity.escapeText(message)}</span>
      <button onclick="this.parentElement.remove()">×</button>
    `;
      MinimalSecurity.sanitizeAndRender(bannerHTML, errorBanner);

      if (
        mainContent.insertBefore &&
        typeof mainContent.insertBefore === 'function'
      ) {
        mainContent.insertBefore(errorBanner, mainContent.firstChild);

        setTimeout(() => {
          if (errorBanner.parentElement) {
            errorBanner.remove();
          }
        }, 10000);
      }
    } catch (error) {}
  }

  showErrorWithRetry(message, retryCallback) {
    if (typeof document === 'undefined') {
      return;
    }

    const mainContent = document.getElementById('main-content');
    if (!mainContent) {
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
        <span>⚠️ ${MinimalSecurity.escapeText(message)}</span>
        <div class="error-actions">
          <button class="retry-btn" onclick="this.closest('.error-banner').remove()">Try Again</button>
          <button onclick="this.closest('.error-banner').remove()">×</button>
        </div>
      </div>
    `;
    MinimalSecurity.sanitizeAndRender(retryHTML, errorBanner);

    const retryBtn = errorBanner.querySelector('.retry-btn');
    if (retryBtn && retryCallback) {
      retryBtn.addEventListener('click', () => {
        errorBanner.remove();
        retryCallback();
      });
    }

    mainContent.insertBefore(errorBanner, mainContent.firstChild);

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
        <p>${MinimalSecurity.escapeText(message)}</p>
        <div class="loading-progress">
          <div class="progress-dots">
            <span class="dot active"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
        </div>
      </div>
    `;
    MinimalSecurity.sanitizeAndRender(loadingHTML, mainContent);
  }

  animateLoadingDots() {
    const dots = document.querySelectorAll('.progress-dots .dot');
    let currentDot = 0;

    const interval = setInterval(() => {
      dots.forEach(dot => dot.classList.remove('active'));

      if (dots[currentDot]) {
        dots[currentDot].classList.add('active');
      }

      currentDot = (currentDot + 1) % dots.length;

      if (!document.querySelector('.loading-section')) {
        clearInterval(interval);
      }
    }, 500);
  }

  logout() {
    this.clearAuthenticationState();

    this.content = '';

    this.setupUI();
  }

  handleAuthError(message = 'Authentication failed') {
    this.clearAuthenticationState();

    if (typeof document !== 'undefined') {
      this.setupUI();
    }

    this.showError(message);
  }

  cleanup() {
    if (this.eventHandler) {
      this.eventHandler.cleanup();
      this.eventHandler = null;
    }

    if (this.inputTimer) clearTimeout(this.inputTimer);
    if (this.validationTimer) clearTimeout(this.validationTimer);
  }

  getSystemStats() {
    const baseStats = {
      mdsgVersion: '2.0.0-observable',
      authenticated: this.authenticated,
      contentLength: this.content?.length || 0,
      isMobile: this.isMobile,
      bundleOptimized: true,
    };

    if (this.eventHandler) {
      baseStats.eventSystem = this.eventHandler.getStats();
    }

    if (this.services) {
      baseStats.services = this.services.getStats?.() || 'Available';
    }

    return baseStats;
  }
}

if (typeof process === 'undefined' || process.env.NODE_ENV !== 'test') {
  new MDSG();
}

export default MDSG;
