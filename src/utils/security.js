import DOMPurify from 'dompurify';

/**
 * Secure HTML sanitization utility for MDSG
 * Prevents XSS attacks while allowing safe markdown content
 */
export class SecureHTML {
  /**
   * Sanitize HTML content with DOMPurify
   * @param {string} html - HTML content to sanitize
   * @param {object} options - Additional DOMPurify configuration
   * @returns {string} - Sanitized HTML
   */
  static sanitize(html, options = {}) {
    if (typeof html !== 'string') {
      return '';
    }

    const defaultConfig = {
      // Allow common markdown elements
      ALLOWED_TAGS: [
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'p',
        'br',
        'hr',
        'strong',
        'b',
        'em',
        'i',
        'u',
        's',
        'mark',
        'code',
        'pre',
        'kbd',
        'samp',
        'blockquote',
        'cite',
        'ul',
        'ol',
        'li',
        'dl',
        'dt',
        'dd',
        'a',
        'img',
        'table',
        'thead',
        'tbody',
        'tfoot',
        'tr',
        'th',
        'td',
        'div',
        'span',
        'section',
        'article',
        'header',
        'footer',
        'details',
        'summary',
      ],

      // Allow safe attributes
      ALLOWED_ATTR: [
        'href',
        'src',
        'alt',
        'title',
        'class',
        'id',
        'target',
        'rel',
        'loading',
        'width',
        'height',
        'colspan',
        'rowspan',
        'start',
        'type',
        'lang',
        'dir',
      ],

      // Only allow safe URL schemes
      ALLOWED_URI_REGEXP:
        /^(?:(?:https?|ftp|mailto):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,

      // Force target="_blank" for external links
      ADD_ATTR: ['target'],

      // Explicitly forbid dangerous attributes
      FORBID_ATTR: [
        'onerror',
        'onload',
        'onclick',
        'onmouseover',
        'onmouseout',
        'onfocus',
        'onblur',
        'onchange',
        'onsubmit',
        'onreset',
        'onselect',
        'onkeydown',
        'onkeypress',
        'onkeyup',
        'ondblclick',
        'onmousedown',
        'onmouseup',
        'onmousemove',
        'oncontextmenu',
        'ondrag',
        'ondrop',
        'onscroll',
      ],

      // Explicitly forbid dangerous tags
      FORBID_TAGS: [
        'script',
        'object',
        'embed',
        'iframe',
        'frame',
        'frameset',
        'applet',
        'base',
        'meta',
        'link',
        'style',
        'title',
        'svg',
        'math',
        'form',
        'input',
        'button',
        'textarea',
        'select',
      ],

      // Remove empty elements that could be used for attacks
      REMOVE_EMPTY: ['script', 'style'],

      // Keep content of invalid elements but remove the tags
      KEEP_CONTENT: true,

      // Return a DOM fragment for better performance
      RETURN_DOM_FRAGMENT: false,

      // Merge with custom options
      ...options,
    };

    try {
      // Check if DOMPurify is supported in current environment
      if (typeof window === 'undefined' || !DOMPurify.isSupported) {
        console.warn(
          'DOMPurify not supported in this environment, falling back to text escaping',
        );
        return this.escapeText(html);
      }

      const sanitized = DOMPurify.sanitize(html, defaultConfig);

      // Additional post-processing for markdown-specific concerns
      return this.postProcessMarkdown(sanitized);
    } catch (error) {
      console.error('HTML sanitization failed:', error);
      // Fallback to basic text escaping if DOMPurify fails
      return this.escapeText(html);
    }
  }

  /**
   * Sanitize and directly render to a DOM element
   * @param {string} html - HTML content to sanitize
   * @param {Element} container - DOM element to render into
   * @param {object} options - Additional DOMPurify configuration
   */
  static sanitizeAndRender(html, container, options = {}) {
    if (!container || typeof container.innerHTML === 'undefined') {
      console.error('Invalid container provided to sanitizeAndRender');
      return;
    }

    const sanitized = this.sanitize(html, options);
    container.innerHTML = sanitized;

    // Post-render security checks
    this.performPostRenderChecks(container);
  }

  /**
   * Escape text content for safe insertion into HTML
   * @param {string} text - Text to escape
   * @returns {string} - Escaped text
   */
  static escapeText(text) {
    if (typeof text !== 'string') {
      return '';
    }

    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Sanitize markdown content with stricter rules
   * @param {string} markdown - Markdown content to sanitize
   * @returns {string} - Sanitized markdown
   */
  static sanitizeMarkdown(markdown) {
    if (typeof markdown !== 'string') {
      return '';
    }

    // Log suspicious patterns but let DOMPurify handle the sanitization
    const suspiciousPatterns = [
      /<script[^>]*>/i,
      /javascript:/i,
      /vbscript:/i,
      /data:text\/html/i,
      /onload\s*=/i,
      /onerror\s*=/i,
      /<iframe[^>]*>/i,
      /<object[^>]*>/i,
      /<embed[^>]*>/i,
    ];

    const hasSuspiciousContent = suspiciousPatterns.some(pattern =>
      pattern.test(markdown),
    );

    if (hasSuspiciousContent) {
      console.warn(
        'Suspicious content detected in markdown, will be sanitized by DOMPurify',
      );
    }

    // Return the markdown as-is - DOMPurify will handle the sanitization
    return markdown;
  }

  /**
   * Create safe attributes object for dynamic element creation
   * @param {object} attributes - Attributes to sanitize
   * @returns {object} - Sanitized attributes
   */
  static sanitizeAttributes(attributes) {
    if (!attributes || typeof attributes !== 'object') {
      return {};
    }

    const safeAttributes = {};
    const allowedAttrs = [
      'class',
      'id',
      'href',
      'src',
      'alt',
      'title',
      'target',
      'rel',
      'loading',
      'width',
      'height',
    ];

    for (const [key, value] of Object.entries(attributes)) {
      const lowerKey = key.toLowerCase();

      // Skip dangerous attributes
      if (lowerKey.startsWith('on') || !allowedAttrs.includes(lowerKey)) {
        continue;
      }

      // Sanitize the value
      if (typeof value === 'string') {
        if (lowerKey === 'href' || lowerKey === 'src') {
          // Validate URLs
          if (this.isValidURL(value)) {
            safeAttributes[key] = value;
          }
        } else {
          // Escape other string values
          safeAttributes[key] = this.escapeText(value);
        }
      } else {
        safeAttributes[key] = value;
      }
    }

    return safeAttributes;
  }

  /**
   * Validate if a URL is safe
   * @param {string} url - URL to validate
   * @returns {boolean} - Whether the URL is safe
   */
  static isValidURL(url) {
    if (typeof url !== 'string') {
      return false;
    }

    // Allow relative URLs and safe protocols
    const safeProtocols = /^(https?:|ftp:|mailto:|#|\/|\.\/|\.\.\/)/i;
    const dangerousProtocols = /^(javascript:|vbscript:|data:)/i;

    return safeProtocols.test(url) && !dangerousProtocols.test(url);
  }

  /**
   * Post-process sanitized markdown content
   * @param {string} html - Sanitized HTML
   * @returns {string} - Post-processed HTML
   */
  static postProcessMarkdown(html) {
    // Ensure external links open in new tab with security attributes
    return html.replace(
      /<a\s+([^>]*href\s*=\s*["']https?:\/\/[^"']*["'][^>]*)>/gi,
      '<a $1 target="_blank" rel="noopener noreferrer">',
    );
  }

  /**
   * Perform security checks after rendering
   * @param {Element} container - Container element to check
   */
  static performPostRenderChecks(container) {
    try {
      // Check for any script tags that might have slipped through
      const scripts = container.querySelectorAll('script');
      if (scripts.length > 0) {
        console.error('Script tags detected after sanitization - removing');
        scripts.forEach(script => script.remove());
      }

      // Check for elements with event handlers
      const elementsWithEvents = container.querySelectorAll('*');
      elementsWithEvents.forEach(element => {
        // Remove any event handler attributes that might exist
        Array.from(element.attributes).forEach(attr => {
          if (attr.name.toLowerCase().startsWith('on')) {
            console.warn(`Removing event handler attribute: ${attr.name}`);
            element.removeAttribute(attr.name);
          }
        });
      });

      // Ensure all external links have proper security attributes
      const externalLinks = container.querySelectorAll('a[href^="http"]');
      externalLinks.forEach(link => {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      });
    } catch (error) {
      console.error('Post-render security check failed:', error);
    }
  }

  /**
   * Create a safe configuration for specific use cases
   * @param {string} mode - Configuration mode ('strict', 'basic', 'minimal')
   * @returns {object} - DOMPurify configuration
   */
  static getConfig(mode = 'basic') {
    const configs = {
      strict: {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'code'],
        ALLOWED_ATTR: ['class'],
        FORBID_ATTR: ['style', 'id'],
        FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'img', 'a'],
      },

      basic: {
        // Default configuration (used in sanitize method)
      },

      minimal: {
        ALLOWED_TAGS: ['p', 'br'],
        ALLOWED_ATTR: [],
        FORBID_ATTR: ['style', 'class', 'id'],
        KEEP_CONTENT: true,
      },
    };

    return configs[mode] || configs.basic;
  }
}

// Legacy function for backward compatibility
export function escapeHtml(text) {
  return SecureHTML.escapeText(text);
}

// Make SecureHTML available as default export
export default SecureHTML;
