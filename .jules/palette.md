## 2024-12-18 - Missing ARIA Labels on Icon-only Navigation
**Learning:** Found an accessibility issue pattern in custom UI components where icon-only buttons (like `ChevronLeft` and `ChevronRight` in `GlassCalendar`) lack `aria-label` attributes, making them inaccessible to screen readers.
**Action:** Always verify icon-only buttons have descriptive `aria-label` attributes during component review, especially in custom UI implementations.
