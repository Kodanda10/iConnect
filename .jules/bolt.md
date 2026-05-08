## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2024-05-21 - O(N²) Array Lookups in Cloud Functions
**Learning:** Using `.some()` inside a loop over large datasets creates a significant O(N²) performance bottleneck.
**Action:** Pre-compute reference arrays into a `Set` or `Map` with composite string keys (e.g., `${id}_${type}_${date}`) outside the hot loop to enable O(1) lookups.
