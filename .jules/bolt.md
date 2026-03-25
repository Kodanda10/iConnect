## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2025-12-17 - O(N²) Computations in Render Maps
**Learning:** Placing array computations like `Math.max(...array.map(...))` inside a `.map()` block in React rendering logic turns an O(N) rendering process into an O(N²) computation, causing serious performance degradation for large datasets.
**Action:** Always extract such calculations outside the map loop (e.g., using an IIFE or early return variable) so the value is computed exactly once per render and passed as a stable prop to children.