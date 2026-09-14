import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import uiText from './eslint-ui-text.mjs';

// Static correctness checks only; design and formatting remain project choices.
export default [{
  files: ['src/**/*.{js,jsx,ts,tsx}'],
  languageOptions: { parser: tseslint.parser, parserOptions: { ecmaFeatures: { jsx: true } } },
  plugins: { 'react-hooks': reactHooks, 'ui-text': { rules: { 'no-escaped-entity': uiText } } },
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'ui-text/no-escaped-entity': 'error',
  },
}];
