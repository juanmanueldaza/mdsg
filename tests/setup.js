// Test setup file for vitest
import { beforeEach, vi } from 'vitest';

// Mock DOM globals
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

global.sessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock fetch
global.fetch = vi.fn();

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    search: '',
    hash: '',
    pathname: '/',
  },
  writable: true,
});

// Mock window.open
global.open = vi.fn();

// Mock URL constructor
global.URL = class URL {
  constructor(url, base) {
    this.href = url;
    this.origin = base || 'http://localhost:3000';
    this.pathname = '/';
    this.search = '';
    this.searchParams = new URLSearchParams();
  }
};

// Mock crypto
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => `mock-uuid-${Math.random().toString(36).substr(2, 9)}`,
  },
});

// Mock DOM environment
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

// Mock window object
global.window = {
  location: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    search: '',
    hash: '',
    pathname: '/',
  },
  localStorage: global.localStorage,
  sessionStorage: global.sessionStorage,
  navigator: {
    userAgent: 'Mozilla/5.0 (Test Browser)',
    maxTouchPoints: 0,
    clipboard: {
      writeText: vi.fn().mockResolvedValue(),
      readText: vi.fn().mockResolvedValue(''),
    },
  },
  open: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  innerWidth: 1024,
  innerHeight: 768,
  screen: {
    width: 1024,
    height: 768,
  },
};

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();

  // Reset DOM mocks
  document.getElementById.mockImplementation(id => {
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
  });
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

// Test utilities
export const domUtils = {
  createMockApp() {
    const appElement = {
      innerHTML: '',
      querySelector: vi.fn(),
      querySelectorAll: vi.fn(() => []),
      appendChild: vi.fn(),
      removeChild: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      insertBefore: vi.fn(),
      firstChild: null,
    };

    global.document.getElementById.mockImplementation(id => {
      if (id === 'app' || id === 'main-content') {
        return appElement;
      }
      return null;
    });

    return appElement;
  },

  createMockElement(tag = 'div') {
    return {
      tagName: tag.toUpperCase(),
      innerHTML: '',
      textContent: '',
      style: {},
      className: '',
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
      focus: vi.fn(),
      parentElement: null,
    };
  },
};

export const mockGitHubApi = {
  mockUserResponse: {
    login: 'testuser',
    name: 'Test User',
    avatar_url: 'https://github.com/testuser.png',
    email: 'test@example.com',
  },

  mockRepositoryResponse: {
    name: 'test-repo',
    full_name: 'testuser/test-repo',
    html_url: 'https://github.com/testuser/test-repo',
    description: 'Test repository',
    private: false,
  },

  mockRepositoriesResponse: [
    {
      name: 'mdsg-site-1',
      full_name: 'testuser/mdsg-site-1',
      html_url: 'https://github.com/testuser/mdsg-site-1',
      description: 'Generated by MDSG',
      private: false,
    },
    {
      name: 'other-repo',
      full_name: 'testuser/other-repo',
      html_url: 'https://github.com/testuser/other-repo',
      description: 'Not an MDSG site',
      private: false,
    },
  ],

  setupMocks() {
    global.fetch.mockImplementation(url => {
      if (url.includes('/user')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(this.mockUserResponse),
        });
      }

      if (url.includes('/user/repos')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(this.mockRepositoriesResponse),
        });
      }

      if (url.includes('/repos/') && url.includes('/contents/')) {
        return Promise.resolve({
          ok: true,
          status: 201,
          json: () =>
            Promise.resolve({
              content: {
                html_url:
                  'https://github.com/testuser/test-repo/blob/main/index.html',
              },
            }),
        });
      }

      if (url.includes('/repos/') && url.includes('/pages')) {
        return Promise.resolve({
          ok: true,
          status: 201,
          json: () =>
            Promise.resolve({
              html_url: 'https://testuser.github.io/test-repo',
            }),
        });
      }

      return Promise.reject(new Error(`Unmocked fetch URL: ${url}`));
    });
  },

  resetMocks() {
    global.fetch.mockReset();
  },
};

export const testData = {
  sampleMarkdown: `# Test Site

This is a test site with some content.

## Features
- Easy to use
- Fast deployment
- Beautiful themes

## Contact
Email: test@example.com`,

  sampleHTML: `<h1 id="test-site">Test Site</h1>
<p>This is a test site with some content.</p>
<h2 id="features">Features</h2>
<ul>
<li>Easy to use</li>
<li>Fast deployment</li>
<li>Beautiful themes</li>
</ul>
<h2 id="contact">Contact</h2>
<p>Email: test@example.com</p>`,

  validToken: 'ghp_test1234567890abcdef1234567890abcdef12',
  invalidToken: 'invalid-token',

  mockUser: {
    login: 'testuser',
    name: 'Test User',
    avatar_url: 'https://github.com/testuser.png',
    email: 'test@example.com',
  },

  mockRepository: {
    name: 'test-site',
    full_name: 'testuser/test-site',
    html_url: 'https://github.com/testuser/test-site',
    description: 'Test site generated by MDSG',
  },
};
