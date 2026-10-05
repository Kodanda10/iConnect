## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2025-12-17 - O(N²) in Render Loops
**Learning:** Performing aggregate calculations like `Math.max(...array.map(...))` inside a React `.map()` render loop recalculates the aggregate on every iteration, leading to O(N²) rendering complexity.
**Action:** Always extract and cache such aggregate calculations with `useMemo` outside the render loop and reference the cached value inside the loop.
