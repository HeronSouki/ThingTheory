// `npm run check`: catches undefined names (typos, a prop that was never imported) before a long render.
import globals from 'globals';

export default [
  { ignores: ['out/**', 'node_modules/**'] },
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: { ecmaVersion: 2024, sourceType: 'module', globals: { ...globals.node } },
    rules: {
      'no-undef': 'error',
      'no-dupe-keys': 'error',
      'no-redeclare': 'error',
      'no-unused-vars': ['warn', { args: 'none' }],
    },
  },
];
