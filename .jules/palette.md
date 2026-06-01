## 2026-06-01 - GlassCalendar Accessibility Update
**Learning:** Calendar components like GlassCalendar have dynamic selection states (month, year, specific days) that require dynamic `aria-label`s and `aria-pressed` rather than static strings or `aria-selected` on buttons for screen readers to accurately convey current selections and interactive states.
**Action:** Ensure dynamic components use calculated ARIA labels based on their internal state (e.g., `aria-label={"Select month, currently " + monthName}`) and use `aria-pressed` instead of `aria-selected` for `role="button"`.
