## 2024-12-19 - Calendar Grid Accessibility
**Learning:** In calendar components, distinguishing "today" from "selected date" is critical for screen readers. Using `aria-current="date"` for today provides specific semantic meaning that generic `aria-selected` (used for user selection) lacks.
**Action:** Always implement `aria-current="date"` on the current day cell in calendar grids, separate from the selection state.
