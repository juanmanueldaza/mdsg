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
            <h3>Write your markdown:</h3>
            <textarea id="markdown-editor" placeholder="# My Awesome Site

Welcome to my site!

## About
Write something about yourself...

## Contact
- Email: your.email@example.com
- GitHub: github.com/yourusername">${this.content}</textarea>
          </div>

          <div class="preview-pane">
            <h3>Preview:</h3>
            <div id="preview"></div>
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

    editor?.addEventListener('input', e => {
      this.content = e.target.value;
      this.updatePreview();
    });

    deployBtn?.addEventListener('click', () => {
      this.deployToGitHub();
    });

    logoutBtn?.addEventListener('click', () => {
      this.logout();
    });
  }

  updatePreview() {
    const preview = document.getElementById('preview');
    if (preview) {
      // Simple markdown to HTML conversion
      preview.innerHTML = this.markdownToHTML(this.content);
    }
  }

  markdownToHTML(markdown) {
    // Enhanced markdown parsing
    return markdown
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/^\> (.*$)/gm, '<blockquote>$1</blockquote>')
      .replace(/^\- (.*$)/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      .replace(
        /\[([^\]]+)\]\(([^\)]+)\)/g,
        '<a href="$2" target="_blank">$1</a>'
      )
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^(.)/gm, '<p>$1')
      .replace(/(.*)$/gm, '$1</p>')
      .replace(/<p><\/p>/g, '')
      .replace(/<p>(<h[1-6]>.*<\/h[1-6]>)<\/p>/g, '$1')
      .replace(/<p>(<ul>.*<\/ul>)<\/p>/g, '$1')
      .replace(/<p>(<blockquote>.*<\/blockquote>)<\/p>/g, '$1');
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
