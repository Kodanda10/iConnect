## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2026-08-13 - Avoid inline array aggregations during render
**Learning:** Performing array aggregations (like `Math.max(...array.map())`) directly inside a `.map()` callback used for rendering lists causes an O(n²) performance bottleneck, as the aggregation re-runs for every single item rendered.
**Action:** Extract the calculation out of the render loop and memoize it using `useMemo` so it's only computed once when the underlying data changes.
