## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2024-08-20 - Prevent O(N²) complexity in loops
**Learning:** Performing aggregate calculations (like Math.max) directly inside `.map()` render loops causes unnecessary O(N²) complexity and slows down re-renders.
**Action:** Extract and cache these calculations using useMemo before conditional early returns to optimize render cycles.
