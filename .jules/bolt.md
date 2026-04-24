## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2025-01-20 - O(N^2) Array Scans and Redundant Date Allocations
**Learning:** Nested array scans (`.some()`) inside loops iterating over large datasets (like thousands of constituents) cause O(N^2) complexity bottlenecks. Additionally, calling `.toISOString().split('T')[0]` on `Date` objects inside the same loop introduces massive redundant allocation overhead.
**Action:** When comparing items against an existing array in a loop, pre-compute a `Set` of composite string keys outside the loop for O(1) lookups. Hoist identical, static date string formatting out of the loop entirely to reuse the reference.
