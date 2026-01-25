## 2025-02-12 - Glass Design System Accessibility Gaps
**Learning:** The custom "Glass" design system components (like `GlassCalendar`) are visually polished but rely heavily on icon-only buttons and `div` structures without semantic roles or ARIA labels. This makes them completely invisible to screen readers despite being interactive.
**Action:** When working on "Glass" components, always verify that icon-only buttons have `aria-label`s and that custom dropdowns/grids use proper roles (`listbox`, `option`, `grid`, etc.) and states (`aria-expanded`, `aria-selected`, `aria-current`).
