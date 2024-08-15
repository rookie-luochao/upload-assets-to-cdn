module.exports = {
  env: { es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  ignorePatterns: [
    'examples',
    'dist',
    'node_modules',
    '.eslintrc.cjs',
    'prettier.config.cjs',
    'commitlint.config.cjs',
    'lint-staged.config.cjs',
    'packages/core/test'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: { 
    ecmaVersion: 'latest', 
    sourceType: 'module',
    project: ['./tsconfig.json'],
  },
  plugins: [],
  rules: {
    '@typescript-eslint/ban-ts-comment': 'off'
  },
}
