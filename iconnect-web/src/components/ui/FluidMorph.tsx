/**
 * @file components/ui/FluidMorph.tsx
 * @description Fluid morphing container for smooth element transitions
 * @changelog
 * - 2024-12-11: Initial implementation with FLIP animation technique
 */

'use client';

import React, { ReactNode, useRef, useState, useLayoutEffect } from 'react';

interface FluidMorphProps {
    children: ReactNode;
    id: string; // Unique ID for tracking element across states
    className?: string;
    duration?: number; // Animation duration in ms
}

interface Position {
    x: number;
    y: number;
    width: number;
    height: number;
}

// Store for tracking element positions across renders
const positionStore: Map<string, Position> = new Map();

export function FluidMorph({
    children,
    id,
    className = '',
    duration = 400,
}: FluidMorphProps) {
    const elementRef = useRef<HTMLDivElement>(null);
    const [isAnimating, setIsAnimating] = useState(false);

    useLayoutEffect(() => {
        if (!elementRef.current) return;

        const element = elementRef.current;
        const rect = element.getBoundingClientRect();
        const currentPos: Position = {
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height,
        };

        const previousPos = positionStore.get(id);

        if (previousPos) {
            // Calculate the difference (FLIP - First, Last, Invert, Play)
            const deltaX = previousPos.x - currentPos.x;
            const deltaY = previousPos.y - currentPos.y;
            const scaleX = previousPos.width / currentPos.width;
            const scaleY = previousPos.height / currentPos.height;

            // Only animate if there's significant change
            // Only animate if there's significant change
            if (Math.abs(deltaX) > 1 || Math.abs(deltaY) > 1 || Math.abs(scaleX - 1) > 0.01 || Math.abs(scaleY - 1) > 0.01) {
                // Use a ref or standard animation loop instead of state if possible, 
                // but if we need state, wrap in rAF to avoid sync render issues
                requestAnimationFrame(() => setIsAnimating(true));

                // Apply inverse transform (snap to previous position)
                element.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`;
                element.style.transformOrigin = 'top left';

                // Force reflow
                element.offsetHeight;

                // Animate to final position
                element.style.transition = `transform ${duration}ms cubic-bezier(0.2, 0.8, 0.2, 1)`;
                element.style.transform = 'translate(0, 0) scale(1, 1)';

                // Cleanup after animation
                const cleanup = setTimeout(() => {
                    element.style.transition = '';
                    element.style.transform = '';
                    element.style.transformOrigin = '';
                    setIsAnimating(false);
                }, duration);

                return () => clearTimeout(cleanup);
            }
        }

        // Store current position for next render
        positionStore.set(id, currentPos);
    });

    return (
        <div
            ref={elementRef}
            className={`will-change-transform ${className}`}
            style={{
                backfaceVisibility: 'hidden',
            }}
        >
            {children}
        </div>
    );
}

/**
 * Clear position store for a specific ID (useful on unmount)
 */
export function clearFluidMorphPosition(id: string) {
    positionStore.delete(id);
}

/**
 * Clear all stored positions
 */
export function clearAllFluidMorphPositions() {
    positionStore.clear();
}
