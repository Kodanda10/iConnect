## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2025-01-20 - Memoizing Aggregate Calculations in Render Loops
**Learning:** Performing aggregate calculations like `Math.max` directly inside `.map()` render loops results in an inefficient O(N²) time complexity per render cycle. This is particularly problematic in interactive components (e.g. DataMetricsCard) that dynamically render progress bars.
**Action:** Always extract and cache such aggregate calculations with `useMemo` outside of rendering loops (and before conditional early returns) to limit the complexity to O(N) and significantly reduce unnecessary re-computation.
