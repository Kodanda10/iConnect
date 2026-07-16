## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2025-12-17 - Fix O(n²) rendering bottleneck in DataMetricsCard
**Learning:** Found an O(n²) performance bottleneck in `DataMetricsCard.tsx` where `Math.max(...array.map())` was executed inside the `array.map()` render loop, causing the calculation to run $n$ times unnecessarily on every render.
**Action:** Always extract invariant array calculations (like finding the maximum value) outside of render loops using `useMemo` to evaluate them only once when the dependencies change, ensuring O(n) rendering complexity instead.
