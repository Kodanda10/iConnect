## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2024-07-27 - O(N*M) Loop in Task Scanning
**Learning:** Checking for existing tasks via `Array.some()` inside a loop over all constituents creates an O(N*M) bottleneck. Furthermore, calling `.toISOString()` repeatedly inside this check results in redundant date parsing.
**Action:** Replace `Array.prototype.some()` with an O(1) `Set` lookup (hash map) built once before the loop, and pre-compute comparison date strings outside the loop to avoid redundant operations.
