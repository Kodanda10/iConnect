## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2025-01-20 - O(N²) Inline Calculations in Render Maps
**Learning:** Performing array operations like `Math.max(...arr.map())` inline inside a `.map()` render loop leads to O(N²) complexity, which causes severe UI blocking and unresponsiveness for large lists.
**Action:** Always extract and calculate array aggregates outside the `.map()` loop and memoize them using `useMemo` so they are computed once per render cycle (O(N) instead of O(N²)).
