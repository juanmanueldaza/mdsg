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
    randomUUID: () => 'mock-uuid-' + Math.random().toString(36).substr(2, 9),
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
