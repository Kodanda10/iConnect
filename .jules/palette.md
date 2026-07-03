## 2026-07-03 - Adding ARIA labels to icon-only buttons
**Learning:** Found several icon-only buttons throughout the app (layout, calendar, scheduler) lacking ARIA labels, making them inaccessible to screen readers. This is a common pattern in the dashboard.
**Action:** Always verify that buttons containing only icons have `aria-label` attributes that explain what they do to ensure screen reader accessibility.
