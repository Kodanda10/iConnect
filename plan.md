1. **Import `useMemo` in `DataMetricsCard.tsx`**
    Modify `import React, { useState, useEffect, useCallback } from 'react';` to include `useMemo`.
2. **Pre-calculate `maxGpCount` using `useMemo`**
    Inside `DataMetricsCard` component (e.g. before `if (loading)` or near other memos, though there are none right now. It's safe to put it anywhere before the return statement and after hooks.):
    ```typescript
    const currentGpData = hoveredBlock ? (gpData[hoveredBlock] || []) : [];
    const maxGpCount = useMemo(() => {
        return Math.max(...currentGpData.map(g => g.count), 1);
    }, [currentGpData]);
    ```
    Actually, because `useMemo` is a hook, it must be called at the top level of the component before any conditional returns. So we will place it before the `if (loading)` statement.
3. **Update the `map` function**
    ```typescript
<<<<<<< SEARCH
                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {(gpData[hoveredBlock] || []).map((gp, index) => (
                                    <GPProgressBar
                                        key={gp.name}
                                        gp={gp}
                                        maxCount={Math.max(...(gpData[hoveredBlock] || []).map(g => g.count), 1)}
                                        delay={index * 50}
                                        index={index}
                                    />
                                ))}
                            </div>
=======
                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {currentGpData.map((gp, index) => (
                                    <GPProgressBar
                                        key={gp.name}
                                        gp={gp}
                                        maxCount={maxGpCount}
                                        delay={index * 50}
                                        index={index}
                                    />
                                ))}
                            </div>
>>>>>>> REPLACE
    ```
4. **Update `.jules/bolt.md`**
    Add the learning about computing max values inside `map` operations in React renders, leading to `O(N^2)` rendering time and how `useMemo` fixes it.

    ```markdown
    ## 2024-12-17 - O(N²) Render Loop Optimization
    **Learning:** Computing aggregate values (like `Math.max` over an array) directly inside a `.map` function during a React render causes the array to be iterated `N` times for each of the `N` elements, resulting in an `O(N²)` time complexity. This can cause significant rendering bottlenecks for large lists.
    **Action:** Always compute aggregate values outside of the `.map` loop. Use `useMemo` to cache the result based on the source array, reducing the time complexity to `O(N)` and preventing unnecessary recalculations on every render.
    ```
5. **Run tests & lint**
    - `pnpm install`
    - `pnpm lint`
    - `pnpm test`
    - `pnpm run build`
