## 2026-01-17 - DataMetricsCard Keyboard Accessibility
**Learning:** `div` elements with `onClick` or hover interactions are invisible to keyboard users. Converting them to `button` elements and adding `onFocus` handlers makes "hover-only" interactions accessible.
**Action:** Audit other "interactive list items" to ensure they are buttons or have `role="button"` with keyboard handlers.
