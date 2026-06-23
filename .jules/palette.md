## 2026-06-23 - Calendar ARIA Navigation Labels
**Learning:** Custom calendar components with icon-only buttons for navigation and toggle-able month/year dropdowns are completely invisible to screen readers without explicit ARIA labels and expanded states.
**Action:** Always verify keyboard/screen-reader navigation for custom date pickers, specifically ensuring icon-only buttons have descriptive `aria-label`s and dropdowns use `aria-expanded`.
