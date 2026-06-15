## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2026-06-15 - O(N^2) Array Lookups in Hot Loops
**Learning:** Using `.some()` inside a loop over constituents to check against an array of existing tasks causes an O(N^2) bottleneck, which is very inefficient when scanning large numbers of constituents.
**Action:** Pre-compute a `Set` or Hash Map (e.g. `existingTaskKeys.add(`${constituentId}_${type}_${date}`)`) of the targets outside the loop for O(1) lookups inside the hot loop.
