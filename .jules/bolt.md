## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2026-06-17 - O(N^2) Bottleneck in task scanning
**Learning:** Nested array lookups inside hot loops (like `existingTasks.some()` inside a constituent loop) can cause serious O(N^2) performance degradation as data grows.
**Action:** Replace nested loops with a pre-constructed `Set` or Hash Map for O(1) lookups.
