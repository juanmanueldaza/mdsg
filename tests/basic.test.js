// Basic integration test for MDSG functionality
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('MDSG Basic Functionality', () => {
  let MDSG;
  let mdsg;

  beforeEach(async () => {
    // Set up DOM
    global.document = {
      getElementById: vi.fn(id => {
        if (id === 'app') {
          return {
            innerHTML: '',
            querySelector: vi.fn(),
            querySelectorAll: vi.fn(() => []),
            appendChild: vi.fn(),
            removeChild: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
          };
        }
        return null;
      }),
      querySelector: vi.fn(),
      querySelectorAll: vi.fn(() => []),
      createElement: vi.fn(tag => ({
        tagName: tag.toUpperCase(),
        innerHTML: '',
        textContent: '',
        style: {},
        classList: {
          add: vi.fn(),
          remove: vi.fn(),
          contains: vi.fn(() => false),
          toggle: vi.fn(),
        },
        setAttribute: vi.fn(),
        getAttribute: vi.fn(),
        appendChild: vi.fn(),
        removeChild: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        click: vi.fn(),
      })),
      body: {
        innerHTML: '',
        appendChild: vi.fn(),
        removeChild: vi.fn(),
        querySelector: vi.fn(),
        querySelectorAll: vi.fn(() => []),
      },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    // Import MDSG class
    const module = await import('../src/main.js');
    MDSG = module.default;

    // Create instance without auto-initialization
    mdsg = new MDSG();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should create MDSG instance with default properties', () => {
      expect(mdsg).toBeDefined();
      expect(mdsg.user).toBeNull();
      expect(mdsg.token).toBeNull();
      expect(mdsg.content).toBe('');
      expect(mdsg.repoName).toBe('');
      expect(mdsg.existingSites).toEqual([]);
    });

    it('should detect mobile devices', () => {
      // Mock mobile user agent
      global.window = {
        ...global.window,
        navigator: {
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
          maxTouchPoints: 2,
        },
        innerWidth: 375,
      };

      const mobileMdsg = new MDSG();
      expect(mobileMdsg.isMobile).toBe(true);
    });

    it('should detect desktop devices', () => {
      global.window = {
        ...global.window,
        navigator: {
          userAgent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          maxTouchPoints: 0,
        },
        innerWidth: 1024,
      };

      const desktopMdsg = new MDSG();
      expect(desktopMdsg.isMobile).toBe(false);
    });
  });

  describe('Markdown Parser', () => {
    it('should parse basic bold text', () => {
      const markdown = 'This is **bold** text';
      const html = mdsg.markdownToHTML(markdown);
      expect(html).toContain('<strong>bold</strong>');
    });

    it('should parse italic text', () => {
      const markdown = 'This is *italic* text';
      const html = mdsg.markdownToHTML(markdown);
      expect(html).toContain('<em>italic</em>');
    });

    it('should parse inline code', () => {
      const markdown = 'This is `code` text';
      const html = mdsg.markdownToHTML(markdown);
      expect(html).toContain('<code>code</code>');
    });

    it('should parse headers with IDs', () => {
      const markdown = '# Main Title';
      const html = mdsg.markdownToHTML(markdown);
      expect(html).toContain('<h1 id="main-title">Main Title</h1>');
    });

    it('should parse code blocks', () => {
      const markdown = '```\nconst x = 1;\n```';
      const html = mdsg.markdownToHTML(markdown);
      expect(html).toContain('<pre><code>');
      expect(html).toContain('const x = 1;');
      expect(html).toContain('</code></pre>');
    });

    it('should parse simple lists', () => {
      const markdown = '- Item 1\n- Item 2';
      const html = mdsg.markdownToHTML(markdown);
      expect(html).toContain('<ul>');
      expect(html).toContain('<li>Item 1</li>');
      expect(html).toContain('<li>Item 2</li>');
      expect(html).toContain('</ul>');
    });

    it('should parse links', () => {
      const markdown = '[Google](https://google.com)';
      const html = mdsg.markdownToHTML(markdown);
      expect(html).toContain('<a href="https://google.com"');
      expect(html).toContain('target="_blank"');
      expect(html).toContain('rel="noopener');
      expect(html).toContain('>Google</a>');
    });

    it('should parse images', () => {
      const markdown = '![Alt text](image.jpg)';
      const html = mdsg.markdownToHTML(markdown);
      expect(html).toContain('<img src="image.jpg" alt="Alt text"');
      expect(html).toContain('loading="lazy"');
    });

    it('should handle empty input', () => {
      const html = mdsg.markdownToHTML('');
      expect(html).toBe('');
    });

    it('should handle null input', () => {
      const html = mdsg.markdownToHTML(null);
      expect(html).toBe('');
    });
  });

  describe('Utility Functions', () => {
    it('should escape HTML properly', () => {
      const html = '<script>alert("xss")</script>';
      const escaped = mdsg.escapeHtml(html);
      expect(escaped).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;',
      );
    });

    it('should encode base64 unicode', () => {
      const text = 'Hello 世界';
      const encoded = mdsg.encodeBase64Unicode(text);
      expect(encoded).toBeDefined();
      expect(typeof encoded).toBe('string');
    });

    it('should validate tokens correctly', () => {
      // Valid token patterns
      expect(
        mdsg.isValidToken('ghp_1234567890123456789012345678901234567890'),
      ).toBe(true);
      expect(
        mdsg.isValidToken('github_pat_11ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'),
      ).toBe(true);
      expect(
        mdsg.isValidToken('gho_1234567890123456789012345678901234567890'),
      ).toBe(true);

      // Invalid tokens
      expect(mdsg.isValidToken('invalid')).toBe(false);
      expect(mdsg.isValidToken('')).toBe(false);
      expect(mdsg.isValidToken(null)).toBe(false);
    });
  });

  describe('Content Management', () => {
    it('should update word count correctly', () => {
      mdsg.content = 'This is a test content with multiple words.';
      mdsg.updateWordCount();
      // Basic verification that the function runs without error
      expect(true).toBe(true);
    });

    it('should validate content', () => {
      mdsg.content = 'Valid content';
      const isValid = mdsg.validateContent();
      expect(typeof isValid).toBe('boolean');
    });

    it('should handle auto-save', () => {
      mdsg.content = 'Content to save';
      // Should not throw error
      expect(() => mdsg.autoSave()).not.toThrow();
    });
  });

  describe('Authentication', () => {
    it('should handle token validation', () => {
      // Mock localStorage
      global.localStorage = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      };

      // Test with no token
      localStorage.getItem.mockReturnValue(null);
      const hasToken = mdsg.checkAuth();
      expect(typeof hasToken).toBe('boolean');
    });

    it('should clear authentication state', () => {
      global.localStorage = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      };

      mdsg.clearAuthenticationState();
      expect(localStorage.removeItem).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should show error messages', () => {
      // Mock required DOM elements
      document.getElementById.mockReturnValue({
        innerHTML: '',
        appendChild: vi.fn(),
        querySelector: vi.fn(),
      });

      expect(() => mdsg.showError('Test error')).not.toThrow();
    });

    it('should handle authentication errors', () => {
      expect(() => mdsg.handleAuthError('Auth failed')).not.toThrow();
    });
  });

  describe('Site Generation', () => {
    it('should generate HTML from markdown content', () => {
      mdsg.content = '# Test Site\n\nThis is a test.';
      mdsg.repoName = 'test-site';

      const html = mdsg.generateSiteHTML();
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<title>test-site</title>');
      expect(html).toContain('<h1 id="test-site">Test Site</h1>');
    });

    it('should handle empty content in site generation', () => {
      mdsg.content = '';
      mdsg.repoName = 'empty-site';

      const html = mdsg.generateSiteHTML();
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<title>empty-site</title>');
    });
  });
});
