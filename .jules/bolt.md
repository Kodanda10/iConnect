## 2024-05-01 - O(N²) array lookups in Cloud Functions
**Learning:** Nested array searches and repeated Date formatting in hot loops cause severe performance bottlenecks.
**Action:** Pre-compute reference data into Sets with composite keys for O(1) lookups and hoist date string extraction outside the loop.
