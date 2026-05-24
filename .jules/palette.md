## 2026-05-24 - Calendar Accessibility
**Learning:** Custom interactive UI controls like calendars need dynamic `aria-label`s to convey current state alongside action, and must use `aria-pressed` instead of `aria-selected` for elements with `role="button"`.
**Action:** Always include current selection state in dropdown labels and use appropriate ARIA states for custom selections.
