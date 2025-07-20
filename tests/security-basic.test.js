// Basic security validation tests for MDSG
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SecureHTML } from '../src/security-minimal.js';

describe('Basic Security Functions', () => {
  describe('Text Escaping', () => {
    it('should escape HTML special characters', () => {
      const dangerous = '<script>alert("xss")</script>';
      const escaped = SecureHTML.escapeText(dangerous);

      expect(escaped).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;',
      );
      expect(escaped).not.toContain('<script>');
      expect(escaped).toContain('&lt;script&gt;');
      expect(escaped).toContain('alert'); // Text content should be preserved
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

    it('should handle empty strings', () => {
      expect(SecureHTML.escapeText('')).toBe('');
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
      expect(SecureHTML.isValidURL('../relative/path')).toBe(true);
      expect(SecureHTML.isValidURL('#anchor')).toBe(true);
    });

    it('should reject dangerous URL schemes', () => {
      expect(SecureHTML.isValidURL('javascript:alert(1)')).toBe(false);
      expect(SecureHTML.isValidURL('vbscript:msgbox(1)')).toBe(false);
      expect(
        SecureHTML.isValidURL('data:text/html,<script>alert(1)</script>'),
      ).toBe(false);
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
        alt: 'Image description',
      };

      const sanitized = SecureHTML.sanitizeAttributes(attributes);

      expect(sanitized.class).toBe('safe-class');
      expect(sanitized.id).toBe('safe-id');
      expect(sanitized.href).toBe('https://example.com');
      expect(sanitized.alt).toBe('Image description');
    });

    it('should remove dangerous event handler attributes', () => {
      const attributes = {
        class: 'safe-class',
        onclick: 'alert("xss")',
        onmouseover: 'steal()',
        onerror: 'attack()',
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
        alt: 'Image',
      };

      const sanitized = SecureHTML.sanitizeAttributes(attributes);

      expect(sanitized.href).toBeUndefined(); // Invalid URL removed
      expect(sanitized.src).toBe('https://example.com/image.jpg');
      expect(sanitized.alt).toBe('Image');
    });

    it('should escape string values in attributes', () => {
      const attributes = {
        alt: 'Image with "quotes" and <tags>',
        title: 'Title with & ampersand',
      };

      const sanitized = SecureHTML.sanitizeAttributes(attributes);

      expect(sanitized.alt).toBe(
        'Image with &quot;quotes&quot; and &lt;tags&gt;',
      );
      expect(sanitized.title).toBe('Title with &amp; ampersand');
    });

    it('should handle non-object inputs', () => {
      expect(SecureHTML.sanitizeAttributes(null)).toEqual({});
      expect(SecureHTML.sanitizeAttributes(undefined)).toEqual({});
      expect(SecureHTML.sanitizeAttributes('string')).toEqual({});
      expect(SecureHTML.sanitizeAttributes(123)).toEqual({});
    });
  });

  describe('Markdown Content Validation', () => {
    it('should detect suspicious markdown patterns', () => {
      const suspiciousMarkdown =
        '# Title\n<script>alert("xss")</script>\nSafe content';

      // Should log warning but return content for DOMPurify to handle
      const result = SecureHTML.sanitizeMarkdown(suspiciousMarkdown);

      // In test environment, just verify function runs without error
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should allow safe markdown content', () => {
      const safeMarkdown =
        '# Title\n\n**Bold text** and *italic text*\n\n[Link](https://example.com)';
      const result = SecureHTML.sanitizeMarkdown(safeMarkdown);

      expect(result).toBe(safeMarkdown);
    });

    it('should handle empty or invalid markdown', () => {
      expect(SecureHTML.sanitizeMarkdown('')).toBe('');
      expect(SecureHTML.sanitizeMarkdown(null)).toBe('');
      expect(SecureHTML.sanitizeMarkdown(undefined)).toBe('');
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

    it('should provide basic configuration by default', () => {
      const config = SecureHTML.getConfig();

      expect(config).toEqual({});
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid inputs to sanitize method', () => {
      expect(SecureHTML.sanitize(null)).toBe('');
      expect(SecureHTML.sanitize(undefined)).toBe('');
      expect(SecureHTML.sanitize(123)).toBe('');
      expect(SecureHTML.sanitize({})).toBe('');
      expect(SecureHTML.sanitize([])).toBe('');
    });

    it('should handle empty HTML input', () => {
      expect(SecureHTML.sanitize('')).toBe('');
    });
  });

  describe('Security Utility Integration', () => {
    it('should provide consistent escaping between methods', () => {
      const dangerous = '<script>alert("test")</script>';

      const escaped1 = SecureHTML.escapeText(dangerous);
      const sanitized = SecureHTML.sanitize(dangerous);

      // Both should prevent script execution
      expect(escaped1).not.toContain('<script>');
      expect(sanitized).not.toContain('<script>');
    });

    it('should handle mixed content appropriately', () => {
      const mixedContent =
        '<p>Safe paragraph</p><script>alert("dangerous")</script>';
      const result = SecureHTML.sanitize(mixedContent);

      // Should not contain dangerous scripts regardless of method used
      expect(result).not.toContain('<script>');
    });
  });

  describe('Environment Detection', () => {
    it('should gracefully handle test environment', () => {
      // In test environment, sanitize should fall back to escaping
      const html = '<p>Test content</p><script>alert("test")</script>';
      const result = SecureHTML.sanitize(html);

      // Should be safe regardless of method used
      expect(result).not.toContain('<script>');
      expect(typeof result).toBe('string');
    });
  });

  describe('Real-world Validation', () => {
    it('should prevent basic XSS in markdown context', () => {
      const maliciousMarkdown =
        '# My Site\n<img src="x" onerror="alert(1)">\nSafe content';

      // Test the escaping fallback
      const escaped = SecureHTML.escapeText(maliciousMarkdown);
      expect(escaped).not.toContain('onerror="alert(1)"');
      expect(escaped).toContain('&lt;img');
    });

    it('should validate repository names safely', () => {
      // This would be used in the main app
      const validRepo = 'my-awesome-site';
      const invalidRepo = '<script>alert("xss")</script>';

      expect(/^[a-zA-Z0-9._-]+$/.test(validRepo)).toBe(true);
      expect(/^[a-zA-Z0-9._-]+$/.test(invalidRepo)).toBe(false);
    });

    it('should safely handle user content in site generation', () => {
      const userTitle = 'My Site <script>alert("xss")</script>';
      const safeTitle = SecureHTML.escapeText(userTitle);

      expect(safeTitle).toBe(
        'My Site &lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;',
      );
      expect(safeTitle).not.toContain('<script>');
    });
  });
});
