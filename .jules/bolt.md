## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2025-05-21 - String Suffix Matching for Date Comparisons
**Learning:** When comparing YYYY-MM-DD date strings against a target month/day in a hot loop (e.g., millions of checks), `split('-')` and `parseInt()` are relatively slow. Using `endsWith('-MM-DD')` is approximately 20x faster.
**Action:** Pre-calculate the target suffix string (e.g., `"-12-25"`) outside the loop. Inside the loop, check `if (dateStr.length === 10 && dateStr.endsWith(suffix))`. Always include the length check to avoid false positives (e.g. `2023-1-12` matching `-12`) if strict format isn't guaranteed.
