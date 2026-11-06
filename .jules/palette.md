## 2024-12-18 - Missing ARIA Labels in Calendar Navigation
**Learning:** Custom glassmorphism UI components (like `GlassCalendar`) often rely on icon-only buttons for navigation to save space, but these are frequently missed for screen reader accessibility in this codebase.
**Action:** Always verify icon-only interactive elements in custom UI components for `aria-label` attributes to ensure they are accessible to screen readers.
