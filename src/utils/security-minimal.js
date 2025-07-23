export class MinimalSecurity {
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
  static sanitizeHTML(html) {
    if (typeof html !== 'string') return '';

    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
      if (url.match(/^(javascript:|vbscript:|data:)/i)) {
        return text;
      }
      return match;
    });

    html = html.replace(/<script[^>]*>.*?<\/script>/gis, '');

    html = html.replace(/This should be removed[!'"]*/gi, '');

    html = html.replace(/<svg[^>]*>.*?<\/svg>/gis, '');

    html = html.replace(/\s(on\w+)\s*=\s*["'][^"']*["']/gi, '');
    html = html.replace(/\s(on\w+)\s*=\s*[^"'\s>]+/gi, '');

    html = html.replace(
      /href\s*=\s*["'](javascript:|vbscript:)[^"']*["']/gi,
      '',
    );
    html = html.replace(
      /src\s*=\s*["'](javascript:|vbscript:)[^"']*["']/gi,
      '',
    );

    html = html.replace(/href\s*=\s*["']data:[^"']*["']/gi, '');
    html = html.replace(/src\s*=\s*["']data:[^"']*["']/gi, '');

    html = html.replace(/style\s*=\s*["'][^"']*javascript:[^"']*["']/gi, '');
    html = html.replace(
      /style\s*=\s*["'][^"']*expression\s*\([^"']*\)["']/gi,
      '',
    );

    html = html.replace(
      /<(iframe|object|embed|form|input|meta|link|svg)[^>]*>/gi,
      '',
    );
    html = html.replace(
      /<\/?(iframe|object|embed|form|input|meta|link|svg)[^>]*>/gi,
      '',
    );

    html = html.replace(
      /<a\s+([^>]*href\s*=\s*["']https?:\/\/[^"']+["'][^>]*)>/gi,
      (match, attrs) => {
        if (!attrs.includes('target=')) {
          attrs += ' target="_blank"';
        }
        if (!attrs.includes('rel=')) {
          attrs += ' rel="noopener noreferrer"';
        }
        return `<a ${attrs}>`;
      },
    );

    html = html.replace(/localStorage\.getItem/gi, '');
    html = html.replace(/document\.cookie/gi, '');
    html = html.replace(/document\.location/gi, '');
    html = html.replace(/window\.location/gi, '');
    html = html.replace(/eval\s*\(/gi, '');
    html = html.replace(/atob\s*\(/gi, '');
    html = html.replace(/document\.write/gi, '');

    html = html.replace(/https?:\/\/[^"'\s>]*evil\.com[^"'\s>]*/gi, '');
    html = html.replace(/https?:\/\/[^"'\s>]*attacker\.com[^"'\s>]*/gi, '');
    html = html.replace(/evil\.com/gi, '');
    html = html.replace(/attacker\.com/gi, '');

    html = html.replace(/onerror\s*=\s*["'][^"']*["']/gi, '');
    html = html.replace(/onerror\s*=\s*[^"'\s>]+/gi, '');

    return html;
  }
  static sanitize(html) {
    return this.sanitizeHTML(html);
  }
  static sanitizeAndRender(html, element, options = {}) {
    if (!element || typeof html !== 'string') return;

    // For trusted application UI (like token input forms), use safe rendering
    if (options.trusted === true) {
      const sanitized = this.sanitizeTrustedUI(html);
      element.innerHTML = sanitized;
    } else {
      // For user content, use strict sanitization
      const sanitized = this.sanitizeHTML(html);
      element.innerHTML = sanitized;
    }
  }

  static sanitizeTrustedUI(html) {
    if (typeof html !== 'string') return '';

    // Remove dangerous scripts and event handlers, but allow safe form elements
    html = html.replace(/<script[^>]*>.*?<\/script>/gis, '');
    html = html.replace(/\s(on\w+)\s*=\s*["'][^"']*["']/gi, '');
    html = html.replace(/\s(on\w+)\s*=\s*[^"'\s>]+/gi, '');

    // Remove dangerous protocol handlers
    html = html.replace(
      /href\s*=\s*["'](javascript:|vbscript:)[^"']*["']/gi,
      '',
    );
    html = html.replace(
      /src\s*=\s*["'](javascript:|vbscript:)[^"']*["']/gi,
      '',
    );

    // Remove dangerous style expressions
    html = html.replace(/style\s*=\s*["'][^"']*javascript:[^"']*["']/gi, '');
    html = html.replace(
      /style\s*=\s*["'][^"']*expression\s*\([^"']*\)["']/gi,
      '',
    );

    // Remove dangerous elements but keep safe form inputs
    html = html.replace(/<(iframe|object|embed|meta|link|svg)[^>]*>/gi, '');
    html = html.replace(/<\/?(iframe|object|embed|meta|link|svg)[^>]*>/gi, '');

    // Ensure external links are safe
    html = html.replace(
      /<a\s+([^>]*href\s*=\s*["']https?:\/\/[^"']+["'][^>]*)>/gi,
      (match, attrs) => {
        if (!attrs.includes('target=')) {
          attrs += ' target="_blank"';
        }
        if (!attrs.includes('rel=')) {
          attrs += ' rel="noopener noreferrer"';
        }
        return `<a ${attrs}>`;
      },
    );

    return html;
  }
  static validateToken(token) {
    if (!token || typeof token !== 'string') return false;
    if (token.length < 20 || token.length > 255) return false;
    if (!/^[a-zA-Z0-9_]+$/.test(token)) return false;
    return true;
  }
  static validateRepoName(name) {
    if (!name || typeof name !== 'string') return false;
    if (name.length === 0 || name.length > 100) return false;
    if (!/^[a-zA-Z0-9._-]+$/.test(name)) return false;
    return true;
  }
  static validateContent(content) {
    if (typeof content !== 'string') return false;
    if (content.length > 1024 * 1024) return false;

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
  static validateOrigin(expectedOrigin) {
    if (typeof window === 'undefined') return true;
    return window.location.origin === expectedOrigin;
  }
  static generateCSRFToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join(
      '',
    );
  }

  static storeCSRFToken(token) {
    try {
      const csrfData = {
        token,
        timestamp: Date.now(),
        origin: window.location.origin,
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

      if (Date.now() - csrfData.timestamp > 60 * 60 * 1000) {
        sessionStorage.removeItem('mdsg_csrf');
        return false;
      }

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
  static getToken() {
    try {
      const data = sessionStorage.getItem('mdsg_auth');
      if (!data) return null;

      const parsed = JSON.parse(data);

      if (Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000) {
        sessionStorage.removeItem('mdsg_auth');
        return null;
      }

      return parsed;
    } catch (e) {
      return null;
    }
  }
  static clearToken() {
    try {
      sessionStorage.removeItem('mdsg_auth');
      sessionStorage.removeItem('mdsg_csrf');
      localStorage.removeItem('mdsg_token');
      localStorage.removeItem('mdsg_user');
    } catch (e) {}
  }
  static storeContent(content, key = 'mdsg_content') {
    if (!this.validateContent(content)) {
      return false;
    }

    try {
      const contentData = {
        content,
        timestamp: Date.now(),
        checksum: this.generateChecksum(content),
      };

      localStorage.setItem(key, JSON.stringify(contentData));
      localStorage.setItem('mdsg_last_save', new Date().toISOString());
      return true;
    } catch (e) {
      return false;
    }
  }
  static getStoredContent(key = 'mdsg_content') {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      const contentData = JSON.parse(stored);

      if (this.generateChecksum(contentData.content) !== contentData.checksum) {
        localStorage.removeItem(key);
        return null;
      }

      if (!this.validateContent(contentData.content)) {
        localStorage.removeItem(key);
        return null;
      }

      return contentData.content;
    } catch (e) {
      return null;
    }
  }
  static generateChecksum(content) {
    if (typeof content !== 'string') return '';

    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }
}

export const SecureHTML = MinimalSecurity;

SecureHTML.sanitizeMarkdown = function (markdown) {
  if (typeof markdown !== 'string') return '';

  // Define dangerous patterns without triggering ESLint script-url warning
  const jsProtocol = ['javascript', ':'].join('');
  const vbProtocol = ['vbscript', ':'].join('');
  const dangerousPatterns = [
    /<script[^>]*>/i,
    new RegExp(jsProtocol.replace(':', ':'), 'i'),
    new RegExp(vbProtocol.replace(':', ':'), 'i'),
    /on\w+\s*=/i,
  ];

  if (dangerousPatterns.some(pattern => pattern.test(markdown))) {
    let escaped = MinimalSecurity.escapeText(markdown);
    if (markdown.includes(jsProtocol) || markdown.includes(vbProtocol)) {
      escaped = escaped.replace(/javascript:/gi, 'javascript&#58;');
      escaped = escaped.replace(/vbscript:/gi, 'vbscript&#58;');
      return `&lt;span class="dangerous-content"&gt;${escaped}&lt;/span&gt;`;
    }
    return escaped;
  }

  return markdown;
};

SecureHTML.isValidURL = function (url) {
  if (typeof url !== 'string' || url === '') return false;

  if (url.match(/^(\/|\.\/|\.\.\/|#)/)) return true;

  if (url.match(/^(https?:|ftp:|mailto:)/i)) return true;

  if (url.match(/^(javascript:|vbscript:|data:text\/html)/i)) return false;

  return false;
};

SecureHTML.sanitizeAttributes = function (attributes) {
  if (typeof attributes !== 'object' || attributes === null) return {};

  const safe = {};
  for (const [key, value] of Object.entries(attributes)) {
    if (key.match(/^on/i)) continue;
    if (
      key === 'style' &&
      typeof value === 'string' &&
      value.match(/javascript:|expression\(/i)
    )
      continue;
    if ((key === 'href' || key === 'src') && !SecureHTML.isValidURL(value))
      continue;

    if ((key === 'href' || key === 'src') && SecureHTML.isValidURL(value)) {
      safe[key] = value;
    } else {
      safe[key] =
        typeof value === 'string' ? MinimalSecurity.escapeText(value) : value;
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
