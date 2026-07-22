## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2025-02-23 - Memoize Calendar Data
**Learning:** Calendar rendering bottlenecks can occur when O(N) operations like `filter` and expensive operations like `new Date()` are inside 31-day loops.
**Action:** Extract O(N) loops out of calendar renders into O(1) hash maps with `useMemo`, utilizing string `.split('-')` instead of `new Date()`.
