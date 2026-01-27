## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2024-12-18 - Stable Callbacks via useRef Cache
**Learning:** In `DataMetricsCard`, passing a callback (`loadGPData`) that depended on state (`gpData`) to a child component caused excessive re-renders because the callback reference changed on every state update. This negated `React.memo` on the child.
**Action:** Use `useRef` to track metadata (like "loaded blocks") instead of state when the data is not needed for rendering the callback itself. This stabilizes the callback reference.
