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

## Overlay accessibility coverage

| Surface | Interaction covered | Regression suite |
| --- | --- | --- |
| Menu | Arrow navigation includes unavailable commands. Enter and Space leave those commands inactive. Escape returns focus to the trigger. | `test/menu.test.tsx` |
| Calendar and date picker | Day navigation crosses a month boundary. Selecting a day closes the picker and returns focus to its trigger. | `test/catalog.test.tsx` |
| Modal | Focus stays inside the open dialog and returns on close. Alert dialogs initially focus the cancellation action. | `test/modal.test.tsx`, `test/catalog.test.tsx` |

Menu keyboard behavior follows the [WAI-ARIA menu pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/).
VoiceOver announcements and iOS Safari scroll behavior still need device verification.

## Release & Support Policy

The kit and MCP server can ship separately. After verification passes on Windows and Linux,
tag the kit as `v<package version>` or the server as `ui-mcp-v<server version>`.
The **Publish tagged npm package** workflow takes the matching tag and package as inputs.
It uses the GitHub `npm` environment and requests npm provenance. Configure each package's
npm trusted publisher for this repository, `publish.yml`, and that environment before running it.
Use a fresh package version for each release.

- **Pre-release (`0.1.x`)**: Active feature development; breaking changes are documented in `CHANGELOG.md` and `MIGRATION.md`.
- **CI Gates**: Every release must pass `typecheck`, `lint`, `docs:audit`, `test` (including `axe-core` WCAG 2.1 AA checks across Night, Paper, and Glass), `check:bundles`, `docs:build`, `docs:verify`, and `smoke:package`.
- **Accessibility**: WCAG 2.1 AA contrast ratios are enforced by `test/contrast.test.ts` and DOM/ARIA rules by `test/a11y.test.tsx`.
