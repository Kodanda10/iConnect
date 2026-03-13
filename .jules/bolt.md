## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2026-03-13 - Zero-Allocation Date Parsing
**Learning:** In hot loops, using `String.prototype.split('-')` on standard `YYYY-MM-DD` dates introduces significant GC overhead by allocating new strings and arrays for every iteration. By replacing it with a zero-allocation fast-path using `.charCodeAt()`, we skip these memory allocations.
**Action:** When parsing known fixed-format strings (like dates) inside hot loops, use `.charCodeAt()` to extract the numeric values instead of `split()` or Regex. Ensure you validate that the extracted characters are actually digits (ASCII 48-57) to prevent malformed data from computing into valid results.
