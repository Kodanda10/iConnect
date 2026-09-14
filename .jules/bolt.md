## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2024-09-14 - Prevent O(N²) calculations in .map() render loops
**Learning:** Performing aggregate calculations like Math.max() directly inside a component's .map() render loop causes O(N²) complexity, significantly degrading rendering performance as the array size increases.
**Action:** Always extract and cache these aggregate calculations using useMemo before they enter the render loop.
