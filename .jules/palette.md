## 2024-12-17 - Custom Calendar Accessibility

**Learning:** Custom calendar components (like GlassCalendar) require a specific set of ARIA attributes to be fully accessible. Native `<input type="date">` handles these automatically, but when building custom UIs, we must manually provide semantic meaning to screen readers:
1. Navigation buttons need `aria-label` (e.g., "Previous month").
2. Dropdown toggles require `aria-haspopup="listbox"` and `aria-expanded`.
3. Dropdown menus need `role="listbox"` and their items need `role="option"`.
4. The "Today" button needs `aria-current="date"`.
5. Selected date buttons must use `aria-pressed="true"` (since `role="button"` doesn't support `aria-selected`).
6. Day buttons need an `aria-label` with the full date string (e.g., "1 January 2024") so screen readers don't just read isolated numbers like "1".

**Action:** Whenever building or modifying custom date pickers, ensure this exact suite of ARIA attributes is applied. Never assume visual indicators (like a colored background for the selected date) are sufficient for all users.
