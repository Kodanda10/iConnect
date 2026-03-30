## 2024-05-18 - GlassCalendar Accessibility Improvements

**Learning:** When using custom accessible calendar UI components like `GlassCalendar` that use `<button>` elements to simulate listbox dropdowns (like month and year selectors) and date grids, implicit button roles and missing labels degrade the screen reader experience. Specifically:
- Icon-only navigation buttons must have `aria-label`s.
- Custom dropdowns built with buttons and absolute positioning need `aria-expanded` and `aria-haspopup="listbox"` on the toggle, and `role="listbox"`, `role="option"`, and `aria-selected` on the list items.
- A `<button>` used as a calendar day cell should use `aria-pressed` (since `role="button"` does not support `aria-selected`) and have an `aria-label` with the full readable date string (e.g., "1 January 2024") so context isn't lost when navigating via screen reader.

**Action:** Ensure custom interactive UI components that behave like complex widgets (calendars, listboxes) strictly implement the appropriate ARIA roles and labels, rather than relying on standard button behaviors.
