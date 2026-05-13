## 2026-05-13 - Calendar Day Selection Accessibility
**Learning:** When custom UI controls use `role="button"` (like calendar days), visual selection states must use `aria-pressed` rather than `aria-selected` because `role="button"` does not support `aria-selected`.
**Action:** Always use `aria-pressed` for selection states on `role="button"` elements.
