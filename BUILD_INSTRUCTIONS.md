# Utkristi UI: build instructions

This is a complete brief for the model that builds Utkristi UI. Read it together with
[DESIGN_TOKENS.md](DESIGN_TOKENS.md), which maps every app token and `.u-*` class to its kit name and
is the naming contract. Don't rename anything listed there.

## 0. Ground rules

- **Write only here.** Write only inside `C:\Users\utkar\Downloads\utkristi-ui`.
- **The app is read-only.** `C:\Users\utkar\Downloads\rtm-code-editor` is reference material. Never
  edit, move or commit anything there.
- **No commits or pushes.** Don't commit or push unless the user asks. Never add a Co-Authored-By
  trailer. Running `git init` here is fine.
- **Match the app.** Copy the look from these files. Don't invent a new style.
  - `src/styles/app.css`: the main reference. The tokens are on lines 9–99 and the core `.u-*`
    components on lines 123–488. The responsive rules are on lines 816–867, the slider on lines
    1218–1240, the split button on lines 3245–3275, rich text (`.rt`) on lines 3074–3087, avatars
    (`.u-av`) on lines 1150–1157 and the toast (`.up-toast`) on line 1730.
  - `src/components/ux/primitives.js` (Modal, Slider), `src/components/ux/Shell.js` (header, sheet,
    footer, ThemeSwitch), `src/components/NewSplit.js`, `src/components/Logo.js`,
    `src/components/RichText.js` and `src/utils/theme.js` (stores `"dark" | "light" | "system"`).
  - The fonts link in `public/index.html`:
    `https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,300..900&family=Geist+Mono:wght@400;500&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap`
- **Build order.** Tokens, then CSS components, then React, then tests, then docs. Keep a short
  `CHANGELOG.md`, starting at `0.1.0`.

## 1. Decisions already made

| Topic | Decision |
| --- | --- |
| Package | `@utkristi/ui`, `"type": "module"`, MIT, `"sideEffects": ["**/*.css"]` |
| Tailwind | Target **v3.4** (`preset` + `plugin` API) as an optional peer `>=3.4`. Tell v4 users to load it with `@config` / `@plugin`. |
| React | Peers `react` / `react-dom` `>=18`, marked optional so CSS-only installs don't warn. No UI frameworks at runtime. |
| Icons | `lucide-react` is an **optional** peer. Components must not import it. Ship a tiny internal `icons.tsx` with lucide-style inline SVGs (24 grid, 2px stroke, round caps) for close, chevron-down, menu, sun, moon, check, plus and search. Components take icons as `ReactNode` props, so lucide icons drop straight in. The docs use lucide. |
| CSS source of truth | Hand-written CSS in `src/styles/`. The Tailwind plugin and the prebuilt CSS are both generated from it, so the two never drift. |
| React build | Plain `tsc` (per-file ESM + `.d.ts`, `jsx: react-jsx`, `moduleResolution: bundler`). Write import specifiers with `.js` extensions (`./Button.js`). This gives tree-shaking with no bundler. |
| Token prefix | `--ut-`, so the kit can run inside the CoLabs app without clashing with `--u-`. |
| Class naming | Bootstrap style: `.btn` + `.btn-solid`. States accept ARIA (`aria-pressed/selected/checked/current="true"`) **or** `.is-active`. |
| Theme default | Night. Paper is the light theme. |

## 2. File layout

```
package.json  tsconfig.json  tsconfig.build.json  eslint.config.js  vitest.config.ts
README.md  CHANGELOG.md  DESIGN_TOKENS.md  LICENSE
src/
  styles/
    tokens.css        theme variables (section 3)
    base.css          html/body defaults, ::selection, global :focus-visible, reduced motion
    components.css    every component class (section 4), its @keyframes and @media
    fonts.css         @import of the Google Fonts URL above
  tailwind/
    plugin-core.js    createPlugin({ base, components }) -> tailwindcss/plugin(...)
    plugin.js         dev entry: reads the CSS with fs + postcss + postcss-js.objectify -> createPlugin
    preset.js         { darkMode, theme.extend, plugins: [plugin] }
    theme.js          the theme.extend object (shared by the preset and the plugin's 2nd arg)
  react/
    index.ts  utils/{cx,useControllable,focus,useScrollLock,Portal,useId}.ts(x)  icons.tsx
    theme/ThemeProvider.tsx
    Button.tsx SplitButton.tsx Card.tsx Field.tsx Choice.tsx Slider.tsx Segmented.tsx Tabs.tsx
    Menu.tsx Modal.tsx Toast.tsx Tooltip.tsx Badge.tsx Avatar.tsx Skeleton.tsx Table.tsx
    EmptyState.tsx Navbar.tsx Footer.tsx Shell.tsx Steps.tsx Stat.tsx ThemeToggle.tsx
    RichText.tsx Kbd.tsx Code.tsx Logo.tsx Spinner.tsx
scripts/build-css.mjs   scripts/build-tailwind.mjs   scripts/screenshots.mjs
test/  (section 7)
docs/  (section 8)
```

### `package.json` exports

| Export | Files |
| --- | --- |
| `.` | `dist/react/index.js` + `.d.ts` |
| `./preset` | `dist/tailwind/preset.js`, `.cjs`, `.d.ts` |
| `./plugin` | `dist/tailwind/plugin.js`, `.cjs`, `.d.ts` |
| `./utkristi-ui.css` | `dist/utkristi-ui.css` (also `./css`) |
| `./utkristi-ui.min.css` | the minified build |
| `./tokens.css`, `./fonts.css` | the standalone token and font sheets |
| `./tokens` | `dist/tokens.js` / `.cjs`: raw night and paper values, parsed from `tokens.css` at build time |
| `./package.json` | the package file itself |

### Scripts

| Script | Runs |
| --- | --- |
| `build` | `clean`, then `build:css`, `build:tailwind` and `build:react` (`tsc -p tsconfig.build.json`) |
| `test` | `vitest run` |
| `lint` | `eslint .` |
| `typecheck` | `tsc --noEmit` |
| `docs` | `vite --config docs/vite.config.ts` |
| `docs:build` | the docs production build |
| `docs:preview` | serves the docs build |
| `screenshots` | `scripts/screenshots.mjs` |

### Dev dependencies

typescript 5, vite 6, @vitejs/plugin-react, vitest 3, jsdom, @testing-library/react 16,
@testing-library/user-event 14, @testing-library/jest-dom 6, tailwindcss 3.4, postcss, postcss-js,
autoprefixer, esbuild, eslint 9 with typescript-eslint, eslint-plugin-react-hooks and
eslint-plugin-jsx-a11y, globals, react 18.3, react-dom 18.3, @types/react, @types/react-dom and
lucide-react.

## 3. Tokens (`src/styles/tokens.css`)

Put the values from DESIGN_TOKENS.md into these blocks:

```css
:root { /* non-colour tokens: fonts, radii, easing, --ut-max, --ut-side, --ut-r-field: 12px */ }
:root, .dark, [data-theme="dark"]   { /* night colours */ color-scheme: dark; }
.light, .light-theme, [data-theme="light"] { /* paper colours */ color-scheme: light; }
@media (prefers-color-scheme: light) { [data-theme="system"] { /* paper colours */ color-scheme: light; } }
```

- **Kit-only tokens.** Include the "added by the kit" tokens: `--ut-on-accent`, `--ut-on-mark`,
  `--ut-on-bad` and the `--ut-*-ink` state text colours, plus `--ut-backdrop` and `--ut-ring`. They
  exist so that text passes 4.5:1. Note that `--ut-on-bad` is dark in night, which is a deliberate
  change from the app.
- **One variable per colour.** Use hex or rgba, with no separate RGB-channel variables, so a brand
  can override a colour in one place.
- **No theme classes inside `components.css`.** Selectors like `.light .btn` break Tailwind
  `prefix`. Any per-theme difference has to be a token.

## 4. Component CSS (`src/styles/components.css`)

Port each `.u-*` rule with its exact values (sizes, radii, transitions, easing, keyframes). Rename
the classes per DESIGN_TOKENS.md and prefix keyframes with `ut-`. Specifics that the app doesn't
spell out:

- **Focus.** Use one shared rule for `btn`, `icon-btn`, `btn-circle`, `chip`, `seg-item`, `tab`,
  `step`, `switch`, `checkbox`, `radio` and `link`, written as `:focus-visible`: `outline: 2px solid
  var(--ut-accent); outline-offset: 2px`. Menu items use `outline-offset: -2px` and a tint
  background. Inputs keep the app's accent border plus a 4px `--ut-ring` halo.
- **Buttons.** `.btn` is the bare pill. Solid hovers to `accent` / `on-accent`. Danger uses `bad` /
  `on-bad`. `:disabled` and `[aria-disabled=true]` drop to opacity .5. `:active` scales to `.97`.
- **Badges.** `.badge` is a new mono pill: 20px tall, 10.5px uppercase, `line-2` border, tint
  background. Tone variants add a `::before` dot, plus a background and border mixed from the tone,
  while the **text stays ink** for contrast. `.badge-count` is the app's red `.u-count`, using
  `on-bad` text.
- **Checkbox and radio.** These are native inputs with `appearance: none`, 18px. The checkbox has a
  5px radius and the radio is round. Checked uses a `mark` fill with an `on-mark` tick drawn by a
  `::after` rotated border. Support `:indeterminate`. `.choice` is the label wrapper (inline-flex,
  10px gap).
- **Switch.** Works on `button[role=switch][aria-checked]` **and** on `input[type=checkbox].switch:checked`.
- **Tabs.** There is no app source for these, so derive them from `.ws-tab` and `.g-index`. Lay the
  tabs out in a row with a hairline bottom border and a 22px gap. Inactive tabs are `ink-3` and
  hover to `ink-2`, at 14.5px weight 500. The active tab is `ink`, with a 2px accent underline that
  sweeps in like `.u-ul` (scaleX, `.45s var(--ut-ease)`).
- **Menus.** `.pop` is the app's floating surface, with the positioning and `ut-pop` animation, and
  takes `pop-left` / `pop-up` modifiers. `.menu` is the same surface but static. Items **only** use
  `.menu-item`: no descendant `button` selectors.
- **Tooltip.** Use the `.u-slider-bubble` look: solid fill, `on-solid` text, mono 11px, 8px radius
  and a 4px arrow. Also add a CSS-only `[data-tip]` version (an `::after` with `attr(data-tip)`, shown
  on hover and focus-visible).
- **Table.** Derive from `.u-rows`. Header cells are mono 11px uppercase `ink-3` at weight 400. Rows
  have hairline bottoms and a tint hover. `.num` is right-aligned with tabular numbers.
  `.table-wrap` scrolls sideways. `.table-stack` turns each row into a card at ≤560px, using
  `data-label`.
- **Toast.** Combine `.up-toast` and `.sw`: a raise background, a `line` border, an 18px radius, the
  shadow and the `ut-up` animation. `.toast-region` sits fixed at the bottom right (12px insets on
  phones) at z-index 1100. Add a `.toast-track` 2px progress bar.
- **Avatar.** Port `.u-av`. The background is `var(--ut-av, var(--ut-bg-3))` and the text is
  `var(--ut-av-ink, var(--ut-ink))`. The React palette sets both, and every palette colour needs
  4.5:1 with white.
- **Navbar.** Breakpoints match the app: **980px** (hide `.navbar-links`, show `.burger`) and
  **700px** (60px tall). The sheet's giant links use the `.u-lines` rise animation.
- **Modal.** At ≤700px it becomes a bottom sheet with radius `22px 22px 0 0`, `max-height: 92vh` and
  `ut-up`. At ≤560px the padding tightens.
- **Reduced motion.** End the file with one `@media (prefers-reduced-motion: reduce)` block that
  turns off pop, modal, sheet, toast, dot, skeleton, step fill and grain animations. Keep the spinner.

## 5. Tailwind (`src/tailwind/`)

### Theme extension (`theme.js`)

- **Colours.** `bg, bg-2, bg-3, raise, ink, ink-2, ink-3, line, line-2, tint, accent, mark, solid,
  on-solid, on-accent, ok, bad, warn, pane, pane-ink, pane-ink-2, pane-line`, each as
  `color-mix(in srgb, var(--ut-X) calc(<alpha-value> * 100%), transparent)` so `/50` opacity
  modifiers work.
- **Fonts.** `fontFamily`: `display`, `sans` / `text` and `mono`, all pointing at the variables.
- **`fontStretch`.** `{ condensed: '62%', semi: '87.5%', normal: '100%' }`.
- **Radius.** `borderRadius`: `ut`, `ut-lg`, `field` and `pill: 999px`.
- **Shadow.** `boxShadow.ut`.
- **Easing.** `transitionTimingFunction`: `ut`, `curve` and `inout-ut`.
- **Widths.** `maxWidth.page` and `spacing.side`.

### Plugin (`plugin-core.js`)

- `addBase(tokens + base)`, with option `{ base: false }` to skip `base.css`.
- `addComponents(components)`, so classes live in `@layer components` and utilities still win.
- `matchUtilities({ stretch: v => ({ fontStretch: v }) }, { values: theme('fontStretch') })`, plus
  `.font-condensed`.
- `addVariant('light', '&:where(.light, .light *, [data-theme="light"], [data-theme="light"] *)')`
  and the matching `night` variant.
- Pass `theme.js` as the plugin's second argument, so the plugin works without the preset.

### Preset (`preset.js`)

`{ darkMode: ['variant', '&:where(.dark, .dark *, [data-theme="dark"], [data-theme="dark"] *)'],
theme: { extend }, plugins: [plugin] }`.

### Build (`scripts/build-tailwind.mjs`)

1. Objectify the CSS with postcss-js into `dist/tailwind/styles.js`.
2. Bundle `plugin-core` + styles with esbuild into ESM `.js` and CJS `.cjs`, with `tailwindcss`
   external.
3. Write `.d.ts` stubs.

The published plugin must not need postcss at runtime.

### `scripts/build-css.mjs`

1. Concatenate `tokens + base + components` into `dist/utkristi-ui.css`.
2. Minify it with esbuild (`loader: 'css'`) into `.min.css`.
3. Copy `tokens.css` and `fonts.css`.
4. Parse `tokens.css` and emit `dist/tokens.js`, `.cjs` and `.d.ts`.

## 6. React (`src/react/`)

General rules:

- Every component forwards its ref, spreads the rest of the props and merges `className` with `cx`.
- Each one renders the CSS classes from section 4. No inline styling beyond CSS variables such as
  `--p`, `--n`, `--d` and `--dur`.
- Use `useId` for every aria link between elements.

| Component | Behaviour |
| --- | --- |
| `ThemeProvider` / `useTheme` | `theme: 'system'\|'dark'\|'light'`, `resolvedTheme`, `setTheme`. Persist to `localStorage` (default key `utkristi-theme`, configurable, wrapped in try/catch). Set `data-theme={resolved}` and the `dark`/`light` class on `<html>` (configurable target). Follow the `matchMedia` change event when on system. Guard for SSR (no `window` at render, effects only). Export a `themeScript(key)` string for a no-flash inline `<script>`. Default theme is `dark`. |
| `Button` | `variant: 'solid'\|'ghost'\|'quiet'\|'danger'\|'plain'`, `size: 'sm'\|'md'\|'lg'`, `block`, `loading` (Spinner + `aria-busy`), `iconLeft` / `iconRight`. With `href` it renders `<a>`. Defaults to `type="button"`. |
| `IconButton` | **Requires** `label` (sets `aria-label`). `variant: 'icon'\|'circle'`, `pressed` → `aria-pressed`, `tone="danger"`, `badge`. |
| `SplitButton` | Main action plus a toggle (`aria-haspopup="menu"`, `aria-expanded`) that opens Menu items with a title and sub line. Reuse Menu's logic. |
| `Card` | Also `CardHeader` and `CardBody`. Props: `well`, `pane`, `interactive`. |
| `Field` | Context that supplies `id`, `aria-describedby` (hint + error) and `aria-invalid` to its child `Input`, `Select`, `Textarea` or `SearchInput`. Props: `label`, `hint`, `error`, `required`. |
| `Checkbox` / `Radio` | Native inputs with a `label` prop. `Checkbox` takes `indeterminate`. `RadioGroup` uses `role="radiogroup"`. |
| `Switch` | A `button role="switch"`, controlled or uncontrolled, with a `label`. |
| `Slider` | Port `primitives.js` `Slider`: `--p`/`--pn` variables, bubble, `aria-valuetext`, marks. |
| `Segmented` | `role="radiogroup"` with `role="radio"` items. Roving tabindex. Arrow keys, Home and End move **and** select. |
| `Tabs` | Items API `{ id, label, content, count? }`. `tablist`, `tab` and `tabpanel` roles, `aria-controls` / `aria-labelledby`, roving tabindex, arrows, Home, End, and `activation: 'auto'\|'manual'`. |
| `Menu` / `Dropdown` | `trigger` render-prop or element. Items have `onSelect`, `icon`, `kbd`, `danger`, `disabled`, plus separators and a header. Enter, Space or ArrowDown on the trigger opens it on the first item; ArrowUp opens it on the last. Arrows wrap, Home/End jump, typeahead by first letter. Escape closes and returns focus to the trigger; Tab closes. Outside `mousedown` closes. Items use `role="menuitem"` and skip disabled ones. `align: 'end'\|'start'`. |
| `Modal` / `Dialog` | `open`, `onClose`, `title` (→ `aria-labelledby`), `description` (→ `aria-describedby`), `label` (mono kicker), `footer`, `wide`, `onSubmit` (renders `<form>`, as in the app), `initialFocus`. Portal to `body`. **Focus trap** with Tab and Shift+Tab wrapping. Escape closes. Backdrop `mousedown` on itself closes. Body scroll lock with a counter, so nested locks restore correctly. Restore focus to the previously focused element. |
| `Portal` | Copies the theme: a hidden marker span reads `closest('[data-theme]')` and the portal wrapper gets the same `data-theme`, so a modal opened inside a paper panel stays paper. |
| `ToastProvider` / `useToast()` | `.show({ title, body, tone, action, duration })` returns an id; also `.dismiss(id)`. The region uses `aria-live="polite"` (`assertive` for the `bad` tone). Auto-dismiss pauses on hover and focus. |
| `Tooltip` | Wraps one child element. Shows on hover and focus after a 300ms delay, hides on Escape. `role="tooltip"` with `aria-describedby` on the child. Fixed position computed from `getBoundingClientRect`, flips when out of room, rendered in a Portal. |
| `Badge` | Tones `neutral\|ok\|warn\|bad\|accent\|count`. |
| `Chip` | When interactive it is a button with `aria-pressed`. Takes `onRemove` for a remove button labelled "Remove X". |
| `Dot` | Takes a tone, plus a `label` (screen-reader text). |
| `Avatar` | `name` (initials, colour picked by a deterministic hash from a palette that all meets 4.5:1 with white), `src`, `size`, `me`, `status`. |
| `AvatarGroup` | `max` → `.avatar-more`. |
| `Skeleton` | `aria-hidden`. |
| `Table` | Columns `{ key, header, render?, align?, num? }`, `rows`, `getRowKey`, `stack` (sets `data-label`), `caption`, `onRowClick` (rows become focusable and respond to Enter). |
| `EmptyState` | `title`, `children`, `action`. |
| `Navbar` | Router-agnostic. `brand`, `links` (`{ href, label, active }`), `renderLink`, `right`, `strip` (left/right nodes), `hideOnScroll`. The burger (`aria-expanded`, `aria-controls`) opens the full-screen sheet: `role="dialog"`, `aria-modal`, focus trap, Escape, scroll lock, close button, optional `onSearch`, `sheetFoot`. The sheet closes on link click. |
| `Footer` | `lede`, `cta`, `columns`, `word` (giant fit-to-width line, ported from `FitLine` with ResizeObserver), `bottom`. Includes a `ThemeSwitch` slot. |
| `Shell` | Navbar + `main.page` + Footer. |
| `Steps` | Items, `value`, `onChange`, `autoplay` duration (`.is-running`, `--dur`, advances on `animationend`, pauses under reduced motion). Arrow keys. |
| `Stat` / `Stats` | `value`, `suffix`, `label`, `desc`. |
| `ThemeToggle` | An icon button with sun and moon. |
| `ThemeSwitch` | Segmented Dark / Light / Auto, like `Shell.js`. |
| `RichText` | Port `RichText.js` exactly. Never use `innerHTML`; only `https?` links are allowed. |
| `Kbd`, `Code` | `Code` takes `lines` for the gutter variant and `inline`. |
| `Logo` | The app's SVG mark plus a `name`/`suffix` wordmark (default "Utkristi" / "ui"). |
| `Spinner` | Has a `label`. |

## 7. Tests (Vitest + Testing Library, jsdom)

| File | What it checks |
| --- | --- |
| `test/modal.test.tsx` | Opening focuses the first focusable element (or `initialFocus`). Tab on the last element wraps to the first, and Shift+Tab on the first wraps to the last. Escape calls `onClose`. Backdrop click closes; a click inside doesn't. Body `overflow` is `hidden` while open and restored after. Focus returns to the trigger. The dialog has `role`, `aria-modal` and `aria-labelledby`. |
| `test/menu.test.tsx` | ArrowDown on the trigger opens it and focuses the first item. Arrows wrap, Home/End jump, disabled items are skipped. Enter calls `onSelect` and closes. Escape closes and refocuses the trigger. An outside click closes. `aria-expanded` follows the open state. |
| `test/theme.test.tsx` | `setTheme('light')` writes to localStorage and sets `data-theme="light"` and the `light` class. A remount reads the stored value back. `system` follows a mocked `matchMedia` and reacts to its change event. Blocked storage (getItem throws) falls back to `dark`. |
| `test/tabs-segmented.test.tsx` | Arrow, Home and End keys; roving tabindex; aria wiring. |
| `test/tailwind.test.ts` | Runs `postcss([tailwindcss({ content: [{ raw: '<button class="btn btn-solid card p-0">' }], presets: [preset] })])`. Asserts `.btn` and `var(--ut-solid)` appear, that the component rules come before utilities (so `p-0` overrides), that unused classes like `.modal` are purged, and that the `font-condensed` and `stretch-condensed` utilities exist. |
| `test/contrast.test.ts` | Parses `tokens.css` and computes WCAG ratios, blending rgba over `bg`, for both themes. Text pairs must reach ≥4.5: ink, ink-2 and ink-3 on bg, bg-2 and raise; on-solid on solid; on-accent on accent; on-bad on bad; the `*-ink` state colours on bg; and accent on bg (used for links and chips). UI pairs must reach ≥3: line-2 borders are excluded, but mark on bg and focus accent on bg are in. Also check every avatar palette colour against white. |
| `test/css.test.ts` | After a build, `dist/utkristi-ui.css` contains every class name listed in DESIGN_TOKENS.md. |

Setup goes in `test/setup.ts`: jest-dom plus a `matchMedia` mock.

## 8. Docs (`docs/`, Vite + React)

- **Setup.** The docs run Tailwind v3 with the **source** preset (`src/tailwind/preset.js`), which
  dogfoods the plugin. Alias `@utkristi/ui` to `src/react/index.ts`. Use `docs/index.html` with the
  Google Fonts link. Use hash routing (`#/getting-started`, `#/components/button`) to avoid a router
  dependency.
- **Layout.** Use the kit's own `Navbar` (burger and sheet at ≤980px), a left sidebar (a horizontal
  scroller on phones) and the `Footer`. There is a global `ThemeSwitch`. A `?theme=light|dark` query
  parameter forces the theme, for screenshots.
- **Pages.**
  - Overview.
  - **Getting started**: install; add `presets: [require('@utkristi/ui/preset')]` (and the ESM
    form) **or** `plugins: [utkristi()]` to `tailwind.config`, and add
    `node_modules/@utkristi/ui/dist/**/*.js` to `content` when using the React components; fonts via
    `<link>` or `@import '@utkristi/ui/fonts.css'`; no-Tailwind use with
    `import '@utkristi/ui/utkristi-ui.css'` or a `<link>` from a CDN such as unpkg; React usage with
    `ThemeProvider`; Tailwind v4 notes.
  - Theming: the selectors, `themeScript`, how to override a brand colour, and the `light:` and
    `night:` variants.
  - Tokens: live swatches in both themes, plus the contrast table.
  - Typography.
  - One page per component.
  - A **Showcase** page with many components together, used for the README screenshots.
- **Component pages.** Render each preview **twice, side by side**, inside a `data-theme="dark"`
  panel and a `data-theme="light"` panel, stacked on phones. Under it, put a code block with tabs:
  **Tailwind** (the HTML classes plus a utility override example), **Plain CSS** (the same HTML,
  noting the stylesheet import) and **React**. Each tab has a Copy button
  (`navigator.clipboard`, with a "Copied" toast).
- **Phones.** Check every page at 375px: no horizontal page scroll; tables scroll inside
  `.table-wrap`.

## 9. README and screenshots

- **Screenshots.** `scripts/screenshots.mjs` runs `docs:build`, starts `vite preview` and captures
  `#/showcase?theme=dark` and `?theme=light` at 1440×1800 into `docs/screenshots/night.png` and
  `paper.png`. Use headless Edge, which is already on this machine, so nothing is downloaded:
  `"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --headless --screenshot=<file> --window-size=1440,1800 <url>`.
  Fall back to Playwright only if Edge is missing.
- **README.** Cover what the kit is, the two screenshots, the three ways to use it (preset/plugin,
  prebuilt CSS, React), theming, accessibility notes (including the `on-bad` contrast deviation),
  browser support (`color-mix` is required: Chrome 111+, Safari 16.2+, Firefox 113+) and the scripts.

## 10. Done means

- In `C:\Users\utkar\Downloads\utkristi-ui`, these all pass: `npm install`, `npm run build`,
  `npm test`, `npm run lint`, `npm run typecheck` and `npm run docs`.
- The docs show every component in night and paper, and they match the CoLabs app side by side. You
  may run the app with `npm run start:front` in the app folder to compare, but don't change it.
- Another project can install it, through `npm pack` or a `file:` path, and use any of the three
  routes.
- Nothing is committed.
