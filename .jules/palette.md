## 2024-05-10 - Calendar Button Accessibility
**Learning:** Calendar day buttons using `role="button"` or semantic `<button>` tags should use `aria-pressed` rather than `aria-selected` for selection states, as `aria-selected` is reserved for roles like gridcell or option.
**Action:** Use `aria-pressed` for custom calendar date buttons to ensure screen readers correctly announce the selected state.
