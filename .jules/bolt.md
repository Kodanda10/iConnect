## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2024-12-17 - O(N²) Render Loop Optimization
**Learning:** Computing aggregate values (like `Math.max` over an array) directly inside a `.map` function during a React render causes the array to be iterated `N` times for each of the `N` elements, resulting in an `O(N²)` time complexity. This can cause significant rendering bottlenecks for large lists.
**Action:** Always compute aggregate values outside of the `.map` loop. Use `useMemo` to cache the result based on the source array, reducing the time complexity to `O(N)` and preventing unnecessary recalculations on every render.
