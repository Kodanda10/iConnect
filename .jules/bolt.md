## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2026-06-14 - Pre-computing Hash Maps for O(1) Lookups in Cloud Functions
**Learning:** O(N^2) `.some()` lookups inside loops when processing thousands of constituents cause significant performance degradation.
**Action:** Replace nested array lookups with a pre-constructed `Set` of concatenated signatures to ensure O(1) lookups during iteration.
