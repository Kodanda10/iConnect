## 2026-05-30 - Dynamic ARIA Labels in GlassCalendar
**Learning:** When creating custom select controls for dynamic values like months/years, using a hardcoded aria-label completely replaces the visible text, obscuring the current state. Calendar day buttons also need aria-pressed instead of aria-selected.
**Action:** Always use dynamic aria-labels that combine the action and current state for custom selects, and use aria-pressed for interactive grid days.
