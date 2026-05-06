## 2024-12-14 - Custom Calendar Selection States
**Learning:** Custom interactive UI controls like calendars that utilize `role="button"` elements must use `aria-pressed` instead of `aria-selected` because `role="button"` does not support `aria-selected`.
**Action:** Apply `aria-pressed` to custom selection buttons and ensure descriptive `aria-label`s are attached to icon-only buttons.
