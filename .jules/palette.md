## 2024-09-02 - Added ARIA labels to calendar navigation
**Learning:** Icon-only navigation buttons in custom calendar components (like GlassCalendar) often lack accessible names, making them difficult for screen reader users to understand.
**Action:** Always ensure icon-only interactive elements have descriptive `aria-label` attributes and visible focus states (e.g., `focus-visible:ring-2`) to support both screen readers and keyboard navigation.
