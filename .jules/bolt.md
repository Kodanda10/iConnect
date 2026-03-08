## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2024-03-08 - O(N²) Computations in React Map Loops
**Learning:** Calculating `Math.max()` over an array *inside* a `.map()` callback over the same array creates an unintended O(N²) time complexity. This is especially bad in UI rendering code, which could cause significant main-thread lag when list sizes grow. In React components with hover states, combining this with missing `React.memo` on list items and using inline arrow functions for event handlers causes *all* list items to re-render, compounding the issue.
**Action:** Extract expensive calculations (like `Math.max` or aggregations) outside of the `.map()` loop. Pass the pre-calculated value as a stable prop to child components. Use `React.memo` for list items and `useCallback` for event handlers that accept identifiers to prevent large list re-renders.
