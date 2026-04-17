## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2025-01-20 - O(N^2) Array Lookup Optimization
**Learning:** Checking for duplicates using `Array.some()` inside a loop over a large dataset results in $O(N \times M)$ complexity. Also, performing operations like `toISOString().split('T')[0]` inside tight loops creates severe allocation and parsing overhead.
**Action:** When cross-referencing collections to prevent duplicates, pre-compute a lookup Hash Set (`Set<string>`) of the existing items and extract any invariant transformations (like getting today's date string) outside the loop to achieve $O(N + M)$ complexity.
