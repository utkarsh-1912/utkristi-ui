# Changelog

## Unreleased

- Added separate HTML, CSS, and JavaScript sandbox editors, automatic indentation, and preview error messages.

- Added controlled table views, page-size selection, column visibility, translatable table controls, and scoped control density.

- Removed the full icon catalog from control bundles and added an `@utkristi/ui/icons` entry and a CI bundle budget.
- Added table density, sticky headers, a toolbar, selection clearing, and click protection for controls inside rows.
- Added scoped CSS and form submission and reset support for Combobox and DatePicker.
- Restored starter code when a sandbox draft is blank and corrected the alignment of grouped package controls.

- Corrected navigation, connectivity, table, and spinner glyphs and deferred offscreen icon previews in the catalog.
- Extended the Glass backdrop through the full page and tinted its raised surfaces.
- Added a collapsible docs index, an on-page outline, and integration examples for 16 platforms.

- Added component variants throughout the docs, including seven Navbar configurations. Navbar supports nested groups and explicit sticky positioning.
- Added scoped entry animations, an expanded standalone DOM runtime, and a combined HTML, CSS, and JavaScript sandbox editor.

- Added theme-independent corners and custom widths to buttons, cards, form controls, dialogs, and video. Glass now uses clearer frosted surfaces and an opaque reduced-transparency mode.
- Added optional themed VideoPlayer controls with seeking, mute, captions, and fullscreen.

- Added controlled remote data tables, filter and bulk action bars, a column chooser, and an inclusive date range picker. Added worklist, audit, and access blocks with live docs, editable sources, and a registry item for the worklist.
- Added CI checks for the package, production docs, and representative keyboard, accessibility, and responsive scenarios.

- Added the branded loader, About, Terms, and Privacy pages. The docs display and use the package version in their install examples.

- Added recovery for missing docs bundles, a route-level error view, and standalone 404 and 500 pages. Code blocks and the sandbox now use each appearance's surface and border tokens.

- Added enterprise landing and execution desk templates, four operational layouts, and four custom cards. Added Signal, Ledger, and Terminal presets that work with Night, Paper, and Glass.
- Rebuilt the showcase icon tray. Scrollbars reveal on hover and focus. Added a native dialog entry point and framework integration examples.

- Added previous and next links to the docs. Simplified Command and docs search, made toast messages compact, and moved copy feedback into the source toolbar.
- Rebuilt the sandbox with a highlighted editor, line numbers, local drafts, source download, and separate source and preview views on smaller screens.

- Rebuilt the icon browser around search, category filters, and a detail dialog. Expanded the library to 256 glyphs and corrected clipped or ambiguous artwork.

- Added a Blocks library and full-width component previews with selectable variants. Added FileDropzone and a panel accordion variant. Simplified the docs sidebar selection and keyboard focus styles.
- Rebuilt the marketing overview and extended the showcase with working layouts, theme previews, and motion that respects reduced-motion preferences.

- Rebuilt the navbar dock as one surface with flat links and controls. The mobile menu opens in a compact panel and adapts to the dock width.

- Replaced the docs theme switch with a native dropdown and redesigned the search palette with grouped results, descriptions, and keyboard hints.

- Redesigned `Navbar`: a frosted floating dock with an inner link track and a sliding active indicator, a refined full-width bar with an accent underline that firms up on scroll (`is-scrolled`), optional link `icon` and `badge`, a built-in search pill (`onSearch`, `searchLabel`, `searchShortcut`), and card-style mobile sheet links. The docs navbar uses it with a `⌘K` / `Ctrl K` shortcut.

- Reworked the docs index, footer, and sandbox for small screens. Added a theme-aware scrollbar and grouped Command results with Enter activation.
- Added 18 Flowbite-inspired navigation, media, and form patterns with demos in Night, Paper, and Glass.
- Refined the icon explorer and added AVIF and WebP sources for the brand hue in each theme.

- Added a custom 135-icon 2D/3D family (`line`, `filled`, `duotone`, `2.5d` layered SVG, and `3d` soft-clay renders) with an 8-hue + monochrome + custom colour palette (`Icon`, `IconTile`, `IconPaletteProvider`, `IconPalettePicker`, `useIconPalette`, and `iconPaletteScript`) across Night, Paper, and Glass.

- Added optional DataTable row and current-page selection, including controlled state and disabled rows. Cached each matching row's sort value during a sort.

- Designed a new ecosystem mark and added an inset Navbar dock with a compact mobile menu.

- Added an editable component sandbox, full example source, and prop references to the hosting-ready docs.
- Added the ecosystem logo and refined the Glass surfaces.

- Expanded the shared catalog with carousel, loading, data, navigation, form, and conversation components in all three themes.
- Added selectable typography presets and component examples.

- Added Glass to CSS, Tailwind, the React theme controls, and the docs.

## 0.1.0

- Ported the CoLabs Night and Paper tokens and component styles.
- Added standalone CSS and Tailwind preset and plugin builds.
- Added typed React components, keyboard navigation and theme persistence.
- Added the Vite documentation, side-by-side theme demos and showcase.
