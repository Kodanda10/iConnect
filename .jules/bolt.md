## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2024-05-20 - Array Lookups in Hot Loops
**Learning:** Checking for duplicates inside a hot loop (like scanning constituents) using O(N) array methods (like `.some` or `.find`) results in an O(N^2) operation, causing performance bottlenecks as datasets grow.
**Action:** Always replace O(N^2) nested array lookups with an O(N) Hash Map or Set constructed before the loop for O(1) lookups.
