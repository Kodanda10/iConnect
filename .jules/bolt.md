## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2026-05-16 - O(N²) Nested Search Bottleneck in Cloud Functions
**Learning:** When processing large datasets in Cloud Functions, O(N²) nested array searches (like using `.some()` inside a loop) create severe bottlenecks. Repeatedly formatting dates using `toISOString()` inside the hot loop also adds significant allocation overhead.
**Action:** Pre-compute reference data into a `Set` or `Map` with composite string keys outside the hot loop for O(1) lookups, and hoist expensive formatting operations outside the loop completely.
