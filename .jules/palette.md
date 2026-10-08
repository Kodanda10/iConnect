
## 2024-10-08 - Add ARIA labels to global icon buttons
**Learning:** Found an accessibility issue pattern specific to this app's dashboard layout component where icon-only buttons like the notifications bell and sign out button lacked `aria-label`s.
**Action:** Always verify icon-only buttons throughout the global navigation components have appropriate `aria-label`s, as they are essential for screen reader users and keyboard navigation.
