## 2025-03-11 - GlassCalendar Accessibility Fixes

**Learning:** When adding `role="button"` to elements like calendar days, they cannot use `aria-selected` because `role="button"` does not support it. Instead, they must use `aria-pressed="true"`. Additionally, when creating custom `<select>`-like dropdowns, the trigger needs `aria-haspopup="listbox"` and `aria-expanded`, while the list needs `role="listbox"` and the items `role="option"`. Full date strings (e.g. "15 January 2024") must be constructed accurately for day button `aria-label`s to give clear context to screen readers.

**Action:** Apply `aria-pressed` instead of `aria-selected` for interactive calendar days styled as buttons. Verify available date arrays like `monthNamesShort` (or `monthNames`) exist before relying on them to build full `aria-label` strings for dynamic elements to avoid ReferenceErrors.
