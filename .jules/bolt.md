## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2025-12-29 - O(N*M) Array Lookup
**Learning:** Found nested loops using `Array.prototype.some` inside a constituent iteration loop to check for duplicate tasks in `functions/src/dailyScan.ts`. This scaled linearly with the number of constituents *and* tasks resulting in O(N*M) time.
**Action:** Used a `Set` to create a hash map outside the hot loop (`O(N)` initialization) to convert the lookup inside the loop to `O(1)`. Always extract repeated date/string conversions and array lookups before hot loops to improve serverless performance for large batches.
