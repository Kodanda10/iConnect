## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2025-02-12 - Expensive Filtering in React Renders
**Learning:** React re-evaluates all variables in a functional component on every render. If data arrays are large, array functions like `filter`, `map`, and `slice` without memoization will execute constantly (e.g. typing in search inputs), leading to noticeable CPU spikes and poor UI performance.
**Action:** Always wrap derived data calculations that iterate over large arrays (like `filteredTasks`, `filteredConstituents`) in `useMemo` with correct dependency arrays to ensure the calculation only runs when underlying data or filters change.
