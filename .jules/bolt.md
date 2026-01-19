## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2025-12-17 - Stabilizing Callbacks vs Effect Dependencies
**Learning:** When memoizing a list item component that triggers a parent side-effect (like fetching data), passing the side-effect function directly to the child breaks memoization if that function depends on changing state (e.g. loading status).
**Action:** Decouple the event handler from the side effect. Pass a stable handler (e.g., `setHoveredId`) to the child. Use a `useEffect` in the parent to watch `hoveredId` and trigger the side effect. This keeps the child's props stable (`onHover` is just a setter) while allowing the parent to react to the change.
