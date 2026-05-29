## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2026-05-29 - Optimize O(N²) loop and string allocations in daily scan
**Learning:** Repeatedly iterating arrays inside a loop leads to O(N²) bottlenecks. Also, string allocations like `.toISOString()` in hot loops cause overhead.
**Action:** Use an O(1) Set lookup created outside the loop, and hoist expensive string allocations outside the iteration.
