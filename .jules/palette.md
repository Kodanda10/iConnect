## 2024-12-17 - Added missing aria-labels and focus styles to dashboard action buttons
**Learning:** Icon-only action buttons like "Notification Bell" and "Sign Out" in the dashboard header are frequently missed by screen readers when aria-labels are absent.
**Action:** Always verify icon-only buttons have descriptive `aria-label` attributes and visible focus rings (`focus-visible:ring-2`) for both screen reader and keyboard accessibility.
