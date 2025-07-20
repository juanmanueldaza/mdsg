export class AuthenticationState {
  constructor() {
    this.reset();
  }
  reset() {
    this.authenticated = false;
    this.user = null;
    this.token = null;
    this.lastAuthenticationTime = null;
  }
  setAuthenticated(user, token) {
    if (!user || !token) {
      throw new Error('Invalid authentication data: user and token required');
    }

    if (!user.login) {
      throw new Error('Invalid user data: login required');
    }

    this.authenticated = true;
    this.user = user;
    this.token = token;
    this.lastAuthenticationTime = new Date().toISOString();

  }
  clearAuthentication() {
    this.reset();
  }
  isAuthenticated() {
    return this.authenticated && this.user && this.token;
  }
  requireAuthentication() {
    if (!this.isAuthenticated()) {
      throw new Error('Authentication required for this operation');
    }
  }
  getAuthHeaders() {
    this.requireAuthentication();
    return {
      'Authorization': `token ${this.token}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'MDSG-App',
    };
  }
  saveToStorage() {
    if (!this.isAuthenticated()) {
      return false;
    }

    try {
      const authData = {
        user: this.user,
        token: this.token,
        lastAuthenticated: this.lastAuthenticationTime,
      };

      localStorage.setItem('mdsg_auth', JSON.stringify(authData));
      return true;
    } catch (error) {
      return false;
    }
  }
  loadFromStorage() {
    try {
      const stored = localStorage.getItem('mdsg_auth');
      if (!stored) return false;

      const authData = JSON.parse(stored);
      if (this._isValidStoredAuth(authData)) {
        this.setAuthenticated(authData.user, authData.token);
        this.lastAuthenticationTime = authData.lastAuthenticated;
        return true;
      }
    } catch (error) {
      this.clearStoredAuth();
    }

    return false;
  }
  clearStoredAuth() {
    try {
      localStorage.removeItem('mdsg_auth');
    } catch (error) {
    }
  }
  _isValidStoredAuth(authData) {
    return authData &&
           authData.user &&
           authData.token &&
           authData.user.login &&
           typeof authData.token === 'string' &&
           authData.token.length > 0;
  }
  isTokenExpired() {
    if (!this.lastAuthenticationTime) return true;

    const authTime = new Date(this.lastAuthenticationTime);
    const now = new Date();
    const hoursSinceAuth = (now - authTime) / (1000 * 60 * 60);

    return hoursSinceAuth > 24;
  }
}
export class ContentState {
  constructor() {
    this.content = '';
    this.repoName = '';
    this.wordCount = 0;
    this.charCount = 0;
    this.hasUnsavedChanges = false;
    this.lastSaveTime = null;
    this.autoSaveTimer = null;
  }
  setContent(newContent) {
    if (typeof newContent !== 'string') {
      throw new Error('Content must be a string');
    }

    const oldContent = this.content;
    this.content = newContent;
    this._updateCounts();
    this.hasUnsavedChanges = (oldContent !== newContent);

    if (this.hasUnsavedChanges) {
      this._scheduleAutoSave();
    }
  }
  setRepoName(name) {
    if (!this.isValidRepoName(name)) {
      throw new Error('Invalid repository name: must contain only letters, numbers, dots, hyphens, and underscores');
    }
    this.repoName = name.toLowerCase();
  }
  _updateCounts() {
    this.charCount = this.content.length;
    this.wordCount = this.content.trim()
      ? this.content.trim().split(/\s+/).filter(word => word.length > 0).length
      : 0;
  }
  markSaved() {
    this.hasUnsavedChanges = false;
    this.lastSaveTime = new Date().toISOString();
    this._clearAutoSaveTimer();
  }
  isValidRepoName(name) {
    if (!name || typeof name !== 'string') return false;
    if (name.length === 0 || name.length > 100) return false;
    return /^[a-zA-Z0-9._-]+$/.test(name);
  }
  isContentValid() {
    return typeof this.content === 'string' &&
           this.content.trim().length > 0;
  }
  getStats() {
    return {
      wordCount: this.wordCount,
      charCount: this.charCount,
      hasUnsavedChanges: this.hasUnsavedChanges,
      lastSaveTime: this.lastSaveTime,
    };
  }
  loadFromStorage() {
    try {
      const stored = localStorage.getItem('mdsg_content');
      if (stored) {
        const contentData = JSON.parse(stored);
        if (contentData.content) {
          this.setContent(contentData.content);
          this.lastSaveTime = contentData.lastSaveTime || null;
          this.hasUnsavedChanges = false; // Mark as saved since it's from storage
          return true;
        }
      }
    } catch (error) {
    }
    return false;
  }
  saveToStorage() {
    try {
      const contentData = {
        content: this.content,
        lastSaveTime: new Date().toISOString(),
      };

      localStorage.setItem('mdsg_content', JSON.stringify(contentData));
      this.markSaved();
      return true;
    } catch (error) {
      return false;
    }
  }
  _scheduleAutoSave() {
    this._clearAutoSaveTimer();

    this.autoSaveTimer = setTimeout(() => {
      this.saveToStorage();
    }, 2000);
  }
  _clearAutoSaveTimer() {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }
  clear() {
    this.content = '';
    this.repoName = '';
    this._updateCounts();
    this.hasUnsavedChanges = false;
    this.lastSaveTime = null;
    this._clearAutoSaveTimer();

    try {
      localStorage.removeItem('mdsg_content');
    } catch (error) {
    }
  }
}
