## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2025-12-17 - O(N^2) Array calculations inside React render maps
**Learning:** Found a performance trap in `DataMetricsCard.tsx` where a `Math.max(...array.map())` calculation was happening inside another `.map()` call, causing O(N^2) work on every render for hover states.
**Action:** Always pre-calculate max/min aggregate values outside of render loops before mapping over arrays to ensure O(N) complexity.
