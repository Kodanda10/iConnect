## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2025-08-05 - O(N²) Operations in React Render Loops
**Learning:** Performing array operations like `Math.max(...array.map())` inside a `.map()` render function causes O(N²) time complexity during every render cycle.
**Action:** Extract expensive calculations out of the `.map()` loop and calculate them once per render, or memoize them if possible, especially when rendering lists.
