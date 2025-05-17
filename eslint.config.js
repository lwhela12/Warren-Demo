import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

export default [
  {
    files: ['**/*.{js,ts,tsx}'],
    ignores: ['dist', 'node_modules'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: require.resolve('@typescript-eslint/parser')
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin')
    },
    rules: {}
  }
];
