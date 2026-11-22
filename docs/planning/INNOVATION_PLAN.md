# Utkristi UI: audit and innovation plan

This plan is for the model or team that builds the next stage of Utkristi UI. It starts from what
the repository actually contains (checked on 2026-11-22), names the gaps that hold it back, and sets
out where the kit can lead instead of catching up. It builds on
[competitive-audit.md](../competitive-audit.md) and
[component-design-review.md](../component-design-review.md); read those first.

**Implementation status (2026-11-22).**

| Phase | Implemented | Acceptance work |
| --- | --- | --- |
| 0 | Client boundaries, layered and per-component CSS, Tailwind 4 entry, RTL controls in docs previews | Full RTL visual baselines pending |
| 1 | Theme Studio, shareable settings and sandbox preview, APCA reporting, built-in DTCG, Tokens Studio and Style Dictionary exports | Rebuilding the Night, Paper and Glass palettes from one colour within a documented tolerance |
| 2 | Feature-detected anchored popovers and dialogs, standalone HTML recipes, View Transitions, scroll reveals and reduced-motion fallbacks | Directional hide-on-scroll still uses JavaScript. Native overlay bundle targets need further work |
| 3 | Collaboration primitives, local two-pane demo and separate WebSocket, Yjs and Liveblocks adapters | Live transport integration, browser frame-rate measurement |
| 4 | Keyed table patches, scroll anchoring, signed changes, ticker, sparkline, gauge and a virtual log viewer | Sustained browser update-rate and frame-budget verification |
| 5 | Persistent accessibility preferences and panel, scheduled NVDA suite | A successful nightly run and reviewed speech output |
| 6 | Generated agent references, separate stdio MCP package, ESLint rules and the 20-task evaluation rubric | Paired agent evaluation results |
| 7 | Light-DOM elements, all-block registry, visual comparison runner and documentation status page | Reviewed baseline matrix, framework smoke tests and published CI artifacts |

**Rule for every claim.** Before the docs or README say Utkristi is "ahead" of a competitor, check
that competitor's current docs and link them. Competitor features change monthly. Never advertise
anything that isn't shipped and tested.

## 1. Where the kit stands

**Strong already:**
- Three ways to use it: React, standalone CSS and the Tailwind preset and plugin.
- 12 themes, with contrast tests.
- About 48 component modules: data tables with remote state, selection, editing and
  virtualisation; overlays with focus management; calendars; Workspace layouts; Conversation and
  Questionnaire.
- About 256 icons in 2D, 2.5D and 3D.
- Docs with an editable sandbox, blocks and a registry pilot.
- axe tests, benchmarks, bundle budgets and package smoke tests.

That is broad, so **more components will not make it stand out.** What matters now: foundations
that work everywhere, things nobody else ships, and proof.

### Gaps found in this audit

Each one was checked in the repo.

| # | Gap | Evidence | Why it matters |
| --- | --- | --- | --- |
| G1 | **No `'use client'` directives.** 29 of the 48 React modules use hooks, but none are marked. | `grep -rl "use client" src` finds nothing. | Importing the kit into a Next.js App Router server component fails. Next.js is the most common React setup, so this is a blocker for adoption. |
| G2 | **The prebuilt CSS has no cascade layers.** | `@layer` appears 0 times in `dist/utkristi-ui.css`. | Without Tailwind, app styles have to fight specificity to override the kit. |
| G3 | **One large stylesheet.** | `utkristi-ui.min.css` is 158 KB (25 KB gzipped). There are no per-component files. | Apps that use five components still download all of them. |
| G4 | **No modern platform features.** | 0 uses of the Popover API (`popover=`), anchor positioning, View Transitions, `@property`, scroll-driven animations or `oklch`. | Competitors still mostly position overlays with JS. Using the platform means less JS, so the kit is faster and stands out. |
| G5 | **No machine-readable tokens.** | No DTCG `tokens.json` and no Figma variables export. | Designers can't sync the kit into Figma or Tokens Studio, and other platforms (iOS, Android, email) can't reuse it. |
| G6 | **Nothing for AI agents.** | No `llms.txt` and no MCP server. | Code is increasingly written by agents. A kit those agents can query correctly gets picked over one they guess at. |
| G7 | **Right-to-left support is thin.** | Logical properties show up in only 3 files. | Arabic, Hebrew and Urdu markets can't use it. |
| G8 | **React only.** | Already listed in component-design-review.md. | Vue, Svelte and Angular teams are left out. |
| G9 | **Verification gaps.** | The existing audit lists screen-reader and image-diff gates as open. | Without these, "accessible" and "pixel-matched" can't be proven. |

## 2. Positioning: where Utkristi leads

> **The design system for live, data-dense, collaborative apps: themeable from one colour, native
> to the browser, and readable by AI agents.**

Most kits are general-purpose and static. Utkristi comes from a real-time code collaboration
product (CoLabs) and already has trading, terminal and workspace layouts. It should own that space.
Six pillars:

| Pillar | Idea | Why it is ahead |
| --- | --- | --- |
| **A. Platform-native core** | Overlays use the Popover API and CSS anchor positioning, page changes use View Transitions, and styles use `@layer`, `@scope`, `:has()` and container queries. JS fallbacks load only where the browser lacks support. | Less JS than JS-positioned overlays, no z-index fights, and the CSS-only build gets real behaviour too. |
| **B. Theme Engine** | One brand colour produces a full theme in `oklch`, with every token pair contrast-checked by construction. A live Theme Studio exports CSS, Tailwind v4 `@theme`, DTCG JSON and Figma variables. | Contrast is guaranteed by the generator instead of checked afterwards. Twelve built-in themes show the range. |
| **C. Collaboration kit** | Presence, live cursors, selection highlights, comment threads, follow mode, activity feed, conflict and offline banners. The UI doesn't depend on any transport: adapters cover Yjs, Liveblocks and plain WebSocket. | Mainstream kits don't ship these as themed, accessible components. This is CoLabs' home ground. |
| **D. Live data kit** | Streaming tables (append, update by key, flash on change), ticker, sparkline, gauge, log and terminal viewer, number and relative-time formatting with `Intl`, a market up/down colour pair with a colour-blind swap. | Builds on the Trading theme and the Worklist. Competitors' data grids target static CRUD. |
| **E. Adaptive accessibility** | An `A11yPreferences` provider, persisted like the theme: contrast boost, motion, density, text scale, focus-ring size, dyslexia-friendly font and underlined links. It ships with a ready-made settings panel. | Goes beyond following OS settings and lets each person tune the UI. Few kits offer this as one feature. |
| **F. AI-native docs** | `llms.txt`, a per-component Markdown API, an MCP server, and a lint rule that checks class and markup usage. | Agents produce correct Utkristi code the first time. |

The foundation fixes in Phase 0 come before all of this.

## 3. Roadmap

Every phase lists what to build, where, and what "done" means. Finish the phases in order. Within a
phase, items can run in parallel if they touch different files.

### Phase 0: foundations (blocks adoption, do first)

1. **Server-component safety (G1).**
   - Add `'use client';` as the first line of every `src/react` module that uses hooks, refs,
     effects, context or event handlers. Leave pure markup components (Card, Kbd, Badge) without
     it, so they render on the server.
   - Add `scripts/check-client-directives.mjs`. It fails CI when a hook-using file has no directive,
     or when `dist` loses the directive (check that `tsc` keeps it).
   - Add a smoke test: a tiny Next.js App Router fixture under `test/fixtures/next-app`, which
     imports the kit from a server component and runs `next build`.
   - **Done when** that fixture builds, and `server-only` imports of pure components render without
     JS.
2. **Cascade layers (G2).**
   - Wrap the prebuilt CSS in `@layer utkristi.tokens, utkristi.base, utkristi.components;`. Keep
     the Tailwind plugin path as it is, because Tailwind already layers it.
   - Document the override rule: anything outside a layer wins.
   - **Done when** a test confirms an unlayered `.btn { padding: 0 }` overrides the kit without
     `!important`.
3. **Per-component CSS (G3).**
   - Have `build-css` also emit `dist/css/<component>.css` (tokens and base kept separate) and a
     `dist/css/manifest.json` that lists each component's dependencies.
   - Add exports such as `@utkristi/ui/css/button.css`.
   - Optionally, add a Vite or PostCSS plugin, `@utkristi/ui/purge`, that keeps only the classes
     an app uses.
   - **Done when** the button-only CSS is under 4 KB gzipped, and the full file stays the same.
4. **Tailwind v4 native entry.**
   - Publish `@utkristi/ui/tailwind.css`, written with `@theme`, `@custom-variant` and `@utility`.
     v4 users then need no `@config`.
   - **Done when** a v4 fixture builds and the classes match v3 output in `test/tailwind.test.ts`.
5. **Right-to-left (G7).**
   - Convert physical properties (`left`, `right`, `margin-left` and so on) to logical ones.
     Add a stylelint rule that blocks new physical ones.
   - Mirror directional icons under `:dir(rtl)`.
   - Show an RTL toggle on every docs preview.
   - **Done when** the screenshot sweep passes in `dir="rtl"`.

### Phase 1: Theme Engine (pillar B)

- **Generator.** Add `src/theme-engine/` with `createTheme({ brand, neutral?, scheme, contrast:
  'AA'|'AAA', radius?, density? })`. It returns the full token set.
  - Work in `oklch`. Neutrals take a slight tint of the brand hue.
  - Solve each `ink-*` and `on-*` lightness by binary search until the WCAG 2 ratio meets its
    target. Also report APCA Lc as a second opinion.
  - Never output a pair that fails. Fix the lightness first; change hue or chroma only if needed.
  - Pure TS with no dependencies, usable in Node and the browser.
- **Exporters.** CSS block, Tailwind v4 `@theme`, DTCG `tokens.json` (G5), Figma variables JSON
  (Tokens Studio compatible), Style Dictionary config, and the 8 icon hue sets for the icon palette.
- **CLI.** `npx @utkristi/ui theme --brand "#7C3AED" --name violet --out src/theme.css`.
- **Theme Studio docs page.**
  - Controls: pick a brand colour, scheme, contrast level, radius and density.
  - A live preview of real blocks (Worklist, Workspace, Conversation).
  - A contrast report for every pair, and a "Copy CSS / Download JSON / Open in sandbox" bar.
  - A shareable URL with the settings in the hash, holding no personal data.
- **Tokens from source.** Regenerate the 12 built-in themes' DTCG JSON from `tokens.css` at build
  time. Publish it as `@utkristi/ui/tokens.json`.
- **Done when:**
  - property tests generate 500 random brand colours × 2 schemes, with zero contrast failures;
  - Night, Paper and Glass can be rebuilt from their brand colours within a tolerance documented in
    the tests;
  - the Studio works at 375px.

### Phase 2: platform-native overlays and motion (pillar A, G4)

- **Overlays.** Menu, Popover, Tooltip, Select, Combobox and DatePicker move to `popover="auto"` /
  `popover="manual"`, with `anchor-name` / `position-anchor` and `position-try-fallbacks` for
  flipping.
  - Feature-detect, and keep the existing `computePlacement` JS path as the fallback.
  - Keep top-layer stacking and `overlayStack` Escape ordering working in both paths.
- **Standalone CSS.** Plain-HTML users get working menus and tooltips with **no JS**:
  `<button popovertarget>` plus anchor positioning. Document which browsers need `dom.js`.
- **Dialogs.** Modal uses native `<dialog>` with `showModal()`, which brings a free focus trap and
  inert background in modern browsers. Keep the current trap for older ones.
- **Motion.**
  - View Transitions: tab, segmented and steps changes, theme switch (a circular reveal from the
    toggle) and route changes in the docs.
  - `@property` for animatable token colours.
  - Scroll-driven animations for `data-rise` reveals and the hide-on-scroll header, with JS only as
    a fallback.
  - All of it is off under `prefers-reduced-motion`.
- **Done when:**
  - the tests run every overlay in both paths (native mocked on and off);
  - the docs show a "zero-JS" badge on components that work without the runtime;
  - the measured JS per overlay drops, recorded in `npm run bench`.

### Phase 3: collaboration kit (pillar C)

Add `src/react/collab/`, with matching CSS classes in `components.css`:

| Component | Behaviour |
| --- | --- |
| `PresenceStack` | Overlapping avatars with live status, "+N" overflow, and a hover card with each person's name, role and location in the doc. |
| `LiveCursor`, `CursorLayer` | Named cursors that fade when idle. Labels flip to avoid edges, and colours come from the icon hue palette, so they stay contrast-safe in every theme. |
| `SelectionHighlight` | A tinted range with an owner label, for text and canvas content. |
| `CommentThread`, `CommentPin` | Threads with replies, resolve and reopen, mentions, and keyboard navigation between pins. |
| `FollowBar` | "Following Asha · Stop". It's a live region and Escape stops following. |
| `ActivityFeed` | Grouped events that use relative time from `Intl.RelativeTimeFormat`. |
| `ConflictBanner`, `OfflineBanner`, `SyncStatus` | Saving, saved, offline and conflict states, with actions. |
| `useCollabAdapter` | The interface the components consume (`users$`, `cursors$`, `comments$`, `send`), with adapters in **separate optional entries**: `@utkristi/ui/collab-yjs`, `@utkristi/ui/collab-liveblocks` and `@utkristi/ui/collab-ws`. The core keeps zero runtime dependencies. |

- **Docs.** A two-pane "multiplayer" demo that simulates a second user locally, with no server.
- **Accessibility.**
  - Cursor movement is not announced. Joins and leaves, mentions and conflicts are announced
    politely.
  - Every colour-coded person also has a name and initials.
- **Done when:**
  - the tests cover the adapter contract with a fake transport;
  - the demo runs at 375px;
  - the cursor layer runs at 60 fps with 25 cursors in the benchmark.

### Phase 4: live data kit (pillar D)

- **Streaming data.** Make `DataTable` accept stream updates: `applyPatch({ upsert, remove })`
  keyed by `getRowKey`.
  - Changed cells flash with `.flash-up` and `.flash-down` (off under reduced motion, with an
    arrow and sign always shown).
  - Keep scroll position when rows are added above the viewport.
  - Announce new rows in batches through a polite live region.
- **New components.**
  - `Ticker`, `Sparkline` (SVG, no chart library) and `Gauge`.
  - `NumberFormat` / `useFormat` (currency, compact, percent and units through `Intl`).
  - A virtualised `LogViewer` with filter, follow-tail, ANSI colours and copy.
- **Market colours.** Add `--ut-up` and `--ut-down` tokens in every theme, with the colour-blind
  swap `[data-ut-market="blue-orange"]` described in THEME_INSTRUCTIONS.md.
- **Done when:** a 10,000-row table takes 50 updates per second for 30 seconds in the benchmark
  without dropped frames above a budget recorded in `bench`, and the log viewer scrolls 100,000
  lines.

### Phase 5: adaptive accessibility (pillar E)

- **Provider.** `A11yPreferencesProvider` and `useA11yPreferences()` persist `{ contrast, motion,
  density, textScale, focusRing, readableFont, underlineLinks }`. They set `data-ut-*` attributes
  that `tokens.css` and `components.css` respond to.
  - The defaults follow the OS (`prefers-contrast`, `prefers-reduced-motion`,
    `prefers-reduced-transparency`).
- **Panel.** `A11yPanel` is a ready-made settings panel with a live preview.
- **Text scale.** It must reflow to 200% without horizontal scroll at 375px (WCAG 1.4.10).
- **Screen-reader tests (G9).** Add Guidepup (VoiceOver or NVDA) scripts for Modal, Menu, Tabs,
  DataTable selection and Combobox. Run them in a nightly workflow, and record the spoken output
  as a reviewed snapshot.
- **Done when:** every preference has a test, and the nightly screen-reader run is green.

### Phase 6: AI-native surface (pillar F, G6)

- **`llms.txt`.** At the docs root, plus `llms-full.txt`, both generated at build time from the
  component manifest, API references, examples and tokens.
- **Per-component Markdown.** `docs/dist/components/<name>.md`, with props, examples, accessibility
  notes and common mistakes.
- **MCP server.** `@utkristi/ui-mcp`, a separate package so the UI package stays
  dependency-free, with these tools:

  | Tool | What it does |
  | --- | --- |
  | `search_components` | Finds components by name or task. |
  | `get_component` | Returns a component's props and examples. |
  | `get_example` | Returns a specific example. |
  | `list_tokens` | Lists the design tokens. |
  | `create_theme` | Calls the Theme Engine. |
  | `validate_markup` | Checks class combinations, required ARIA and contrast. |

  It reads the same generated manifest as the docs, so it never drifts.
- **Lint rule.** `eslint-plugin-utkristi` with `ut/valid-class-combo` (for example, `btn-solid`
  without `btn`), `ut/icon-button-label` and `ut/no-physical-props`.
- **Done when:** an evaluation of 20 tasks, each run with and without the MCP server, measures how
  often the generated code is correct, and the result goes in the README.

### Phase 7: reach and proof (G8, G9)

- **Web components.** `@utkristi/ui/elements`: `<ut-menu>`, `<ut-dialog>`, `<ut-tabs>`,
  `<ut-toast>` and `<ut-theme>`. They wrap the existing DOM runtime and render into the light DOM,
  so the global CSS still applies. That one package works in Vue, Svelte, Angular and plain HTML.
  Add framework recipes once each has been tested.
- **Source install.** Promote the registry pilot to a full shadcn-compatible registry for every
  block, with the version-pinned package as a dependency.
- **Visual regression.** Screenshot every docs example in all 12 themes, at 375, 768 and 1440 px,
  in LTR and RTL. Diff against baselines in CI, with a threshold, and approve changes in the PR.
- **Public status page.** A `#/status` page in the docs showing live numbers from CI:
  - tests, axe violations and contrast pairs checked;
  - bundle size per component;
  - benchmark results;
  - screen-reader run date;
  - browser support matrix.

  These numbers are the honest basis for any "ahead of X" statement.

## 4. Metrics that make the claim real

| Metric | Target |
| --- | --- |
| Next.js App Router server import | Works (Phase 0) |
| CSS for one component | ≤ 4 KB gzipped |
| JS for a menu with native support | ≤ 1.5 KB gzipped, measured |
| Generated theme contrast failures | 0 in 1,000 random brands |
| axe violations across all examples × themes | 0 |
| Visual diff coverage | Every example × 12 themes × 3 widths × 2 directions |
| Streaming table | 50 updates/s on 10,000 rows within the recorded frame budget |
| Agent task success with MCP | Measured and published; target +30 points over no-MCP |

## 5. What not to do

- Don't add cosmetic variants or more themes until Phases 0–2 are done. Breadth isn't the gap.
- Don't add runtime dependencies to the core package. Adapters, the MCP server and the lint plugin
  are separate packages.
- Don't claim a competitor lacks a feature without a dated link. Re-check before each release.
- Don't break current class names, token names or React props. Deprecate with a console warning in
  development and a `MIGRATION.md` entry, and remove only in a major version.

## 6. Hand-off checklist for each phase

- [ ] Update `CHANGELOG.md`, the docs page and the status page.
- [ ] Add tests for the behaviour, not just a render.
- [ ] `npm run build`, `npm test`, `npm run lint`, `npm run typecheck`, `npm run check:bundles` and
      `npm run docs:verify` pass.
- [ ] Check every new surface at 375px, in RTL, and under reduced motion, high contrast and forced
      colours.
- [ ] Commit nothing unless the user asks.
