# Enterprise implementation plan

Status: in progress. Enterprise readiness is a release decision backed by validation, not a component-count target.

## 1. Stabilize the package and examples

- Finish the current type, lint, package smoke, browser and accessibility checks.
- Keep a complete component/variant inventory with copyable code.
- Verify controlled/uncontrolled state, reset, disabled, empty, error, loading and keyboard flows where applicable.
- Require passing CI before publishing. Preserve compatibility and document changes.

## 2. Build deeper application primitives

- Data tables: explicit column sizing and logical start/end pinning first; then resizing, editing with validation, expandable rows, virtualization and keyboard grid navigation.
- Navigation: shared responsive sidebar state, modal mobile drawer, icon rail, nested sections and persistent layout preferences.
- Forms: async validation, reset semantics, composable grouped fields, date/time ranges and localization.
- Overlays: shared collision-aware placement, focus restoration, nested overlay behavior and reduced-motion coverage.

## 3. Prove accessibility and performance

- Test every supported theme and representative device width.
- Run automated accessibility checks and manual keyboard/screen-reader workflows.
- Benchmark large datasets, rapid updates and memory after repeated mount/unmount cycles.
- Set measured budgets for package imports and the docs/sandbox. Do not claim trading/HFT suitability from visual styling.

## 4. Release and adoption

- Refresh the home page and README from verified package capabilities.
- Publish migration notes, support policy and compatibility matrix.
- Pilot in Utkristi applications and resolve observed defects before declaring enterprise readiness.

## Acceptance gates

A capability is complete only with a typed public API, usable docs/sandbox example, relevant interaction tests, responsive behavior and a passing package build. Competitor parity is tracked feature by feature. No claim of being ahead is permitted without comparative measurements.

## Current implementation

Column width and logical start/end pinning are being added to Table and inherited by DataTable. Other items above remain planned unless separately verified.
