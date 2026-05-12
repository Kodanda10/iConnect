## 2026-05-12 - ARIA Selection States for Role Button
**Learning:** When using custom elements like calendar days as buttons (`role="button"` or `<button>`), `aria-selected` is invalid according to WAI-ARIA specs.
**Action:** Always use `aria-pressed` to indicate the selection state for custom toggle buttons to ensure screen readers correctly announce the active state.
