# Utkristi UI: competitive audit

This audit compares the Utkristi ecosystem kit with official documentation for shadcn/ui, MUI X, Mantine, React Aria, and Storybook. It checks workflows against the package exports, React source, docs, and tests in this repository. **Partial** means a primitive or example exists but does not cover the workflow. Priorities reflect reuse across Utkristi apps and implementation cost; they are not market-share rankings. Some advanced MUI X features require paid plans, so their presence is a reference point rather than a parity target.

Utkristi already ships standalone CSS, React components, and a Tailwind preset and plugin with shared Night, Paper, and Glass tokens. Its docs have executable examples, API references, and an editable TSX/HTML sandbox. The biggest opportunity is to make those pieces cover complete app workflows and verify them continuously.

| Priority | Workflow | What competitors provide | Utkristi status and next deliverable |
| --- | --- | --- | --- |
| Now | Bulk table actions | [MUI X row selection](https://mui.com/x/react-data-grid/row-selection/) supports controlled selection and checkbox selection. | **Implemented.** Stable selection across pages, disabled rows, mixed state, and a bulk action bar. Project Worklist demonstrates archive confirmation and focus return. |
| P0 | Release quality | [Storybook accessibility tests](https://storybook.js.org/docs/writing-tests/accessibility-testing) run axe against examples. | **Partial.** CI runs package and docs checks, the responsive Edge sweep, and a focused axe check in each theme. Screen-reader and image-diff gates remain open. |
| P0 | Reusable app screens | [Flowbite CRUD layouts](https://flowbite.com/blocks/application/crud/) and [shadcn/ui Blocks](https://ui.shadcn.com/blocks) compose primitives into working screens. | **Implemented with fixtures.** Project Worklist, Audit Explorer, and Roles and Access include request, permission, or persistence states and editable sources. Real app integration is the next acceptance gate. |
| P0 | Remote tables | [MUI X Data Source](https://mui.com/x/react-data-grid/server-side-data/) supports server-side pagination, filtering, and sorting. | **Implemented.** `DataTable` supports controlled paging, sorting, and query state with total rows and request status. The worklist fixture cancels superseded requests. |
| P1 | Table personalization | [MUI X column visibility](https://mui.com/x/react-data-grid/column-visibility/) supports controlled visibility and non-hideable columns. | **Implemented.** `ColumnChooser` protects required columns. Audit Explorer persists a versioned browser view and reconciles saved keys with the current columns. |
| P1 | Large or editable datasets | [MUI X virtualization](https://mui.com/x/react-data-grid/virtualization/) windows rows and columns. [Editing](https://mui.com/x/react-data-grid/editing/) defines an edit and validation lifecycle. | **Partial.** Local and remote paging limit mounted rows. Measure actual scroll and editing needs before choosing a separate grid adapter. |
| P1 | Validated forms | [Mantine `useForm`](https://mantine.dev/form/use-form/) supplies field state, validation, and submission helpers, including uncontrolled mode. | **Partial.** `Field`, inputs, and `Questionnaire` cover presentation and a step flow. Document an integration with an existing form library covering errors, focus on invalid submit, async submission, and reset. Keep the form dependency in the recipe. |
| P1 | Date ranges and international input | [Mantine dates](https://mantine.dev/dates/date-picker-input/) includes range and multiple dates. [React Aria](https://react-aria.adobe.com/blog/rtl-date-time) covers locale-specific date fields and calendar systems. | **Partial.** `DateRangePicker` supports inclusive date-only bounds and native date inputs. Additional calendar systems remain open. |
| P1 | Source installation | [shadcn/ui registry](https://ui.shadcn.com/docs/registry/getting-started) declares files and dependencies for CLI installation. | **Pilot implemented.** The production docs emit a version-pinned worklist item from the sandbox source. Public installation requires publishing the matching package build. |
| P2 | Notification lifecycle | [Mantine notifications](https://mantine.dev/x/notifications/) supports visible limits, a queue, and updates to existing notifications. | **Partial.** `ToastProvider` exposes `show` and `dismiss` with pause and timing behavior. Add a visible limit and update-by-ID for progress and completion. Verify queued toasts start their timers when shown. |
| P2 | AI app workflows | [shadcn/ui AI Elements](https://ui.shadcn.com/docs/ai-elements) includes prompt input, model selection, tool state, and citations. | **Partial.** `Message`, `MessageScroller`, `Attachment`, and `Trace` cover parts of a conversation. Start with a streaming transcript and composer recipe with stop, retry, and sources; keep transport in the consuming app. |

## First implementation: DataTable selection

Open **Data Table** in the docs to try the controlled example or edit it in the sandbox. Pass `selection={{}}` for local state, `defaultSelectedKeys` to seed it, or `selectedKeys` and `onSelectionChange` to wire selection to bulk actions. Use immutable arrays of stable IDs from `getRowKey`. The component keeps selected IDs even when a row is filtered out or temporarily absent from `rows`; a controlled consumer can prune IDs after a confirmed deletion. **Select all on this page** changes eligible rows on the current filtered page. `isRowSelectable` can disable individual controls, and `getRowCheckboxLabel` lets the app provide a human-readable name.

The sort path now extracts sort values once per matching row and reuses one numeric collator per sort. Changing only the page or selection does not re-sort the data when the row and column inputs are stable. The table still renders a native HTML table and uses the shared checkbox and theme tokens.

## Ecosystem pilots

Trial the worklist contract in two ecosystem apps with different API and permission models. Record time to first successful query, integration changes, keyboard and narrow-screen results, and whether each app could reuse the recipe without a fork. Use those pilots to decide which specialized workflow to build next, such as execution replay, chart drill-down, or an AI composer. These need a consuming team and representative data to validate their behavior.

## Flowbite coverage

Utkristi covers a number of the same component categories. Flowbite has a deeper catalog of examples within those categories, a much larger library of complete layouts, and component theme overrides through a provider. Compare those separately from the number of component names. [Flowbite components](https://github.com/themesberg/flowbite/tree/main/content/components) · [Flowbite blocks](https://flowbite.com/blocks/) · [Flowbite React theming](https://flowbite-react.com/docs/customize/theme)

| Area | Implemented here | Follow-up variants |
| --- | --- | --- |
| Navigation and actions | Bottom Navigation with fixed placement, Mega Menu, inline and fixed Speed Dial, Clipboard | Full-width mega menu with a feature card |
| Content and feedback | Sticky Banner, Jumbotron, List Group, Rating, vertical and horizontal Timeline. Extra examples for alert tones, button states, progress, and multi-open accordion panels. | Interactive rating, broader state and composition examples across the catalog |
| Media | Device Mockup, Gallery with a lightbox example, QR Code, Video | QR payload encoding, media playlists |
| Forms | File, Floating, Number, Phone, and Time inputs. FileDropzone with native picker and drop support. | Country dial-code selection, time dial, file validation and upload progress |
| Full layouts | Project directory, sign-in, workspace settings, and pricing | Dashboards, checkout, product detail, broader marketing sections, and error/loading state examples |
| Customization | Shared CSS variables and Tailwind theme variants | Scoped component overrides and app-wide default props comparable to the Flowbite React theme provider |

Indicators, chat bubbles, steppers, and other overlapping categories use the existing Dot, Bubble, and Steps components. The QR component accepts a matrix from an encoder. The phone and time controls use native input types.
