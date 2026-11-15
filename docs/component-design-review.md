# Component documentation and behavior review

Reviewed 15 November 2026. The complete inventory is in [component coverage](component-coverage.md). Run npm run docs:audit to regenerate it.

## Reference patterns

[MUI Button](https://mui.com/material-ui/react-button/) separates appearance, size, loading, icon placement, and links into named examples. [Ant Design Button](https://ant.design/components/button/) separates usage guidance, examples, API defaults, and design tokens. [Flowbite Buttons](https://flowbite.com/docs/components/buttons/) presents examples beside reusable HTML. Direct Flowbite page fetching returned HTTP 403 in this environment; its indexed official documentation was available.

The docs now apply that structure to every component page. Basic usage is followed by named use cases with individual previews, copyable sources, and sandbox links. Previews mount when expanded to avoid running every demo simultaneously. API tables come from package types and include source-derived defaults where available. HTML, CSS, and JavaScript can be copied separately. Sandbox search includes example names and descriptions.

## Package improvements in this pass

| Family | Implemented options | Reference |
| --- | --- | --- |
| Sidebar | Persistent panel or rail, controlled and uncontrolled collapse, content hiding, retained icon links, retractable panel, header or edge trigger, footer slot | [Ant Layout](https://ant.design/components/layout/), [MUI Drawer](https://mui.com/material-ui/react-drawer/), [Flowbite Sidebar](https://flowbite.com/docs/components/sidebar/) |
| Alerts | Soft, plain, outlined, solid, title and description, optional icon, action slot, controlled dismissal, banner geometry, semantic tone | [MUI Alert](https://mui.com/material-ui/react-alert/), [Ant Alert](https://ant.design/components/alert/) |
| Tabs | Horizontal or vertical, soft/pill/plain appearance, full width, automatic or manual activation, disabled entries, directional keyboard support | [MUI Tabs](https://mui.com/material-ui/react-tabs/) |
| Accordion | Flush, panel, separated, single/multiple expansion, leading/trailing indicator, optional required open section | Package API and existing disclosure tests |
| Cards | Outlined, elevated, soft, plain, contrast pane, custom width and corners | Package API |
| Tables | Striped, bordered, optional hover, compact/comfortable density, sticky header, mobile stacking, custom empty content | Package API |
| Workspace | Trading icon rail, terminal tabs, creative studio, office navigation | Package API |

Decorative accent edges have been removed from workspace navigation, navbar active markers, tabs, and toast edges. Selection uses the theme surface and text. Neutral separators and keyboard focus indicators remain.

## Remaining feature gaps

Coverage means an example is documented and runnable, not that every competing API has an equivalent. These gaps remain separate engineering work and must not be advertised as implemented.

| Area | Current coverage | Remaining capability |
| --- | --- | --- |
| Data grid | Sorting, search, paging, remote state, selection, column visibility, density | Virtualized rows/columns, cell editing, resizing/pinning, grouping, aggregation and spreadsheet navigation comparable to [MUI X Data Grid](https://mui.com/x/react-data-grid/) |
| Date and time | Calendar, bounded dates/ranges, native time input | Timezone-aware date/time composition, presets and multi-month range navigation |
| Navigation | Dropdowns, nested navbar, sidebar collapse, modal drawers | Unified responsive sidebar controller, swipe gestures and resizable navigation rails |
| Overlays | Focus management, Escape, outside dismissal, portal themes | General collision-aware placement API shared by every floating component |
| Frameworks | React package and standalone DOM runtime, integration guidance | Native Vue/Svelte/Angular components with independently verified framework APIs |
| HTML examples | Standalone markup/runtime and native browser equivalents | Exact interaction parity with every advanced React example |
| Verification | All source examples type-checked; catalog inventory and browser startup checks | Exhaustive interaction/state combinations for every example and screen reader testing |

The next implementation pass should prioritize these behavioral capabilities rather than increasing a variant count with cosmetic duplicates.
