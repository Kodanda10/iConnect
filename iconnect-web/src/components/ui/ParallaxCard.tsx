/**
 * @file components/ui/ParallaxCard.tsx
 * @description Gyroscopic/cursor-aware 3D parallax card with depth effect
 * @changelog
 * - 2024-12-11: Initial implementation with mouse tracking and spring physics
 * - 2024-05-22: Optimized performance by using direct DOM manipulation and requestAnimationFrame instead of React state for high-frequency updates.
 */

'use client';

import React, { useRef, useState, useCallback, ReactNode, useEffect, useLayoutEffect } from 'react';

interface ParallaxCardProps {
    children: ReactNode;
    className?: string;
    intensity?: number; // 0-20 degrees of tilt
    glowColor?: string;
}

export function ParallaxCard({
    children,
    className = '',
    intensity = 10,
    glowColor = 'rgba(0, 143, 122, 0.2)',
}: ParallaxCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const glowRef = useRef<HTMLDivElement>(null);
    const reflectionRef = useRef<HTMLDivElement>(null);
    const rafId = useRef<number | null>(null);

    const [isHovering, setIsHovering] = useState(false);

    // Initialize styles to avoid hydration mismatches or missing initial states
    useLayoutEffect(() => {
        if (contentRef.current) {
            contentRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
        }
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current || !contentRef.current) return;

        const card = cardRef.current;
        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Calculate values
        const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * intensity;
        const rotateX = ((centerY - e.clientY) / (rect.height / 2)) * intensity;
        const glowX = ((e.clientX - rect.left) / rect.width) * 100;
        const glowY = ((e.clientY - rect.top) / rect.height) * 100;

        // Schedule update
        if (rafId.current) cancelAnimationFrame(rafId.current);

        rafId.current = requestAnimationFrame(() => {
            if (contentRef.current) {
                contentRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
            }
            if (glowRef.current) {
                glowRef.current.style.background = `radial-gradient(600px circle at ${glowX}% ${glowY}%, ${glowColor}, transparent 40%)`;
            }
            if (reflectionRef.current) {
                 reflectionRef.current.style.background = `linear-gradient(${105 + rotateY}deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%)`;
            }
        });
    }, [intensity, glowColor]);

    const handleMouseLeave = useCallback(() => {
        setIsHovering(false);
        if (rafId.current) {
            cancelAnimationFrame(rafId.current);
            rafId.current = null;
        }

        // Reset styles immediately
        if (contentRef.current) {
             contentRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
        }
        if (glowRef.current) {
            glowRef.current.style.background = `radial-gradient(600px circle at 50% 50%, ${glowColor}, transparent 40%)`;
        }
        if (reflectionRef.current) {
             reflectionRef.current.style.background = `linear-gradient(105deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%)`;
        }

    }, [glowColor]);

    const handleMouseEnter = () => {
        setIsHovering(true);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (rafId.current) {
                cancelAnimationFrame(rafId.current);
            }
        };
    }, []);

    return (
        <div
            ref={cardRef}
            className={`relative transform-gpu ${className}`}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
                perspective: 1000,
                transformStyle: 'preserve-3d',
            }}
        >
            <div
                ref={contentRef}
                className="relative w-full h-full"
                style={{
                    // Initial state matching reset - kept out of JSX to prevent React overwrites
                    transition: isHovering
                        ? 'transform 0.1s ease-out'
                        : 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
                    transformStyle: 'preserve-3d',
                }}
            >
                {/* Glow effect that follows cursor */}
                <div
                    ref={glowRef}
                    className="absolute inset-0 rounded-inherit pointer-events-none"
                    style={{
                        background: `radial-gradient(
              600px circle at 50% 50%,
              ${glowColor},
              transparent 40%
            )`,
                        opacity: isHovering ? 1 : 0,
                        transition: 'opacity 0.3s ease',
                        borderRadius: 'inherit',
                    }}
                />

                {/* Card content */}
                <div className="relative z-10">{children}</div>

                {/* Reflection/depth layer */}
                <div
                    ref={reflectionRef}
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: `linear-gradient(
              105deg,
              rgba(255, 255, 255, 0.1) 0%,
              transparent 50%
            )`,
                        borderRadius: 'inherit',
                        opacity: isHovering ? 0.5 : 0,
                        transition: 'opacity 0.3s ease',
                    }}
                />
            </div>
        </div>
    );
}
