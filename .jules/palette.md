## 2025-01-20 - Missing ARIA Labels on Icon-only Buttons
**Learning:** Found multiple instances where icon-only buttons lacked `aria-label` attributes for screen readers, particularly in components that render custom interactive elements like calendars and layout headers.
**Action:** Always verify icon-only buttons include an `aria-label` to ensure they are accessible via keyboard and screen reader tools.
