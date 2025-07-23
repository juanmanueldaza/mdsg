export class UIComponentBuilder {
  static buildMainInterface() {
    return `
      <div class="container">
        <header>${this.buildHeader()}</header>
        <main id="main-content">${this.buildLoginInterface()}</main>
      </div>
    `;
  }
  static buildHeader() {
    return `
      <h1>📝 MDSG</h1>
      <p>Create GitHub Pages sites from markdown</p>
    `;
  }
  static buildLoginInterface() {
    return `
      <div class="login-section">
        ${this.buildLoginHeader()}
        ${this.buildLoginContent()}
      </div>
    `;
  }
  static buildLoginHeader() {
    return `
      <div class="login-header">
        <h2>🚀 Welcome to MDSG</h2>
        <p>Create beautiful GitHub Pages sites from markdown</p>
      </div>
    `;
  }
  static buildLoginContent() {
    return `
      <div class="login-content">
        ${this.buildFeaturesList()}
        ${this.buildLoginActions()}
        ${this.buildLoginDescription()}
      </div>
    `;
  }
  static buildFeaturesList() {
    const features = [
      { icon: '✨', text: 'Live markdown preview' },
      { icon: '🔧', text: 'One-click deployment' },
      { icon: '🌐', text: 'Your own GitHub Pages site' },
    ];

    const featureItems = features
      .map(feature => this.buildFeatureItem(feature))
      .join('');

    return `<div class="features-list">${featureItems}</div>`;
  }
  static buildFeatureItem({ icon, text }) {
    return `
      <div class="feature-item">
        <span class="feature-icon">${icon}</span>
        <span>${text}</span>
      </div>
    `;
  }
  static buildLoginActions() {
    return `
      <div class="login-options">
        ${this.buildLoginButton()}
        ${this.buildDemoOption()}
      </div>
    `;
  }
  static buildLoginButton() {
    return `
      <button id="login-btn" class="primary-btn login-button">
        <span class="github-icon">🔑</span>
        Login with GitHub
      </button>
    `;
  }
  static buildDemoOption() {
    return `
      <div class="demo-option">
        <p>Want to try it first?</p>
        <button id="demo-btn" class="secondary-btn demo-button">
          <span>🎮</span>
          Try Demo Mode
        </button>
      </div>
    `;
  }
  static buildLoginDescription() {
    return `
      <p class="login-description">Sign in to create your markdown site in minutes</p>
      <div class="security-note">
        <small>🔒 Secure OAuth authentication • No passwords stored</small>
      </div>
    `;
  }
  static buildEditorInterface(user, content = '') {
    return `
      <div class="editor-section">
        ${this.buildUserInfo(user)}
        ${this.buildEditorContainer(content)}
        ${this.buildDeploymentActions()}
      </div>
    `;
  }
  static buildUserInfo(user) {
    return `
      <div class="user-info">
        ${this.buildUserProfile(user)}
        ${this.buildHeaderActions()}
      </div>
    `;
  }
  static buildUserProfile(user) {
    return `
      <div class="user-profile">
        <img src="${user.avatar_url}" alt="${user.login}" class="user-avatar">
        <div class="user-details">
          <span class="user-greeting">👋 Hello, <strong>${user.name || user.login}</strong></span>
          <span class="user-login">@${user.login}</span>
        </div>
      </div>
    `;
  }
  static buildHeaderActions() {
    return `
      <div class="header-actions">
        <button id="logout-btn" class="secondary-btn logout-button">
          <span>🚪</span> Logout
        </button>
      </div>
    `;
  }
  static buildEditorContainer(content = '') {
    return `
      <div class="editor-container">
        ${this.buildEditorPane(content)}
        ${this.buildPreviewPane()}
      </div>
    `;
  }
  static buildEditorPane(content = '') {
    return `
      <div class="editor-pane">
        ${this.buildEditorHeader()}
        ${this.buildEditorTextarea(content)}
      </div>
    `;
  }
  static buildEditorHeader() {
    return `
      <div class="editor-header">
        <h3>📝 Write your markdown</h3>
        <div class="editor-tools">
          <button id="clear-btn" class="tool-btn" title="Clear content">🗑️</button>
          <button id="sample-btn" class="tool-btn" title="Load sample content">📄</button>
          <span class="word-count" id="word-count">0 words</span>
        </div>
      </div>
    `;
  }
  static buildEditorTextarea(content = '') {
    const placeholderContent = `# My Awesome Site

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

> Start typing to see the live preview! ✨`;

    return `
      <textarea id="markdown-editor"
        placeholder="${placeholderContent}"
        spellcheck="true"
        autocomplete="off"
        rows="20">${content}</textarea>
      <div class="editor-status">
        <span class="char-count" id="char-count">0 characters</span>
        <span class="auto-save-status" id="auto-save-status">Auto-save: Ready</span>
      </div>
    `;
  }
  static buildPreviewPane() {
    return `
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
    `;
  }
  static buildPreviewHeader() {
    return `
      <div class="preview-header">
        <h3>👁️ Live Preview</h3>
        <div class="preview-tools">
          <button id="preview-mode" class="tool-btn active" title="Toggle preview mode">📱</button>
          <button id="fullscreen-preview" class="tool-btn" title="Fullscreen preview">🔍</button>
        </div>
      </div>
    `;
  }
  static buildPreviewContent() {
    return '<div id="preview" class="preview-content"></div>';
  }
  static buildEditorActions() {
    return `
      <div class="actions">
        <button id="editor-deploy-btn" class="primary-btn">
          🚀 Deploy to GitHub Pages
        </button>
      </div>
    `;
  }
  static buildDeploymentSection() {
    return `
      <div class="deployment-section">
        ${this.buildDeploymentHeader()}
        ${this.buildDeploymentForm()}
        ${this.buildExistingSites()}
      </div>
    `;
  }
  static buildDeploymentHeader() {
    return `
      <div class="deployment-header">
        <h3>🚀 Deploy Your Site</h3>
        <p>Create a new GitHub Pages site from your markdown content</p>
      </div>
    `;
  }
  static buildDeploymentForm() {
    return `
      <div class="deployment-form">
        <div class="form-group">
          <label for="repo-name">Repository Name</label>
          <input type="text" 
                 id="repo-name" 
                 class="repo-input"
                 placeholder="my-awesome-site"
                 maxlength="100"
                 autocomplete="off"
                 aria-describedby="repo-help">
          <small id="repo-help" class="form-help">
            Choose a unique name for your GitHub repository
          </small>
        </div>
        <button id="form-deploy-btn" class="primary-btn deploy-button" disabled>
          <span class="deploy-icon">🚀</span>
          <span class="deploy-text">Deploy to GitHub Pages</span>
        </button>
      </div>
    `;
  }
  static buildExistingSites() {
    return `
      <div class="existing-sites" id="existing-sites">
        <h4>📄 Your Existing Sites</h4>
        <div id="sites-list" class="sites-list">
          <div class="loading-sites">Loading your sites...</div>
        </div>
      </div>
    `;
  }
  static buildSiteCard(site) {
    return `
      <div class="site-card" data-repo="${site.name}">
        <div class="site-info">
          <h5 class="site-name">${site.name}</h5>
          <p class="site-description">${site.description || 'No description'}</p>
          <div class="site-meta">
            <span class="site-updated">Updated ${this.formatDate(site.updated_at)}</span>
            ${site.has_pages ? '<span class="site-status published">📡 Published</span>' : '<span class="site-status draft">📝 Draft</span>'}
          </div>
        </div>
        <div class="site-actions">
          ${site.has_pages ? `<a href="${site.homepage}" target="_blank" class="site-link">🌐 View Site</a>` : ''}
          <button class="edit-site-btn" data-repo="${site.name}">✏️ Edit</button>
        </div>
      </div>
    `;
  }
  static formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString();
  }
  static buildLoadingSpinner(message = 'Loading...') {
    return `
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-message">${message}</p>
      </div>
    `;
  }
  static buildErrorMessage(
    title,
    message,
    actionText = 'Try Again',
    actionId = 'retry-btn',
  ) {
    return `
      <div class="error-container">
        <div class="error-icon">⚠️</div>
        <h4 class="error-title">${title}</h4>
        <p class="error-message">${message}</p>
        <button id="${actionId}" class="primary-btn">${actionText}</button>
      </div>
    `;
  }
  static buildSuccessMessage(
    title,
    message,
    actionText = 'Continue',
    actionId = 'continue-btn',
  ) {
    return `
      <div class="success-container">
        <div class="success-icon">✅</div>
        <h4 class="success-title">${title}</h4>
        <p class="success-message">${message}</p>
        <button id="${actionId}" class="primary-btn">${actionText}</button>
      </div>
    `;
  }
  static buildDeploymentActions() {
    return `
      <div class="deployment-actions">
        <div class="deployment-info">
          <h4>🚀 Ready to publish?</h4>
          <p>Deploy your site to GitHub Pages with one click</p>
        </div>
        <div class="actions">
          <button id="main-deploy-btn" class="primary-btn deploy-button">
            <span class="deploy-icon">🚀</span>
            <span class="deploy-text">Deploy to GitHub Pages</span>
          </button>
        </div>
      </div>
    `;
  }
}
