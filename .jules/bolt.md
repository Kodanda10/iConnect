## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2024-12-25 - Date Parsing in Component Render Loops
**Learning:** Instantiating `new Date()` and calling string conversion methods (like `toISOString()`) inside a map loop (e.g., rendering calendar grid days) causes unnecessary performance overhead during React re-renders.
**Action:** Extract `Date` object calculations outside the render loop where possible, precalculate static components like year/month, use Sets for `O(1)` lookups, and defer creating objects to event handlers (like `onClick`) instead of pre-creating them for every render cycle.
