const js = require('@eslint/js');
const globals = require('globals');
const tseslint = require('typescript-eslint');
const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');

const tsRecommended = tseslint.configs.recommended.map((config) =>
  config.files ? config : { ...config, files: ['**/*.{ts,tsx,mts,cts}'] }
);

module.exports = [
  { ignores: ['build/**', 'dist/**', 'node_modules/**'] },

  js.configs.recommended,
  ...tsRecommended,

  {
    files: ['**/*.{js,cjs,mjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'script',
      globals: globals.node,
    },
    rules: {
      'no-redeclare': 'off',
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrors: 'none',
        },
      ],
    },
  },

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrors: 'none',
        },
      ],
      'prefer-const': 'warn',
    },
  },

  {
    files: ['**/*.{jsx,tsx}'],
    plugins: { react, 'react-hooks': reactHooks },
    settings: { react: { version: 'detect' } },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
  },

  {
    files: ['**/*.{test,spec}.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.jest,
    },
  },
];
