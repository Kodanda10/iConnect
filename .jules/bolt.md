## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2024-07-24 - Calendar Grid Render Bottleneck
**Learning:** Date parsing in nested loops (e.g., rendering a calendar matrix across 1000 constituents) causes severe performance drops. Repeatedly calling new Date() on stored date strings like YYYY-MM-DD in React render functions is surprisingly expensive.
**Action:** For simple matches (e.g. comparing month/day), use padded strings and .endsWith() or exact string matches against standard ISO date formats to completely avoid new Date() instantiation in hot paths.
