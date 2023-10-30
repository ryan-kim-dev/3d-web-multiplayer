/* eslint-env node */

module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:prettier/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: true,
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: ['.eslintrc.cjs', 'vite.config.ts'],
  plugins: ['react-refresh'],
  rules: {
    'prettier/prettier': ['error', { endOfLine: 'auto', singleQuote: true }],
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    // '@typescript-eslint/no-non-null-assertion': 'off',
    // '@typescript-eslint/no-explicit-any': 'off',
    // '@typescript-eslint/no-unsafe-member-access': 'off',
    // '@typescript-eslint/no-unsafe-assignment': 'off',
    // '@typescript-eslint/no-unsafe-argument': 'off',
    // '@typescript-eslint/no-unsafe-call': 'off',
    // '@typescript-eslint/restrict-template-expressions': 'off',
    // '@typescript-eslint/no-unsafe-return': 'off',
    // '@typescript-eslint/no-floating-promises': 'off',
    // 'no-mixed-spaces-and-tabs': 'off',
  },
};
