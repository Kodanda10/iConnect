## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2024-06-25 - React Memoization for Computed List Properties
**Learning:** Recalculating aggregated properties (like `Math.max`) inline within a `map` loop inside a React render causes an O(N²) time complexity bottleneck. In `DataMetricsCard.tsx`, it severely impacted the rendering performance when hovering over blocks with large numbers of Gram Panchayats.
**Action:** Memoize these aggregated calculations using `useMemo` outside the render loop so they are evaluated in O(N) time only when their dependencies change.
