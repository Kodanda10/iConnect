## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2025-03-17 - React Component Render Array Operations
**Learning:** Performing full-array operations (like `Math.max(...array.map())`) inside a `.map()` render loop over the same array causes O(N²) time complexity during every render cycle. This is especially problematic in data visualization components that map over many items (like GP progress bars).
**Action:** Always pre-calculate aggregate values like `maxCount` outside of render mapping loops. Additionally, combine this with `React.memo` for list items and `useCallback` for stable ID-based event handlers to ensure list performance scales linearly O(N) instead of exponentially.
