## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2025-01-28 - O(N²) Render Performance in React List Mapping
**Learning:** Performing inline aggregate array calculations, such as `Math.max(...array.map(item => item.value))`, inside a React `.map()` loop results in an O(N²) time complexity for rendering the list. In components with potentially large datasets (like `DataMetricsCard` iterating over lots of entries), this can cause severe UI blockages during renders.
**Action:** Extract aggregate calculations outside the mapping loop, calculate the result once, and pass it as a static prop to `React.memo` wrapped list item components.
