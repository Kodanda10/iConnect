## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2024-09-24 - O(N²) Aggregate Calculations in Render Loops
**Learning:** Performing aggregate calculations like `Math.max` directly inside a `.map()` render loop leads to an O(N²) complexity as it recalculates the aggregate for every item rendered.
**Action:** Always extract such aggregate calculations and cache them using `useMemo` at the top level of the component (before conditional early returns) to optimize render cycles.
