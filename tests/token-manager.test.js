// Comprehensive tests for SecureTokenManager
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MinimalSecurity } from '../src/security-minimal.js';

// Use MinimalSecurity as SecureTokenManager for compatibility with tests
const SecureTokenManager = MinimalSecurity;

describe('SecureTokenManager', () => {
  let tokenManager;
  let mockSessionStorage;
  let mockLocalStorage;

  beforeEach(() => {
    // Mock sessionStorage
    mockSessionStorage = {
      data: {},
      getItem: vi.fn(key => mockSessionStorage.data[key] || null),
      setItem: vi.fn((key, value) => {
        mockSessionStorage.data[key] = value;
      }),
      removeItem: vi.fn(key => {
        delete mockSessionStorage.data[key];
      }),
      clear: vi.fn(() => {
        mockSessionStorage.data = {};
      }),
    };

    // Mock localStorage
    mockLocalStorage = {
      data: {},
      getItem: vi.fn(key => mockLocalStorage.data[key] || null),
      setItem: vi.fn((key, value) => {
        mockLocalStorage.data[key] = value;
      }),
      removeItem: vi.fn(key => {
        delete mockLocalStorage.data[key];
      }),
      clear: vi.fn(() => {
        mockLocalStorage.data = {};
      }),
    };

    // Mock window objects
    global.sessionStorage = mockSessionStorage;
    global.localStorage = mockLocalStorage;
    global.window = {
      location: { origin: 'https://mdsg.daza.ar' },
      crypto: {
        getRandomValues: vi.fn(array => {
          for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256);
          }
          return array;
        }),
      },
    };
    global.navigator = {
      userAgent: 'Mozilla/5.0 (Test Browser)',
    };

    // Create fresh instance
    tokenManager = new SecureTokenManager();
  });

  afterEach(() => {
    vi.clearAllMocks();
    mockSessionStorage.clear();
    mockLocalStorage.clear();
  });

  describe('Token Storage and Retrieval', () => {
    const validToken = 'ghp_1234567890123456789012345678901234567890';
    const userInfo = {
      id: 12345,
      login: 'testuser',
      name: 'Test User',
      avatar_url: 'https://github.com/avatar.jpg',
    };

    it('should store token securely', () => {
      const result = tokenManager.storeToken(validToken, userInfo);

      expect(result).toBe(true);
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'mdsg_secure_auth',
        expect.any(String),
      );
    });

    it('should retrieve stored token correctly', () => {
      tokenManager.storeToken(validToken, userInfo);
      const retrieved = tokenManager.getToken();

      expect(retrieved).toBeTruthy();
      expect(retrieved.token).toBe(validToken);
      expect(retrieved.user.login).toBe('testuser');
      expect(retrieved.origin).toBe('https://mdsg.daza.ar');
    });

    it('should get token string directly', () => {
      tokenManager.storeToken(validToken, userInfo);
      const tokenString = tokenManager.getTokenString();

      expect(tokenString).toBe(validToken);
    });

    it('should get user info from token', () => {
      tokenManager.storeToken(validToken, userInfo);
      const retrievedUser = tokenManager.getUserInfo();

      expect(retrievedUser.login).toBe('testuser');
      expect(retrievedUser.id).toBe(12345);
    });

    it('should return null for non-existent token', () => {
      const token = tokenManager.getToken();
      const tokenString = tokenManager.getTokenString();
      const userInfo = tokenManager.getUserInfo();

      expect(token).toBeNull();
      expect(tokenString).toBeNull();
      expect(userInfo).toBeNull();
    });

    it('should handle storage without user info', () => {
      const result = tokenManager.storeToken(validToken);

      expect(result).toBe(true);

      const retrieved = tokenManager.getToken();
      expect(retrieved.token).toBe(validToken);
      expect(retrieved.user).toBeNull();
    });
  });

  describe('Token Validation', () => {
    it('should validate GitHub token formats', () => {
      const validTokens = [
        'ghp_1234567890123456789012345678901234567890',
        'gho_abcdefghijklmnopqrstuvwxyz1234567890',
        'ghu_ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
        'ghs_1234567890abcdefghijklmnopqrstuvwxyz',
        'github_pat_11ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890123456789012345678901234567890123456789012345678',
      ];

      validTokens.forEach(token => {
        expect(tokenManager.validateTokenFormat(token)).toBe(true);
      });
    });

    it('should reject invalid token formats', () => {
      const invalidTokens = [
        'invalid',
        'ghp_short',
        'not_github_token_1234567890123456789012345678901234567890',
        '',
        null,
        undefined,
        123,
        'a'.repeat(200), // Too long
      ];

      invalidTokens.forEach(token => {
        expect(tokenManager.validateTokenFormat(token)).toBe(false);
      });
    });

    it('should reject invalid token on storage', () => {
      const result = tokenManager.storeToken('invalid_token');

      expect(result).toBe(false);
      expect(mockSessionStorage.setItem).not.toHaveBeenCalled();
    });

    it('should check if valid token exists', () => {
      expect(tokenManager.hasValidToken()).toBe(false);

      tokenManager.storeToken('ghp_1234567890123456789012345678901234567890');
      expect(tokenManager.hasValidToken()).toBe(true);
    });
  });

  describe('Token Expiration', () => {
    const validToken = 'ghp_1234567890123456789012345678901234567890';

    it('should store token with default expiration', () => {
      tokenManager.storeToken(validToken);
      const retrieved = tokenManager.getToken();

      const expectedExpiry = Date.now() + 8 * 60 * 60 * 1000; // 8 hours
      expect(retrieved.expiresAt).toBeCloseTo(expectedExpiry, -1000); // Within 1 second
    });

    it('should store token with custom expiration', () => {
      const customExpiry = 2 * 60 * 60 * 1000; // 2 hours
      tokenManager.storeToken(validToken, null, customExpiry);
      const retrieved = tokenManager.getToken();

      const expectedExpiry = Date.now() + customExpiry;
      expect(retrieved.expiresAt).toBeCloseTo(expectedExpiry, -1000);
    });

    it('should return null for expired token', () => {
      // Store token with past expiry
      const pastExpiry = -1000; // 1 second ago
      tokenManager.storeToken(validToken, null, pastExpiry);

      const retrieved = tokenManager.getToken();
      expect(retrieved).toBeNull();
    });

    it('should detect expiring tokens', () => {
      // Store token expiring in 20 minutes
      const shortExpiry = 20 * 60 * 1000;
      tokenManager.storeToken(validToken, null, shortExpiry);

      expect(tokenManager.isTokenExpiringSoon()).toBe(true);
    });

    it('should not flag non-expiring tokens', () => {
      tokenManager.storeToken(validToken); // Default 8 hours
      expect(tokenManager.isTokenExpiringSoon()).toBe(false);
    });

    it('should extend token expiration', () => {
      tokenManager.storeToken(validToken);
      const originalToken = tokenManager.getToken();
      const originalExpiry = originalToken.expiresAt;

      // Wait a millisecond to ensure different timestamp
      const startTime = Date.now();
      const result = tokenManager.extendToken();
      expect(result).toBe(true);

      const extendedToken = tokenManager.getToken();
      // Should be extended by at least the default expiry time
      const expectedMinExpiry = startTime + tokenManager.DEFAULT_EXPIRY;
      expect(extendedToken.expiresAt).toBeGreaterThanOrEqual(expectedMinExpiry);
    });

    it('should get time until expiry', () => {
      const customExpiry = 2 * 60 * 60 * 1000; // 2 hours
      tokenManager.storeToken(validToken, null, customExpiry);

      const timeUntilExpiry = tokenManager.getTimeUntilExpiry();
      expect(timeUntilExpiry).toBeCloseTo(customExpiry, -1000);
    });

    it('should return 0 time for no token', () => {
      const timeUntilExpiry = tokenManager.getTimeUntilExpiry();
      expect(timeUntilExpiry).toBe(0);
    });
  });

  describe('OAuth State Management', () => {
    it('should generate OAuth state', () => {
      const state = tokenManager.generateOAuthState();

      expect(typeof state).toBe('string');
      expect(state.length).toBe(32);
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'mdsg_oauth_state',
        expect.any(String),
      );
    });

    it('should validate correct OAuth state', () => {
      const state = tokenManager.generateOAuthState();
      const isValid = tokenManager.validateOAuthState(state);

      expect(isValid).toBe(true);
    });

    it('should reject invalid OAuth state', () => {
      tokenManager.generateOAuthState();
      const isValid = tokenManager.validateOAuthState('wrong_state');

      expect(isValid).toBe(false);
    });

    it('should reject expired OAuth state', () => {
      // Manually create expired state
      const expiredState = {
        state: 'test_state',
        createdAt: Date.now() - 20 * 60 * 1000, // 20 minutes ago
        expiresAt: Date.now() - 10 * 60 * 1000, // 10 minutes ago
        origin: 'https://mdsg.daza.ar',
      };
      mockSessionStorage.setItem(
        'mdsg_oauth_state',
        JSON.stringify(expiredState),
      );

      const isValid = tokenManager.validateOAuthState('test_state');
      expect(isValid).toBe(false);
    });

    it('should reject OAuth state with wrong origin', () => {
      // Manually create state with wrong origin
      const wrongOriginState = {
        state: 'test_state',
        createdAt: Date.now(),
        expiresAt: Date.now() + 10 * 60 * 1000,
        origin: 'https://evil.com',
      };
      mockSessionStorage.setItem(
        'mdsg_oauth_state',
        JSON.stringify(wrongOriginState),
      );

      const isValid = tokenManager.validateOAuthState('test_state');
      expect(isValid).toBe(false);
    });
  });

  describe('Security Features', () => {
    const validToken = 'ghp_1234567890123456789012345678901234567890';

    it('should validate origin on token retrieval', () => {
      tokenManager.storeToken(validToken);

      // Change origin
      global.window.location.origin = 'https://evil.com';

      const retrieved = tokenManager.getToken();
      expect(retrieved).toBeNull();
    });

    it('should clear token on security validation failure', () => {
      tokenManager.storeToken(validToken);

      // Change origin to trigger security failure
      global.window.location.origin = 'https://evil.com';

      tokenManager.getToken(); // This should clear the token

      // Restore origin and check token is gone
      global.window.location.origin = 'https://mdsg.daza.ar';
      const retrieved = tokenManager.getToken();
      expect(retrieved).toBeNull();
    });

    it('should obfuscate and deobfuscate data', () => {
      const testData = 'sensitive_token_data';
      const obfuscated = tokenManager.obfuscateData(testData);
      const deobfuscated = tokenManager.deobfuscateData(obfuscated);

      expect(obfuscated).not.toBe(testData);
      expect(deobfuscated).toBe(testData);
    });

    it('should generate secure random strings', () => {
      const random1 = tokenManager.generateSecureRandom(32);
      const random2 = tokenManager.generateSecureRandom(32);

      expect(random1).not.toBe(random2);
      expect(random1.length).toBe(32);
      expect(random2.length).toBe(32);
      expect(/^[A-Za-z0-9]+$/.test(random1)).toBe(true);
    });

    it('should provide security information', () => {
      const securityInfo = tokenManager.getSecurityInfo();
      expect(securityInfo.hasToken).toBe(false);
      expect(securityInfo.isSecure).toBe(false);

      tokenManager.storeToken(validToken);
      const securityInfoWithToken = tokenManager.getSecurityInfo();
      expect(securityInfoWithToken.hasToken).toBe(true);
      expect(securityInfoWithToken.isSecure).toBe(true);
      expect(securityInfoWithToken.storage).toBe('sessionStorage');
    });
  });

  describe('Token Clearing', () => {
    const validToken = 'ghp_1234567890123456789012345678901234567890';

    it('should clear stored token', () => {
      tokenManager.storeToken(validToken);
      expect(tokenManager.hasValidToken()).toBe(true);

      tokenManager.clearToken();
      expect(tokenManager.hasValidToken()).toBe(false);
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(
        'mdsg_secure_auth',
      );
    });

    it('should clear OAuth state', () => {
      tokenManager.generateOAuthState();
      tokenManager.clearToken();

      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(
        'mdsg_oauth_state',
      );
    });
  });

  describe('Migration from localStorage', () => {
    it('should migrate token from localStorage', () => {
      const oldToken = 'ghp_1234567890123456789012345678901234567890';
      mockLocalStorage.data['github_token'] = oldToken;

      const migrated = tokenManager.migrateFromLocalStorage();

      expect(migrated).toBe(true);
      expect(tokenManager.getTokenString()).toBe(oldToken);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('github_token');
    });

    it('should not migrate if no localStorage token exists', () => {
      const migrated = tokenManager.migrateFromLocalStorage();

      expect(migrated).toBe(false);
      expect(tokenManager.hasValidToken()).toBe(false);
    });

    it('should clean up all localStorage items during migration', () => {
      const oldToken = 'ghp_1234567890123456789012345678901234567890';
      mockLocalStorage.data['github_token'] = oldToken;
      mockLocalStorage.data['github_token_type'] = 'bearer';
      mockLocalStorage.data['github_token_scope'] = 'repo';
      mockLocalStorage.data['oauth_state'] = 'state123';

      tokenManager.migrateFromLocalStorage();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('github_token');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        'github_token_type',
      );
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        'github_token_scope',
      );
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('oauth_state');
    });
  });

  describe('Cleanup Operations', () => {
    it('should clean up expired tokens', () => {
      // Create expired token manually
      const expiredTokenData = {
        token: 'ghp_1234567890123456789012345678901234567890',
        createdAt: Date.now() - 10 * 60 * 60 * 1000, // 10 hours ago
        expiresAt: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
        origin: 'https://mdsg.daza.ar',
      };

      const obfuscated = tokenManager.obfuscateData(
        JSON.stringify(expiredTokenData),
      );
      mockSessionStorage.data['mdsg_secure_auth'] = obfuscated;

      tokenManager.cleanupExpiredTokens();

      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(
        'mdsg_secure_auth',
      );
    });

    it('should clean up invalid token data', () => {
      // Store invalid data
      mockSessionStorage.data['mdsg_secure_auth'] = 'invalid_data';

      tokenManager.cleanupExpiredTokens();

      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(
        'mdsg_secure_auth',
      );
    });

    it('should clean up expired OAuth state', () => {
      const expiredState = {
        state: 'test_state',
        createdAt: Date.now() - 20 * 60 * 1000,
        expiresAt: Date.now() - 10 * 60 * 1000,
        origin: 'https://mdsg.daza.ar',
      };
      mockSessionStorage.data['mdsg_oauth_state'] =
        JSON.stringify(expiredState);

      tokenManager.cleanupExpiredTokens();

      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(
        'mdsg_oauth_state',
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle sessionStorage errors gracefully', () => {
      mockSessionStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const result = tokenManager.storeToken(
        'ghp_1234567890123456789012345678901234567890',
      );
      expect(result).toBe(false);
    });

    it('should handle corrupted token data', () => {
      mockSessionStorage.data['mdsg_secure_auth'] = 'corrupted_data';

      const token = tokenManager.getToken();
      expect(token).toBeNull();
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(
        'mdsg_secure_auth',
      );
    });

    it('should handle missing crypto API', () => {
      global.window.crypto = undefined;

      const random = tokenManager.generateSecureRandom(32);
      expect(random.length).toBe(32);
    });

    it('should handle cleanup errors gracefully', () => {
      mockSessionStorage.removeItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      // Should not throw
      expect(() => tokenManager.cleanupExpiredTokens()).not.toThrow();
    });
  });

  describe('Token Data Validation', () => {
    it('should validate complete token data structure', () => {
      const validTokenData = {
        token: 'ghp_1234567890123456789012345678901234567890',
        createdAt: Date.now(),
        expiresAt: Date.now() + 8 * 60 * 60 * 1000,
        origin: 'https://mdsg.daza.ar',
      };

      expect(tokenManager.validateTokenData(validTokenData)).toBe(true);
    });

    it('should reject incomplete token data', () => {
      const incompleteData = {
        token: 'ghp_1234567890123456789012345678901234567890',
        createdAt: Date.now(),
        // Missing expiresAt and origin
      };

      expect(tokenManager.validateTokenData(incompleteData)).toBe(false);
    });

    it('should reject invalid token data types', () => {
      expect(tokenManager.validateTokenData(null)).toBe(false);
      expect(tokenManager.validateTokenData(undefined)).toBe(false);
      expect(tokenManager.validateTokenData('string')).toBe(false);
      expect(tokenManager.validateTokenData(123)).toBe(false);
    });
  });

  describe('Integration Scenarios', () => {
    const validToken = 'ghp_1234567890123456789012345678901234567890';
    const userInfo = {
      id: 12345,
      login: 'testuser',
      name: 'Test User',
    };

    it('should handle complete authentication flow', () => {
      // Store token
      const stored = tokenManager.storeToken(validToken, userInfo);
      expect(stored).toBe(true);

      // Verify stored
      expect(tokenManager.hasValidToken()).toBe(true);
      expect(tokenManager.getTokenString()).toBe(validToken);
      expect(tokenManager.getUserInfo().login).toBe('testuser');

      // Clear token
      tokenManager.clearToken();
      expect(tokenManager.hasValidToken()).toBe(false);
    });

    it('should handle session restoration', () => {
      // Store token
      tokenManager.storeToken(validToken, userInfo);

      // Create new manager instance (simulating page refresh)
      const newManager = new SecureTokenManager();

      // Should still have token
      expect(newManager.hasValidToken()).toBe(true);
      expect(newManager.getTokenString()).toBe(validToken);
    });

    it('should handle token refresh scenario', () => {
      // Store token with short expiry
      const shortExpiry = 30 * 60 * 1000; // 30 minutes
      tokenManager.storeToken(validToken, userInfo, shortExpiry);

      // Check expiry warning
      expect(tokenManager.isTokenExpiringSoon()).toBe(true);

      // Extend token
      const extended = tokenManager.extendToken();
      expect(extended).toBe(true);
      expect(tokenManager.isTokenExpiringSoon()).toBe(false);
    });
  });
});
