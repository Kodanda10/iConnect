## 2024-05-20 - Date Parsing in Hot Loops
**Learning:** In Cloud Functions with potentially thousands of iterations (like iterating over all constituents), repeated `new Date(string)` calls are significantly expensive.
**Action:** When comparing dates in a loop, parse the target date once outside the loop. If the source data is a string (e.g. YYYY-MM-DD), consider parsing it once into lightweight components (month/day integers) or ensure the `new Date()` call happens only once per item, not multiple times for different comparisons (e.g. against today vs tomorrow).
## 2024-12-28 - Fast Local Date Formatting
**Learning:** Using `new Date(...).toISOString().split('T')[0]` to format local dates as strings is inefficient and prone to UTC off-by-one timezone bugs, especially when done inside a render loop (like GlassCalendar).
**Action:** Always format local date strings by directly concatenating date getters (`.getFullYear()`, `.getMonth() + 1`, `.getDate()`) with `.padStart(2, '0')`.
