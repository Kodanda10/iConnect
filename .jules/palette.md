## 2024-12-11 - Accessibility on Dashboard Header Buttons
**Learning:** Icon-only utility buttons in the global layout (like notifications and sign out) were missing ARIA labels and focus-visible states, making keyboard navigation and screen reader usage difficult on primary actions.
**Action:** Always include `aria-label` and `focus-visible:ring-2` styles for icon-only buttons to ensure they remain accessible across all interaction modalities.
