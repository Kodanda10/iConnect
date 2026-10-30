## 2024-12-16 - Date Instantiations in Hot Render Loops
**Learning:** Found redundant `new Date()` allocations inside a hot loop (like calendar day cells). Relying on `.toISOString().split('T')[0]` causes both performance overhead and subtle timezone bugs (e.g., UTC off-by-one errors) in local date strings.
**Action:** When rendering calendars or grids, pre-calculate constant parts of the date (year, month) outside the loop and use fast, timezone-safe manual string concatenation (`String().padStart`) instead of `new Date(...).toISOString()`.
