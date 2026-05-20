## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2024-05-20 - O(N²) nested array searches in Hot Loops
**Learning:** When processing large datasets in Cloud Functions (like arrays of constituents and tasks), using `.some()` inside a loop creates O(N²) overhead. Repeated `.toISOString()` calls also add significant allocation overhead.
**Action:** Pre-compute reference data into a `Set` with composite string keys (e.g., `${id}_${type}_${date}`) outside the hot loop for O(1) lookups, and hoist date formatting outside the hot loop.
