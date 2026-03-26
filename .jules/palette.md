## 2024-03-26 - Custom Calendar Component Accessibility
**Learning:** Custom calendar components like `GlassCalendar` require specific attributes for screen readers to navigate them correctly. Specifically:
- Navigation buttons (ChevronLeft/Right) need `aria-label`s.
- Custom dropdowns need `aria-haspopup="listbox"` and `aria-expanded` on the trigger, `role="listbox"` on the container, and `role="option"` with `aria-selected` on the items.
- Day buttons need full date strings for their `aria-label` (e.g. "1 January 2024").
- The current day needs `aria-current="date"`.
- Since day selection uses `role="button"` (default for `<button>`), `aria-pressed` should be used instead of `aria-selected` to indicate the active state, as `aria-selected` is invalid on `role="button"`.

**Action:** Whenever building or modifying custom date pickers, ensure this full suite of aria attributes is implemented to maintain screen reader accessibility for interactive dates and custom dropdown navigation.
