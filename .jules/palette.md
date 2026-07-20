## 2024-07-20 - ARIA Labels on Navigation Icons
**Learning:** Icon-only navigation buttons (chevrons for pagination and calendars) lack context for screen readers in this app, making essential navigation confusing or impossible.
**Action:** Always verify that buttons containing only icons (like lucide-react chevrons) have an explicit, descriptive `aria-label` (e.g. "Next month", "Previous page").
