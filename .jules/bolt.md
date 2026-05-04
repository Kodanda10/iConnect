## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2024-05-04 - O(N) Task Lookup Optimization
**Learning:** Pre-computing reference data into a Set outside hot loops avoids O(N²) nested array searches for Cloud Functions processing large datasets.
**Action:** Use Set or Map with composite string keys for O(1) lookups instead of .some() inside loops, and hoist expensive string formatting operations outside the loop.
