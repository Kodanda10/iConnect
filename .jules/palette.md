## 2024-05-23 - [Date Locale Consistency]
**Learning:** `Date.toLocaleDateString` in Next.js (SSR) requires a specific locale (e.g., `'en-GB'`) to avoid hydration mismatches between server (Node) and client (Browser). Also, tests must match this locale expectation.
**Action:** Always specify locale in date formatting functions and ensure tests use the same locale or mocked date strings.
