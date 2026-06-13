## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2026-06-13 - Optimize CSV valid row filtering
**Learning:** In React components that process large datasets (like CSV uploads), using nested array iteration like `filter` with `some` creates an O(N^2) performance bottleneck that can block the main thread.
**Action:** Always replace nested array lookups (`some`, `find`) inside loops with pre-constructed `Set` or Hash Maps to ensure O(1) lookups, especially for data ingestion flows.
