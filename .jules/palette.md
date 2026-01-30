## 2024-05-23 - Accessible Date Picker
**Learning:** React components often use icon-only buttons for navigation (e.g., calendars), which are inaccessible by default.
**Action:** Always add `aria-label` to icon buttons and ensure state changes (like selected date) are communicated via `aria-pressed` or `aria-current`.

## 2024-05-23 - Testing Authenticated Routes
**Learning:** Testing authenticated routes in Next.js with Firebase can be blocked by missing environment variables.
**Action:** Temporarily mocking the `useAuth` hook (returning `isStaff: true` and skipping `useEffect` logic) allows for local verification of protected UI flows without a full auth setup.
