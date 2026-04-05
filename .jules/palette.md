## 2024-12-21 - Custom Calendar Accessibility

**Learning:** Custom calendar implementations where day items implicitly act as buttons (or explicitly use `role="button"`) should not use `aria-selected="true"`. The `aria-selected` attribute is invalid on `role="button"` elements. Instead, use `aria-pressed="true"` to indicate selection state for buttons acting as toggles, or ensure the parent uses a composite role like `grid` with proper `gridcell` roles if maintaining a true ARIA grid implementation. In a button-based UI, `aria-pressed` effectively communicates the selected state to screen readers.

**Action:** When reviewing or creating interactive selection components (like calendar days or toggle buttons), always verify the ARIA states align with the element's role. For standard `<button>` elements, prefer `aria-pressed` over `aria-selected`.
