## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2024-05-20 - React List Rendering with Computations
**Learning:** Performing inline calculations like `Math.max` over an entire array within a `.map()` loop that renders list items results in O(N²) calculations on every render.
**Action:** Extract list-level computations (like finding a max value) outside of the `.map()` loop to execute them only once per render, and wrap child list items with `React.memo` while passing stable primitives and `useCallback` functions to drastically reduce unnecessary re-renders.
