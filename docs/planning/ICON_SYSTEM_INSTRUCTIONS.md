# Utkristi Icons: design and build brief

This is a design brief for a custom 2D and 3D icon family with a colour palette people can choose
from in every theme. It is **instructions only**: the model or designer who picks it up makes the
artwork and the code. Read it together with [DESIGN_TOKENS.md](DESIGN_TOKENS.md), which defines the
night, paper and glass themes, and [BUILD_INSTRUCTIONS.md](BUILD_INSTRUCTIONS.md).

## 0. Ground rules

- **Where to work.** Work only in `C:\Users\utkar\Downloads\utkristi-ui`. The CoLabs app at
  `C:\Users\utkar\Downloads\rtm-code-editor` is read-only reference. Its icon rules
  (`src/components/icons/README.md`) are worth reading: outline by default, filled for "on", and one
  glyph per action.
- **No commits or pushes** unless the user asks.
- **Keep current names working.** `src/react/icons.tsx` already has `close`, `chevronDown`, `menu`,
  `sun`, `moon`, `check`, `plus`, `search`, the arrows and `layers`. Keep these names and the
  `<Icon name size>` signature working, so nothing that already uses them breaks.
- **Don't copy other icon sets.** Draw every glyph from scratch. Lucide and Fluent are references
  for weight and size only; don't trace their glyphs.

## 1. Design direction

**The idea: a quiet tool that comes alive when it matters.** The kit's look is near-black film or
paper, hairlines, condensed uppercase type and one cool accent. The icons have to fit that, so:

| Use | Style | Feel |
| --- | --- | --- |
| Interface (buttons, menus, tabs, inputs) | **2D line** | Calm, thin, ink-coloured. It never fights the type. |
| Selected or "on" states, active nav items | **2D filled** | The same silhouette, solid. |
| Cards, empty states, feature lists, settings tiles | **2D duotone** | Line plus a soft tinted back-plate in the chosen hue. |
| Hero spots, onboarding, empty states, marketing | **3D soft-clay** | Rounded, matte, slightly toy-like, with one hue and a rim light that matches the theme. |
| Any 3D spot that must recolour live | **2.5D layered SVG** | A flat "extruded" version of the 3D look, made with CSS variables. Use this when people pick custom colours. |

The four 2D and 2.5D styles share **one master silhouette** per icon. 3D is a sculpted version of
the same silhouette, so a person sees the same object in every style.

## 2. 2D construction

| Rule | Value |
| --- | --- |
| Grid | 24×24, with a 2px safe margin, so the live area is 20×20 |
| Keyline shapes | Circle Ø20, square 18×18, portrait 16×20, landscape 20×16. Every glyph fits one of them, which keeps the optical weight even. |
| Stroke | 2px at 24 (the kit's current weight). Optical sizes: **16px → 1.75**, **20px → 1.875**, **24px+ → 2**. The component picks the stroke from `size`, and `strokeWidth` overrides it. |
| Caps and joins | Round, as in the CoLabs icons. |
| Corners | Outer corners 2px radius at 24 (about 9% of the box), echoing the kit's 16/22px soft radii. Inner corners 1px. |
| Angles | 0°, 45° and 90° where possible. Diagonals use a 1:1 or 1:2 slope only. |
| Gaps | At least 2px between strokes, so shapes stay readable at 16px. |
| Pixel fit | Put strokes on half-pixels so they render crisp on 1× screens. Test every icon at 16, 20 and 24. |
| Filled twin | The same outline, filled. Inner details become **knock-outs** (cut-throughs), not strokes drawn on top. |
| Duotone | Line layer in `--ut-icon-stroke` **plus** one back-plate shape (the main area of the glyph, inset 1px) filled with `--ut-icon-tint`. Never use more than two layers. |
| Colour | Line and filled icons always use `currentColor`. Only duotone and 2.5D read the `--ut-icon-*` palette variables. |
| Export | Optimised SVG (SVGO with `removeViewBox: false` and `convertShapeToPath`). No `fill` or `stroke` hex values: use `currentColor` or `var(--ut-icon-*)` only. No `<style>`, ids or masks, except for the knock-outs in filled icons. |

## 3. 3D soft-clay construction

| Rule | Value |
| --- | --- |
| Tool | Blender 4.x, with one shared scene file (`icons/3d/scene.blend`) holding the camera, lights and materials. Every icon is its own collection in that scene. |
| Camera | **Orthographic**, elevation 22° and azimuth −28° (a friendly front three-quarter view). Every icon uses the same camera; never re-aim it per icon. |
| Form | Extrude the 2D master silhouette to **25% of its width**. Bevel **8% of the size** with 4 segments, so edges are soft but not blobby. Small details float 4% forward instead of being carved in. |
| Material | Matte clay: roughness .55, specular .3, subsurface .05 tinted in the hue. Use **one hue per icon** (base, plus shade and highlight from the lighting) and at most one secondary neutral part in `graphite`. |
| Lighting | Key light from the top left (softbox, 45°). Fill at 30%. A **rim light from the back right in the theme's rim colour** (section 5). The contact shadow under the object is 18% opacity in night and 10% in paper and glass. |
| Background | Transparent. Pad 12% around the object so shadows don't clip. |
| Sizes | 48, 64, 96, 128 and 256px, each at 1× and 2× (and 3× for 64 and 96, for phones). |
| Formats | **AVIF** first, with a **WebP** fallback and **PNG** for email and README use. Each icon is under 18KB at 128@2× (AVIF). |
| Variants | One render per **theme** (night, paper, glass, because rim light and shadow change) × per **preset hue** (section 4). That gives 3 themes × 8 hues. Make only the hues people actually use, and note which ones in `icons/manifest.json`. |
| Live recolour | Raster 3D can't follow a custom colour. When someone picks a custom hue, the component swaps to the **2.5D SVG** (section 6). |

## 4. Colour palette people can choose from

There are eight preset hues, which people can pick for the whole icon set or for each icon. Each
hue has five roles in each theme:

- **base**: the main fill and the 3D body.
- **shade**: the side faces and the darker plate.
- **hi**: highlights and bevel catch-light.
- **tint**: the duotone back-plate.
- **stroke**: line colour when the icon is "in colour" (otherwise `currentColor`).

### Contrast rules

Check these with the contrast test before shipping.

- In night and paper, **stroke** needs ≥3:1 against `--ut-bg`, `--ut-bg-2` and `--ut-raise`
  (WCAG 1.4.11, graphics).
- In glass, the bright hues can't reach 3:1 on its pale background, so **stroke always uses
  `--ut-ink`** and the hue is used **only as a fill**.
- When the icon carries meaning that text doesn't repeat, the same 3:1 rule applies to its filled
  shape.
- A glyph drawn on a `base` fill (a filled icon inside a coloured tile) uses `--ut-icon-on`, which
  must reach ≥4.5:1 against `base`.

### Night (background `#0B0B0A`): light pastels that glow on black

| Hue | base | shade | hi | tint | stroke | on |
| --- | --- | --- | --- | --- | --- | --- |
| blue (brand) | `#9CC3FF` | `#5B8DEF` | `#D6E6FF` | `rgba(156,195,255,.16)` | `#9CC3FF` | `#0B0B0A` |
| lime | `#C6F36B` | `#8DBA2E` | `#E9FFC2` | `rgba(198,243,107,.14)` | `#C6F36B` | `#0B0B0A` |
| violet | `#C4B1FF` | `#8B6FE8` | `#E7DEFF` | `rgba(196,177,255,.16)` | `#C4B1FF` | `#0B0B0A` |
| teal | `#7FE0D0` | `#2FA394` | `#C9F5EE` | `rgba(127,224,208,.14)` | `#7FE0D0` | `#0B0B0A` |
| amber | `#FBCB6A` | `#D9952B` | `#FFE9B8` | `rgba(251,203,106,.14)` | `#FBCB6A` | `#0B0B0A` |
| coral | `#FF9F87` | `#E0664B` | `#FFD6CB` | `rgba(255,159,135,.14)` | `#FF9F87` | `#0B0B0A` |
| rose | `#F7A8C8` | `#D6608F` | `#FDDDEA` | `rgba(247,168,200,.14)` | `#F7A8C8` | `#0B0B0A` |
| graphite | `#CFCCC3` | `#8E8B83` | `#F2F0EA` | `rgba(232,230,223,.10)` | `#CFCCC3` | `#0B0B0A` |

Night rim light is `#9CC3FF` at 60%, a cool edge like the brand accent.

### Paper (background `#F5F7FB`): deep inks, like printed colour on paper

| Hue | base | shade | hi | tint | stroke | on |
| --- | --- | --- | --- | --- | --- | --- |
| blue (brand) | `#2F62C9` | `#1F4699` | `#8FB2F2` | `rgba(47,98,201,.10)` | `#2F62C9` | `#FFFFFF` |
| lime | `#4D7A00` | `#365700` | `#B5E35A` | `rgba(77,122,0,.10)` | `#4D7A00` | `#FFFFFF` |
| violet | `#6A4BD1` | `#4B30A3` | `#B9A6F5` | `rgba(106,75,209,.10)` | `#6A4BD1` | `#FFFFFF` |
| teal | `#0F7C6E` | `#0A5A50` | `#7FD3C6` | `rgba(15,124,110,.10)` | `#0F7C6E` | `#FFFFFF` |
| amber | `#A85C00` | `#7A4300` | `#F5C065` | `rgba(168,92,0,.10)` | `#A85C00` | `#FFFFFF` |
| coral | `#C2410C` | `#922F07` | `#F7A487` | `rgba(194,65,12,.10)` | `#C2410C` | `#FFFFFF` |
| rose | `#B3306A` | `#86204E` | `#F0A0C2` | `rgba(179,48,106,.10)` | `#B3306A` | `#FFFFFF` |
| graphite | `#0E1A33` | `#050C1C` | `#8C97AD` | `rgba(14,26,51,.07)` | `#0E1A33` | `#F5F7FB` |

Paper rim light is white at 80%, with a navy contact shadow `rgba(14,26,51,.10)`.

### Glass (background `#F7F4FB`): bright candy fills, charcoal outlines

| Hue | base | shade | hi | tint | stroke | on |
| --- | --- | --- | --- | --- | --- | --- |
| lime (brand) | `#A3FF00` | `#6FB300` | `#DBFF99` | `rgba(163,255,0,.28)` | `var(--ut-ink)` | `#202021` |
| blue | `#A8C7FF` | `#5E8BE0` | `#DCE8FF` | `rgba(168,199,255,.35)` | `var(--ut-ink)` | `#202021` |
| violet | `#CDB8FF` | `#8F6FE6` | `#EDE4FF` | `rgba(205,184,255,.35)` | `var(--ut-ink)` | `#202021` |
| teal | `#8FE3D3` | `#3AA897` | `#D4F7F0` | `rgba(143,227,211,.35)` | `var(--ut-ink)` | `#202021` |
| amber | `#FFD27A` | `#D99A2B` | `#FFEDC2` | `rgba(255,210,122,.35)` | `var(--ut-ink)` | `#202021` |
| coral | `#FFB09C` | `#E26F55` | `#FFDCD3` | `rgba(255,176,156,.35)` | `var(--ut-ink)` | `#202021` |
| rose | `#FFB8D4` | `#DB6A97` | `#FFE2EE` | `rgba(255,184,212,.35)` | `var(--ut-ink)` | `#202021` |
| graphite | `#D9D6E0` | `#8C8899` | `#F3F1F7` | `rgba(35,30,43,.08)` | `var(--ut-ink)` | `#202021` |

Glass rim light is lilac-white `#F3EEFF` at 70%. 3D glass renders also get a **0.5px white inner
edge**, a 2D overlay that echoes the frosted cards.

### Other modes

- **Custom hue.** When someone picks any colour, derive the five roles in CSS, never in JS per
  render:
  - `base` is the picked colour.
  - `shade` is `color-mix(in oklab, base 70%, black)`.
  - `hi` is `color-mix(in oklab, base 45%, white)`.
  - `tint` is `color-mix(in srgb, base 14%, transparent)` (35% in glass).
  - `stroke` is `base` in night and paper. If `base` is under 3:1 against `--ut-bg`, `stroke` falls
    back to `--ut-ink`, and `on` is whichever of `#0B0B0A` and `#FFFFFF` has more contrast against
    `base`. Make both of these decisions in a small JS helper at pick time and store the result.
- **Monochrome.** People can choose "no colour" (the default for interface icons). Every role then
  maps to `currentColor` and `--ut-tint`.
- **High contrast and forced colours.** Under `@media (forced-colors: active)`, every icon uses
  `CanvasText` strokes and duotone back-plates are hidden. 3D rasters are swapped for the 2D line
  icon, because a raster can't follow system colours. Under `prefers-contrast: more`, tint opacity
  doubles and the line stroke goes up 0.25px.
- **Reduced motion.** The 3D hover tilt and the duotone plate "pop" (section 6) switch off.

## 5. Tokens and CSS

Add these to `src/styles/tokens.css` (per theme block) and `src/styles/components.css`:

```css
/* per theme: the eight hues x five roles, e.g. */
--ut-hue-blue-base: …; --ut-hue-blue-shade: …; --ut-hue-blue-hi: …; --ut-hue-blue-tint: …; --ut-hue-blue-stroke: …; --ut-hue-blue-on: …;
/* the active icon palette, which defaults to the brand hue */
--ut-icon-base: var(--ut-hue-blue-base);  /* glass default: lime */
--ut-icon-shade / -hi / -tint / -stroke / -on
```

- **Hue classes.** `.icon-hue-{blue|lime|violet|teal|amber|coral|rose|graphite}` reassign the six
  `--ut-icon-*` variables. Put a class on an icon or on any parent, such as a card or the whole app.
  Use `[data-icon-hue="…"]` for the same thing as an attribute.
- **Custom hue.** `.icon-hue-custom` reads `--ut-icon-custom` and derives the other roles with the
  `color-mix` rules in section 4.
- **Icon classes.**
  - `.icon` is the base class: `display: inline-block; flex: none; vertical-align: -0.125em`.
  - `.icon-duotone .icon-plate { fill: var(--ut-icon-tint) }`.
  - `.icon-tile` is a 36/44/56px rounded square (radius 12/14/16) with a `--ut-icon-tint`
    background, for settings and feature lists, as with `.u-tile-ico` in the app.
  - `.icon-3d` is an `<img>`/`<picture>` wrapper with `aspect-ratio: 1`.
- **Tailwind.** Add `icon-hue-*` to the plugin's components and `text-hue-*` / `bg-hue-*-tint`
  colours to the preset, all driven by the same variables.

## 6. 2.5D layered SVG, the recolourable "3D"

Generate this from each 2D master during the build, not by hand. It has four stacked layers, all
using `--ut-icon-*` variables:

1. **Shadow.** The silhouette offset 0/+2px, blurred 2px, in `rgba(0,0,0,.35)` for night and the
   paper navy at 10% for paper and glass.
2. **Extrusion.** The silhouette repeated 3 times, offset diagonally by 0.75px steps down and to the
   right, filled with `--ut-icon-shade`.
3. **Face.** The silhouette filled with a `linearGradient` running top-left to bottom-right, from
   `--ut-icon-hi` (0%) through `--ut-icon-base` (55%) to `--ut-icon-shade` (100%).
4. **Detail and edge.** The inner details in `--ut-icon-on`, plus a 1px top-left highlight stroke in
   `--ut-icon-hi` at 70%.

Give gradient ids unique, per-instance values via React `useId`, so several icons on one page don't
clash. On hover, lift `translateY(-2px)` and add one extra extrusion step, `.3s var(--ut-ease)`;
skip this under reduced motion. Sizes are 32–128px; below 32px, use duotone instead.

## 7. Icon list

Every icon ships as **line, filled and duotone**. Rows marked **3D** also get the 2.5D SVG and the
Blender renders. The names are kebab-case and are the registry keys; keep the existing camelCase
keys as aliases.

| Group | Icons |
| --- | --- |
| Navigation | `arrow-left`, `arrow-right`, `arrow-up`, `arrow-down`, `arrow-up-right`, `chevron-down`, `chevron-up`, `chevron-left`, `chevron-right`, `menu`, `close`, `more-horizontal`, `more-vertical`, `home` **3D**, `external` |
| Actions | `plus`, `minus`, `check`, `search`, `filter`, `sort`, `edit`, `copy`, `paste`, `trash`, `undo`, `redo`, `refresh`, `download`, `upload` **3D**, `share`, `link`, `pin`, `star`, `heart`, `bookmark` |
| Status | `info`, `warning`, `error`, `success` **3D**, `help`, `lock` **3D**, `unlock`, `eye`, `eye-off`, `bell` **3D**, `bell-off`, `clock`, `spinner-ring`, `offline` |
| Theme and settings | `sun`, `moon`, `system`, `palette` **3D**, `settings` **3D**, `sliders`, `brush`, `glass-sparkle` |
| Collaboration (CoLabs) | `room` **3D**, `project` **3D**, `snippet` **3D**, `invite`, `people` **3D**, `presence-cursor`, `chat` **3D**, `call` **3D**, `call-leave`, `mic`, `mic-off`, `camera`, `camera-off`, `screen-share`, `whiteboard` **3D**, `ai-spark` **3D**, `analytics` **3D**, `history`, `focus`, `command`, `layers` |
| Code | `code`, `terminal` **3D**, `run`, `stop`, `bug`, `branch`, `commit`, `merge`, `pull-request`, `github`, `file`, `file-code`, `folder` **3D**, `folder-open`, `add-file`, `add-folder`, `save`, `database` **3D**, `api`, `package` **3D** |
| Content | `calendar` **3D**, `image`, `video`, `music`, `document` **3D**, `table`, `chart-bar`, `chart-line`, `kanban`, `list`, `grid`, `quote` |
| Commerce and account | `user`, `user-plus`, `logout`, `login`, `key`, `shield` **3D**, `credit-card`, `gift` **3D**, `rocket` **3D**, `trophy` **3D** |
| Device and system | `desktop`, `laptop`, `phone`, `tablet`, `cloud` **3D**, `wifi`, `battery`, `power`, `globe` **3D** |
| Brand and social | `utkristi-mark` (uses the Logo SVG geometry), `x-social`, `linkedin`, `discord`, `youtube`. Social icons are line only, in neutral ink, with no brand colours. |

Glyph meaning follows the CoLabs icon table, for example `call` is a handset, `whiteboard` is a
board with a pen, and `ai-spark` is a chat bubble with a spark. Each icon also gets a one-line
description and `keywords` in `icons/manifest.json` for search in the docs.

## 8. Files and pipeline

```
icons/
  manifest.json                  name, group, keywords, description, styles[], has3d, hues3d[]
  source/<name>.svg              2D master: one layer per style (line, filled, plate)
  3d/scene.blend                 shared camera, lights and materials
  3d/render/<theme>/<hue>/<name>@<scale>x.{avif,webp,png}   generated, git-ignored except the PNG previews
scripts/build-icons.mjs
  1. read source SVGs, optimise them with SVGO, and check the rules (viewBox 0 0 24 24, no hex
     colours, every stroke uses currentColor)
  2. emit src/react/icons/generated/<Name>.tsx, one file per icon for tree-shaking, with line,
     filled and duotone in one component
  3. emit the 2.5D variant for icons where has3d is true
  4. emit dist/icons/sprite.svg (<symbol> per icon and style) and dist/icons/svg/<style>/<name>.svg
     for people who don't use React
  5. emit a 3D <picture> map from the renders that exist
scripts/render-3d.py             Blender CLI: renders every has3d icon x theme x hue x size
```

`npm run icons` runs the build script. `npm run icons:3d` runs Blender and is optional, because
Blender might not be installed. Make it fail with a clear message if Blender is missing.

## 9. React API

```tsx
<Icon name="call" />                                   // line, currentColor, 16px, aria-hidden
<Icon name="call" variant="filled" size={20} />
<Icon name="folder" variant="duotone" hue="amber" />
<Icon name="rocket" variant="3d" size={96} />           // raster for the current theme and hue
<Icon name="rocket" variant="3d" hue="custom" />        // switches to the 2.5D SVG automatically
<Icon name="bell" label="Notifications" />              // role="img" + aria-label
<IconTile name="settings" hue="violet" size="lg" />     // the tinted square behind an icon
<IconPaletteProvider defaultHue="blue" storageKey="utkristi-icon-hue">…</IconPaletteProvider>
const { hue, setHue, custom, setCustom } = useIconPalette();
<IconPalettePicker />                                    // role="radiogroup" of 8 swatches + "None" + custom colour
```

- **Themes.** `variant="3d"` reads the theme from `useTheme()` and picks
  `<picture><source type="image/avif">…<img alt="" or label></picture>`, lazy-loaded with
  `decoding="async"` and fixed width and height so the layout doesn't jump.
- **Persistence.** The palette provider stores `{ hue, custom }` in localStorage (wrapped in
  try/catch, safe for SSR) and sets `data-icon-hue` on `<html>`. It works with the same
  `themeScript` pattern, so the page doesn't flash on load.
- **`IconPalettePicker`.**
  - Swatches are 28px circles with a 2px `--ut-bg` ring, and the selected one gets an accent ring
    (as with `.u-av--me`).
  - Arrow keys move and select (the `Segmented` pattern), and each swatch has an `aria-label` such
    as "Teal".
  - "Custom" opens a native `<input type="color">` plus a hex field. If the colour fails 3:1 it shows
    a live contrast note ("Too light for paper, the outline will use ink").
  - It shows a preview row of 6 icons in line, duotone and 2.5D.
- **Accessibility.** Decorative icons are `aria-hidden`. A meaningful icon needs `label`. An
  `IconButton` keeps its own `label` and its icon stays hidden.

## 10. Docs

- Add an **Icons** page with:
  - search by name and keyword;
  - group filters;
  - a style switch (line, filled, duotone, 3D);
  - a size slider (16–128);
  - the `IconPalettePicker`;
  - each icon shown in night, paper and glass side by side, as with the other component pages.
- Clicking an icon opens a panel with copy snippets for React, the SVG sprite `<use>`, raw SVG and
  the Tailwind classes, plus download links for each 3D render.
- Add a **Palette** section to the Tokens page: the 8 hues × 3 themes × 6 roles, with the measured
  contrast against each background, and failures shown in `--ut-bad-ink`.
- Add the icon picker and some 3D spots to the Showcase page, so the README screenshots show them.

## 11. Tests and QA

**Automated** (`test/icons.test.ts[x]`):

- Every source SVG has a 24×24 viewBox, no raw hex colour and no `<style>`.
- Every manifest entry has its line, filled and duotone files, and its 2.5D file when
  `has3d` is true.
- Every palette `stroke` reaches ≥3:1 and every `on` reaches ≥4.5:1 against its pair, in every theme.
  Glass strokes must be ink.
- `<Icon label>` renders `role="img"`, and without `label` the icon is `aria-hidden`.
- The picker supports arrow keys and persists across a remount. A custom hue derives `stroke` and
  `on` correctly for one light and one dark custom colour.
- Two 2.5D icons on one page never share a gradient id.

**Manual design QA** (record results in a `icons/QA.md` table):

- View all icons together at 16, 20 and 24px in every theme, and check that the weight looks even
  and nothing is blurry on a 1× screen.
- Put the line icons next to the kit's text (14px Archivo, 11px Geist Mono labels) and check the
  icons don't look heavier than the type.
- Compare the 3D renders together on one sheet per theme: same camera, same light direction, same
  bevel.
- Check icons at 375px wide in the docs, and in Windows High Contrast (forced colours).

## 12. Done means

- `npm run icons`, `npm run build`, `npm test` and `npm run docs` all pass.
- The Icons page shows the whole list in line, filled and duotone; at least the **3D** rows in
  2.5D; and 3D renders for the brand hue of each theme.
- Choosing a hue or a custom colour recolours duotone and 2.5D icons live, and the choice persists.
- Existing `Icon` names keep working.
- `CHANGELOG.md` has an entry.
- Nothing is committed.
