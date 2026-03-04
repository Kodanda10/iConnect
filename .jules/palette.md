
## 2025-01-28 - Custom Calendar Component Accessibility Pattern
**Learning:** Custom calendar implementations frequently overlook accessibility. For robust screen reader support, day buttons require full date strings (e.g., `1 January 2024`) as `aria-label`s, along with `aria-selected` and `aria-current="date"`. Dropdowns need appropriate roles (`listbox`, `option`) and attributes (`aria-haspopup="listbox"`, `aria-expanded`).
**Action:** Always verify ARIA roles and labels when reviewing or building custom UI components, ensuring screen readers can correctly announce states and navigate interactive elements.
