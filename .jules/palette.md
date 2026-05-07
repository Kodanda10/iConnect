## 2024-05-07 - Calendar Day ARIA Selection States
**Learning:** When implementing custom interactive UI controls in React like calendars, visual selection states must be accompanied by explicit ARIA attributes. Specifically, use `aria-pressed` instead of `aria-selected` for elements with `role="button"` (like calendar days), as `role="button"` does not support `aria-selected`.
**Action:** Always use `aria-pressed` for selection states on custom button-based components.
