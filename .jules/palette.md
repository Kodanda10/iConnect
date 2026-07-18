## 2026-07-18 - Added ARIA labels to GlassCalendar
**Learning:** Custom calendar components often use icon-only navigation buttons (e.g. Chevrons) and dynamic dropdowns for month/year selection. Without explicit `aria-label` and `aria-expanded` attributes, these controls are completely inaccessible to screen reader users, making date selection impossible for them.
**Action:** Always verify that icon-only navigation elements and custom dropdown triggers in interactive components like calendars have descriptive `aria-label`s and properly sync `aria-expanded` state.
