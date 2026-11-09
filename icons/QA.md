# Utkristi Icons: Design & Accessibility QA Report

This document records the design, optical-weight, 3D consistency, and accessibility QA checks defined in Section 11 of `ICON_SYSTEM_INSTRUCTIONS.md`.

The shipped clay images use the repository’s deterministic renderer. A verified Blender scene and the full size and density matrix are still outstanding. The current assets use 96px and 160px PNG masters. The brand hue for each theme also has AVIF and WebP at both sizes. The optical and lighting rows below describe checks of the shipped artwork and its geometry.

The explorer follows the category and search patterns used by Lucide and the compact filtered catalog used by Tabler. The Utkristi grid loads 72 results at a time and keeps copy actions, size, colour, and the three theme previews in a dialog for the selected icon. [Lucide catalog](https://lucide.dev/icons) · [Tabler icon explorer](https://tabler.io/icons)

The catalog now contains 256 glyphs. Settings and API were redrawn, and Branch, Battery, Cloud, Link, Offline, and Rocket were adjusted to fit the canvas. Settings, Cloud, and Rocket also have regenerated 3D assets. The browser suite checks outline and filled SVG bounds for every entry in the sprite.

## 1. Optical Weight & Pixel-Fit Audit (16px, 20px, 24px)

| Check | Target | Night (`#0B0B0A`) | Paper (`#F5F7FB`) | Glass (`#F7F4FB`) | Result |
| --- | --- | --- | --- | --- | --- |
| **Grid & keylines** | 24×24 artwork canvas with room for the default stroke | All sprite paths checked in the browser | Theme uses the same paths | Theme uses the same paths | **Automated** |
| **Optical stroke scaling** | `16px → 1.75`, `20px → 1.875`, `24px+ → 2.0` (`round` caps & joins) | Crisp 1× rendering, even weight | Crisp 1× rendering, even weight | Crisp 1× rendering, charcoal stroke | **Pass** |
| **Typography pairing** | Line icons alongside 14px Archivo & 11px Geist Mono labels | Never fights or outweighs display/mono text | Balanced against `#0E1A33` ink | Balanced against `#202021` ink | **Pass** |
| **Filled knock-outs** | Inner details use `fill-rule="evenodd"` cut-throughs | Clean silhouettes at 16–32px | Clean silhouettes at 16–32px | Clean silhouettes at 16–32px | **Pass** |
| **Duotone back-plate** | 2 layers max: `--ut-icon-tint` plate + `--ut-icon-stroke` line | Soft pastel glow (10–16% alpha) | Printed ink wash (7–10% alpha) | Candy fill (28–35% alpha) + `--ut-ink` outline | **Pass** |

## 2. 3D Soft-Clay & 2.5D Layered SVG Consistency

| Check | Specification | Verification | Result |
| --- | --- | --- | --- |
| **Orthographic camera** | Elevation `22°`, Azimuth `-28°` shared across all 28 3D icons | Precomputed orthographic projection in `scripts/render-clay-3d.mjs` and `scripts/render-3d.py` | **Pass** |
| **Bevel & extrusion** | 25% extrusion depth, 8% 4-segment soft bevel, +4% floating details | Verified across all 28 `has3d` icons (`home`, `upload`, `success`, `lock`, `bell`, `palette`, `settings`, `room`, `project`, `snippet`, `people`, `chat`, `call`, `whiteboard`, `ai-spark`, `analytics`, `terminal`, `folder`, `database`, `package`, `calendar`, `document`, `shield`, `gift`, `rocket`, `trophy`, `cloud`, `globe`) | **Pass** |
| **Theme lighting & rim** | Key top-left 45°, fill 30%, rim back-right (`#9CC3FF` 60% Night, `#FFFFFF` 80% Paper, `#F3EEFF` 70% Glass + 0.5px inner edge) | Verified across 3 themes × 8 hues (`@1x.png` and `@2x.png`) | **Pass** |
| **2.5D live recolour** | 4 stacked SVG layers (shadow, 3-step extrusion + hover step, gradient face, `--ut-icon-on` detail + highlight stroke) | Swaps automatically when `hue="custom"` or `hue="mono"`, with unique `useId()` gradient IDs | **Pass** |

## 3. Contrast, Responsive (375px), and High-Contrast Modes

| Check | Requirement | Measured / Verified | Result |
| --- | --- | --- | --- |
| **Preset `stroke` contrast** | ≥ 3.0:1 against `--ut-bg`, `--ut-bg-2`, `--ut-raise` in Night & Paper; `--ut-ink` in Glass | Minimum Night: `7.62:1` (`coral` on `raise`); Minimum Paper: `4.54:1` (`amber` on `raise`); Glass: `15.4:1` (`--ut-ink`) | **Pass** |
| **Preset `on` contrast** | ≥ 4.5:1 against `base` in all 3 themes | Minimum Night: `7.89:1`; Minimum Paper: `5.00:1`; Minimum Glass: `9.31:1` | **Pass** |
| **Custom colour fallback** | `deriveCustomPalette()` falls back to `var(--ut-ink)` when `base` < 3:1 against `--ut-bg` and picks `#0B0B0A` or `#FFFFFF` for `on` | Verified in `test/icons.test.tsx` and live `IconPalettePicker` status note | **Pass** |
| **Mobile 375px layout** | Zero horizontal page scroll on `#/icons`, `#/tokens`, `#/showcase`, `#/components/icon` | Checked at 375×812 across Night, Paper, and Glass (`scrollWidth <= 375`) | **Pass** |
| **Forced colors & reduced motion** | `@media (forced-colors: active)` uses `CanvasText`, hides duotone plates, and swaps 3D rasters to 2D line fallback; `prefers-reduced-motion` disables hover lift/tilt | Verified in `src/styles/components.css` | **Pass** |
