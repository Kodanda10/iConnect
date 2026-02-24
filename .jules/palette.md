## 2024-12-16 - Accessible Calendar Navigation
**Learning:** Calendar components often use icon-only buttons for navigation (prev/next month) and abbreviated day names (S, M, T) without accessible alternatives, making them difficult for screen reader users.
**Action:** Always add `aria-label` to navigation buttons and use `<abbr title="Full Day Name">Short</abbr>` for day headers in calendar components.
