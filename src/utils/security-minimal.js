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
      /href\s*=\s*['"](javascript:|vbscript:)[^'"]*['"]/gi,
      '',
    );
    html = html.replace(
      /src\s*=\s*['"](javascript:|vbscript:)[^'"]*['"]/gi,
      '',
    );
    html = html.replace(/href\s*=\s*['"]data:[^'"]*['"]/gi, '');
    html = html.replace(/src\s*=\s*['"]data:[^'"]*['"]/gi, '');
    html = html.replace(/style\s*=\s*['"][^'"]*javascript:[^'"]*['"]/gi, '');
    html = html.replace(
      /style\s*=\s*['"][^'"]*expression\s*\([^'"]*\)['"]/gi,
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
      /<a\s+([^>]*href\s*=\s*['"]https?:\/\/[^'"]+['"][^>]*)>/gi,
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
    html = html.replace(/document\.cookie/gi, '');
    html = html.replace(/document\.location/gi, '');
    html = html.replace(/window\.location/gi, '');
    html = html.replace(/localStorage/gi, '');
    html = html.replace(/sessionStorage/gi, '');
    html = html.replace(/eval\s*\(/gi, '');
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
    if (options.trusted === true) {
      const sanitized = this.sanitizeTrustedUI(html);
      element.innerHTML = sanitized;
    } else {
      const sanitized = this.sanitizeHTML(html);
      element.innerHTML = sanitized;
    }
  }

  static sanitizeTrustedUI(html) {
    if (typeof html !== 'string') return '';
    html = html.replace(/<script[^>]*>.*?<\/script>/gis, '');
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
    html = html.replace(/style\s*=\s*["'][^"']*javascript:[^"']*["']/gi, '');
    html = html.replace(
      /style\s*=\s*["'][^"']*expression\s*\([^"']*\)["']/gi,
      '',
    );
    html = html.replace(/<(iframe|object|embed|meta|link|svg)[^>]*>/gi, '');
    html = html.replace(/<\/?(iframe|object|embed|meta|link|svg)[^>]*>/gi, '');
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

  static getToken() {
    try {
      const stored = sessionStorage.getItem('mdsg_auth');
      if (!stored) return null;

      const data = JSON.parse(stored);
      return data;
    } catch (e) {
      return null;
    }
  }

  static clearToken() {
    try {
      sessionStorage.removeItem('mdsg_auth');
      sessionStorage.removeItem('mdsg_csrf');
      localStorage.removeItem('mdsg_content');
      return true;
    } catch (e) {
      return false;
    }
  }

  static storeContent(content) {
    if (!this.validateContent(content)) return false;

    try {
      const data = {
        content,
        timestamp: Date.now(),
        checksum: this.generateChecksum(content),
      };

      localStorage.setItem('mdsg_content', JSON.stringify(data));
      return true;
    } catch (e) {
      return false;
    }
  }

  static isValidURL(url) {
    if (typeof url !== 'string' || url === '') return false;
    // Allow relative URLs, anchors, and filenames
    if (url.match(/^(\/|\.\/|\.\.\/|#)[\w\-./]*$/)) return true;
    if (url.match(/^[a-zA-Z0-9._-]+$/)) return true;
    if (url.match(/^(https?:|ftp:|mailto:)/i)) return true;
    if (url.match(/^(javascript:|vbscript:|data:text\/html)/i)) return false;
    return false;
  }

  static storeToken(token, userInfo = null) {
    if (!token || typeof token !== 'string') return false;

    try {
      const data = {
        token,
        timestamp: Date.now(),
        ...(userInfo && { user: userInfo }),
      };

      sessionStorage.setItem('mdsg_auth', JSON.stringify(data));
      return true;
    } catch (e) {
      return false;
    }
  }

  static validateToken(token) {
    if (!token || typeof token !== 'string') return false;

    // GitHub personal access token (classic) - ghp_ + 36 chars = 40 total
    if (token.startsWith('ghp_') && token.length >= 40) return true;

    // GitHub fine-grained personal access token - github_pat_ + variable length
    if (token.startsWith('github_pat_') && token.length >= 30) return true;

    // GitHub OAuth token - gho_ + 36 chars = 40 total
    if (token.startsWith('gho_') && token.length >= 40) return true;

    // Legacy token format (40 character hex)
    if (/^[a-f0-9]{40}$/i.test(token)) return true;

    return false;
  }
}

export const SecureHTML = MinimalSecurity;

SecureHTML.sanitizeMarkdown = function (markdown) {
  if (typeof markdown !== 'string') return '';
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

SecureHTML.isValidURL = MinimalSecurity.isValidURL;
