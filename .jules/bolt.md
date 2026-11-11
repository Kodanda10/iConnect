## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2025-01-24 - React Loop Date Overhead
**Learning:** Using `new Date()` and `.toISOString()` inside React render loops (e.g. calendar grid) creates significant garbage collection overhead and potential timezone off-by-one bugs.
**Action:** Extract constant date comparisons out of the loop and build date strings using local getters (e.g. `.getFullYear()`, `.getMonth()`) with `.padStart()` instead of `.toISOString().split('T')[0]`. Defer `Date` object instantiation during rendering to `onClick` event handlers if possible.
