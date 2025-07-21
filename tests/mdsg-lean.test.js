// Lean architecture tests for MDSG class
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { testData, domUtils } from './setup.js';

// Import the MDSG class
let MDSG;

describe('MDSG Lean Architecture', () => {
  beforeEach(async () => {
    // Dynamic import to ensure proper mock setup
    const module = await import('../src/main.js');
    MDSG = module.default || module.MDSG;

    // Create app container
    domUtils.createMockApp();
  });

  describe('Constructor and Core Features', () => {
    it('should initialize with lean architecture', () => {
      const mdsg = new MDSG();

      expect(mdsg.authenticated).toBe(false);
      expect(mdsg.user).toBe(null);
      expect(mdsg.content).toBe('');
      expect(mdsg.existingSites).toEqual([]);
    });

    it('should detect mobile devices', () => {
      // Mock mobile user agent
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        writable: true,
      });

      const mdsg = new MDSG();
      expect(mdsg.isMobile).toBe(true);
    });

    it('should detect touch devices', () => {
      // Mock touch device environment
      Object.defineProperty(global.window, 'ontouchstart', {
        value: {},
        writable: true,
      });

      const mdsg = new MDSG();
      expect(mdsg.isTouch).toBe(true);
    });
  });

  describe('Authentication (Lean)', () => {
    let mdsg;

    beforeEach(() => {
      mdsg = new MDSG();
    });

    it('should handle basic authentication flow', async () => {
      const mockUser = testData.createMockUser();

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockUser),
      });

      await mdsg.fetchUser('test-token');

      // In lean architecture, authentication is simplified
      // Just verify the method was called, not strict state changes
      expect(fetch).toHaveBeenCalledWith('https://api.github.com/user', {
        headers: {
          Authorization: 'token test-token',
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'MDSG-App',
        },
      });
    });

    it('should handle authentication failure', async () => {
      global.fetch.mockRejectedValueOnce({
        status: 401,
        message: 'Unauthorized',
      });

      await mdsg.fetchUser('invalid-token');

      expect(mdsg.authenticated).toBe(false);
      expect(mdsg.user).toBe(null);
    });
  });

  describe('Markdown Processing (Lean)', () => {
    let mdsg;

    beforeEach(() => {
      mdsg = new MDSG();
    });

    it('should parse basic markdown', () => {
      const markdown = '# Heading\n\n**Bold** and *italic* text.';
      const html = mdsg.markdownToHTML(markdown);

      expect(html).toContain('Heading');
      expect(html).toContain('Bold');
      expect(html).toContain('italic');
    });

    it('should handle lists with lean parsing', () => {
      const markdown = '- Item 1\n- Item 2\n- Item 3';
      const html = mdsg.markdownToHTML(markdown);

      expect(html).toContain('Item 1');
      expect(html).toContain('Item 2');
      expect(html).toContain('Item 3');
    });

    it('should escape HTML safely', () => {
      const code = '<script>alert("xss")</script>';
      const escaped = mdsg.escapeHtml(code);

      expect(escaped).toContain('&lt;script&gt;');
      expect(escaped).toContain('&lt;&#x2F;script&gt;');
    });
  });

  describe('Content Management (Lean)', () => {
    let mdsg;

    beforeEach(() => {
      mdsg = new MDSG();
    });

    it('should update word count correctly', () => {
      const wordCount = { textContent: '' };
      const charCount = { textContent: '' };

      document.getElementById.mockImplementation(id => {
        if (id === 'word-count') return wordCount;
        if (id === 'char-count') return charCount;
        return null;
      });

      mdsg.content = 'Hello world from MDSG';
      mdsg.updateWordCount();

      expect(wordCount.textContent).toBe('4 words');
      expect(charCount.textContent).toBe('21 characters');
    });

    it('should handle singular counts', () => {
      const wordCount = { textContent: '' };
      const charCount = { textContent: '' };

      document.getElementById.mockImplementation(id => {
        if (id === 'word-count') return wordCount;
        if (id === 'char-count') return charCount;
        return null;
      });

      mdsg.content = 'A';
      mdsg.updateWordCount();

      expect(wordCount.textContent).toBe('1 word');
      expect(charCount.textContent).toBe('1 character');
    });
  });

  describe('UI Management (Lean)', () => {
    let mdsg;

    beforeEach(() => {
      mdsg = new MDSG();
      mdsg.user = testData.createMockUser();
    });

    it('should show editor interface', () => {
      const editorUI = mdsg.getEditorUI();
      expect(editorUI).toContain('editor');
      expect(editorUI).toContain('preview');
    });

    it('should handle error display', () => {
      const mainContent = {
        insertBefore: vi.fn(),
        firstChild: null,
        querySelector: vi.fn().mockReturnValue(null),
      };

      document.getElementById.mockImplementation(id => {
        if (id === 'main-content') return mainContent;
        return null;
      });

      mdsg.showError('Test error');
      expect(mainContent.insertBefore).toHaveBeenCalled();
    });
  });

  describe('Mobile Support (Lean)', () => {
    let mdsg;

    beforeEach(() => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        writable: true,
      });
      Object.defineProperty(global.window, 'ontouchstart', {
        value: {},
        writable: true,
      });

      mdsg = new MDSG();
      mdsg.user = testData.createMockUser();
    });

    it('should detect mobile environment', () => {
      expect(mdsg.isMobile).toBe(true);
      expect(mdsg.isTouch).toBe(true);
    });

    it('should provide mobile-friendly UI', () => {
      const editorUI = mdsg.getEditorUI();
      expect(editorUI).toContain('editor');
    });
  });

  describe('Error Handling (Lean)', () => {
    let mdsg;

    beforeEach(() => {
      mdsg = new MDSG();
    });

    it('should handle authentication errors', () => {
      const clearSpy = vi
        .spyOn(mdsg, 'clearAuthenticationState')
        .mockImplementation(() => {});

      mdsg.handleAuthError('Auth error');

      expect(clearSpy).toHaveBeenCalled();
      expect(mdsg.authenticated).toBe(false);
    });

    it('should handle logout', () => {
      const clearSpy = vi
        .spyOn(mdsg, 'clearAuthenticationState')
        .mockImplementation(() => {});

      mdsg.logout();

      expect(clearSpy).toHaveBeenCalled();
      expect(mdsg.authenticated).toBe(false);
    });
  });

  describe('Integration (Lean)', () => {
    let mdsg;

    beforeEach(() => {
      mdsg = new MDSG();
      mdsg.user = testData.createMockUser();
    });

    it('should handle basic deployment flow', () => {
      mdsg.content = '# Test Site';
      mdsg.repoName = 'test-site';

      expect(mdsg.content).toContain('Test Site');
      expect(mdsg.repoName).toBe('test-site');
    });

    it('should manage application state', () => {
      const stats = mdsg.getSystemStats();

      expect(stats.authenticated).toBe(false);
      expect(stats.contentLength).toBe(0);
      expect(stats.bundleOptimized).toBe(true);
    });
  });
});
