## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2024-05-20 - Fast Date Filtering via Suffix String Matching
**Learning:** In Cloud Functions, parsing dates using `split('-')` and `parseInt()` thousands of times inside loops represents measurable overhead. Node.js processes `String.prototype.endsWith()` roughly 7-8x faster than splitting and parsing strings into integers.
**Action:** When filtering dates by MM-DD against a common target date in a loop, extract the target date components once outside the loop into a `-MM-DD` suffix string. Then use `dateStr.endsWith(targetSuffix)` inside the loop to avoid repetitively allocating arrays via `split` and parsing integers.
