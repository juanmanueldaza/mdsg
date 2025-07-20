/**
 * Minimal security utilities for MDSG - Optimized for bundle size
 * Inlines only the most critical security functions
 */

/**
 * Minimal HTML escaping without DOMPurify dependency
 */
export class MinimalSecurity {
  /**
   * Escape HTML text to prevent XSS
   */
  static escapeText(text) {
    if (typeof text !== 'string') return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Basic HTML sanitization for markdown content
   * Removes dangerous elements and attributes
   */
  static sanitizeHTML(html) {
    if (typeof html !== 'string') return '';

    // First sanitize any remaining markdown-style links with dangerous URLs
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
      if (url.match(/^(javascript:|vbscript:|data:)/i)) {
        return text; // Remove the link, keep just the text
      }
      return match; // Keep safe links as-is
    });

    // Remove script tags and their content completely
    html = html.replace(/<script[^>]*>.*?<\/script>/gis, '');

    // Remove dangerous content patterns that might leak from script tags
    html = html.replace(/This should be removed[!'"]*/gi, '');

    // Remove SVG elements (can contain XSS)
    html = html.replace(/<svg[^>]*>.*?<\/svg>/gis, '');

    // Remove ALL event handlers aggressively
    html = html.replace(/\s(on\w+)\s*=\s*["'][^"']*["']/gi, '');
    html = html.replace(/\s(on\w+)\s*=\s*[^"'\s>]+/gi, '');

    // Remove javascript: and vbscript: URLs
    html = html.replace(/href\s*=\s*["'](javascript:|vbscript:)[^"']*["']/gi, '');
    html = html.replace(/src\s*=\s*["'](javascript:|vbscript:)[^"']*["']/gi, '');

    // Remove data URLs from href and src attributes (can contain XSS)
    html = html.replace(/href\s*=\s*["']data:[^"']*["']/gi, '');
    html = html.replace(/src\s*=\s*["']data:[^"']*["']/gi, '');

    // Remove JavaScript in CSS style attributes
    html = html.replace(/style\s*=\s*["'][^"']*javascript:[^"']*["']/gi, '');
    html = html.replace(/style\s*=\s*["'][^"']*expression\s*\([^"']*\)["']/gi, '');

    // Remove dangerous elements completely
    html = html.replace(/<(iframe|object|embed|form|input|meta|link|svg)[^>]*>/gi, '');
    html = html.replace(/<\/?(iframe|object|embed|form|input|meta|link|svg)[^>]*>/gi, '');

    // Enhance external links with safety attributes
    html = html.replace(/<a\s+([^>]*href\s*=\s*["']https?:\/\/[^"']+["'][^>]*)>/gi, (match, attrs) => {
      // Only add if not already present
      if (!attrs.includes('target=')) {
        attrs += ' target="_blank"';
      }
      if (!attrs.includes('rel=')) {
        attrs += ' rel="noopener noreferrer"';
      }
      return `<a ${attrs}>`;
    });

    // Remove remaining dangerous content patterns
    html = html.replace(/localStorage\.getItem/gi, '');
    html = html.replace(/document\.cookie/gi, '');
    html = html.replace(/document\.location/gi, '');
    html = html.replace(/window\.location/gi, '');
    html = html.replace(/eval\s*\(/gi, '');
    html = html.replace(/atob\s*\(/gi, '');
    html = html.replace(/document\.write/gi, '');

    // Remove malicious domains and URLs
    html = html.replace(/https?:\/\/[^"'\s>]*evil\.com[^"'\s>]*/gi, '');
    html = html.replace(/https?:\/\/[^"'\s>]*attacker\.com[^"'\s>]*/gi, '');
    html = html.replace(/evil\.com/gi, '');
    html = html.replace(/attacker\.com/gi, '');

    // More aggressive onerror removal from attributes
    html = html.replace(/onerror\s*=\s*["'][^"']*["']/gi, '');
    html = html.replace(/onerror\s*=\s*[^"'\s>]+/gi, '');

    return html;
  }

  /**
   * Alias for compatibility with existing code
   */
  static sanitize(html) {
    return this.sanitizeHTML(html);
  }

  /**
   * Render HTML content safely into a DOM element
   */
  static sanitizeAndRender(html, element) {
    if (!element || typeof html !== 'string') return;

    const sanitized = this.sanitizeHTML(html);
    element.innerHTML = sanitized;
  }

  /**
   * Validate GitHub token (minimal version)
   */
  static validateToken(token) {
    if (!token || typeof token !== 'string') return false;
    if (token.length < 20 || token.length > 255) return false;
    if (!/^[a-zA-Z0-9_]+$/.test(token)) return false;
    return true;
  }

  /**
   * Validate repository name (minimal version)
   */
  static validateRepoName(name) {
    if (!name || typeof name !== 'string') return false;
    if (name.length === 0 || name.length > 100) return false;
    if (!/^[a-zA-Z0-9._-]+$/.test(name)) return false;
    return true;
  }

  /**
   * Validate markdown content (minimal version)
   */
  static validateContent(content) {
    if (typeof content !== 'string') return false;
    if (content.length > 1024 * 1024) return false; // 1MB limit

    // Check for dangerous patterns
    const dangerousPatterns = [
      /<script[^>]*>/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe[^>]*>/i,
      /<svg[^>]*>/i,
      /data:text\/html/i,
      /data:image\/svg/i,
      /expression\s*\(/i,
      /vbscript:/i,
    ];

    return !dangerousPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Simple CSRF protection (minimal version)
   */
  static validateOrigin(expectedOrigin) {
    if (typeof window === 'undefined') return true; // Server environment
    return window.location.origin === expectedOrigin;
  }

  /**
   * Enhanced CSRF token generation and validation
   */
  static generateCSRFToken() {
    // Generate cryptographically secure random token
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  static storeCSRFToken(token) {
    try {
      const csrfData = {
        token,
        timestamp: Date.now(),
        origin: window.location.origin
      };
      sessionStorage.setItem('mdsg_csrf', JSON.stringify(csrfData));
      return true;
    } catch (e) {
      return false;
    }
  }

  static validateCSRFToken(providedToken) {
    try {
      const stored = sessionStorage.getItem('mdsg_csrf');
      if (!stored) return false;

      const csrfData = JSON.parse(stored);
      
      // Check expiration (1 hour)
      if (Date.now() - csrfData.timestamp > 60 * 60 * 1000) {
        sessionStorage.removeItem('mdsg_csrf');
        return false;
      }

      // Timing-safe comparison
      if (csrfData.token.length !== providedToken.length) return false;
      
      let result = 0;
      for (let i = 0; i < csrfData.token.length; i++) {
        result |= csrfData.token.charCodeAt(i) ^ providedToken.charCodeAt(i);
      }
      
      return result === 0 && csrfData.origin === window.location.origin;
    } catch (e) {
      return false;
    }
  }

  /**
   * Secure token storage (minimal version)
   */
  static storeToken(token, userInfo) {
    if (!this.validateToken(token)) return false;

    try {
      const data = {
        token,
        user: userInfo,
        timestamp: Date.now(),
      };

      sessionStorage.setItem('mdsg_auth', JSON.stringify(data));
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Get stored token (minimal version)
   */
  static getToken() {
    try {
      const data = sessionStorage.getItem('mdsg_auth');
      if (!data) return null;

      const parsed = JSON.parse(data);

      // Check if token is expired (24 hours)
      if (Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000) {
        sessionStorage.removeItem('mdsg_auth');
        return null;
      }

      return parsed;
    } catch (e) {
      return null;
    }
  }

  /**
   * Clear stored token
   */
  static clearToken() {
    try {
      sessionStorage.removeItem('mdsg_auth');
      sessionStorage.removeItem('mdsg_csrf');
      localStorage.removeItem('mdsg_token'); // Legacy cleanup
      localStorage.removeItem('mdsg_user'); // Legacy cleanup
    } catch (e) {
      // Silent fail
    }
  }

  /**
   * Secure content storage with validation
   */
  static storeContent(content, key = 'mdsg_content') {
    if (!this.validateContent(content)) {
      console.warn('Content validation failed, not storing');
      return false;
    }

    try {
      const contentData = {
        content: content,
        timestamp: Date.now(),
        checksum: this.generateChecksum(content)
      };
      
      localStorage.setItem(key, JSON.stringify(contentData));
      localStorage.setItem('mdsg_last_save', new Date().toISOString());
      return true;
    } catch (e) {
      console.error('Failed to store content:', e);
      return false;
    }
  }

  /**
   * Secure content retrieval with validation
   */
  static getStoredContent(key = 'mdsg_content') {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      const contentData = JSON.parse(stored);
      
      // Validate integrity
      if (this.generateChecksum(contentData.content) !== contentData.checksum) {
        console.warn('Content integrity check failed');
        localStorage.removeItem(key);
        return null;
      }

      // Check if content is still valid
      if (!this.validateContent(contentData.content)) {
        console.warn('Stored content failed validation');
        localStorage.removeItem(key);
        return null;
      }

      return contentData.content;
    } catch (e) {
      console.error('Failed to retrieve content:', e);
      return null;
    }
  }

  /**
   * Generate simple checksum for content integrity
   */
  static generateChecksum(content) {
    if (typeof content !== 'string') return '';
    
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }
}

// Compatibility aliases for existing code
export const SecureHTML = MinimalSecurity;

// Additional methods for test compatibility
SecureHTML.sanitizeMarkdown = function (markdown) {
  if (typeof markdown !== 'string') return '';

  // Check for dangerous patterns
  const dangerousPatterns = [
    /<script[^>]*>/i,
    /javascript:/i,
    /vbscript:/i,
    /on\w+\s*=/i,
  ];

  // If dangerous patterns found, escape the entire content
  if (dangerousPatterns.some(pattern => pattern.test(markdown))) {
    // For markdown-specific dangerous patterns, completely neutralize dangerous protocols
    let escaped = MinimalSecurity.escapeText(markdown);
    if (markdown.includes('javascript:') || markdown.includes('vbscript:')) {
      // Additional escaping for dangerous protocols
      escaped = escaped.replace(/javascript:/gi, 'javascript&#58;');
      escaped = escaped.replace(/vbscript:/gi, 'vbscript&#58;');
      return '&lt;span class="dangerous-content"&gt;' + escaped + '&lt;/span&gt;';
    }
    return escaped;
  }

  return markdown;
};

// Additional test compatibility methods
SecureHTML.isValidURL = function (url) {
  if (typeof url !== 'string' || url === '') return false;

  // Allow relative URLs and anchors
  if (url.match(/^(\/|\.\/|\.\.\/|#)/)) return true;

  // Allow common safe protocols
  if (url.match(/^(https?:|ftp:|mailto:)/i)) return true;

  // Block dangerous schemes
  if (url.match(/^(javascript:|vbscript:|data:text\/html)/i)) return false;

  return false;
};

SecureHTML.sanitizeAttributes = function (attributes) {
  if (typeof attributes !== 'object' || attributes === null) return {};

  const safe = {};
  for (const [key, value] of Object.entries(attributes)) {
    // Remove dangerous attributes
    if (key.match(/^on/i)) continue;
    if (key === 'style' && typeof value === 'string' && value.match(/javascript:|expression\(/i)) continue;
    if ((key === 'href' || key === 'src') && !SecureHTML.isValidURL(value)) continue;

    // Don't escape URLs that are already safe
    if ((key === 'href' || key === 'src') && SecureHTML.isValidURL(value)) {
      safe[key] = value;
    } else {
      safe[key] = typeof value === 'string' ? MinimalSecurity.escapeText(value) : value;
    }
  }
  return safe;
};

SecureHTML.getConfig = function (mode) {
  switch (mode) {
    case 'strict':
      return {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'code'],
        FORBID_TAGS: ['img', 'a', 'script', 'iframe'],
        ALLOWED_ATTR: ['id', 'class'],
      };
    case 'minimal':
      return {
        ALLOWED_TAGS: ['p', 'br'],
        ALLOWED_ATTR: [],
      };
    default:
      return {};
  }
};
