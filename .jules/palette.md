## 2025-01-28 - [GlassCalendar Accessibility Constraints]
**Learning:** `aria-selected` is not supported on `role="button"` elements by the linter/standard, even though it feels semantic. The linter strictly enforces this.
**Action:** When making custom interactive grids using buttons (like calendars), avoid `aria-selected` unless the button is wrapped in `role="gridcell"`. Use descriptive `aria-label` (e.g., "15 January 2024, selected") to convey state to screen readers.
