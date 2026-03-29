## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2025-01-28 - Optimizing Computations Inside React Array Maps
**Learning:** In React components rendering lists (e.g. `DataMetricsCard`), computing aggregate values like `Math.max` over an entire array *inside* the `.map` function that iterates over the same array causes an `O(N²)` performance bottleneck.
**Action:** Extract expensive computations like finding the maximum value over an array outside the `.map()` loop, store the result in a variable, and pass it down as a prop. Additionally, wrap child list items in `React.memo` and pass stable IDs instead of inline anonymous functions for event handlers to prevent redundant re-renders.
