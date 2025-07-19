/**
 * Secure Token Manager for MDSG
 * Replaces vulnerable localStorage with enhanced sessionStorage + security features
 *
 * Security improvements over localStorage:
 * - sessionStorage clears on browser close (reduces persistence risk)
 * - Token expiration (8 hours max)
 * - Origin validation
 * - Format validation
 * - Automatic cleanup of expired tokens
 * - Secure token generation for state management
 */

export class SecureTokenManager {
  constructor() {
    this.SESSION_KEY = 'mdsg_secure_auth';
    this.STATE_KEY = 'mdsg_oauth_state';
    this.DEFAULT_EXPIRY = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
    this.WARNING_TIME = 30 * 60 * 1000; // 30 minutes before expiry

    // Initialize cleanup
    this.cleanupExpiredTokens();

    // Set up periodic cleanup (every 5 minutes)
    this.setupPeriodicCleanup();
  }

  /**
   * Store GitHub token securely
   * @param {string} token - GitHub token
   * @param {object} userInfo - User information object
   * @param {number} customExpiry - Custom expiry time in milliseconds (optional)
   * @returns {boolean} - Success status
   */
  storeToken(token, userInfo = null, customExpiry = null) {
    try {
      if (!this.validateTokenFormat(token)) {
        console.error('Invalid token format provided to storeToken');
        return false;
      }

      const now = Date.now();
      const expiryTime = customExpiry || this.DEFAULT_EXPIRY;

      const tokenData = {
        token: token,
        createdAt: now,
        expiresAt: now + expiryTime,
        origin: window.location.origin,
        userAgent: navigator.userAgent.substring(0, 100), // Truncated for storage
        user: userInfo
          ? {
              id: userInfo.id,
              login: userInfo.login,
              name: userInfo.name,
              avatar_url: userInfo.avatar_url,
            }
          : null,
        version: '1.0', // For future migration compatibility
      };

      // Encrypt sensitive data (basic obfuscation for client-side)
      const encryptedData = this.obfuscateData(JSON.stringify(tokenData));

      sessionStorage.setItem(this.SESSION_KEY, encryptedData);

      console.log(
        'Token stored securely with expiration:',
        new Date(tokenData.expiresAt),
      );
      return true;
    } catch (error) {
      console.error('Failed to store token:', error);
      return false;
    }
  }

  /**
   * Retrieve and validate stored token
   * @returns {object|null} - Token data or null if invalid/expired
   */
  getToken() {
    try {
      const encryptedData = sessionStorage.getItem(this.SESSION_KEY);
      if (!encryptedData) {
        return null;
      }

      const decryptedData = this.deobfuscateData(encryptedData);
      const tokenData = JSON.parse(decryptedData);

      // Validate token data structure
      if (!this.validateTokenData(tokenData)) {
        console.warn('Invalid token data structure, clearing');
        this.clearToken();
        return null;
      }

      // Check expiration
      if (Date.now() > tokenData.expiresAt) {
        console.log('Token expired, clearing');
        this.clearToken();
        return null;
      }

      // Validate origin (prevent token theft across domains)
      if (tokenData.origin !== window.location.origin) {
        console.warn('Token origin mismatch, clearing for security');
        this.clearToken();
        return null;
      }

      // Check if token format is still valid
      if (!this.validateTokenFormat(tokenData.token)) {
        console.warn('Token format invalid, clearing');
        this.clearToken();
        return null;
      }

      return tokenData;
    } catch (error) {
      console.error('Failed to retrieve token:', error);
      this.clearToken();
      return null;
    }
  }

  /**
   * Get just the token string (for API calls)
   * @returns {string|null} - Token string or null
   */
  getTokenString() {
    const tokenData = this.getToken();
    return tokenData ? tokenData.token : null;
  }

  /**
   * Get user information from stored token
   * @returns {object|null} - User info or null
   */
  getUserInfo() {
    const tokenData = this.getToken();
    return tokenData ? tokenData.user : null;
  }

  /**
   * Check if token exists and is valid
   * @returns {boolean} - True if valid token exists
   */
  hasValidToken() {
    return this.getToken() !== null;
  }

  /**
   * Check if token is close to expiring
   * @returns {boolean} - True if token expires within warning time
   */
  isTokenExpiringSoon() {
    const tokenData = this.getToken();
    if (!tokenData) return false;

    const timeUntilExpiry = tokenData.expiresAt - Date.now();
    return timeUntilExpiry <= this.WARNING_TIME;
  }

  /**
   * Get time until token expiration
   * @returns {number} - Milliseconds until expiration, or 0 if no token
   */
  getTimeUntilExpiry() {
    const tokenData = this.getToken();
    if (!tokenData) return 0;

    return Math.max(0, tokenData.expiresAt - Date.now());
  }

  /**
   * Extend token expiration time
   * @param {number} additionalTime - Additional time in milliseconds (optional)
   * @returns {boolean} - Success status
   */
  extendToken(additionalTime = null) {
    const tokenData = this.getToken();
    if (!tokenData) return false;

    const extension = additionalTime || this.DEFAULT_EXPIRY;
    tokenData.expiresAt = Date.now() + extension;

    return this.storeToken(tokenData.token, tokenData.user, extension);
  }

  /**
   * Clear stored token
   */
  clearToken() {
    try {
      sessionStorage.removeItem(this.SESSION_KEY);
      sessionStorage.removeItem(this.STATE_KEY);
      console.log('Token cleared from secure storage');
    } catch (error) {
      console.error('Failed to clear token:', error);
    }
  }

  /**
   * Generate secure OAuth state parameter
   * @returns {string} - Secure random state string
   */
  generateOAuthState() {
    const state = this.generateSecureRandom(32);
    const stateData = {
      state: state,
      createdAt: Date.now(),
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes for OAuth flow
      origin: window.location.origin,
    };

    try {
      sessionStorage.setItem(this.STATE_KEY, JSON.stringify(stateData));
      return state;
    } catch (error) {
      console.error('Failed to store OAuth state:', error);
      return state; // Return anyway, just won't be validated
    }
  }

  /**
   * Validate OAuth state parameter
   * @param {string} receivedState - State received from OAuth callback
   * @returns {boolean} - True if state is valid
   */
  validateOAuthState(receivedState) {
    try {
      const stateDataStr = sessionStorage.getItem(this.STATE_KEY);
      if (!stateDataStr) {
        console.warn('No OAuth state found in storage');
        return false;
      }

      const stateData = JSON.parse(stateDataStr);

      // Check expiration
      if (Date.now() > stateData.expiresAt) {
        console.warn('OAuth state expired');
        sessionStorage.removeItem(this.STATE_KEY);
        return false;
      }

      // Check origin
      if (stateData.origin !== window.location.origin) {
        console.warn('OAuth state origin mismatch');
        sessionStorage.removeItem(this.STATE_KEY);
        return false;
      }

      // Validate state
      const isValid = stateData.state === receivedState;

      if (isValid) {
        // Clear state after successful validation
        sessionStorage.removeItem(this.STATE_KEY);
      }

      return isValid;
    } catch (error) {
      console.error('Failed to validate OAuth state:', error);
      return false;
    }
  }

  /**
   * Validate token format (GitHub token patterns)
   * @param {string} token - Token to validate
   * @returns {boolean} - True if format is valid
   */
  validateTokenFormat(token) {
    if (typeof token !== 'string' || token.length < 20 || token.length > 100) {
      return false;
    }

    // GitHub token patterns (flexible length to accommodate different formats)
    const validPatterns = [
      /^ghp_[a-zA-Z0-9]{36,40}$/, // Personal access tokens (36-40 chars)
      /^gho_[a-zA-Z0-9]{36,40}$/, // OAuth app tokens
      /^ghu_[a-zA-Z0-9]{36,40}$/, // User-to-server tokens
      /^ghs_[a-zA-Z0-9]{36,40}$/, // Server-to-server tokens
      /^github_pat_[a-zA-Z0-9_]{70,90}$/, // Fine-grained PATs (flexible length)
    ];

    return validPatterns.some(pattern => pattern.test(token));
  }

  /**
   * Validate token data structure
   * @param {object} tokenData - Token data object
   * @returns {boolean} - True if structure is valid
   */
  validateTokenData(tokenData) {
    if (!tokenData || typeof tokenData !== 'object') {
      return false;
    }

    const requiredFields = ['token', 'createdAt', 'expiresAt', 'origin'];
    return requiredFields.every(field => tokenData.hasOwnProperty(field));
  }

  /**
   * Basic obfuscation for client-side storage (not encryption!)
   * @param {string} data - Data to obfuscate
   * @returns {string} - Obfuscated data
   */
  obfuscateData(data) {
    // Simple base64 encoding with character shifting (security through obscurity)
    const encoded = btoa(data);
    return encoded
      .split('')
      .map((char, i) => String.fromCharCode(char.charCodeAt(0) + (i % 3) + 1))
      .join('');
  }

  /**
   * Reverse obfuscation
   * @param {string} obfuscatedData - Data to deobfuscate
   * @returns {string} - Original data
   */
  deobfuscateData(obfuscatedData) {
    const decoded = obfuscatedData
      .split('')
      .map((char, i) => String.fromCharCode(char.charCodeAt(0) - (i % 3) - 1))
      .join('');
    return atob(decoded);
  }

  /**
   * Generate cryptographically secure random string
   * @param {number} length - Length of random string
   * @returns {string} - Random string
   */
  generateSecureRandom(length = 32) {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = new Uint8Array(length);

    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(values);
    } else {
      // Fallback for older browsers
      for (let i = 0; i < length; i++) {
        values[i] = Math.floor(Math.random() * 256);
      }
    }

    return Array.from(values, byte => chars[byte % chars.length]).join('');
  }

  /**
   * Clean up expired tokens and state
   */
  cleanupExpiredTokens() {
    try {
      // Check and clean main token
      const tokenData = sessionStorage.getItem(this.SESSION_KEY);
      if (tokenData) {
        try {
          const decrypted = this.deobfuscateData(tokenData);
          const parsed = JSON.parse(decrypted);
          if (Date.now() > parsed.expiresAt) {
            sessionStorage.removeItem(this.SESSION_KEY);
            console.log('Cleaned up expired token');
          }
        } catch (e) {
          // Invalid data, remove it
          sessionStorage.removeItem(this.SESSION_KEY);
        }
      }

      // Check and clean OAuth state
      const stateData = sessionStorage.getItem(this.STATE_KEY);
      if (stateData) {
        try {
          const parsed = JSON.parse(stateData);
          if (Date.now() > parsed.expiresAt) {
            sessionStorage.removeItem(this.STATE_KEY);
            console.log('Cleaned up expired OAuth state');
          }
        } catch (e) {
          sessionStorage.removeItem(this.STATE_KEY);
        }
      }
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  }

  /**
   * Set up periodic cleanup of expired tokens
   */
  setupPeriodicCleanup() {
    // Run cleanup every 5 minutes
    setInterval(
      () => {
        this.cleanupExpiredTokens();
      },
      5 * 60 * 1000,
    );
  }

  /**
   * Get security information about current session
   * @returns {object} - Security info
   */
  getSecurityInfo() {
    const tokenData = this.getToken();
    if (!tokenData) {
      return {
        hasToken: false,
        isSecure: false,
      };
    }

    const now = Date.now();
    const timeUntilExpiry = tokenData.expiresAt - now;
    const ageInMinutes = Math.floor((now - tokenData.createdAt) / (60 * 1000));

    return {
      hasToken: true,
      isSecure: true,
      storage: 'sessionStorage',
      ageInMinutes: ageInMinutes,
      expiresInMinutes: Math.floor(timeUntilExpiry / (60 * 1000)),
      isExpiringSoon: timeUntilExpiry <= this.WARNING_TIME,
      origin: tokenData.origin,
      version: tokenData.version || '1.0',
    };
  }

  /**
   * Migrate from old localStorage tokens (compatibility)
   * @returns {boolean} - True if migration occurred
   */
  migrateFromLocalStorage() {
    try {
      const oldToken = localStorage.getItem('github_token');
      if (!oldToken) return false;

      console.log('Migrating token from localStorage to secure storage');

      // Store with shorter expiry for migrated tokens (4 hours)
      const migrationExpiry = 4 * 60 * 60 * 1000;
      const success = this.storeToken(oldToken, null, migrationExpiry);

      if (success) {
        // Clear old storage
        localStorage.removeItem('github_token');
        localStorage.removeItem('github_token_type');
        localStorage.removeItem('github_token_scope');
        localStorage.removeItem('oauth_state');

        console.log('Successfully migrated token to secure storage');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token migration failed:', error);
      return false;
    }
  }
}

// Create singleton instance
export const tokenManager = new SecureTokenManager();

// Export for backward compatibility
export default tokenManager;
