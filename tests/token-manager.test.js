// Lean architecture token management tests for MDSG
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MinimalSecurity } from '../src/utils/security-minimal.js';

describe('Lean Token Management', () => {
  beforeEach(() => {
    // Clear any existing tokens
    MinimalSecurity.clearToken();

    // Set up proper sessionStorage mock
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
        for (const key in storage) delete storage[key];
      }),
    };
  });

  describe('Basic Token Operations', () => {
    it('should store and retrieve tokens', () => {
      const token = 'ghp_1234567890123456789012345678901234567890'; // Valid GitHub token format
      const user = { login: 'testuser', id: 123 };

      MinimalSecurity.storeToken(token, user);
      const retrieved = MinimalSecurity.getToken();

      expect(retrieved).toBeTruthy();
      expect(retrieved.token).toBe(token);
      expect(retrieved.user.login).toBe('testuser');
    });

    it('should clear tokens completely', () => {
      MinimalSecurity.storeToken('ghp_test123456789012345678901234567890', {
        login: 'test',
      });
      MinimalSecurity.clearToken();

      expect(MinimalSecurity.getToken()).toBe(null);
    });

    it('should handle invalid tokens gracefully', () => {
      expect(() => MinimalSecurity.storeToken(null)).not.toThrow();
      expect(() => MinimalSecurity.storeToken('')).not.toThrow();
      expect(() => MinimalSecurity.storeToken(123)).not.toThrow();
    });

    it('should validate GitHub token format', () => {
      expect(
        MinimalSecurity.validateToken(
          'ghp_1234567890123456789012345678901234567890',
        ),
      ).toBe(true);
      expect(
        MinimalSecurity.validateToken(
          'gho_1234567890123456789012345678901234567890',
        ),
      ).toBe(true);
      expect(MinimalSecurity.validateToken('invalid-token')).toBe(false);
      expect(MinimalSecurity.validateToken('')).toBe(false);
      expect(MinimalSecurity.validateToken(null)).toBe(false);
    });
  });

  describe('Security Features', () => {
    it('should escape HTML content', () => {
      const dangerous = '<script>alert("xss")</script>';
      const escaped = MinimalSecurity.escapeText(dangerous);

      expect(escaped).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;',
      );
      expect(escaped).not.toContain('<script>');
    });

    it('should sanitize HTML content', () => {
      const dangerous = '<script>alert("xss")</script><p>Safe content</p>';
      const sanitized = MinimalSecurity.sanitizeHTML(dangerous);

      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('<p>Safe content</p>');
    });
  });

  describe('Error Handling', () => {
    it('should handle storage errors gracefully', () => {
      // Mock sessionStorage to throw error
      const originalSetItem = sessionStorage.setItem;
      sessionStorage.setItem = () => {
        throw new Error('Storage full');
      };

      expect(() => MinimalSecurity.storeToken('test-token')).not.toThrow();

      // Restore original
      sessionStorage.setItem = originalSetItem;
    });

    it('should handle corrupted token data', () => {
      // Manually set corrupted data
      sessionStorage.setItem('mdsg_auth', 'corrupted-json');

      expect(MinimalSecurity.getToken()).toBe(null);
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete authentication flow', () => {
      const token = 'ghp_valid_token_1234567890123456789012345678901';
      const user = {
        id: 12345,
        login: 'testuser',
        name: 'Test User',
        avatar_url: 'https://github.com/avatar.jpg',
      };

      // Store token
      MinimalSecurity.storeToken(token, user);

      // Verify storage
      const retrieved = MinimalSecurity.getToken();
      expect(retrieved.token).toBe(token);
      expect(retrieved.user.login).toBe('testuser');

      // Clear token
      MinimalSecurity.clearToken();
      expect(MinimalSecurity.getToken()).toBe(null);
    });

    it('should maintain data integrity', () => {
      const token1 = 'ghp_token1_567890123456789012345678901234567';
      const user1 = { login: 'user1' };

      MinimalSecurity.storeToken(token1, user1);

      const token2 = 'ghp_token2_567890123456789012345678901234567';
      const user2 = { login: 'user2' };

      MinimalSecurity.storeToken(token2, user2);

      // Should have latest token
      const retrieved = MinimalSecurity.getToken();
      expect(retrieved.token).toBe(token2);
      expect(retrieved.user.login).toBe('user2');
    });
  });
});
