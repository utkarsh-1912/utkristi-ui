# Migration Guide

## Upgrading to `@utkristi/ui` 0.1.7+

### Data tables (`Table` and `DataTable`)
- **Column sizing & pinning**: Pass `width`, `pinned: 'start' | 'end'`, and `resizable: true` on `TableColumn` or `DataColumn`. Pinned columns automatically compute `inset-inline-start` / `inset-inline-end` offsets.
- **Expandable rows**: Pass `renderExpandedRow`, and optionally control expansion with `expandedRowKeys` / `onExpandedRowsChange`.
- **Inline cell editing**: Set `editable: true` on a column with optional `validate` (sync or async) and `onCellEdit`.
- **Virtualization & grid navigation**: Pass `virtualize={{ rowHeight, height, overscan }}` for large datasets and `gridNavigation` for roving cell `Arrow` / `Home` / `End` keyboard movement.

### Navigation (`Sidebar`, `SidebarProvider`, `SidebarSection`, `SidebarDrawer`)
- Wrap app navigation in `<SidebarProvider storageKey="...">` to share collapsed and mobile drawer state across `Sidebar` and `SidebarDrawer`.
- Use `<SidebarSection>` for collapsible nested navigation groups.
- `Navbar`: when `onSearch` is passed, a search pill now renders in the bar in addition to the mobile sheet. Remove duplicate search icon buttons from `right` if you previously added one manually.

### Forms (`Fieldset`, `Form`, `useAsyncValidation`, `DateRangePicker`)
- Group related fields with `<Fieldset legend="..." orientation="horizontal | vertical">`.
- Use `useAsyncValidation(validator, delayMs)` for debounced, stale-request-safe async validation.
- Use `<DateRangePicker showTime locale="..." />` for localized date and time range selection with native `<form>` reset support.

### Overlays (`Modal`, `Popover`)
- `Popover` and `Modal` share a unified overlay stack so `Escape` dismisses only the topmost open layer.
- `Popover` automatically computes collision-aware placement (`top`/`bottom`, `start`/`end`) relative to viewport bounds.
