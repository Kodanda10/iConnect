## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2025-12-17 - Optimize O(N²) complexity in map loops
**Learning:** Performing aggregate operations like Math.max() directly inside .map() render loops creates an O(N²) complexity anti-pattern that can block the main thread, specifically observed in DataMetricsCard.
**Action:** Always extract and memoize aggregate array calculations using useMemo before mapping over lists to ensure O(N) rendering.
