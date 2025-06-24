import jsdoc from 'eslint-plugin-jsdoc';

/** @type {import('eslint').Linter.FlatConfig} */
export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        File: 'readonly',
        FileReader: 'readonly',
        Element: 'readonly',
        HTMLElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLTextAreaElement: 'readonly',
        HTMLButtonElement: 'readonly',
      }
    },
    plugins: {
      jsdoc
    },
    rules: {
      camelcase: ['error', { properties: 'always' }],
      'new-cap': ['error', { capIsNew: false }],
      'no-var': 'error',
      'prefer-const': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'jsdoc/require-jsdoc': ['warn', {
        require: {
          FunctionDeclaration: true,
          MethodDefinition: true,
          ClassDeclaration: true,
          ArrowFunctionExpression: false,
          FunctionExpression: false
        }
      }],
      'jsdoc/check-tag-names': 'warn',
      'jsdoc/check-param-names': 'warn',
      'jsdoc/check-types': 'warn',
      'jsdoc/require-param': 'warn',
      'jsdoc/require-returns': 'warn'
    }
  }
]; 