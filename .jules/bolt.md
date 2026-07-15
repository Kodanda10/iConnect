## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2025-12-17 - Avoid O(n²) in render loops
**Learning:** Running aggregation calculations like `Math.max` over an entire list during a `.map()` iteration of that same list causes O(n²) execution time during render.
**Action:** Extract list-level aggregations and calculations out of item-level iterators so they are calculated exactly once per render.
