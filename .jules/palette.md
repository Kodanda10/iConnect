## 2024-05-20 - Calendar Accessibility Attributes
**Learning:** Visual selection states on custom interactive UI controls (like calendar days) must be accompanied by explicit ARIA attributes. Also, elements with `role="button"` do not support `aria-selected`; `aria-pressed` must be used instead.
**Action:** Always verify custom interactive UI controls use appropriate `aria-pressed` or similar attributes and ensure icon-only buttons include `aria-label` to provide screen reader context.
