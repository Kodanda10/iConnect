## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2024-05-20 - Unnecessary computations in render loops
**Learning:** Found O(N^2) complexity in `DataMetricsCard.tsx` where an aggregate calculation (`Math.max`) was placed inside a `.map()` render loop over the array, forcing the array to be traversed N times for N elements on every render.
**Action:** Extract aggregate calculations outside the render map loop and cache them using `useMemo` (e.g. at the component's top level, before conditional early returns). Ensure fallback logic (like `, 1`) is preserved to avoid edge-case bugs.
