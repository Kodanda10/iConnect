## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2024-07-06 - Optimize daily scan task generation
**Learning:** Using `Array.some()` inside a loop causes an O(N²) bottleneck in large dataset scans.
**Action:** Pre-compute signatures for existing records and store them in an O(1) `Set` before the loop.
