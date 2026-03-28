## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2025-03-28 - React List Render Optimization with React.memo and Stable Handlers
**Learning:** Performing inline calculations like `Math.max` over an entire array within a `.map()` loop causes O(N²) operations which significantly degrades render performance. In addition, when implementing hover interactions on long list items, omitting `React.memo` and using inline anonymous functions for event handlers causes every item to re-render when the hover state changes on just one.
**Action:** Extract list-wide calculations outside of the `.map()` loop to compute once, passing the result as a stable prop. Wrap list item components in `React.memo` and use `useCallback` to create stable event handlers that accept an ID/key instead of generating inline closures in the render function.
