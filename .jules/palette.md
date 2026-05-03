## 2024-05-03 - Accessible Calendar Selection
**Learning:** Day buttons in custom calendars should use `aria-pressed` instead of `aria-selected` for selection states, since `role="button"` does not support `aria-selected`, and must include explicit `aria-label`s and `aria-current="date"`.
**Action:** Always apply `aria-pressed` for selected states on interactive UI elements acting as toggle buttons rather than list options.
