## 2024-10-01 - Missing aria-labels on Calendar Navigation Buttons
**Learning:** Found multiple icon-only navigation buttons in the GlassCalendar and DataMetricsCard components that lacked accessibility labels (aria-label). When components act as standard navigation tools, their buttons often depend entirely on visual context unless properly annotated, causing accessibility barriers for screen reader users.
**Action:** Always add descriptive `aria-label` tags to icon-only buttons like next/previous selectors to ensure clear meaning and usage across assistive technologies.
