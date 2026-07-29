## 2024-07-29 - Missing A11y on Icon-Only Buttons in Custom Components
**Learning:** Custom UI components like `GlassCalendar` often implement icon-only navigation buttons that screen readers interpret as empty, meaningless elements unless explicitly labeled.
**Action:** Always verify icon-only interactive elements in custom date pickers and calendars have explicit `aria-label` attributes and proper `focus-visible` styling for keyboard navigation.
