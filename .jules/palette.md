## 2025-05-15 - ARIA attributes on Calendar interactive elements
**Learning:** Calendar day buttons using `role="button"` do not support `aria-selected`, so `aria-pressed` must be used to indicate selection state for screen readers. Icon-only buttons need explicit `aria-label`s for context.
**Action:** Always use `aria-pressed` for custom calendar grid selection states implemented as buttons, and ensure icon-only pagination controls have `aria-label`s.
