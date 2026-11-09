# Design tokens and class map

Utkristi UI is shared across the Utkristi ecosystem. The original Night and Paper reference is
`rtm-code-editor/src/styles/app.css`: the tokens under `.ux, .ws` and `.light-theme .ux`, and the
`.u-*` component classes. This file shows how each one is named in the kit.

- **Tokens.** App tokens are prefixed `--u-`. Kit tokens are prefixed `--ut-`, so the kit can run next to
  the app without clashes.
- **Classes.** App classes use `.u-name` and `.u-name--modifier`. Kit classes use Bootstrap-style
  `.name` and `.name-modifier`.
- **States.** The app uses a `.on` class. The kit accepts the matching ARIA attribute
  (`aria-pressed`, `aria-selected`, `aria-checked`, `aria-current`) or the class `.is-active`.

## Theme selectors

| App | Kit |
| --- | --- |
| `.ux, .ws` (night) | `:root`, `.dark`, `[data-theme="dark"]` (night is the default) |
| `.light-theme .ux` (paper) | `.light`, `.light-theme`, `[data-theme="light"]` |
| `utils/theme.js` "system" | `[data-theme="system"]` plus `@media (prefers-color-scheme: light)` |

## Colour tokens

Every value below was checked against `app.css` lines 9–99.

| App token | Kit token | Tailwind colour | Night | Paper |
| --- | --- | --- | --- | --- |
| `--u-bg` | `--ut-bg` | `bg` | `#0B0B0A` | `#F5F7FB` |
| `--u-bg-2` | `--ut-bg-2` | `bg-2` | `#131311` | `#FCFDFF` |
| `--u-bg-3` | `--ut-bg-3` | `bg-3` | `#1C1C19` | `#ECF0F7` |
| `--u-raise` | `--ut-raise` | `raise` | `#181816` | `#FFFFFF` |
| `--u-ink` | `--ut-ink` | `ink` | `#E8E6DF` | `#0E1A33` |
| `--u-ink-2` | `--ut-ink-2` | `ink-2` | `#A3A098` | `rgba(14,26,51,.64)` |
| `--u-ink-3` | `--ut-ink-3` | `ink-3` | `#8E8B83` | `#5B6880` |
| `--u-line` | `--ut-line` | `line` | `rgba(232,230,223,.10)` | `rgba(14,26,51,.11)` |
| `--u-line-2` | `--ut-line-2` | `line-2` | `rgba(232,230,223,.22)` | `rgba(14,26,51,.26)` |
| `--u-tint` | `--ut-tint` | `tint` | `rgba(232,230,223,.05)` | `rgba(14,26,51,.045)` |
| `--u-accent` | `--ut-accent` | `accent` | `#9CC3FF` | `#2F62C9` |
| `--u-mark` | `--ut-mark` | `mark` | `#5B8DEF` | `#2F62C9` |
| `--u-solid` | `--ut-solid` | `solid` | `#E8E6DF` | `#0E1A33` |
| `--u-on-solid` | `--ut-on-solid` | `on-solid` | `#0B0B0A` | `#F5F7FB` |
| `--u-ok` | `--ut-ok` | `ok` | `#4ADE80` | `#16A34A` |
| `--u-bad` | `--ut-bad` | `bad` | `#F87171` | `#DC2626` |
| `--u-warn` | `--ut-warn` | `warn` | `#FBBF24` | `#D97706` |
| `--u-pane` | `--ut-pane` | `pane` | `#F4F3EE` | `#0A1326` |
| `--u-pane-2` | `--ut-pane-2` | `pane-2` | `#E8E6DF` | `#111E3A` |
| `--u-pane-ink` | `--ut-pane-ink` | `pane-ink` | `#1B1A17` | `#E6ECF7` |
| `--u-pane-ink-2` | `--ut-pane-ink-2` | `pane-ink-2` | `#605E58` | `rgba(230,236,247,.64)` |
| `--u-pane-line` | `--ut-pane-line` | `pane-line` | `rgba(27,26,23,.12)` | `rgba(245,247,251,.14)` |
| `--u-grain` | `--ut-grain` | — | `.07` | `.035` |
| `--u-shadow` | `--ut-shadow` | `shadow-ut` | `0 30px 80px -30px rgba(0,0,0,.7)` | `0 30px 70px -30px rgba(14,26,51,.28)` |

### Tokens added by the kit

These tokens are new. The app hard-codes these values or sets them per selector.

| Kit token | Night | Paper | Why |
| --- | --- | --- | --- |
| `--ut-on-accent` | `#0B0B0A` | `#FFFFFF` | Text on an accent fill. The app hard-codes this on `.u-btn--solid:hover`. |
| `--ut-on-mark` | `#FFFFFF` | `#FFFFFF` | The tick and knob on `mark` fills (`.d-check`, `.u-switch`). |
| `--ut-on-bad` | `#0B0B0A` | `#FFFFFF` | **Deviation, for contrast.** The app puts `#fff` on `#F87171`, which is only 2.8:1. Dark ink on it is 7.6:1. |
| `--ut-ok-ink`, `--ut-bad-ink`, `--ut-warn-ink` | same as the state colour | `#15803D`, `#B91C1C`, `#B45309` | State colours used as **text**. On paper, `#16A34A` and `#D97706` don't reach 4.5:1. |
| `--ut-backdrop` | `rgba(5,5,4,.62)` | `rgba(14,26,51,.32)` | The `.u-modal-back` fills. |
| `--ut-ring` | accent at 18% | accent at 18% | The 4px focus halo on inputs (`.u-input:focus`). |

### Glass

Use `.glass` or `[data-theme="glass"]` for the third palette in `src/styles/tokens.css`. The Tailwind variant is `glass:`. Glass uses a pale lilac canvas, a charcoal navbar, and translucent cards, menus, and toasts with backdrop blur. `--ut-solid` provides the lime action fill. `--ut-accent` provides the darker link and focus colour on light surfaces.

## Type, shape and motion

| App | Kit token | Tailwind |
| --- | --- | --- |
| `--u-display` `'Archivo', 'Helvetica Neue', Arial, sans-serif` | `--ut-font-display` | `font-display` |
| `--u-text` `'Archivo', 'Inter', …` | `--ut-font-text` | `font-sans` (also `font-text`) |
| `--u-mono` `'Geist Mono', 'JetBrains Mono', …` | `--ut-font-mono` | `font-mono` |
| `font-stretch: 62%` | — | `font-condensed`, `stretch-condensed` (and `stretch-[75%]`) |
| `--u-r` 16px | `--ut-r` | `rounded-ut` |
| `--u-r-lg` 22px | `--ut-r-lg` | `rounded-ut-lg` |
| inputs, 12px | `--ut-r-field` | `rounded-field` |
| `999px` | — | `rounded-pill` |
| `--u-ease` `cubic-bezier(.22,1,.36,1)` | `--ut-ease` | `ease-ut` |
| `--u-curve` `cubic-bezier(.2,.8,.2,1)` | `--ut-curve` | `ease-curve` |
| `--u-inout` `cubic-bezier(.65,0,.35,1)` | `--ut-inout` | `ease-inout-ut` |
| `--u-max` `clamp(1320px, 90vw, 1720px)` | `--ut-max` | `max-w-page` |
| `--u-side` `clamp(16px, 4vw, 48px)` | `--ut-side` | `px-side` |

## Component classes

| App class | Kit class | React |
| --- | --- | --- |
| `.u-display`, `.u-giant`, `.u-xl`, `.u-lg` | `.display`, `.display-giant`, `.display-xl`, `.display-lg` | — |
| `.u-label`, `.u-lede`, `.u-muted`, `.u-faint`, `.u-mono` | `.label`, `.lede`, `.muted`, `.faint`, `.mono` | — |
| `.u-ul` (underline sweep) | `.link` | — |
| `.u-btn` + `--solid/--ghost/--quiet/--danger/--sm/--lg/--block` | `.btn` + `btn-solid`, `btn-ghost`, `btn-quiet`, `btn-danger`, `btn-sm`, `btn-lg`, `btn-block` | `Button` |
| `.u-icon` | `.icon-btn` (`icon-btn-sm`, `icon-btn-danger`) | `IconButton` |
| `.u-circ` | `.btn-circle` | `IconButton variant="circle"` |
| `.u-split`, `-main`, `-more`, `-pop`, `-text` | `.split-button`, `.split-button-main`, `.split-button-toggle`, `.menu-item-text` | `SplitButton` |
| `.u-chip` + `--mono/--accent`, `.on` | `.chip`, `chip-mono`, `chip-accent`, `[aria-pressed=true]` | `Chip` |
| `.u-count` | `.badge-count` | `Badge tone="count"` |
| — (mono pill, new) | `.badge` (`badge-ok/warn/bad/accent`) | `Badge` |
| `.u-dot` + `--bad/--warn/--off` | `.dot`, `dot-bad`, `dot-warn`, `dot-off`, `dot-static` | `Dot` |
| `.u-field`, `.u-hint` | `.field`, `.field-label`, `.field-hint`, `.field-error` | `Field` |
| `.u-input`, `.u-textarea`, `.u-textarea--code`, `.u-select` | `.input`, `.textarea`, `.textarea-code`, `.select` | `Input`, `Textarea`, `Select` |
| `.u-search` | `.search` | `SearchInput` |
| `.u-switch` | `.switch` | `Switch` |
| `.d-check li i` | `.checkbox`, `.radio`, `.choice` | `Checkbox`, `Radio` |
| `.u-slider`, `-rail`, `-bubble` | `.slider`, `.slider-rail`, `.slider-bubble` | `Slider` |
| `.u-seg` | `.seg`, `.seg-item` | `Segmented` |
| `.ws-tab`, `.g-index` (accent bar, ink-3 → ink) | `.tabs`, `.tab`, `.tab-panel` | `Tabs` |
| `.u-pop`, `-head`, `-sep`, `.danger` | `.pop` (floating), `.menu` (static), `.menu-head`, `.menu-sep`, `.menu-item`, `.menu-item-danger` | `Menu` / `Dropdown` |
| `.u-modal-back`, `.u-modal`, `--wide`, `-head/-body/-foot` | `.modal-backdrop`, `.modal`, `.modal-wide`, `.modal-head`, `.modal-title`, `.modal-desc`, `.modal-body`, `.modal-foot` | `Modal` / `Dialog` |
| `.up-toast`, `.sw` (cold-start card) | `.toast-region`, `.toast`, `.toast-title`, `.toast-body`, `.toast-actions`, `.toast-track` | `ToastProvider`, `useToast` |
| `.u-slider-bubble` (solid mono bubble) | `.tooltip`, `[data-tip]` | `Tooltip` |
| `.u-skel` | `.skeleton`, `skeleton-text`, `skeleton-circle` | `Skeleton` |
| `.u-rows`, `.u-row` (hairline rows) | `.table`, `.table-wrap`, `.table-stack` | `Table` |
| `.u-av`, `--me`, `.wsh-avatars`, `.wsh-more` | `.avatar`, `avatar-me`, `.avatar-group`, `.avatar-more` | `Avatar`, `AvatarGroup` |
| `.u-steps`, `.u-step`, `.on.run` | `.steps`, `.step`, `.step.is-running` | `Steps` |
| `.u-stats`, `.u-stat`, `.u-num` | `.stats`, `.stat`, `.stat-num`, `.stat-desc` | `Stat`, `Stats` |
| `.u-empty` | `.empty-state`, `.empty-state-title` | `EmptyState` |
| `.u-search kbd`, `.ds2-keys kbd` | `.kbd` | `Kbd` |
| `.u-code`, `.rt-code` | `.code`, `.code-lines`, `.code-inline` | `Code` |
| `.rt` | `.rich-text` | `RichText` |
| `.u-card`, `.u-sheetbox`, `.u-pane`, `.g-panel-head` | `.card`, `.card-well`, `.pane`, `.card-head`, `.card-body` | `Card` |
| `.u-header`, `.u-strip`, `.u-nav`, `.u-links`, `.u-burger` | `.header`, `.strip`, `.navbar`, `.navbar-links`, `.burger` | `Navbar` |
| `.u-sheet`, `-top`, `-search`, `nav`, `-foot` | `.sheet`, `.sheet-top`, `.sheet-search`, `.sheet-nav`, `.sheet-foot` | `Navbar` (mobile) |
| `.u-foot`, `.f-top`, `.f-cols`, `.f-word`, `.u-foot-bottom` | `.footer`, `.footer-top`, `.footer-cols`, `.footer-word`, `.footer-bottom` | `Footer` |
| `.u-main`, `.u-section`, `.u-rule` | `.page`, `.section`, `.section-head`, `.rule` | `Shell` |
| `.brand-*` (Logo.js) | `.brand-*` | `Logo` |
| `.u-grain` | `.grain` | — |
| `.u-spin` | `.spinner` | `Spinner` |
| Theme switch (`ThemeSwitch`, `ThemeButton`) | `.seg` / `.icon-btn` | `ThemeSwitch`, `ThemeToggle` |

## Breakpoints

These match the app: **980px** (the navbar links collapse into the burger), **700px** (the navbar is
60px tall, modals become bottom sheets, steps stack) and **560px** (tighter modal padding, and
`.table-stack` turns rows into cards).

