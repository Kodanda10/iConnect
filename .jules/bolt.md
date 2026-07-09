## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2024-05-20 - Substring vs Split for Date Parsing
**Learning:** Even simple string splits (`dateStr.split('-')`) allocate arrays. Inside O(N) loops running thousands of times, this causes significant GC pressure and slowdowns. Benchmarking showed `substring` extraction is ~3x faster than `split` for parsing fixed-format dates like YYYY-MM-DD.
**Action:** Always prefer `substring` or char code extraction over `split` for extracting parts of predictably formatted strings in hot paths.
