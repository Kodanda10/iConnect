## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2026-06-18 - Optimize array lookups in hot loops
**Learning:** Nested array lookups (e.g., using `.some()` inside a loop over constituents) can lead to O(N^2) performance bottlenecks when scanning large arrays.
**Action:** Replace nested array scans with a pre-constructed `Set` or Hash Map for O(1) lookups to ensure efficient scaling.
