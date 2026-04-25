## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2024-12-14 - Pre-computing Sets for O(1) Lookups in Hot Loops
**Learning:** In Cloud Functions handling large datasets (like constituents and tasks), using `.some()` inside a loop over the dataset creates an O(N²) bottleneck for array searches.
**Action:** When repeatedly checking if an item exists within a loop, pre-compute a `Set` or `Map` using composite keys outside the hot loop to enable O(1) lookups.
