## 2024-12-18 - GlassCalendar Accessibility
**Learning:** The `button` role does not support `aria-selected` unless within a widget role (grid/listbox). For calendar grids implemented with buttons, relying on descriptive `aria-label` (e.g., "15 December 2024, selected") is a robust alternative to complex grid role structures.
**Action:** When enhancing custom interactive grids, prioritize descriptive labels over complex ARIA roles if full grid semantics are not strictly necessary.
