## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2025-07-31 - O(N^2) Math.max calculation in render loops
**Learning:** Found a performance bottleneck where `Math.max` over an entire array was being recalculated inside a `.map()` function within a React component render `maxCount={Math.max(...(gpData[hoveredBlock] || []).map(g => g.count), 1)}`. This caused an O(N^2) operation during rendering, unnecessarily recalculating the maximum count N times for an N-element array.
**Action:** When calculating derived aggregate data for child components in a list (like the maximum value for progress bars), calculate it once outside the loop and pass it down, or use `useMemo` to memoize it.
