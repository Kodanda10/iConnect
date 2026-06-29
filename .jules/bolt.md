## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2026-06-29 - Fix O(N^2) render loop in GP progress bars
**Learning:** Performing array aggregations like Math.max() directly inside a React .map() loop creates an O(N^2) operation on every render, as the entire array is iterated to find the max for every single element being rendered.
**Action:** Always extract array-wide aggregations (like finding min/max/sum) to the component level, outside of the render loops, to compute them exactly once per render in O(N) time.
