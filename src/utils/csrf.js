export class CSRFProtection {
  static generateToken() {
    const array = new Uint8Array(32);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(array);
    } else {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }

    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join(
      '',
    );
  }
  static storeToken(token) {
    try {
      const csrfData = {
        token,
        created: Date.now(),
        expires: Date.now() + 60 * 60 * 1000,
      };

      sessionStorage.setItem('mdsg_csrf_token', JSON.stringify(csrfData));
      return true;
    } catch (error) {
      return false;
    }
  }
  static getToken() {
    try {
      const csrfDataStr = sessionStorage.getItem('mdsg_csrf_token');
      if (!csrfDataStr) {
        return null;
      }

      const csrfData = JSON.parse(csrfDataStr);

      if (Date.now() > csrfData.expires) {
        sessionStorage.removeItem('mdsg_csrf_token');
        return null;
      }

      return csrfData.token;
    } catch (error) {
      sessionStorage.removeItem('mdsg_csrf_token');
      return null;
    }
  }
  static initializeProtection() {
    let token = this.getToken();

    if (!token) {
      token = this.generateToken();
      this.storeToken(token);
    }

    return token;
  }
  static validateOrigin(expectedOrigin) {
    if (typeof window === 'undefined') {
      return true;
    }

    const currentOrigin = window.location.origin;

    const allowedOrigins = [
      expectedOrigin,
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
    ];

    return allowedOrigins.includes(currentOrigin);
  }
  static validateReferrer(expectedOrigin) {
    if (typeof document === 'undefined') {
      return true;
    }

    const referrer = document.referrer;

    if (!referrer) {
      return this.validateOrigin(expectedOrigin);
    }

    try {
      const referrerOrigin = new URL(referrer).origin;
      return this.validateOrigin(referrerOrigin);
    } catch (error) {
      return false;
    }
  }
  static protectForm(form, expectedOrigin = 'https://mdsg.daza.ar') {
    if (!form || !form.tagName || form.tagName !== 'FORM') {
      return false;
    }

    const token = this.initializeProtection();

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

    const originalSubmitHandler = form.onsubmit;
    form.onsubmit = event => {
      if (!this.validateOrigin(expectedOrigin)) {
        event.preventDefault();
        return false;
      }

      if (!this.validateReferrer(expectedOrigin)) {
        event.preventDefault();
        return false;
      }

      const formToken = form.querySelector('input[name="csrf_token"]')?.value;
      const sessionToken = this.getToken();

      if (!formToken || !sessionToken || formToken !== sessionToken) {
        event.preventDefault();
        return false;
      }

      if (originalSubmitHandler) {
        return originalSubmitHandler.call(form, event);
      }

      return true;
    };

    return true;
  }
  static validateRequest(token, expectedOrigin = 'https://mdsg.daza.ar') {
    const errors = [];

    if (!this.validateOrigin(expectedOrigin)) {
      errors.push('Invalid request origin');
    }

    if (!this.validateReferrer(expectedOrigin)) {
      errors.push('Invalid request referrer');
    }

    const sessionToken = this.getToken();
    if (!token || !sessionToken || token !== sessionToken) {
      errors.push('Invalid or missing CSRF token');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
  static createSecureHeaders(csrfToken = null) {
    const headers = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    };

    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }

    return headers;
  }
  static async secureFetch(
    url,
    options = {},
    expectedOrigin = 'https://mdsg.daza.ar',
  ) {
    const isSensitiveOperation =
      options.method &&
      ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method.toUpperCase());

    if (isSensitiveOperation) {
      const token = this.initializeProtection();

      const validation = this.validateRequest(token, expectedOrigin);
      if (!validation.isValid) {
        throw new Error(
          `CSRF validation failed: ${validation.errors.join(', ')}`,
        );
      }

      const secureHeaders = this.createSecureHeaders(token);
      options.headers = {
        ...secureHeaders,
        ...options.headers,
      };
    }

    return fetch(url, options);
  }
  static clearProtection() {
    try {
      sessionStorage.removeItem('mdsg_csrf_token');
    } catch (error) {}
  }
  static getStatus() {
    const token = this.getToken();

    return {
      isActive: !!token,
      hasValidToken: !!token,
      origin:
        typeof window !== 'undefined' ? window.location.origin : 'unknown',
      referrer: typeof document !== 'undefined' ? document.referrer : 'unknown',
    };
  }
}

export default CSRFProtection;
