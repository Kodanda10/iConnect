## 2024-12-18 - Missing ARIA Labels in Custom Calendar
**Learning:** Custom UI components like GlassCalendar often miss critical ARIA labels on icon-only navigation buttons and dynamically generated day buttons, rendering them opaque to screen reader users.
**Action:** Always ensure any interactive elements (especially buttons containing only icons or generic numbers) have descriptive `aria-label` attributes to explicitly announce their purpose or target value (e.g., "Previous month" or "Select Dec 18 2024").
