## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2025-01-20 - Expensive array mapping logic in React components
**Learning:** Performing `Math.max` on a mapped array inside a React component's return statement results in an O(N²) rendering complexity and causes main thread blocking during active user interactions like hovers.
**Action:** Extract expensive or nested iteration operations to a `useMemo` hook to calculate the value only when the dependencies change, ensuring O(N) complexity and preserving layout responsiveness.
