module.exports = {
  root: true,
  extends: '@react-native-community',
  rules: {
    '@typescript-eslint/no-unused-vars': 'warn',
    'padding-line-between-statements': [
      'error',
      {
        blankLine: 'always',
        prev: '*',
        next: '*',
      },
      {
        blankLine: 'any',
        prev: 'import',
        next: 'import',
      },
      {
        blankLine: 'any',
        prev: 'export',
        next: 'export',
      },
      {
        blankLine: 'any',
        prev: 'if',
        next: ['if', 'return'],
      },
      {
        blankLine: 'any',
        prev: 'singleline-const',
        next: 'singleline-const',
      },
      {
        blankLine: 'any',
        prev: 'singleline-let',
        next: 'singleline-let',
      },
      {
        blankLine: 'never',
        prev: 'case',
        next: ['case', 'default'],
      },
    ],
    'no-unused-vars': [
      'warn',
      {vars: 'all', args: 'after-used', ignoreRestSiblings: false},
    ],
    'no-console': 'off',
    'react-native/no-inline-styles': 'off',
    'react-hooks/exhaustive-deps': 'warn',
    semi: 'off',
  },
};
