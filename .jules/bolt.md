## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2026-06-28 - Pre-calculate values outside nested loops
**Learning:** Calling `Math.max(...array.map(item => item.property))` inside a React `array.map()` loop recalculates the maximum for every single rendered element. This forces (n^2)$ iteration over the exact same array, causing significant main thread blockage and UI freezing for large datasets.
**Action:** Always pre-calculate aggregate or maximum values outside the loop. In React JSX, you can wrap the calculation and iteration in an IIFE (Immediately Invoked Function Expression) `{(() => { const max = ...; return array.map(...); })()}` to keep the mapping context clean while correctly hoisting the calculation to (n)$ time.
