## 2024-12-18 - GlassCalendar Accessibility
**Learning:** Custom calendar components (like `GlassCalendar`) need full date strings (e.g., '1 January 2024') for day button `aria-label`s to be meaningful to screen readers, and should use `aria-current="date"` for today and `aria-pressed` for selected states instead of `aria-selected` when using `role="button"`.
**Action:** When creating or reviewing custom calendar grids, ensure day buttons have full date `aria-label`s and correct ARIA state attributes (`aria-current`, `aria-pressed`).
