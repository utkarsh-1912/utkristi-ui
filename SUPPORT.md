# Support Policy & Compatibility Matrix

## Compatibility Matrix

| Surface / Dependency | Supported Versions | Notes |
| --- | --- | --- |
| React & React DOM | `>=18.0.0` (verified on `18.3.1`) | Peer dependencies |
| Tailwind CSS | `>=3.4.0` (3.4 preset/plugin & 4.x `@plugin`) | Optional peer dependency |
| Browsers | Chrome/Edge 111+, Safari 16.2+, Firefox 113+ | Requires CSS `color-mix()` |
| Node.js (build & CI) | `22.x` | Verified in `.github/workflows/verify.yml` |
| Icons (`lucide-react`) | `>=0.468.0` | Optional peer; kit ships 150+ built-in icons |

## Bundle Size Budgets

Enforced in CI via `npm run check:bundles` (`scripts/check-bundles.mjs`):

| Entry Export | Max Gzipped Budget |
| --- | --- |
| `Button` | 2,000 B |
| `Badge` | 2,000 B |
| `Select` | 2,500 B |
| `DataTable` | 10,000 B |

Tree-shaking is verified so importing single components never retains the full icon catalog.

## Release & Support Policy

- **Pre-release (`0.1.x`)**: Active feature development; breaking changes are documented in `CHANGELOG.md` and `MIGRATION.md`.
- **CI Gates**: Every release must pass `typecheck`, `lint`, `docs:audit`, `test` (including `axe-core` WCAG 2.1 AA checks across Night, Paper, and Glass), `check:bundles`, `docs:build`, `docs:verify`, and `smoke:package`.
- **Accessibility**: WCAG 2.1 AA contrast ratios are enforced by `test/contrast.test.ts` and DOM/ARIA rules by `test/a11y.test.tsx`.
