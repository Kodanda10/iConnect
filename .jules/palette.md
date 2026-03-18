# Palette's UX/A11y Journal

## 2024-12-19 - GlassCalendar Custom Calendar Accessibility
**Learning:** Custom calendar implementations built with non-semantic elements (like div/button instead of native select/input) require a complex suite of ARIA attributes. `role="button"` elements cannot validly receive `aria-selected` (which causes a11y linter warnings and screen reader confusion); they must use `aria-pressed`. Similarly, interactive dropdown lists without native `<select>` must receive `role="listbox"`, `role="option"`, `aria-expanded`, and `aria-haspopup`.
**Action:** Always check custom UI components acting as lists or date pickers. Apply `role="listbox"`, `role="option"`, and `aria-expanded` on custom dropdowns. Apply `aria-pressed` instead of `aria-selected` for day buttons, and ensure `aria-label`s on day buttons read out the complete date string (e.g. "1 January 2024") for screen readers instead of just the number "1".
