## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2024-08-12 - Extracted Math.max from Array.map callback to fix O(N^2)
**Learning:** Computing the maximum value of an array inside a `.map` loop mapping the same array turns an O(N) rendering block into an O(N²) operation, significantly impacting rendering performance when the dataset grows (e.g. for long GP lists).
**Action:** When calculating statistics across an entire dataset needed for rendering each item, compute it once outside the loop (using `useMemo` if inside a React component) and pass the pre-computed value down.
