## 2026-04-28 - GlassCalendar Accessibility Fix
**Learning:** Custom calendar components like GlassCalendar require specific accessibility attributes: aria-label on navigation buttons, aria-haspopup='listbox'/aria-expanded on dropdown toggles, role='listbox'/role='option' for dropdown menus, aria-current='date' for today, aria-pressed for the selected date (since role='button' does not support aria-selected), and full date strings for day button aria-labels.
**Action:** Always add proper ARIA states and roles when building custom interactive UI controls like calendars and dropdowns.
