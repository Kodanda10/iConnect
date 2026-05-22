## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2026-05-22 - Optimize O(N²) hot loop in dailyScan
**Learning:** Using .some() inside a large dataset loop creates O(N²) complexity. Repeated Date.toISOString() calls also add significant overhead in hot loops.
**Action:** Pre-compute reference data into an O(1) Set with composite string keys and extract Date operations before the loop.
