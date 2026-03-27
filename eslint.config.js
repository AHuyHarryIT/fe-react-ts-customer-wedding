import importPlugin from 'eslint-plugin-import'
import tscPlugin from 'eslint-plugin-tsc'
import tanstackRouter from '@tanstack/eslint-plugin-router'
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'

export default tseslint.config(
  globalIgnores(['dist']),
  js.configs.recommended,
  ...tseslint.configs.recommended,
  reactHooks.configs.flat['recommended-latest'],
  reactRefresh.configs.vite,
  ...tanstackRouter.configs['flat/recommended'],
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      import: importPlugin,
      tsc: tscPlugin,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.app.json',
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
    rules: {
      'import/no-unresolved': 'error',
      'tsc/config': ['error', { configFile: 'tsconfig.app.json' }],
    },
  },
  {
    files: ['src/routes/*.tsx', 'src/routes/**/*.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    files: ['src/components/ui/*.tsx', 'src/components/ui/**/*.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
)
