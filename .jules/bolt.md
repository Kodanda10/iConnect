## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2024-05-20 - Pre-computing Sets for Hot Loops
**Learning:** In Cloud Functions, O(N²) nested array searches (`.some()`) inside a loop iterating over all constituents cause severe performance bottlenecks as datasets grow. Repeated expensive string allocations like `.toISOString()` in the hot loop also add significant overhead.
**Action:** Pre-compute reference data into a `Set` with composite string keys for O(1) lookups before the hot loop, and hoist expensive formatting outside the loop.
