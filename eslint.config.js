import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

export default [
  // Base JavaScript recommendations
  js.configs.recommended,

  // Prettier integration (must be last to override conflicting rules)
  prettierConfig,

  {
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        fetch: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        btoa: 'readonly',
        atob: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        location: 'readonly',
        history: 'readonly',
        navigator: 'readonly',
        confirm: 'readonly',
        alert: 'readonly',
        prompt: 'readonly',
        // Additional browser globals
        Event: 'readonly',
        CustomEvent: 'readonly',
        EventTarget: 'readonly',
        Element: 'readonly',
        HTMLElement: 'readonly',
        crypto: 'readonly',
        Blob: 'readonly',
        File: 'readonly',
        FileReader: 'readonly',
        FormData: 'readonly',
        Headers: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        // Node.js globals for server files
        process: 'readonly',
        Buffer: 'readonly',
        global: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },

    plugins: {
      prettier: prettierPlugin,
    },

    rules: {
      // Prettier integration
      'prettier/prettier': 'error',

      // Code quality rules that don't conflict with Prettier
      'no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: false,
          varsIgnorePattern:
            '^(openFolder|_|originalSanitize|maliciousScript|originalExpiry)',
          argsIgnorePattern: '^(_|error|e|next|beforeEach|afterEach)',
          caughtErrorsIgnorePattern: '^(_|error|e)$',
        },
      ],

      // Allow empty catch blocks for error handling
      'no-empty': ['error', { allowEmptyCatch: true }],

      // Prefer const over let when variable is never reassigned
      'prefer-const': 'error',

      // Remove unnecessary escape characters
      'no-useless-escape': 'error',

      // Prevent console in production (warn for now)
      'no-console': 'warn',

      // Modern JavaScript best practices
      'no-var': 'error',
      'prefer-arrow-callback': 'error',
      'prefer-template': 'error',
      'object-shorthand': 'error',

      // Security-focused rules
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'warn', // Warn instead of error for security tests

      // Allow method overrides in main classes
      'no-dupe-class-members': 'warn',
    },
  },

  {
    // Server-specific configuration
    files: ['server.js', '**/server.js', '**/*.config.js'],
    languageOptions: {
      globals: {
        // Node.js specific globals
        process: 'readonly',
        Buffer: 'readonly',
        global: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        require: 'readonly',
      },
    },
    rules: {
      'no-console': 'off', // Allow console in server/config files
    },
  },

  {
    // Test files configuration
    files: ['**/*.test.js', '**/*.spec.js', 'tests/**/*.js'],
    languageOptions: {
      globals: {
        // Vitest globals
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly',
        // Node.js require for test utilities
        require: 'readonly',
      },
    },
    rules: {
      'no-console': 'off', // Allow console in tests
      'no-script-url': 'off', // Allow javascript: URLs in security tests
      'no-unused-vars': [
        'error',
        {
          varsIgnorePattern:
            '^(openFolder|_|originalSanitize|maliciousScript|originalExpiry)',
          argsIgnorePattern: '^(_|beforeEach|afterEach)',
        },
      ],
    },
  },

  {
    // Ignore build outputs and dependencies
    ignores: [
      'dist/**',
      'node_modules/**',
      'build/**',
      '.vite/**',
      'coverage/**',
      '*.min.js',
      'cleanup-comments.js', // Utility script with intentional console usage
      '*.backup.*',
      '*.new',
    ],
  },
];
