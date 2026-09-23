1. filepath: iconnect-web/src/components/dashboard/DataMetricsCard.tsx
```<<<<<<< SEARCH
import React, { useState, useEffect, useCallback } from 'react';
import { Database, Users, ChevronRight, Loader2, AlertCircle, BarChart3, MapPin } from 'lucide-react';
=======
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Database, Users, ChevronRight, Loader2, AlertCircle, BarChart3, MapPin } from 'lucide-react';
>>>>>>> REPLACE
<<<<<<< SEARCH
    const loadGPData = useCallback(async (blockName: string) => {
        if (gpData[blockName] || gpLoading[blockName]) return;

        setGpLoading(prev => ({ ...prev, [blockName]: true }));
        try {
            const gps = await fetchGPMetricsForBlock(blockName);
            setGpData(prev => ({ ...prev, [blockName]: gps }));
        } catch (err) {
            console.error('Error loading GP data:', err);
        } finally {
            setGpLoading(prev => ({ ...prev, [blockName]: false }));
        }
    }, [gpData, gpLoading]);

    const handleBlockHover = (blockName: string) => {
        setHoveredBlock(blockName);
        loadGPData(blockName);
    };

    // Loading state
    if (loading) {
=======
    const loadGPData = useCallback(async (blockName: string) => {
        if (gpData[blockName] || gpLoading[blockName]) return;

        setGpLoading(prev => ({ ...prev, [blockName]: true }));
        try {
            const gps = await fetchGPMetricsForBlock(blockName);
            setGpData(prev => ({ ...prev, [blockName]: gps }));
        } catch (err) {
            console.error('Error loading GP data:', err);
        } finally {
            setGpLoading(prev => ({ ...prev, [blockName]: false }));
        }
    }, [gpData, gpLoading]);

    const handleBlockHover = (blockName: string) => {
        setHoveredBlock(blockName);
        loadGPData(blockName);
    };

    // Memoize the max count to prevent O(N²) recalculations
    const maxCount = useMemo(() => {
        if (!hoveredBlock || !gpData[hoveredBlock]) return 1;
        return Math.max(...gpData[hoveredBlock].map(g => g.count), 1);
    }, [gpData, hoveredBlock]);

    // Loading state
    if (loading) {
>>>>>>> REPLACE
<<<<<<< SEARCH
                        ) : (
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
                        )}
=======
                        ) : (
                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {(gpData[hoveredBlock] || []).map((gp, index) => (
                                    <GPProgressBar
                                        key={gp.name}
                                        gp={gp}
                                        maxCount={maxCount}
                                        delay={index * 50}
                                        index={index}
                                    />
                                ))}
                            </div>
                        )}
>>>>>>> REPLACE```
2. git diff --cached iconnect-web/src/components/dashboard/DataMetricsCard.tsx
3. cat << 'EOF' >> .jules/bolt.md
## 2025-01-20 - Memoizing Aggregate Calculations in Render Loops
**Learning:** Performing aggregate calculations like `Math.max` directly inside a `.map()` render loop leads to O(N²) complexity and unnecessary re-renders. In Next.js components, inserting a `useMemo` conditionally or after early returns can cause hook errors.
**Action:** Extract expensive aggregate calculations from render loops and cache them using `useMemo` at the top level of the component, before any conditional early returns.
