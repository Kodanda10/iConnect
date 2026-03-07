## 2025-02-14 - Accessible Custom Calendar Selection State
**Learning:** In custom React calendar components (like GlassCalendar), using `role="button"` for selectable day elements creates an accessibility mismatch if you use `aria-selected` to indicate state. The `aria-selected` attribute is invalid for `role="button"`.
**Action:** Use `aria-pressed="true"` on `role="button"` day cells instead of `aria-selected`, and apply `aria-current="date"` to highlight today's date so screen readers correctly announce the state.
