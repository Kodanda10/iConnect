## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2026-06-16 - O(N^2) Bottleneck in Array Lookup
**Learning:** The `scanForTasks` function called `.some()` on an array of existing tasks within a loop over all constituents, leading to a potential O(N^2) bottleneck.
**Action:** When repeatedly checking for existing items in a loop, pre-compute a `Set` of keys to ensure O(1) lookups instead of O(N) array iterations.
