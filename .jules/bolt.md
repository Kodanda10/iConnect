## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2026-05-12 - O(N^2) Array Search in Hot Loops
**Learning:** Using .some() to search an array of existing tasks within a loop iterating over thousands of constituents causes massive performance degradation (O(N^2) complexity). Repeated date formatting inside loops also adds overhead.
**Action:** Pre-compute a Set of composite string keys (e.g., `${id}_${type}_${date}`) outside the hot loop for O(1) lookups, and extract string formatting operations (like .toISOString().split('T')[0]) out of the loop.
