// Basic security validation tests for MDSG lean architecture
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MinimalSecurity } from '../src/utils/security-minimal.js';

describe('Basic Security Functions', () => {
  beforeEach(() => {
    // Set up proper sessionStorage mock for token tests
    const storage = {};
    global.sessionStorage = {
      getItem: vi.fn(key => storage[key] || null),
      setItem: vi.fn((key, value) => {
        storage[key] = value;
      }),
      removeItem: vi.fn(key => {
        delete storage[key];
      }),
      clear: vi.fn(() => {
        Object.keys(storage).forEach(key => delete storage[key]);
      }),
    };

    // Clear any existing tokens
    MinimalSecurity.clearToken();
  });
  describe('Text Escaping', () => {
    it('should escape HTML special characters', () => {
      const dangerous = '<script>alert("xss")</script>';
      const escaped = MinimalSecurity.escapeText(dangerous);

      expect(escaped).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;',
      );
      expect(escaped).not.toContain('<script>');
      expect(escaped).toContain('&lt;script&gt;');
      expect(escaped).toContain('alert'); // Text content should be preserved
    });

    it('should escape all dangerous characters', () => {
      const text = '<>&"\'/';
      const escaped = MinimalSecurity.escapeText(text);

      expect(escaped).toBe('&lt;&gt;&amp;&quot;&#39;&#x2F;');
    });

    it('should handle non-string inputs safely', () => {
      expect(MinimalSecurity.escapeText(null)).toBe('');
      expect(MinimalSecurity.escapeText(undefined)).toBe('');
      expect(MinimalSecurity.escapeText(123)).toBe('');
      expect(MinimalSecurity.escapeText({})).toBe('');
    });

    it('should handle empty strings', () => {
      expect(MinimalSecurity.escapeText('')).toBe('');
    });
  });

  describe('HTML Sanitization', () => {
    it('should sanitize dangerous HTML', () => {
      const dangerous = '<script>alert("xss")</script><p>Safe content</p>';
      const sanitized = MinimalSecurity.sanitizeHTML(dangerous);

      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('<p>Safe content</p>');
    });

    it('should handle empty content', () => {
      expect(MinimalSecurity.sanitizeHTML('')).toBe('');
      expect(MinimalSecurity.sanitizeHTML(null)).toBe('');
      expect(MinimalSecurity.sanitizeHTML(undefined)).toBe('');
    });
  });

  describe('Token Management', () => {
    it('should store and retrieve tokens', () => {
      const token = 'ghp_1234567890123456789012345678901234567890';
      MinimalSecurity.storeToken(token);
      expect(MinimalSecurity.getToken()).toBeTruthy();
    });

    it('should clear tokens', () => {
      MinimalSecurity.storeToken('ghp_test123456789012345678901234567890');
      MinimalSecurity.clearToken();
      expect(MinimalSecurity.getToken()).toBe(null);
    });

    it('should handle invalid tokens', () => {
      expect(() => MinimalSecurity.storeToken(null)).not.toThrow();
      expect(() => MinimalSecurity.storeToken('')).not.toThrow();
    });
  });
});
