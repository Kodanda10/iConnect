## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2024-12-19 - O(N²) Operations in React Renders
**Learning:** Performing array computations like `Math.max(...arr.map())` directly inside a `.map` loop during rendering causes O(N²) time complexity on every render cycle.
**Action:** Always extract expensive computations outside of render loops, and ideally memoize them with `useMemo` if the derived value depends on state that doesn't change on every single re-render.
