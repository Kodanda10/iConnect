## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2024-05-20 - Array Iteration Consolidation in Hot Paths
**Learning:** Looping over an array of thousands of items multiple times to calculate different metrics or collect different sub-arrays is unnecessarily expensive.
**Action:** Consolidate multiple passes over the same array into a single pass that collects all necessary metrics and subsets simultaneously.
