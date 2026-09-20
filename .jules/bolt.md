## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2024-08-20 - Extract Aggregations from Render Loops
**Learning:** Performing aggregate calculations like `Math.max` directly inside `.map()` render loops in Next.js dashboard components causes O(N²) complexity, significantly degrading rendering performance for large datasets.
**Action:** Always extract such calculations, preserve fallbacks (like 1), and cache them using `useMemo` at the top level of the component before any conditional early returns.
