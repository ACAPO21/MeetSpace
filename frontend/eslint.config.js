import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // Pattern idiomatique de PoC : chargement des données au montage du
      // composant (useEffect vide appelant une fonction qui met à jour l'état).
      // Cette règle très stricte (react-hooks v7) est désactivée volontairement ;
      // toutes les autres règles restent actives.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
])
