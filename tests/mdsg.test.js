// Comprehensive unit tests for MDSG class
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockGitHubApi, testData, domUtils } from './setup.js';

// Import the MDSG class
// Note: We need to dynamically import to ensure mocks are set up
let MDSG;

describe('MDSG', () => {
  beforeEach(async () => {
    // Dynamic import to ensure proper mock setup
    const module = await import('../src/main.js');
    MDSG = module.default || module.MDSG;

    // Create app container
    domUtils.createMockApp();
  });

  describe('Constructor and Initialization', () => {
    it('should initialize with default values', () => {
      const mdsg = new MDSG();

      expect(mdsg.authenticated).toBe(false);
      expect(mdsg.user).toBe(null);
      expect(mdsg.content).toBe('');
      expect(mdsg.existingSites).toEqual([]);
      expect(mdsg.currentSite).toBe(null);
    });

    it('should detect mobile devices correctly', () => {
      // Mock mobile user agent
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        writable: true,
      });

      const mdsg = new MDSG();
      expect(mdsg.isMobile).toBe(true);
    });

    it('should detect desktop devices correctly', () => {
      // Mock desktop user agent
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        writable: true,
      });

      const mdsg = new MDSG();
      expect(mdsg.isMobile).toBe(false);
    });

    it('should detect touch devices', () => {
      Object.defineProperty(window.navigator, 'maxTouchPoints', {
        value: 5,
        writable: true,
      });

      const mdsg = new MDSG();
      expect(mdsg.isTouch).toBe(true);
    });
  });

  describe('Authentication', () => {
    let mdsg;

    beforeEach(() => {
      mdsg = new MDSG();
    });

    it('should fetch user successfully', async () => {
      const mockUser = testData.createMockUser();
      mockGitHubApi.mockUserSuccess();
      localStorage.setItem.mockReturnValue();

      await mdsg.fetchUser('test-token');

      expect(fetch).toHaveBeenCalledWith('https://api.github.com/user', {
        headers: {
          Authorization: 'token test-token',
          Accept: 'application/vnd.github.v3+json',
        },
      });
      expect(mdsg.authenticated).toBe(true);
      expect(mdsg.user).toEqual(mockUser);
    });

    it('should handle authentication failure', async () => {
      mockGitHubApi.mockApiError(401, 'Unauthorized');

      await mdsg.fetchUser('invalid-token');

      expect(mdsg.authenticated).toBe(false);
      expect(mdsg.user).toBe(null);
    });

    it('should check existing auth token', () => {
      localStorage.getItem.mockReturnValue('existing-token');
      const fetchUserSpy = vi
        .spyOn(mdsg, 'fetchUser')
        .mockImplementation(() => {});

      mdsg.checkAuth();

      expect(localStorage.getItem).toHaveBeenCalledWith('github_token');
      expect(fetchUserSpy).toHaveBeenCalledWith('existing-token');
    });

    it('should setup login handler when no token exists', () => {
      localStorage.getItem.mockReturnValue(null);
      const setupLoginSpy = vi
        .spyOn(mdsg, 'setupLoginHandler')
        .mockImplementation(() => {});

      mdsg.checkAuth();

      expect(setupLoginSpy).toHaveBeenCalled();
    });
  });

  describe('Markdown Parsing', () => {
    let mdsg;

    beforeEach(() => {
      mdsg = new MDSG();
    });

    it('should parse basic markdown correctly', () => {
      const markdown = '# Heading\n\n**Bold** and *italic* text.';
      const html = mdsg.markdownToHTML(markdown);

      expect(html).toContain('<h1 id="heading">Heading</h1>');
      expect(html).toContain('<strong>Bold</strong>');
      expect(html).toContain('<em>italic</em>');
    });

    it('should parse lists correctly', () => {
      const markdown = '- Item 1\n- Item 2\n- Item 3';
      const html = mdsg.markdownToHTML(markdown);

      expect(html).toContain('<ul>');
      expect(html).toContain('<li data-level="0">Item 1</li>');
      expect(html).toContain('<li data-level="0">Item 2</li>');
      expect(html).toContain('<li data-level="0">Item 3</li>');
      expect(html).toContain('</ul>');
    });

    it('should parse code blocks with syntax highlighting', () => {
      const markdown =
        '```javascript\nfunction hello() {\n  console.log("Hello");\n}\n```';
      const html = mdsg.markdownToHTML(markdown);

      expect(html).toContain('<div class="code-block">');
      expect(html).toContain('language-javascript');
      expect(html).toContain('<span class="keyword">function</span>');
      expect(html).toContain('<span class="string">"Hello"</span>');
    });

    it('should parse tables correctly', () => {
      const markdown =
        '| Name | Age |\n|------|-----|\n| John | 25 |\n| Jane | 30 |';
      const html = mdsg.markdownToHTML(markdown);

      expect(html).toContain('<table class="markdown-table">');
      expect(html).toContain('<thead>');
      expect(html).toContain('<th>Name</th>');
      expect(html).toContain('<th>Age</th>');
      expect(html).toContain('<tbody>');
      expect(html).toContain('<td>John</td>');
      expect(html).toContain('<td>25</td>');
    });

    it('should parse images correctly', () => {
      const markdown = '![Alt text](https://example.com/image.jpg)';
      const html = mdsg.markdownToHTML(markdown);

      expect(html).toContain(
        '<img src="https://example.com/image.jpg" alt="Alt text" class="markdown-image" loading="lazy" />',
      );
    });

    it('should parse links correctly', () => {
      const markdown = '[GitHub](https://github.com)';
      const html = mdsg.markdownToHTML(markdown);

      expect(html).toContain(
        '<a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>',
      );
    });

    it('should parse strikethrough text', () => {
      const markdown = '~~strikethrough~~';
      const html = mdsg.markdownToHTML(markdown);

      expect(html).toContain('<del>strikethrough</del>');
    });

    it('should parse emojis', () => {
      const markdown = 'Hello :smile: :rocket:';
      const html = mdsg.markdownToHTML(markdown);

      expect(html).toContain('😊');
      expect(html).toContain('🚀');
    });

    it('should escape HTML in code', () => {
      const code = '<script>alert("xss")</script>';
      const escaped = mdsg.escapeHtml(code);

      expect(escaped).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;');
    });
  });

  describe('Site Management', () => {
    let mdsg;

    beforeEach(() => {
      mdsg = new MDSG();
      mdsg.user = testData.createMockUser();
    });

    it('should detect existing MDSG sites', async () => {
      const mockRepos = [
        testData.createMockRepo('mdsg-site'),
        testData.createMockRepo('mdsg-site-2'),
        testData.createMockRepo('other-repo'),
      ];
      mockGitHubApi.mockReposSuccess(mockRepos);

      await mdsg.detectExistingSites();

      expect(mdsg.existingSites).toHaveLength(2);
      expect(mdsg.existingSites[0].name).toBe('mdsg-site');
      expect(mdsg.existingSites[1].name).toBe('mdsg-site-2');
    });

    it('should filter out non-MDSG repositories', async () => {
      const mockRepos = [
        testData.createMockRepo('my-project'),
        testData.createMockRepo('another-repo'),
      ];
      mockGitHubApi.mockReposSuccess(mockRepos);

      await mdsg.detectExistingSites();

      expect(mdsg.existingSites).toHaveLength(0);
    });

    it('should handle API errors when detecting sites', async () => {
      mockGitHubApi.mockApiError(403, 'Rate limit exceeded');

      await mdsg.detectExistingSites();

      expect(mdsg.existingSites).toEqual([]);
    });

    it('should load site content for editing', async () => {
      const htmlContent = '<h1>Test Site</h1><p>Content here</p>';
      mockGitHubApi.mockFileContentSuccess(htmlContent);
      mdsg.existingSites = [testData.createMockRepo('test-site')];

      const showEditorSpy = vi
        .spyOn(mdsg, 'showEditor')
        .mockImplementation(() => {});

      await mdsg.loadSiteForEditing('test-site');

      expect(mdsg.currentSite).toEqual(mdsg.existingSites[0]);
      expect(mdsg.content).toContain('Test Site');
      expect(showEditorSpy).toHaveBeenCalled();
    });

    it('should extract markdown from HTML', () => {
      const html =
        '<h1>Title</h1><p><strong>Bold</strong> text</p><ul><li>Item 1</li><li>Item 2</li></ul>';
      const markdown = mdsg.extractMarkdownFromHTML(html);

      expect(markdown).toContain('# Title');
      expect(markdown).toContain('**Bold** text');
      expect(markdown).toContain('- Item 1');
      expect(markdown).toContain('- Item 2');
    });
  });

  describe('GitHub Repository Operations', () => {
    let mdsg;

    beforeEach(() => {
      mdsg = new MDSG();
      mdsg.user = testData.createMockUser();
      mdsg.authenticated = true;
    });

    it('should create repository successfully', async () => {
      const mockRepo = testData.createMockRepo();
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRepo),
      });

      const repo = await mdsg.createRepository();

      expect(fetch).toHaveBeenCalledWith(
        'https://api.github.com/user/repos',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'token null',
            'Content-Type': 'application/json',
          }),
          body: expect.stringContaining('mdsg-site'),
        }),
      );
      expect(repo).toEqual(mockRepo);
    });

    it('should handle repository creation errors', async () => {
      mockGitHubApi.mockApiError(422, 'Repository already exists');

      await expect(mdsg.createRepository()).rejects.toThrow(
        'Repository already exists',
      );
    });

    it('should upload content successfully', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Success' }),
      });
      mdsg.content = '# Test Site\n\nHello World!';

      await mdsg.uploadContent('test-repo');

      expect(fetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/testuser/test-repo/contents/index.html',
        expect.objectContaining({
          method: 'PUT',
          body: expect.stringContaining('Add site content'),
        }),
      );
    });

    it('should update existing content with SHA', async () => {
      // Mock getting existing file SHA
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ sha: 'existing-sha' }),
      });

      // Mock successful update
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Updated' }),
      });

      mdsg.content = '# Updated Site';

      await mdsg.uploadContent('test-repo', true);

      expect(fetch).toHaveBeenCalledTimes(2);
      expect(fetch).toHaveBeenLastCalledWith(
        'https://api.github.com/repos/testuser/test-repo/contents/index.html',
        expect.objectContaining({
          method: 'PUT',
          body: expect.stringContaining('existing-sha'),
        }),
      );
    });

    it('should enable GitHub Pages', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Pages enabled' }),
      });

      await mdsg.enableGitHubPages('test-repo');

      expect(fetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/testuser/test-repo/pages',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"branch":"main"'),
        }),
      );
    });

    it('should handle Pages already enabled (409 error)', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: () => Promise.resolve({ message: 'Pages already enabled' }),
      });

      // Should not throw error for 409 status
      await expect(
        mdsg.enableGitHubPages('test-repo'),
      ).resolves.toBeUndefined();
    });
  });

  describe('UI Management', () => {
    let mdsg;

    beforeEach(() => {
      mdsg = new MDSG();
      mdsg.user = testData.createMockUser();
      mdsg.authenticated = true;
    });

    it('should show editor UI', () => {
      mdsg.showEditor();

      const editorSection = document.querySelector('.editor-section');
      expect(editorSection).toBeTruthy();

      const textarea = document.querySelector('#markdown-editor');
      expect(textarea).toBeTruthy();

      const preview = document.querySelector('#preview');
      expect(preview).toBeTruthy();
    });

    it('should show site management UI when sites exist', () => {
      mdsg.existingSites = [testData.createMockRepo()];

      mdsg.showSiteManagement();

      const dashboard = document.querySelector('.sites-dashboard');
      expect(dashboard).toBeTruthy();

      const siteCard = document.querySelector('.site-card');
      expect(siteCard).toBeTruthy();
    });

    it('should show editor when no sites exist', () => {
      mdsg.existingSites = [];
      const showEditorSpy = vi
        .spyOn(mdsg, 'showEditor')
        .mockImplementation(() => {});

      mdsg.showSiteManagement();

      expect(showEditorSpy).toHaveBeenCalled();
    });

    it('should update word count correctly', () => {
      mdsg.content = 'Hello world this is a test';

      // Mock DOM elements
      const wordCount = document.createElement('span');
      wordCount.id = 'word-count';
      const charCount = document.createElement('span');
      charCount.id = 'char-count';

      document.body.appendChild(wordCount);
      document.body.appendChild(charCount);

      mdsg.updateWordCount();

      expect(wordCount.textContent).toBe('6 words');
      expect(charCount.textContent).toBe('26 characters');
    });

    it('should handle singular word/character count', () => {
      mdsg.content = 'a';

      const wordCount = document.createElement('span');
      wordCount.id = 'word-count';
      const charCount = document.createElement('span');
      charCount.id = 'char-count';

      document.body.appendChild(wordCount);
      document.body.appendChild(charCount);

      mdsg.updateWordCount();

      expect(wordCount.textContent).toBe('1 word');
      expect(charCount.textContent).toBe('1 character');
    });
  });

  describe('Error Handling', () => {
    let mdsg;

    beforeEach(() => {
      mdsg = new MDSG();
    });

    it('should show error messages', () => {
      mdsg.showError('Test error message');

      const errorBanner = document.querySelector('.error-banner');
      expect(errorBanner).toBeTruthy();
      expect(errorBanner.textContent).toContain('Test error message');
    });

    it('should handle authentication errors', () => {
      const setupUISpy = vi.spyOn(mdsg, 'setupUI').mockImplementation(() => {});
      const showErrorSpy = vi
        .spyOn(mdsg, 'showError')
        .mockImplementation(() => {});

      mdsg.handleAuthError('Custom auth error');

      expect(localStorage.removeItem).toHaveBeenCalledWith('github_token');
      expect(mdsg.authenticated).toBe(false);
      expect(mdsg.user).toBe(null);
      expect(setupUISpy).toHaveBeenCalled();
      expect(showErrorSpy).toHaveBeenCalledWith('Custom auth error');
    });

    it('should handle logout correctly', () => {
      mdsg.authenticated = true;
      mdsg.user = testData.createMockUser();
      mdsg.content = 'Some content';

      const setupUISpy = vi.spyOn(mdsg, 'setupUI').mockImplementation(() => {});

      mdsg.logout();

      expect(localStorage.removeItem).toHaveBeenCalledWith('github_token');
      expect(mdsg.authenticated).toBe(false);
      expect(mdsg.user).toBe(null);
      expect(mdsg.content).toBe('');
      expect(setupUISpy).toHaveBeenCalled();
    });
  });

  describe('Mobile Features', () => {
    let mdsg;

    beforeEach(() => {
      // Mock mobile environment
      Object.defineProperty(window, 'innerWidth', {
        value: 500,
        writable: true,
      });
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        writable: true,
      });
      Object.defineProperty(window.navigator, 'maxTouchPoints', {
        value: 5,
        writable: true,
      });

      mdsg = new MDSG();
      mdsg.user = testData.createMockUser();
    });

    it('should detect mobile correctly', () => {
      expect(mdsg.isMobile).toBe(true);
      expect(mdsg.isTouch).toBe(true);
    });

    it('should show mobile-specific UI elements', () => {
      const editorUI = mdsg.getEditorUI();

      expect(editorUI).toContain('toggle-preview');
      expect(editorUI).toContain('👁️ Preview');
    });

    it('should handle orientation changes', () => {
      mdsg.showEditor();

      // Mock orientation change
      const orientationEvent = new Event('orientationchange');
      window.dispatchEvent(orientationEvent);

      // Should call detectMobile again
      expect(mdsg.isMobile).toBe(true);
    });
  });

  describe('Copy Code Functionality', () => {
    let mdsg;

    beforeEach(() => {
      mdsg = new MDSG();

      // Mock clipboard API
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: vi.fn().mockResolvedValue(),
        },
        writable: true,
      });
    });

    it('should setup copy code buttons', () => {
      mdsg.setupCodeCopyButtons();

      expect(window.copyCode).toBeDefined();
      expect(typeof window.copyCode).toBe('function');
    });

    it('should copy code when copyCode is called', async () => {
      mdsg.setupCodeCopyButtons();

      // Create mock code element
      const codeElement = document.createElement('code');
      codeElement.id = 'test-code-123';
      codeElement.textContent = 'console.log("Hello World");';

      const copyButton = document.createElement('button');
      copyButton.className = 'copy-code-btn';
      copyButton.textContent = '📋 Copy';

      const container = document.createElement('div');
      container.appendChild(codeElement);
      container.appendChild(copyButton);
      document.body.appendChild(container);

      await window.copyCode('test-code-123');

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        'console.log("Hello World");',
      );
    });
  });

  describe('Integration Tests', () => {
    let mdsg;

    beforeEach(() => {
      mdsg = new MDSG();
    });

    it('should complete full deployment workflow', async () => {
      // Setup authenticated user
      mdsg.authenticated = true;
      mdsg.user = testData.createMockUser();
      mdsg.content = testData.sampleMarkdown;

      // Mock successful repository creation
      const mockRepo = testData.createMockRepo();
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRepo),
      });

      // Mock successful content upload
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Content uploaded' }),
      });

      // Mock successful Pages enabling
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Pages enabled' }),
      });

      const showSuccessSpy = vi
        .spyOn(mdsg, 'showSuccess')
        .mockImplementation(() => {});

      await mdsg.deployToGitHub();

      expect(fetch).toHaveBeenCalledTimes(3);
      expect(showSuccessSpy).toHaveBeenCalledWith(mockRepo);
    });

    it('should handle complete update workflow', async () => {
      // Setup for update
      mdsg.authenticated = true;
      mdsg.user = testData.createMockUser();
      mdsg.content = '# Updated Content';
      mdsg.currentSite = testData.createMockRepo();

      // Mock getting existing file SHA
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ sha: 'existing-sha' }),
      });

      // Mock successful update
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Updated' }),
      });

      const showUpdateSuccessSpy = vi
        .spyOn(mdsg, 'showUpdateSuccess')
        .mockImplementation(() => {});

      await mdsg.updateExistingSite();

      expect(fetch).toHaveBeenCalledTimes(2);
      expect(showUpdateSuccessSpy).toHaveBeenCalled();
    });
  });
});
