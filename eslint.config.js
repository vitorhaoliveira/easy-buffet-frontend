const tseslint = require('@typescript-eslint/eslint-plugin')
const tsparser = require('@typescript-eslint/parser')
const angular = require('@angular-eslint/eslint-plugin')
const angularTemplate = require('@angular-eslint/eslint-plugin-template')
const angularTemplateParser = require('@angular-eslint/template-parser')

module.exports = [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.angular/**',
      '**/coverage/**',
      '**/*.js',
      '!eslint.config.js'
    ]
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    plugins: {
      '@typescript-eslint': tseslint,
      '@angular-eslint': angular
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...angular.configs.recommended.rules,
      'semi': ['error', 'never'],
      'indent': ['error', 2, {
        'SwitchCase': 1
      }]
    }
  },
  {
    files: ['**/*.html'],
    languageOptions: {
      parser: angularTemplateParser
    },
    plugins: {
      '@angular-eslint/template': angularTemplate
    },
    rules: {
      ...angularTemplate.configs.recommended.rules
    }
  }
]
