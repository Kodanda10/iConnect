## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## $(date +%Y-%m-%d) - Date Parsing Optimization with charCodeAt
**Learning:** Replacing `String.prototype.split('-')` with `charCodeAt()` for standard `YYYY-MM-DD` date parsing significantly reduces object allocation (arrays and substrings) and provides an 11x-13x speedup in hot loops like daily scans.
**Action:** When parsing well-formatted strings in performance-critical loops (such as scanning thousands of constituents), use `charCodeAt()` to extract integer values directly. Always include length checks, delimiter checks, and ASCII digit validation to prevent malformed inputs from computing incorrect values.
