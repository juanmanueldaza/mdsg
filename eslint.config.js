import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        window: 'readonly',
        document: 'readonly',
        fetch: 'readonly',
        alert: 'readonly',
        URL: 'readonly',
        define: 'readonly',
        module: 'readonly',
        self: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['warn', { varsIgnorePattern: '^(openFolder)$' }],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { varsIgnorePattern: '^(openFolder)$' },
      ],
      'no-console': 'off',
      'prefer-const': 'error',
      'no-var': 'error',
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
      indent: ['error', 2],
      'comma-dangle': ['error', 'only-multiline'],
      'no-trailing-spaces': 'error',
      'eol-last': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ['./tsconfig.json', './sites/*/tsconfig.json'],
      },
    },
  },
];
