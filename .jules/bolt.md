## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2024-05-24 - Optimize DataMetricsCard GP rendering
**Learning:** Found an O(N^2) anti-pattern in `DataMetricsCard.tsx` where `Math.max(...(gpData[hoveredBlock] || []).map(g => g.count), 1)` was called inside a `.map()` render loop for GP progress bars.
**Action:** Extract the max count calculation out of the render loop and memoize it using `useMemo` to prevent recalculation on every iteration.
