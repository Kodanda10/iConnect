## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2025-03-09 - Fast Path String Parsing in Date Ranges
**Learning:** In date range processing where strings like `YYYY-MM-DD` are repeatedly parsed (like in `parseDateParts` for task generation), relying on `String.prototype.split('-')` and `parseInt` introduces unnecessary array allocations and parsing overhead.
**Action:** When working in hot loops, use a fast-path zero-allocation check using `.length` and `.charCodeAt()` to manually extract numeric values from known fixed formats like `YYYY-MM-DD`. This yields a ~3x speedup.
