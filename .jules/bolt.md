## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2024-10-25 - Avoid O(N²) Array Lookups for Tasks
**Learning:** Using .some() inside a loop over constituents creates an O(N²) performance bottleneck, compounded by recalculating dates inside the loop.
**Action:** Pre-compute existing data into a Set using composite string keys (e.g., `${id}_${type}_${date}`) for O(1) lookups, and hoist expensive date formatting (.toISOString) entirely outside the hot loop.
