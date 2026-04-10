## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).

## 2024-05-18 - Avoid Date object allocation in hot rendering loops
**Learning:** Instantiating multiple `new Date()` objects inside React `.map()` loops (like generating calendar days) causes significant allocation overhead. Using `.toISOString().split('T')[0]` for simple `YYYY-MM-DD` formatting is also extremely slow compared to manual string concatenation.
**Action:** Extract invariant date calculations (like current month/year) outside the render loop. Build `YYYY-MM-DD` strings using `.padStart()` and string concatenation instead of `new Date(...).toISOString()`.
