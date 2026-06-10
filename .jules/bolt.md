## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2026-06-10 - O(N^2) Bottleneck in Daily Scan
**Learning:** In Cloud Functions with potentially thousands of iterations, using array methods like `.some()` inside a loop (e.g. checking existing tasks) creates O(M*N) performance bottlenecks.
**Action:** Replaced nested array lookups with a pre-constructed Hash Set containing serialized keys (e.g. constituentId_type_date) to ensure O(1) lookups.
