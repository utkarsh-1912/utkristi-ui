# Utkristi UI: theme brief

These are instructions for the model that builds themes in **utkristi-ui** (this folder). They don't
apply to the CoLabs app. Read [DESIGN_TOKENS.md](../../DESIGN_TOKENS.md) first. Commit nothing unless the
user asks.

## 1. How a theme is wired (every theme follows this)

1. **Tokens.** Add a block `.<id>, [data-theme="<id>"] { … }` in `src/styles/tokens.css`, after the
   glass block. Give **every** colour token a value, plus `color-scheme`, `--ut-shadow`,
   `--ut-backdrop`, `--ut-ring`, the eight `--ut-hue-*` sets and the `--ut-icon-*` defaults. A
   missing token silently falls back to night.
2. **Registry.** Add `{ id, label, scheme }` to `src/react/theme/themes.ts`. `ThemeProvider`,
   `themeScript`, `ThemeSwitch`, `ThemeSelect`, `ThemeToggle` and `dom.ts` all read this list.
3. **Tailwind variant.** Add the id to the variant loop in `src/tailwind/plugin-core.js`. It already
   lists `aurora`, `snow` and `trading`.
4. **Reduced transparency.** If the theme uses blur or translucency, add a
   `@media (prefers-reduced-transparency: reduce)` block with opaque fallbacks, as glass does.
5. **Docs.** `docs/src/main.tsx` hard-codes `themes` and `themeLabels` (lines 81–82); switch them to
   import from the registry. Update the glass-specific lists in `IconsPage`, `TokensPaletteSection`,
   `Playground`, `Marketing` and `component-variants`, and add the theme to the gallery.
6. **Tests.**
   - Extend `test/contrast.test.ts` so every theme passes: text ≥4.5:1 on `bg`, `bg-2` and `raise`
     (blend translucent surfaces over the canvas's **lightest and darkest** stop); `on-*` pairs
     ≥4.5:1; borders and focus ≥3:1.
   - Extend `test/theme.test.tsx` so the theme persists and gets its class.
   - Add the theme to `test/icons.test.tsx`.
7. **Release.** Add a `CHANGELOG.md` entry, and run `npm run build && npm test && npm run lint`.

Shared surface hooks that already exist in `components.css`:

| Token | What it controls |
| --- | --- |
| `--ut-surface-filter` | blur and saturation behind surfaces |
| `--ut-surface-sheen` | gradient laid over a surface |
| `--ut-surface-edge` | inner highlight |
| `--ut-surface-border` | surface border |
| `--ut-surface-shadow` | surface shadow |
| `--ut-canvas`, `--ut-canvas-size`, `--ut-canvas-repeat`, `--ut-canvas-attachment` | page backdrop |
| `--ut-navbar-*` | navbar colours, blur and sheen |
| `--ut-button-radius` | button corners |
| `--ut-numeric` | number style (`tabular-nums`) |
| `--ut-scrim-filter` | blur behind modals |

Use these hooks rather than adding theme selectors inside `components.css`.

## 2. Fix glass so it is truly glassy

Glass today reads as frosted plastic: surfaces are 82–94% opaque, the canvas is pale and low
contrast, so the blur has almost nothing to show. Make the backdrop rich and the surfaces thin:

- **Canvas.** Raise the colour behind the glass. Use 3–4 saturated radial blobs (violet
  `#8E7CF0`, lime `#B8F25A`, sky `#7CC4F5`, pink `#F59BC9`) at 45–60% over `#E9E6F6`. Set
  `--ut-canvas-attachment: fixed`, so surfaces slide over colour as you scroll.
- **Surfaces.**
  - Fills: `--ut-bg-2: rgba(255,255,255,.42)`, `--ut-raise: rgba(255,255,255,.58)` (menus and
    modals), `--ut-bg-3: rgba(255,255,255,.28)`.
  - Blur: `--ut-surface-filter: blur(28px) saturate(180%)`.
- **Edges.** Light catches glass on its edges.
  - Border: `--ut-surface-border: rgba(255,255,255,.65)`.
  - Inner highlight: `--ut-surface-edge: inset 0 1px 0 rgba(255,255,255,.95), inset 0 -1px 0 rgba(255,255,255,.25)`.
  - Sheen: a diagonal `linear-gradient(135deg, rgba(255,255,255,.55), rgba(255,255,255,.08) 45%, rgba(255,255,255,.18))`.
  - Shadow: a soft violet drop, `--ut-surface-shadow: 0 24px 48px -24px rgba(60,40,120,.35)`.
- **Navbar.** Keep it dark smoked glass: `rgba(24,20,34,.55)` with `blur(24px) saturate(170%)`
  and a 1px `rgba(255,255,255,.12)` bottom edge.
- **Inputs.** Use `rgba(255,255,255,.5)` with the same edge highlight. Keep borders at
  `rgba(35,30,43,.28)` or more, so field outlines reach 3:1.
- **Text.** Keep ink `#202021` (`ink-2` / `ink-3` as they are), but re-check contrast against the
  **darkest** canvas blob showing through a 42% surface. If anything fails, raise surface opacity
  locally (`.card` to `.5`) rather than lightening the text.
- **Fallbacks.** With no `backdrop-filter` (`@supports not (backdrop-filter: blur(1px))`) and
  under reduced transparency, switch to opaque values (`#F4F2FB`, `#FFFFFF`) and drop the canvas
  blobs.
- **Performance.** Blur only surfaces, never the page. Skip blur on `.table` rows, list items and
  anything repeated over 20 times.

## 3. New themes to build

Each theme lists its intent, palette, surfaces, type and motion, and special rules. Every value must
still pass the contrast tests; adjust within the same hue if one fails.

### Trading (`trading`, dark)

A dense, calm trading terminal: data first, colour only for meaning.

- **Palette.**

  | Token | Value |
  | --- | --- |
  | bg | `#07090D` |
  | bg-2 | `#0D1117` |
  | bg-3 | `#141A22` |
  | raise | `#111720` |
  | ink | `#E6EDF3` |
  | ink-2 | `#9DA7B3` |
  | ink-3 | `#7D8793` |
  | line | `rgba(230,237,243,.08)` |
  | line-2 | `rgba(230,237,243,.18)` |
  | accent | `#F0B90B` (amber, for focus and links) |
  | solid | `#F0B90B`, with on-solid `#07090D` |

- **States.** Market colours are their own tokens: `--ut-up: #16C784` and `--ut-down: #EA3943`,
  with tints at 14% for row flashes. Keep ok, bad and warn separate from up and down.
- **Surfaces.**
  - Flat. No blur, no sheen, and a tight shadow: `0 8px 24px -12px rgba(0,0,0,.6)`.
  - Radii are smaller: `--ut-r: 8px`, `--ut-r-lg: 12px`, `--ut-r-field: 6px`,
    `--ut-button-radius: 6px`.
  - The canvas is a faint 24px grid: `linear-gradient` lines at `rgba(230,237,243,.025)`.
- **Type and density.**
  - `--ut-numeric: tabular-nums slashed-zero`, with Geist Mono for prices.
  - Default to `data-ut-density="compact"`.
  - Headings use Archivo condensed but smaller; no giant display text.
- **Motion.** A price change flashes the cell background, up or down, for 600ms (`.flash-up` and
  `.flash-down` utilities). Turn it off under reduced motion; arrows ▲▼ carry the meaning.
- **Rules.**
  - Up and down must never be the only signal. Always pair them with a sign and an arrow.
  - Offer a colour-blind swap: `[data-ut-market="blue-orange"]` sets up to `#3B82F6` and down to
    `#F97316`.

### Snow (`snow`, light)

Fresh, airy, winter light: cool whites, ice-blue accent and soft frost.

- **Palette.**

  | Token | Value |
  | --- | --- |
  | bg | `#F7FAFD` |
  | bg-2 | `#FFFFFF` |
  | bg-3 | `#EEF3F9` |
  | raise | `#FFFFFF` |
  | ink | `#0F2236` |
  | ink-2 | `#3E536B` |
  | ink-3 | `#5A6E85` |
  | line | `rgba(15,34,54,.09)` |
  | line-2 | `rgba(15,34,54,.22)` |
  | accent | `#1D6FD6` |
  | mark | `#3B8BEB` |
  | solid | `#0F2236`, with on-solid `#F7FAFD` |
  | ok / bad / warn | `#13804B` / `#C8283B` / `#A65A00` |

- **Surfaces.**
  - Light frost, not full glass: `--ut-surface-filter: blur(12px)`, and a sheen from white to
    `rgba(220,235,250,.4)`.
  - The shadow is cool and wide: `0 24px 60px -30px rgba(29,111,214,.25)`.
  - Radii are a touch rounder: `--ut-r: 18px`, `--ut-r-lg: 26px`.
- **Canvas.** A very soft vertical gradient from `#FFFFFF` to `#EEF4FB`, plus an optional
  `.snowfall` decoration: a fixed, pointer-events-none layer of 40–60 tiny white dots drifting
  slowly with CSS only. It must be opt-in, hidden under reduced motion, and `aria-hidden`.
- **Type.** As in paper, but headings in ink `#0F2236` with `letter-spacing: 0`.
- **Rules.** White on white needs edges: every surface keeps a visible `line` border, because
  shadows alone aren't enough contrast.

### Aurora (`aurora`, dark)

Night with northern lights: deep teal-violet with a glowing accent. Its variant name is already
registered.

- **Palette.**

  | Token | Value |
  | --- | --- |
  | bg | `#070B14` |
  | bg-2 | `rgba(16,22,38,.72)` |
  | raise | `rgba(20,28,48,.82)` |
  | ink | `#E8EEFA` |
  | ink-2 | `#A9B4CC` |
  | ink-3 | `#8792AB` |
  | accent | `#5EF2C2` (mint) |
  | mark | `#8B7CFF` |
  | solid | `#5EF2C2`, with on-solid `#04110C` |

- **Canvas.** Two slow radial blobs, green `#1FBF8F` and violet `#6B4CFF` at 25–30%, drifting
  over 40s (`@keyframes ut-aurora`). They are static under reduced motion.
- **Surfaces.** Dark glass: `blur(20px) saturate(140%)`, a 1px `rgba(255,255,255,.08)` border and
  a top inner highlight `rgba(255,255,255,.06)`.

### More themes (build only after the four above are done)

| Id | Scheme | Idea | Key values |
| --- | --- | --- | --- |
| `sepia` | light | Reading and docs: warm paper, brown ink | bg `#F5EFE3`, ink `#2B2116`, accent `#8A4B14`, low-saturation states |
| `midnight` | dark | OLED true black for battery | bg `#000000`, bg-2 `#0A0A0A`, ink `#EDEDED`, accent `#9CC3FF`, no shadows (borders only) |
| `forest` | dark | Calm green workspace | bg `#0C1410`, ink `#E3EDE6`, accent `#7DDBA3`, solid `#7DDBA3` |
| `sunset` | light | Marketing and warm | bg `#FFF6F0`, ink `#2A1410`, accent `#C2410C`, canvas peach-to-rose gradient |
| `high-contrast` | dark | Accessibility | bg `#000`, ink `#FFF`, line-2 `#FFF`, accent `#FFD400`, all borders 2px, no translucency or blur; must reach 7:1 |
| `terminal` | dark | Retro CRT | bg `#050A05`, ink `#B6F5B0`, accent `#3DFF6E`, everything in Geist Mono, optional scanline canvas, off under reduced motion |

## 4. Per-theme checklist

For every theme, confirm each of these:

- [ ] All tokens are defined. Compare against the night block key by key with a script, not by eye.
- [ ] The contrast tests pass, including translucent surfaces over the canvas extremes.
- [ ] Focus rings are visible on every surface, including the navbar and panes.
- [ ] `prefers-reduced-motion` and `prefers-reduced-transparency` fallbacks work.
- [ ] Forced colours (Windows High Contrast) are still usable.
- [ ] The theme looks right at 375px. Blur stays light enough on phones that scrolling stays smooth.
- [ ] Icons: the eight hue sets and the 3D render theme mapping are defined in `icons.tsx`
      (`iconPaletteTable`, the background map and `themeKey`).
- [ ] The docs gallery and showcase screenshot exist for the theme.
