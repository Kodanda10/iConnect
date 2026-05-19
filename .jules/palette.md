## 2026-05-19 - Add accessible states to interactive calendar UI
**Learning:** Calendar day components built as native buttons without a formal `grid` role must use `aria-pressed` rather than `aria-selected` to properly convey selection state to screen readers.
**Action:** When implementing custom interactive calendars, prefer `aria-pressed` for day cells unless wrapping the entire structure in an explicit ARIA `grid` or `listbox`.
