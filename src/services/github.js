import { MinimalSecurity } from '@security';

export class GitHubAPIService {
  constructor(authenticationService) {
    this.auth = authenticationService;
  }
  getAPIHeaders() {
    const token = this.auth.getCurrentToken();
    if (!token) {
      throw new Error('No authentication token available');
    }

    return {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'MDSG-App',
    };
  }
  validateRequestOrigin(expectedOrigin = 'https://mdsg.daza.ar') {
    if (!MinimalSecurity.validateOrigin(expectedOrigin)) {
    }
  }
  async fetchUser() {
    try {
      this.validateRequestOrigin();

      const response = await fetch('https://api.github.com/user', {
        headers: this.getAPIHeaders(),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch user: ${response.status} ${response.statusText}`,
        );
      }

      const userData = await response.json();

      if (!userData.login) {
        throw new Error('Invalid user data received from GitHub API');
      }

      return userData;
    } catch (error) {
      if (error.message.includes('fetch')) {
        throw new Error('Unable to connect to GitHub API');
      }
      throw error;
    }
  }
  async createRepository(name, description = '', options = {}) {
    if (!name || typeof name !== 'string') {
      throw new Error('Repository name is required');
    }

    const sanitizedName = name.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase();

    const defaultOptions = {
      auto_init: true,
      public: true,
      has_issues: false,
      has_projects: false,
      has_wiki: false,
    };

    const repositoryConfig = {
      name: sanitizedName,
      description:
        description ||
        `My markdown site created with MDSG on ${new Date().toLocaleDateString()}`,
      ...defaultOptions,
      ...options,
    };

    try {
      this.validateRequestOrigin();

      const response = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: this.getAPIHeaders(),
        body: JSON.stringify(repositoryConfig),
      });

      if (response.ok) {
        const repo = await response.json();
        return repo;
      }

      const errorData = await response.json().catch(() => ({}));

      if (response.status === 422) {
        if (this.isRepositoryExistsError(errorData)) {
          throw new Error(`Repository '${sanitizedName}' already exists`);
        }
        throw new Error(
          `Invalid repository configuration: ${errorData.message || 'Unknown validation error'}`,
        );
      }

      if (response.status === 401) {
        throw new Error('Authentication failed. Please login again.');
      }

      if (response.status === 403) {
        throw new Error(
          'Permission denied. You may have reached your repository limit.',
        );
      }

      throw new Error(
        `Failed to create repository (${response.status}): ${errorData.message || response.statusText}`,
      );
    } catch (error) {
      if (error.message.includes('fetch')) {
        throw new Error('Unable to connect to GitHub API');
      }
      throw error;
    }
  }
  async createRepositoryWithAutoNaming(
    baseName,
    description = '',
    maxAttempts = 10,
  ) {
    let attempt = 0;

    while (attempt < maxAttempts) {
      const currentName = attempt === 0 ? baseName : `${baseName}-${attempt}`;

      try {
        return await this.createRepository(currentName, description);
      } catch (error) {
        if (error.message.includes('already exists')) {
          attempt++;
          continue;
        }
        throw error;
      }
    }

    throw new Error(
      `Unable to create repository after ${maxAttempts} attempts. Please try a different name.`,
    );
  }
  isRepositoryExistsError(errorData) {
    if (errorData.errors) {
      const nameError = errorData.errors.find(
        err => err.resource === 'Repository' && err.field === 'name',
      );
      return nameError && nameError.code === 'already_exists';
    }

    return (
      errorData.message &&
      (errorData.message.includes('already exists') ||
        errorData.message.includes('name already exists'))
    );
  }
  async uploadContent(repoName, filePath, content, commitMessage) {
    if (!repoName || !filePath || typeof content !== 'string') {
      throw new Error('Repository name, file path, and content are required');
    }

    const user = this.auth.getCurrentUser();
    if (!user) {
      throw new Error('User information not available');
    }

    try {
      this.validateRequestOrigin();

      const response = await fetch(
        `https://api.github.com/repos/${user.login}/${repoName}/contents/${filePath}`,
        {
          method: 'PUT',
          headers: this.getAPIHeaders(),
          body: JSON.stringify({
            message: commitMessage || 'Add content via MDSG',
            content: this.encodeBase64Unicode(content),
            committer: {
              name: user.name || user.login,
              email: user.email || `${user.login}@users.noreply.github.com`,
            },
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Failed to upload content: ${errorData.message || response.statusText}`,
        );
      }

      const result = await response.json();
      return result;
    } catch (error) {
      if (error.message.includes('fetch')) {
        throw new Error('Unable to connect to GitHub API');
      }
      throw error;
    }
  }
  async enableGitHubPages(repoName, options = {}) {
    if (!repoName) {
      throw new Error('Repository name is required');
    }

    const user = this.auth.getCurrentUser();
    if (!user) {
      throw new Error('User information not available');
    }

    const defaultOptions = {
      source: {
        branch: 'main',
        path: '/',
      },
    };

    const pagesConfig = { ...defaultOptions, ...options };

    try {
      this.validateRequestOrigin();

      const response = await fetch(
        `https://api.github.com/repos/${user.login}/${repoName}/pages`,
        {
          method: 'POST',
          headers: {
            ...this.getAPIHeaders(),
            Accept: 'application/vnd.github+json',
          },
          body: JSON.stringify(pagesConfig),
        },
      );

      if (response.ok) {
        const result = await response.json();
        return result;
      }

      if (response.status === 409) {
        return { status: 'already_enabled' };
      }

      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to enable GitHub Pages: ${errorData.message || response.statusText}`,
      );
    } catch (error) {
      if (error.message.includes('fetch')) {
        throw new Error('Unable to connect to GitHub API');
      }
      throw error;
    }
  }
  encodeBase64Unicode(str) {
    return btoa(
      encodeURIComponent(str).replace(
        /%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
          return String.fromCharCode('0x' + p1);
        },
      ),
    );
  }
  async checkRateLimit() {
    try {
      const response = await fetch('https://api.github.com/rate_limit', {
        headers: this.getAPIHeaders(),
      });

      if (response.ok) {
        return await response.json();
      }

      return { error: 'Unable to check rate limit' };
    } catch (error) {
      return { error: error.message };
    }
  }
  async testConnection() {
    try {
      const user = await this.fetchUser();
      const rateLimit = await this.checkRateLimit();

      return {
        connected: true,
        authenticated: true,
        user: user.login,
        rateLimit: rateLimit.rate || rateLimit.error,
      };
    } catch (error) {
      return {
        connected: false,
        authenticated: false,
        error: error.message,
      };
    }
  }
}
