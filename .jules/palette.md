## 2026-06-26 - ARIA Labels on Custom Date Pickers
**Learning:** Custom UI components like GlassCalendar often miss essential ARIA labels on icon-only navigation buttons, making them inaccessible to screen readers despite having visual icons (like chevrons).
**Action:** Always verify that interactive elements, especially icon-only buttons in custom components, have appropriate `aria-label`, `aria-expanded`, and `aria-haspopup` attributes.
