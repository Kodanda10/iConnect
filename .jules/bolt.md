## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2024-12-11 - Optimize O(N²) array searches in Cloud Functions loops
**Learning:** Repeated `.some()` calls inside a large array iteration (N * M) create severe CPU overhead, especially as `existingTasks` grows.
**Action:** Pre-compute array data into a `Set` or `Map` with composite keys outside the hot loop for O(1) lookups.
