## 2025-02-27 - Accessible Custom Date Pickers
**Learning:** Custom date pickers built with `div` and `button` elements lose semantic meaning for screen readers without proper ARIA attributes. Icon-only buttons for navigation and custom day grids need explicit labeling and state communication.
**Action:** Always add `aria-label` to icon-only navigation buttons, and use `aria-label` (with full date context), `aria-current="date"`, and `aria-selected` on custom date grid buttons to match native input accessibility.
