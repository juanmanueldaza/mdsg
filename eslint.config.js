export default [
  {
    languageOptions: {
      ecmaVersion: 2022,
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
        // Node.js globals for server files
        process: 'readonly',
        Buffer: 'readonly',
        global: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
    rules: {
      // Enforce single quotes
      quotes: ['error', 'single', { avoidEscape: true }],

      // Consistent indentation (2 spaces)
      indent: ['error', 2, { SwitchCase: 1 }],

      // Allow unused variables that match specific patterns
      'no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: false,
          varsIgnorePattern: '^(openFolder)$',
        },
      ],

      // Prefer const over let when variable is never reassigned
      'prefer-const': 'error',

      // Remove unnecessary escape characters
      'no-useless-escape': 'error',

      // Trailing commas
      'comma-dangle': ['error', 'always-multiline'],

      // Semicolons
      semi: ['error', 'always'],

      // Object/array spacing
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],

      // Function spacing
      'space-before-function-paren': [
        'error',
        {
          anonymous: 'always',
          named: 'never',
          asyncArrow: 'always',
        },
      ],

      // General spacing
      'space-infix-ops': 'error',
      'keyword-spacing': 'error',

      // Line breaks
      'eol-last': 'error',
      'no-trailing-spaces': 'error',
    },
  },
  {
    // Server-specific configuration
    files: ['server.js', '**/server.js'],
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
  },
  {
    // Ignore build outputs and dependencies
    ignores: ['dist/**', 'node_modules/**', 'build/**', '.vite/**'],
  },
];
