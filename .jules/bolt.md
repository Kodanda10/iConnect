## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2025-04-03 - O(N²) Performance in React Mapping Loops
**Learning:** Performing array computations like `Math.max` over a full mapped array directly inside a `.map()` callback function causes an O(N²) performance hit on every render because the computation is executed repeatedly for each item in the list.
**Action:** Always extract array computations (like `Math.max` or aggregations) outside of the `.map()` block so they execute only once per render, and pass the computed value down to child components. Additionally, avoid inline anonymous event handlers and memoize sub-components with `React.memo` to further prevent unnecessary list re-renders.
