# MDSG Testing Documentation

## Overview

MDSG employs a comprehensive testing strategy to ensure reliability, security, and performance. The testing approach covers unit tests, integration tests, performance testing, security testing, and end-to-end workflows.

## Table of Contents

- [Testing Philosophy](#testing-philosophy)
- [Test Structure](#test-structure)
- [Unit Testing](#unit-testing)
- [Integration Testing](#integration-testing)
- [Performance Testing](#performance-testing)
- [Security Testing](#security-testing)
- [CI/CD Testing](#cicd-testing)
- [Manual Testing](#manual-testing)
- [Test Data Management](#test-data-management)
- [Best Practices](#best-practices)

## Testing Philosophy

### Core Principles

1. **Test-Driven Development (TDD)**: Write tests before implementation where possible
2. **Comprehensive Coverage**: >90% coverage for critical paths
3. **Fast Feedback**: Tests should run quickly to enable rapid development
4. **Reliable Tests**: Tests should be deterministic and not flaky
5. **Realistic Testing**: Use real-world scenarios and edge cases

### Testing Pyramid

```
        /\
       /  \
      / E2E \     ← End-to-End Tests (Few, High Value)
     /______\
    /        \
   /Integration\   ← Integration Tests (Some, API & UI)
  /____________\
 /              \
/  Unit Tests    \  ← Unit Tests (Many, Fast, Isolated)
/________________\
```

## Test Structure

### Directory Organization

```
tests/
├── unit/
│   ├── mdsg.test.js         # Core application logic
│   ├── markdown.test.js     # Markdown parsing
│   ├── auth.test.js         # Authentication
│   └── utils.test.js        # Utility functions
├── integration/
│   ├── deployment.test.js   # End-to-end deployment
│   ├── github-api.test.js   # GitHub API integration
│   └── oauth.test.js        # OAuth flow
├── performance/
│   ├── bundle-size.test.js  # Bundle size validation
│   ├── lighthouse.test.js   # Performance metrics
│   └── load-testing.test.js # Load testing
├── security/
│   ├── xss.test.js         # XSS prevention
│   ├── csrf.test.js        # CSRF protection
│   └── input-validation.test.js # Input sanitization
├── mocks/
│   ├── github-api.js       # GitHub API mocks
│   ├── dom.js              # DOM mocks
│   └── localStorage.js     # Storage mocks
├── fixtures/
│   ├── markdown-samples.js # Test markdown content
│   ├── user-data.js        # Sample user data
│   └── repository-data.js  # Sample repo data
└── setup.js                # Global test setup
```

### Test Configuration

#### Vitest Configuration (`vitest.config.js`)

```javascript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'tests/',
        '**/*.config.js'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        },
        './src/main.js': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        }
      }
    },
    timeout: 10000,
    testTimeout: 5000
  }
});
```

#### Test Setup (`tests/setup.js`)

```javascript
import { vi } from 'vitest';
import { JSDOM } from 'jsdom';

// Setup DOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body><div id="app"></div></body></html>');
global.document = dom.window.document;
global.window = dom.window;
global.navigator = dom.window.navigator;

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock fetch
global.fetch = vi.fn();

// Mock performance API
global.performance = {
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByType: vi.fn(() => []),
  now: vi.fn(() => Date.now())
};

// Global test utilities
global.createMockResponse = (data, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: vi.fn().mockResolvedValue(data),
  text: vi.fn().mockResolvedValue(JSON.stringify(data))
});

// Cleanup between tests
beforeEach(() => {
  document.body.innerHTML = '<div id="app"></div>';
  vi.clearAllMocks();
  localStorage.clear();
});
```

## Unit Testing

### Core Application Testing

#### MDSG Class Tests (`tests/unit/mdsg.test.js`)

```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('MDSG Core Functionality', () => {
  let MDSG;
  let mdsg;

  beforeEach(async () => {
    // Dynamic import to ensure fresh instance
    MDSG = (await import('../../src/main.js')).default;
    mdsg = new MDSG();
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      expect(mdsg.authenticated).toBe(false);
      expect(mdsg.user).toBeNull();
      expect(mdsg.content).toBe('');
    });

    it('should setup UI on initialization', () => {
      const appElement = document.getElementById('app');
      expect(appElement.innerHTML).toContain('MDSG');
    });
  });

  describe('Authentication', () => {
    it('should validate GitHub tokens correctly', () => {
      // Valid token
      expect(mdsg.isValidToken('ghp_1234567890abcdef')).toBe(true);
      
      // Invalid tokens
      expect(mdsg.isValidToken('')).toBe(false);
      expect(mdsg.isValidToken('short')).toBe(false);
      expect(mdsg.isValidToken('has spaces')).toBe(false);
    });

    it('should fetch user data successfully', async () => {
      const mockUser = {
        login: 'testuser',
        name: 'Test User',
        avatar_url: 'https://github.com/avatar.jpg'
      };

      fetch.mockResolvedValueOnce(createMockResponse(mockUser));

      const user = await mdsg.fetchUser('valid_token');
      
      expect(fetch).toHaveBeenCalledWith(
        'https://api.github.com/user',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'token valid_token'
          })
        })
      );
      expect(user).toEqual(mockUser);
    });

    it('should handle authentication errors gracefully', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(mdsg.fetchUser('invalid_token')).rejects.toThrow();
    });
  });

  describe('Markdown Processing', () => {
    it('should parse basic markdown correctly', () => {
      const markdown = '# Header\n\n**Bold text**\n\n*Italic text*';
      const html = mdsg.parseMarkdown(markdown);
      
      expect(html).toContain('<h1>Header</h1>');
      expect(html).toContain('<strong>Bold text</strong>');
      expect(html).toContain('<em>Italic text</em>');
    });

    it('should handle code blocks with syntax highlighting', () => {
      const markdown = '```javascript\nconst x = 1;\n```';
      const html = mdsg.parseMarkdown(markdown);
      
      expect(html).toContain('javascript');
      expect(html).toContain('const x = 1;');
    });

    it('should sanitize potentially dangerous content', () => {
      const markdown = '<script>alert("xss")</script>';
      const html = mdsg.parseMarkdown(markdown);
      
      expect(html).not.toContain('<script>');
    });
  });

  describe('GitHub Operations', () => {
    it('should create repository successfully', async () => {
      const mockRepo = {
        name: 'test-repo',
        html_url: 'https://github.com/user/test-repo'
      };

      fetch.mockResolvedValueOnce(createMockResponse(mockRepo, 201));

      const repo = await mdsg.createRepository('test-repo');
      
      expect(fetch).toHaveBeenCalledWith(
        'https://api.github.com/user/repos',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('test-repo')
        })
      );
      expect(repo.name).toBe('test-repo');
    });

    it('should handle repository creation conflicts', async () => {
      fetch.mockResolvedValueOnce(createMockResponse({
        message: 'Repository creation failed.',
        errors: [{ message: 'name already exists on this account' }]
      }, 422));

      await expect(mdsg.createRepository('existing-repo')).rejects.toThrow();
    });
  });
});
```

### Markdown Parser Testing (`tests/unit/markdown.test.js`)

```javascript
import { describe, it, expect } from 'vitest';

describe('Markdown Parser', () => {
  let parser;

  beforeEach(async () => {
    const MDSG = (await import('../../src/main.js')).default;
    parser = new MDSG();
  });

  describe('Headers', () => {
    it('should parse all header levels', () => {
      const markdown = `# H1\n## H2\n### H3\n#### H4\n##### H5\n###### H6`;
      const html = parser.parseMarkdown(markdown);
      
      expect(html).toMatch(/<h1>H1<\/h1>/);
      expect(html).toMatch(/<h2>H2<\/h2>/);
      expect(html).toMatch(/<h3>H3<\/h3>/);
      expect(html).toMatch(/<h4>H4<\/h4>/);
      expect(html).toMatch(/<h5>H5<\/h5>/);
      expect(html).toMatch(/<h6>H6<\/h6>/);
    });
  });

  describe('Text Formatting', () => {
    it('should handle bold and italic combinations', () => {
      const markdown = '***Bold and italic***';
      const html = parser.parseMarkdown(markdown);
      
      expect(html).toContain('<strong><em>Bold and italic</em></strong>');
    });

    it('should handle strikethrough text', () => {
      const markdown = '~~Strikethrough~~';
      const html = parser.parseMarkdown(markdown);
      
      expect(html).toContain('<del>Strikethrough</del>');
    });
  });

  describe('Lists', () => {
    it('should parse unordered lists', () => {
      const markdown = '- Item 1\n- Item 2\n- Item 3';
      const html = parser.parseMarkdown(markdown);
      
      expect(html).toContain('<ul>');
      expect(html).toContain('<li>Item 1</li>');
      expect(html).toContain('<li>Item 2</li>');
      expect(html).toContain('<li>Item 3</li>');
      expect(html).toContain('</ul>');
    });

    it('should parse ordered lists', () => {
      const markdown = '1. First\n2. Second\n3. Third';
      const html = parser.parseMarkdown(markdown);
      
      expect(html).toContain('<ol>');
      expect(html).toContain('<li>First</li>');
      expect(html).toContain('<li>Second</li>');
      expect(html).toContain('<li>Third</li>');
      expect(html).toContain('</ol>');
    });
  });

  describe('Code', () => {
    it('should handle inline code', () => {
      const markdown = 'Use `console.log()` to debug';
      const html = parser.parseMarkdown(markdown);
      
      expect(html).toContain('<code>console.log()</code>');
    });

    it('should handle code blocks with language', () => {
      const markdown = '```javascript\nfunction hello() {\n  return "world";\n}\n```';
      const html = parser.parseMarkdown(markdown);
      
      expect(html).toContain('class="language-javascript"');
      expect(html).toContain('function hello()');
    });
  });

  describe('Links and Images', () => {
    it('should parse links correctly', () => {
      const markdown = '[GitHub](https://github.com)';
      const html = parser.parseMarkdown(markdown);
      
      expect(html).toContain('<a href="https://github.com">GitHub</a>');
    });

    it('should parse images with alt text', () => {
      const markdown = '![Alt text](https://example.com/image.jpg)';
      const html = parser.parseMarkdown(markdown);
      
      expect(html).toContain('<img alt="Alt text" src="https://example.com/image.jpg"');
    });
  });

  describe('Tables', () => {
    it('should parse markdown tables', () => {
      const markdown = `| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |`;
      
      const html = parser.parseMarkdown(markdown);
      
      expect(html).toContain('<table>');
      expect(html).toContain('<thead>');
      expect(html).toContain('<tbody>');
      expect(html).toContain('<th>Header 1</th>');
      expect(html).toContain('<td>Cell 1</td>');
    });
  });
});
```

## Integration Testing

### Deployment Flow Testing (`tests/integration/deployment.test.js`)

```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Complete Deployment Flow', () => {
  let MDSG;
  let mdsg;

  beforeEach(async () => {
    MDSG = (await import('../../src/main.js')).default;
    mdsg = new MDSG();
    
    // Mock authenticated state
    mdsg.authenticated = true;
    mdsg.user = {
      login: 'testuser',
      name: 'Test User'
    };
  });

  it('should complete full deployment workflow', async () => {
    // Mock repository creation
    fetch.mockResolvedValueOnce(createMockResponse({
      name: 'mdsg-site',
      html_url: 'https://github.com/testuser/mdsg-site'
    }, 201));

    // Mock file upload
    fetch.mockResolvedValueOnce(createMockResponse({
      content: { sha: 'abc123' }
    }));

    // Mock Pages enablement
    fetch.mockResolvedValueOnce(createMockResponse({
      html_url: 'https://testuser.github.io/mdsg-site'
    }));

    // Set content to deploy
    mdsg.content = '# Test Site\n\nThis is a test deployment.';

    // Execute deployment
    const result = await mdsg.deployToGitHub();

    // Verify API calls were made in correct order
    expect(fetch).toHaveBeenCalledTimes(3);
    
    // Verify repository creation
    expect(fetch).toHaveBeenNthCalledWith(1,
      'https://api.github.com/user/repos',
      expect.objectContaining({ method: 'POST' })
    );

    // Verify file upload
    expect(fetch).toHaveBeenNthCalledWith(2,
      expect.stringContaining('/contents/index.html'),
      expect.objectContaining({ method: 'PUT' })
    );

    // Verify Pages enablement
    expect(fetch).toHaveBeenNthCalledWith(3,
      expect.stringContaining('/pages'),
      expect.objectContaining({ method: 'POST' })
    );

    expect(result.html_url).toBe('https://testuser.github.io/mdsg-site');
  });

  it('should handle deployment errors gracefully', async () => {
    // Mock repository creation failure
    fetch.mockResolvedValueOnce(createMockResponse({
      message: 'Repository creation failed'
    }, 422));

    mdsg.content = '# Test Site';

    await expect(mdsg.deployToGitHub()).rejects.toThrow();

    // Should show error to user
    const errorElements = document.querySelectorAll('.error-message');
    expect(errorElements.length).toBeGreaterThan(0);
  });
});
```

### OAuth Flow Testing (`tests/integration/oauth.test.js`)

```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('OAuth Integration', () => {
  it('should handle complete OAuth flow', async () => {
    // Mock token validation
    const mockToken = 'ghp_valid_token_123456789';
    localStorage.setItem('github_token', mockToken);

    // Mock user fetch
    fetch.mockResolvedValueOnce(createMockResponse({
      login: 'testuser',
      name: 'Test User',
      avatar_url: 'https://avatars.githubusercontent.com/u/123'
    }));

    const MDSG = (await import('../../src/main.js')).default;
    const mdsg = new MDSG();

    // Wait for authentication check
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(mdsg.authenticated).toBe(true);
    expect(mdsg.user.login).toBe('testuser');
    
    // Verify UI shows authenticated state
    const userInfo = document.querySelector('.user-info');
    expect(userInfo).toBeTruthy();
    expect(userInfo.textContent).toContain('testuser');
  });

  it('should handle logout correctly', async () => {
    const MDSG = (await import('../../src/main.js')).default;
    const mdsg = new MDSG();

    // Set authenticated state
    mdsg.authenticated = true;
    mdsg.user = { login: 'testuser' };
    localStorage.setItem('github_token', 'test_token');

    // Perform logout
    mdsg.logout();

    expect(mdsg.authenticated).toBe(false);
    expect(mdsg.user).toBeNull();
    expect(localStorage.getItem('github_token')).toBeNull();
  });
});
```

## Performance Testing

### Bundle Size Testing (`tests/performance/bundle-size.test.js`)

```javascript
import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import { readFileSync, readdirSync } from 'fs';
import { gzipSync } from 'zlib';
import path from 'path';

describe('Bundle Size Performance', () => {
  const THRESHOLDS = {
    JS_GZIPPED: 50 * 1024,  // 50KB
    CSS_GZIPPED: 20 * 1024, // 20KB
    TOTAL_GZIPPED: 70 * 1024 // 70KB
  };

  beforeAll(() => {
    // Build the application for testing
    execSync('npm run build', { stdio: 'inherit' });
  });

  it('should have JavaScript bundle under size limit', () => {
    const distDir = path.join(process.cwd(), 'dist', 'assets');
    const files = readdirSync(distDir);
    
    const jsFiles = files.filter(file => file.endsWith('.js'));
    
    let totalJsSize = 0;
    jsFiles.forEach(file => {
      const content = readFileSync(path.join(distDir, file));
      const gzipped = gzipSync(content);
      totalJsSize += gzipped.length;
    });

    expect(totalJsSize).toBeLessThan(THRESHOLDS.JS_GZIPPED);
  });

  it('should have CSS bundle under size limit', () => {
    const distDir = path.join(process.cwd(), 'dist', 'assets');
    const files = readdirSync(distDir);
    
    const cssFiles = files.filter(file => file.endsWith('.css'));
    
    let totalCssSize = 0;
    cssFiles.forEach(file => {
      const content = readFileSync(path.join(distDir, file));
      const gzipped = gzipSync(content);
      totalCssSize += gzipped.length;
    });

    expect(totalCssSize).toBeLessThan(THRESHOLDS.CSS_GZIPPED);
  });

  it('should have total bundle under size limit', () => {
    const distDir = path.join(process.cwd(), 'dist', 'assets');
    const files = readdirSync(distDir);
    
    let totalSize = 0;
    files.forEach(file => {
      const content = readFileSync(path.join(distDir, file));
      const gzipped = gzipSync(content);
      totalSize += gzipped.length;
    });

    expect(totalSize).toBeLessThan(THRESHOLDS.TOTAL_GZIPPED);
  });
});
```

### Load Testing (`tests/performance/load-testing.test.js`)

```javascript
import { describe, it, expect } from 'vitest';

describe('Application Load Performance', () => {
  it('should initialize within performance budget', async () => {
    const startTime = performance.now();
    
    const MDSG = (await import('../../src/main.js')).default;
    const mdsg = new MDSG();
    
    const endTime = performance.now();
    const initTime = endTime - startTime;
    
    // Should initialize in under 100ms
    expect(initTime).toBeLessThan(100);
  });

  it('should parse markdown efficiently', async () => {
    const MDSG = (await import('../../src/main.js')).default;
    const mdsg = new MDSG();
    
    // Large markdown content
    const largeMarkdown = '# Header\n\n' + 'Lorem ipsum dolor sit amet. '.repeat(1000);
    
    const startTime = performance.now();
    const html = mdsg.parseMarkdown(largeMarkdown);
    const endTime = performance.now();
    
    const parseTime = endTime - startTime;
    
    // Should parse large content in under 50ms
    expect(parseTime).toBeLessThan(50);
    expect(html).toContain('<h1>Header</h1>');
  });

  it('should handle rapid UI updates efficiently', async () => {
    const MDSG = (await import('../../src/main.js')).default;
    const mdsg = new MDSG();
    
    const startTime = performance.now();
    
    // Simulate rapid typing
    for (let i = 0; i < 100; i++) {
      mdsg.content = `# Test ${i}\n\nContent update ${i}`;
      mdsg.updatePreview();
    }
    
    const endTime = performance.now();
    const updateTime = endTime - startTime;
    
    // Should handle 100 updates in under 500ms
    expect(updateTime).toBeLessThan(500);
  });
});
```

## Security Testing

### XSS Prevention Testing (`tests/security/xss.test.js`)

```javascript
import { describe, it, expect } from 'vitest';

describe('XSS Prevention', () => {
  let mdsg;

  beforeEach(async () => {
    const MDSG = (await import('../../src/main.js')).default;
    mdsg = new MDSG();
  });

  it('should sanitize script tags in markdown', () => {
    const maliciousMarkdown = `
# Safe Header
<script>alert('xss')</script>
<img src="x" onerror="alert('xss')">
<iframe src="javascript:alert('xss')"></iframe>
    `;

    const html = mdsg.parseMarkdown(maliciousMarkdown);

    expect(html).not.toContain('<script>');
    expect(html).not.toContain('onerror=');
    expect(html).not.toContain('javascript:');
    expect(html).not.toContain('<iframe>');
  });

  it('should handle event handlers in attributes', () => {
    const maliciousMarkdown = `
[Click me](javascript:alert('xss'))
![Image](data:image/svg+xml;base64,PHN2ZyBvbmxvYWQ9YWxlcnQoMSk+)
    `;

    const html = mdsg.parseMarkdown(maliciousMarkdown);

    expect(html).not.toContain('javascript:');
    expect(html).not.toContain('onload=');
  });

  it('should preserve safe HTML elements', () => {
    const safeMarkdown = `
# Header
**Bold text**
*Italic text*
[Safe link](https://example.com)
![Safe image](https://example.com/image.jpg)
\`code snippet\`
    `;

    const html = mdsg.parseMarkdown(safeMarkdown);

    expect(html).toContain('<h1>Header</h1>');
    expect(html).toContain('<strong>Bold text</strong>');
    expect(html).toContain('<em>Italic text</em>');
    expect(html).toContain('<a href="https://example.com">Safe link</a>');
    expect(html).toContain('<img alt="Safe image" src="https://example.com/image.jpg"');
    expect(html).toContain('<code>code snippet</code>');
  });
});
```

### Input Validation Testing (`tests/security/input-validation.test.js`)

```javascript
import { describe, it, expect } from 'vitest';

describe('Input Validation', () => {
  let mdsg;

  beforeEach(async () => {
    const MDSG = (await import('../../src/main.js')).default;
    mdsg = new MDSG();
  });

  describe('Token Validation', () => {
    it('should reject invalid token formats', () => {
      expect(mdsg.isValidToken('')).toBe(false);
      expect(mdsg.isValidToken(null)).toBe(false);
      expect(mdsg.isValidToken(undefined)).toBe(false);
      expect(mdsg.isValidToken('short')).toBe(false);
      expect(mdsg.isValidToken('has spaces in it')).toBe(false);
      expect(mdsg.isValidToken('has-invalid@characters')).toBe(false);
    });

    it('should accept valid token formats', () => {
      expect(mdsg.isValidToken('ghp_1234567890abcdefghijklmnopqrstuvwxyz')).toBe(true);
      expect(mdsg.isValidToken('gho_validTokenFormat123456789')).toBe(true);
    });
  });

  describe('Repository Name Validation', () => {
    it('should validate repository names', () => {
      // Assuming we add this method
      const validateRepoName = (name) => {
        return /^[a-zA-Z0-9._-]+$/.test(name) && name.length <= 100;
      };

      expect(validateRepoName('valid-repo-name')).toBe(true);
      expect(validateRepoName('valid_repo_name')).toBe(true);
      expect(validateRepoName('valid.repo.name')).toBe(true);
      
      expect(validateRepoName('')).toBe(false);
      expect(validateRepoName('invalid repo name')).toBe(false);
      expect(validateRepoName('invalid@repo')).toBe(false);
      expect(validateRepoName('a'.repeat(101))).toBe(false);
    });
  });

  describe('Content Size Limits', () => {
    it('should handle large content gracefully', () => {
      const largeContent = 'x'.repeat(1000000); // 1MB
      const veryLargeContent = 'x'.repeat(10000000); // 10MB

      // Should handle reasonable sizes
      expect(() => mdsg.parseMarkdown(largeContent)).not.toThrow();
      
      // Should have some protection against extremely large content
      // This would depend on implementation
    });
  });
});
```

## CI/CD Testing

### GitHub Actions Testing

The CI/CD pipeline includes multiple test stages:

#### Test Matrix Configuration

```yaml
# .github/workflows/ci.yml (testing section)
strategy:
  matrix:
    node-version: [18.x, 20.x, 21.x]
    os: [ubuntu-latest, windows-latest, macos-latest]

steps:
  - name: Run unit tests
    run: npm run test:run

  - name: Run integration tests
    run: npm run test:integration

  - name: Generate coverage report
    run: npm run test:coverage

  - name: Run security tests
    run: npm run test:security

  - name: Run performance tests
    run: npm run test:performance
```

#### Test Scripts in `package.json`

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:integration": "vitest run tests/integration/",
    "test:security": "vitest run tests/security/",
    "test:performance": "vitest run tests/performance/",
    "test:ui": "vitest --ui",
    "test:watch": "vitest --watch"
  }
}
```

## Manual Testing

### Test Scenarios

#### Complete User Journey

1. **Initial Load**
   - [ ] Application loads without errors
   - [ ] UI displays correctly on desktop and mobile
   - [ ] Login interface is accessible

2. **Authentication Flow**
   - [ ] GitHub OAuth button works
   - [ ] Token input validation works
   - [ ] Error messages display for invalid tokens
   - [ ] Successful authentication redirects to editor

3. **Content Creation**
   - [ ] Markdown editor accepts input
   - [ ] Live preview updates in real-time
   - [ ] Word count updates correctly
   - [ ] Auto-save functionality works

4. **Deployment Process**
   - [ ] Deploy button is enabled after content entry
   - [ ] Deployment progress is shown
   - [ ] Success message displays with site URL
   - [ ] Generated site loads correctly

5. **Error Handling**
   - [ ] Network errors display user-friendly messages
   - [ ] Rate limit errors are handled gracefully
   - [ ] Invalid repository names are rejected
   - [ ] Logout functionality works correctly

### Browser Compatibility Testing

#### Desktop Browsers
- [ ] Chrome (latest 2 versions)
- [ ] Firefox (latest 2 versions)
- [ ] Safari (latest 2 versions)
- [ ] Edge (latest 2 versions)

#### Mobile Browsers
- [ ] iOS Safari
- [ ] Chrome Mobile
- [ ] Samsung Internet
- [ ] Firefox Mobile

### Accessibility Testing

#### WCAG 2.1 Compliance
- [ ] Keyboard navigation works throughout the app
- [ ] Screen reader compatibility (test with NVDA/JAWS)
- [ ] Color contrast meets AA standards