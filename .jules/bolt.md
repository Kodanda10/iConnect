## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2026-06-05 - O(N^2) Loop Optimization in dailyScan
**Learning:** Found an O(N^2) bottleneck in dailyScan where `existingTasks.some()` was called multiple times inside a loop over `constituents`. Date toISOString conversion was also inside the loop.
**Action:** Replaced nested array lookups with an O(1) Set lookup by pre-computing task signatures. Hoisted Date string conversion outside the hot loop.
