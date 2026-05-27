## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2026-05-27 - Optimize daily scan hot loop
**Learning:** String allocations like .toISOString() and nested array lookups (.some) inside large loops cause significant overhead and O(N*M) time complexity.
**Action:** Hoist string allocations outside of loops and pre-compute O(1) Sets or Maps for lookups to flatten complexity.
