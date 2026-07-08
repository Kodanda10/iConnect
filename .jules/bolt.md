## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2025-01-01 - O(n²) Array Lookup in Render Loop
**Learning:** Using `Array.includes()` inside a calendar render loop (31 iterations) against an array of dates causes O(n²) complexity, degrading rendering performance.
**Action:** Convert arrays to `Set`s using `useMemo` outside the render loop to achieve O(1) lookups for `hasEvent` checks.
