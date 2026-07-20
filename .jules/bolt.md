## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2024-07-20 - React.memo for Hover States in Lists
**Learning:** In lists of components, updating a shared state like `hoveredId` in the parent component causes all list items to re-render, not just the hovered one.
**Action:** Wrap the list item component in `React.memo()` and use `useCallback` for event handlers so that only the items whose `isHovered` prop changes are re-rendered.
