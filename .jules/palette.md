## 2024-07-10 - Missing Accessible Names on Core Layout Actions
**Learning:** Core navigation actions (like notifications and sign out) frequently use icon-only buttons with tooltips (`title`) but lack semantic accessible names (`aria-label`) and proper keyboard focus states. This pattern makes the primary dashboard shell inaccessible to screen readers and keyboard navigators.
**Action:** Always verify that layout-level icon-only actions have both `aria-label` and `focus-visible` states to ensure the application shell is fundamentally accessible.
