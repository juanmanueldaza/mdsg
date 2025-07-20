import { MinimalSecurity } from '@security';
import { MarkdownProcessor } from '@markdown';

export class DeploymentService {
  constructor(authenticationService, gitHubAPIService) {
    this.auth = authenticationService;
    this.github = gitHubAPIService;
    this.onProgress = null;
  }

  async deployToGitHubPages(content, repoName, options = {}) {
    if (!content || typeof content !== 'string') {
      throw new Error('Content is required for deployment');
    }

    if (!repoName || typeof repoName !== 'string') {
      throw new Error('Repository name is required for deployment');
    }

    if (!this.auth.isAuthenticated()) {
      throw new Error('Authentication required for deployment');
    }

    if (!this.validateContentForDeployment(content)) {
      throw new Error(
        'Content validation failed - contains potentially dangerous patterns',
      );
    }

    const deploymentOptions = {
      autoNaming: true,
      enablePages: true,
      maxNamingAttempts: 10,
      ...options,
    };

    try {
      this.updateProgress('Starting deployment...', 0);

      this.updateProgress('Creating repository...', 25);
      const repo = await this.createDeploymentRepository(
        repoName,
        deploymentOptions,
      );

      this.updateProgress('Uploading your content...', 50);
      await this.uploadSiteContent(repo.name, content);

      this.updateProgress('Enabling GitHub Pages...', 75);
      await this.enableSitePages(repo.name);

      this.updateProgress('Deployment complete!', 100);

      const siteInfo = this.generateSiteInfo(repo);

      return siteInfo;
    } catch (error) {
      throw this.enhanceDeploymentError(error);
    }
  }

  async createDeploymentRepository(baseName, options) {
    const sanitizedName = this.sanitizeRepositoryName(baseName);

    if (options.autoNaming) {
      return await this.github.createRepositoryWithAutoNaming(
        sanitizedName,
        options.description,
        options.maxNamingAttempts,
      );
    } else {
      return await this.github.createRepository(
        sanitizedName,
        options.description,
      );
    }
  }
  sanitizeRepositoryName(name) {
    return name
      .replace(/[^a-zA-Z0-9._-]/g, '-')
      .toLowerCase()
      .replace(/^[-._]+|[-._]+$/g, '')
      .slice(0, 100);
  }
  async uploadSiteContent(repoName, markdownContent) {
    const htmlContent = this.generateSiteHTML(markdownContent);

    return await this.github.uploadContent(
      repoName,
      'index.html',
      htmlContent,
      'Add site content via MDSG',
    );
  }
  generateSiteHTML(markdownContent) {
    const user = this.auth.getCurrentUser();
    if (!user) {
      throw new Error('User information required for site generation');
    }

    const siteTitle = this.extractSiteTitle(markdownContent);

    const htmlContent = MarkdownProcessor.process(markdownContent);

    return this.buildHTMLDocument(siteTitle, htmlContent, user);
  }
  extractSiteTitle(content) {
    const h1Match = content.match(/^#\s+(.+)$/m);
    if (h1Match) {
      return MinimalSecurity.escapeText(h1Match[1].trim());
    }

    const h2Match = content.match(/^##\s+(.+)$/m);
    if (h2Match) {
      return MinimalSecurity.escapeText(h2Match[1].trim());
    }

    return 'My MDSG Site';
  }
  buildHTMLDocument(title, content, user) {
    const currentDate = new Date().toLocaleDateString();
    const userName = MinimalSecurity.escapeText(user.login || 'Unknown User');
    const escapedTitle = MinimalSecurity.escapeText(title);

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapedTitle}</title>
    <meta name="description" content="A beautiful markdown site created with MDSG">
    <meta name="author" content="${userName}">
    <meta name="generator" content="MDSG - Markdown Site Generator">
    
    ${this.generateStylesheet()}
</head>
<body>
    <div class="site-header">
        <h1>${escapedTitle}</h1>
        <p>Created with ❤️ using MDSG</p>
    </div>

    <article class="markdown-body">
        ${content}
    </article>

    <footer class="site-footer">
        <p>
            Generated with <a href="https://mdsg.daza.ar" target="_blank" rel="noopener">MDSG</a> •
            <a href="https://github.com/${userName}" target="_blank" rel="noopener">${userName}</a> •
            ${currentDate}
        </p>
    </footer>
</body>
</html>`;
  }
  generateStylesheet() {
    return `<style>
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #24292f;
            background-color: #ffffff;
            margin: 0;
            padding: 2rem 1rem;
            max-width: 980px;
            margin: 0 auto;
        }

        .site-header {
            text-align: center;
            border-bottom: 1px solid #d0d7de;
            padding-bottom: 2rem;
            margin-bottom: 3rem;
        }

        .site-header h1 {
            color: #0969da;
            margin: 0 0 0.5rem 0;
            font-size: 2.5rem;
            font-weight: 600;
        }

        .site-header p {
            color: #656d76;
            margin: 0;
            font-size: 1.1rem;
        }

        .markdown-body {
            margin-bottom: 3rem;
        }

        .markdown-body h1 { font-size: 2rem; }
        .markdown-body h2 { font-size: 1.5rem; }
        .markdown-body h3 { font-size: 1.25rem; }
        .markdown-body h4 { font-size: 1rem; }
        .markdown-body h5 { font-size: 0.875rem; }
        .markdown-body h6 { font-size: 0.85rem; }

        .markdown-body h1, .markdown-body h2, .markdown-body h3,
        .markdown-body h4, .markdown-body h5, .markdown-body h6 {
            margin-top: 2rem;
            margin-bottom: 1rem;
            font-weight: 600;
            line-height: 1.25;
        }

        .markdown-body h1:first-child { margin-top: 0; }

        .markdown-body p { margin-bottom: 1rem; }

        .markdown-body ul, .markdown-body ol {
            padding-left: 2rem;
            margin-bottom: 1rem;
        }

        .markdown-body li { margin-bottom: 0.25rem; }

        .markdown-body blockquote {
            background: #f6f8fa;
            border-left: 0.25rem solid #d0d7de;
            border-radius: 6px;
            padding: 1rem;
            margin: 1rem 0;
        }

        .markdown-body pre, .markdown-body code {
            font-family: ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace;
        }

        .markdown-body pre {
            background: #f6f8fa !important;
            border-radius: 6px;
            padding: 1rem;
            overflow-x: auto;
            margin: 1rem 0;
        }

        .markdown-body code {
            background: #f6f8fa;
            border-radius: 3px;
            padding: 0.2rem 0.4rem;
            font-size: 85%;
        }

        .markdown-body pre code {
            background: transparent;
            padding: 0;
        }

        .markdown-body img {
            max-width: 100%;
            height: auto;
            border-radius: 6px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .markdown-body a {
            color: #0969da;
            text-decoration: none;
        }

        .markdown-body a:hover {
            text-decoration: underline;
        }

        .site-footer {
            text-align: center;
            border-top: 1px solid #d0d7de;
            padding-top: 2rem;
            color: #656d76;
            font-size: 0.875rem;
        }

        .site-footer a {
            color: #0969da;
            text-decoration: none;
        }

        .site-footer a:hover {
            text-decoration: underline;
        }

        @media (max-width: 768px) {
            body { padding: 1rem 0.5rem; }
            .site-header h1 { font-size: 2rem; }
            .markdown-body h1 { font-size: 1.75rem; }
            .markdown-body h2 { font-size: 1.5rem; }
        }
    </style>`;
  }
  async enableSitePages(repoName) {
    return await this.github.enableGitHubPages(repoName);
  }
  setProgressCallback(callback) {
    this.onProgress = callback;
  }
  updateProgress(message, percentage) {
    if (this.onProgress && typeof this.onProgress === 'function') {
      this.onProgress(message, percentage);
    }
  }
  validateContentForDeployment(content) {
    if (!content || typeof content !== 'string') {
      return false;
    }

    return MinimalSecurity.validateContent(content);
  }
  generateSiteInfo(repo) {
    const user = this.auth.getCurrentUser();
    if (!user) {
      throw new Error('User information required for site info generation');
    }

    return {
      name: repo.name,
      url: `https://${user.login}.github.io/${repo.name}`,
      repoUrl: `https://github.com/${user.login}/${repo.name}`,
      user: user.login,
      createdAt: repo.created_at,
      deployedAt: new Date().toISOString(),
      status: 'deployed',
    };
  }
  enhanceDeploymentError(error) {
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
    } else if (error.message.includes('Content validation failed')) {
      errorMessage = 'Content security validation failed';
      errorDetails =
        'Your content contains patterns that could be unsafe for deployment.';
    }

    const enhancedError = new Error(`${errorMessage}: ${errorDetails}`);
    enhancedError.originalError = error;
    enhancedError.category = this.categorizeError(error);

    return enhancedError;
  }
  categorizeError(error) {
    if (
      error.message.includes('Authentication') ||
      error.message.includes('401')
    ) {
      return 'authentication';
    }
    if (error.message.includes('Permission') || error.message.includes('403')) {
      return 'authorization';
    }
    if (error.message.includes('rate limit')) {
      return 'rate_limit';
    }
    if (
      error.message.includes('repository') &&
      error.message.includes('exist')
    ) {
      return 'naming_conflict';
    }
    if (error.message.includes('Content validation')) {
      return 'content_security';
    }
    if (error.message.includes('connect') || error.message.includes('fetch')) {
      return 'network';
    }
    return 'unknown';
  }
  getDefaultOptions() {
    return {
      autoNaming: true,
      enablePages: true,
      maxNamingAttempts: 10,
      description: `My markdown site created with MDSG on ${new Date().toLocaleDateString()}`,
      public: true,
      autoInit: true,
    };
  }
  validateDeploymentOptions(options = {}) {
    return {
      ...this.getDefaultOptions(),
      ...options,
      public: true,
      autoInit: true,
    };
  }
}
