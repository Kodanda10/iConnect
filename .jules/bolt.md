## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2025-01-24 - O(N²) trap in React render loops
**Learning:** Calculating aggregated values like `Math.max()` directly inside a `.map()` during render can silently create O(N²) time complexity (the aggregation loops over N items, for each of the N iterations of the map).
**Action:** Always pre-calculate expensive derivations or aggregations (like finding maximums, mapping lookup objects) OUTSIDE the loop during render, or wrap them in `useMemo` if derived globally within a component.
