## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2025-12-17 - O(N²) Arrays in Render Map Loops
**Learning:** Found an O(N²) array aggregation problem (`Math.max(...gpData.map(...))`) running inside an O(N) `.map` block directly inside the component render. While small datasets may mask the issue, larger lists will block the main thread and impact TTI significantly.
**Action:** Extract and memoize data aggregations (via `useMemo`) before rendering map blocks. Pass the single cached value directly into the iterated component parameters.
