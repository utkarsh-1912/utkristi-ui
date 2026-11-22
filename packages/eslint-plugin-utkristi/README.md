# Utkristi UI ESLint rules

Extend `utkristi.configs.recommended` in your ESLint flat config.

```js
import utkristi from 'eslint-plugin-utkristi';

export default [
  {
    ...utkristi.configs.recommended,
    files: ['**/*.{jsx,tsx}'],
  },
];
```

Configure your JSX or TypeScript parser as usual. The rules inspect literal classes, accessible names on icon buttons, and logical properties in JSX style objects.
