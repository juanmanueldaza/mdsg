/**
 * CSRF Protection Utility for MDSG
 * Provides Cross-Site Request Forgery protection mechanisms
 */

/**
 * CSRF Protection class
 */
export class CSRFProtection {
  /**
   * Generate a CSRF token for the current session
   * @returns {string} - CSRF token
   */
  static generateToken() {
    // Generate a cryptographically secure random token
    const array = new Uint8Array(32);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(array);
    } else {
      // Fallback for environments without crypto.getRandomValues
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Store CSRF token securely
   * @param {string} token - CSRF token to store
   */
  static storeToken(token) {
    try {
      // Store with expiration (1 hour)
      const csrfData = {
        token,
        created: Date.now(),
        expires: Date.now() + (60 * 60 * 1000) // 1 hour
      };
      
      sessionStorage.setItem('mdsg_csrf_token', JSON.stringify(csrfData));
      return true;
    } catch (error) {
      console.error('Failed to store CSRF token:', error);
      return false;
    }
  }

  /**
   * Get current valid CSRF token
   * @returns {string|null} - CSRF token or null if expired/invalid
   */
  static getToken() {
    try {
      const csrfDataStr = sessionStorage.getItem('mdsg_csrf_token');
      if (!csrfDataStr) {
        return null;
      }

      const csrfData = JSON.parse(csrfDataStr);
      
      // Check if token is expired
      if (Date.now() > csrfData.expires) {
        sessionStorage.removeItem('mdsg_csrf_token');
        return null;
      }

      return csrfData.token;
    } catch (error) {
      console.error('Failed to retrieve CSRF token:', error);
      sessionStorage.removeItem('mdsg_csrf_token');
      return null;
    }
  }

  /**
   * Initialize CSRF protection for the session
   * @returns {string} - Generated CSRF token
   */
  static initializeProtection() {
    let token = this.getToken();
    
    if (!token) {
      token = this.generateToken();
      this.storeToken(token);
    }
    
    return token;
  }

  /**
   * Validate origin for sensitive operations
   * @param {string} expectedOrigin - Expected origin (e.g., 'https://mdsg.daza.ar')
   * @returns {boolean} - Whether the origin is valid
   */
  static validateOrigin(expectedOrigin) {
    if (typeof window === 'undefined') {
      // Server-side or test environment
      return true;
    }

    const currentOrigin = window.location.origin;
    
    // Allow localhost for development
    const allowedOrigins = [
      expectedOrigin,
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173'
    ];

    return allowedOrigins.includes(currentOrigin);
  }

  /**
   * Validate referrer for sensitive operations
   * @param {string} expectedOrigin - Expected origin
   * @returns {boolean} - Whether the referrer is valid
   */
  static validateReferrer(expectedOrigin) {
    if (typeof document === 'undefined') {
      // Server-side or test environment
      return true;
    }

    const referrer = document.referrer;
    
    // If no referrer, require same origin
    if (!referrer) {
      return this.validateOrigin(expectedOrigin);
    }

    try {
      const referrerOrigin = new URL(referrer).origin;
      return this.validateOrigin(referrerOrigin);
    } catch (error) {
      console.warn('Invalid referrer URL:', referrer);
      return false;
    }
  }

  /**
   * Add CSRF protection to sensitive forms
   * @param {HTMLFormElement} form - Form element to protect
   * @param {string} expectedOrigin - Expected origin
   */
  static protectForm(form, expectedOrigin = 'https://mdsg.daza.ar') {
    if (!form || !form.tagName || form.tagName !== 'FORM') {
      console.error('Invalid form element provided to protectForm');
      return false;
    }

    // Initialize CSRF protection
    const token = this.initializeProtection();

    // Add CSRF token as hidden input
    const existingTokenInput = form.querySelector('input[name="csrf_token"]');
    if (existingTokenInput) {
      existingTokenInput.value = token;
    } else {
      const tokenInput = document.createElement('input');
      tokenInput.type = 'hidden';
      tokenInput.name = 'csrf_token';
      tokenInput.value = token;
      form.appendChild(tokenInput);
    }

    // Add form submission validation
    const originalSubmitHandler = form.onsubmit;
    form.onsubmit = (event) => {
      // Validate origin and referrer
      if (!this.validateOrigin(expectedOrigin)) {
        console.error('CSRF protection: Invalid origin');
        event.preventDefault();
        return false;
      }

      if (!this.validateReferrer(expectedOrigin)) {
        console.error('CSRF protection: Invalid referrer');
        event.preventDefault();
        return false;
      }

      // Validate CSRF token
      const formToken = form.querySelector('input[name="csrf_token"]')?.value;
      const sessionToken = this.getToken();
      
      if (!formToken || !sessionToken || formToken !== sessionToken) {
        console.error('CSRF protection: Invalid or missing token');
        event.preventDefault();
        return false;
      }

      // Call original handler if exists
      if (originalSubmitHandler) {
        return originalSubmitHandler.call(form, event);
      }

      return true;
    };

    return true;
  }

  /**
   * Validate a request for CSRF protection
   * @param {string} token - CSRF token from request
   * @param {string} expectedOrigin - Expected origin
   * @returns {object} - Validation result
   */
  static validateRequest(token, expectedOrigin = 'https://mdsg.daza.ar') {
    const errors = [];

    // Validate origin
    if (!this.validateOrigin(expectedOrigin)) {
      errors.push('Invalid request origin');
    }

    // Validate referrer
    if (!this.validateReferrer(expectedOrigin)) {
      errors.push('Invalid request referrer');
    }

    // Validate CSRF token
    const sessionToken = this.getToken();
    if (!token || !sessionToken || token !== sessionToken) {
      errors.push('Invalid or missing CSRF token');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Create secure headers for sensitive operations
   * @param {string} csrfToken - CSRF token
   * @returns {object} - Headers object
   */
  static createSecureHeaders(csrfToken = null) {
    const headers = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest', // Helps prevent simple CSRF
    };

    // Add CSRF token if provided
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }

    return headers;
  }

  /**
   * Secure fetch wrapper that includes CSRF protection
   * @param {string} url - URL to fetch
   * @param {object} options - Fetch options
   * @param {string} expectedOrigin - Expected origin for validation
   * @returns {Promise} - Fetch promise with CSRF protection
   */
  static async secureFetch(url, options = {}, expectedOrigin = 'https://mdsg.daza.ar') {
    // Validate that this is a sensitive operation
    const isSensitiveOperation = options.method && 
      ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method.toUpperCase());

    if (isSensitiveOperation) {
      // Initialize CSRF protection
      const token = this.initializeProtection();

      // Validate request
      const validation = this.validateRequest(token, expectedOrigin);
      if (!validation.isValid) {
        throw new Error(`CSRF validation failed: ${validation.errors.join(', ')}`);
      }

      // Add secure headers
      const secureHeaders = this.createSecureHeaders(token);
      options.headers = {
        ...secureHeaders,
        ...options.headers
      };
    }

    return fetch(url, options);
  }

  /**
   * Clear CSRF protection data (e.g., on logout)
   */
  static clearProtection() {
    try {
      sessionStorage.removeItem('mdsg_csrf_token');
    } catch (error) {
      console.error('Failed to clear CSRF protection:', error);
    }
  }

  /**
   * Get CSRF protection status and information
   * @returns {object} - Status information
   */
  static getStatus() {
    const token = this.getToken();
    
    return {
      isActive: !!token,
      hasValidToken: !!token,
      origin: typeof window !== 'undefined' ? window.location.origin : 'unknown',
      referrer: typeof document !== 'undefined' ? document.referrer : 'unknown'
    };
  }
}

// Default export
export default CSRFProtection;
