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
        <button id="login-btn" class="primary-btn">
          Login with GitHub
        </button>
        <p>Sign in to create your markdown site</p>
      </div>
    `;
  }

  getEditorUI() {
    return `
      <div class="editor-section">
        <div class="user-info">
          <span>👋 Hello, ${this.user.login}</span>
          <button id="logout-btn" class="secondary-btn">Logout</button>
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
    // Simple check for existing auth
    const token = localStorage.getItem('github_token');
    if (token) {
      this.fetchUser(token);
    } else {
      this.setupLoginHandler();
    }
  }

  setupLoginHandler() {
    document.getElementById('login-btn')?.addEventListener('click', () => {
      this.loginWithGitHub();
    });
  }

  loginWithGitHub() {
    // Redirect to GitHub OAuth
    const clientId = 'Ov23liKZ8KgfLQDZFGSR'; // Default demo client ID
    const redirectUri = encodeURIComponent(window.location.origin);
    const scope = 'repo user';

    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    window.location.href = authUrl;
  }

  async fetchUser(token) {
    try {
      this.showLoading('Authenticating...');

      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (response.ok) {
        this.user = await response.json();
        this.authenticated = true;
        this.showEditor();
      } else {
        this.handleAuthError('Failed to authenticate with GitHub');
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
    localStorage.removeItem('github_token');
    this.authenticated = false;
    this.user = null;
    this.content = '';
    this.setupUI();
  }

  handleAuthError(message = 'Authentication failed') {
    localStorage.removeItem('github_token');
    this.authenticated = false;
    this.user = null;
    this.setupUI();
    this.showError(message);
  }
}

// Handle OAuth callback
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');

if (code) {
  console.log('OAuth code received, exchanging for token...');

  // Remove the code from URL immediately
  window.history.replaceState({}, document.title, window.location.pathname);

  // Exchange code for token via backend
  exchangeCodeForToken(code);
}

async function exchangeCodeForToken(code) {
  try {
    const response = await fetch('/auth/github', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('github_token', data.access_token);
      // Reload to trigger auth check
      window.location.reload();
    } else {
      console.error('Failed to exchange code for token');
      alert('Authentication failed. Please try again.');
    }
  } catch (error) {
    console.error('OAuth error:', error);
    alert('Authentication failed. Please try again.');
  }
}

// Start the app
new MDSG();
