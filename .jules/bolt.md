## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2024-05-18 - Avoid O(N^2) loops with Array.some() for database task matching
**Learning:** Checking for existing records by calling `Array.some()` inside a loop over a large constituent list creates a hidden O(N^2) complexity bottleneck. This is common when filtering out duplicates before database insertion.
**Action:** Always pre-compute existing records into a `Set` or `Map` using a composite string key (e.g., `${id}_${type}_${date}`) before entering the loop to ensure O(1) lookups.
