/**
 * @file components/ui/ParallaxCard.tsx
 * @description Gyroscopic/cursor-aware 3D parallax card with depth effect
 * @changelog
 * - 2024-12-11: Initial implementation with mouse tracking and spring physics
 */

'use client';

import React, { useRef, useState, useEffect, ReactNode } from 'react';

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
    const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0, scale: 1 });
    const [glowPosition, setGlowPosition] = useState({ x: 50, y: 50 });
    const [isHovering, setIsHovering] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;

        const rect = cardRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Calculate rotation based on mouse position relative to center
        const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * intensity;
        const rotateX = ((centerY - e.clientY) / (rect.height / 2)) * intensity;

        // Calculate glow position (0-100%)
        const glowX = ((e.clientX - rect.left) / rect.width) * 100;
        const glowY = ((e.clientY - rect.top) / rect.height) * 100;

        setTransform({ rotateX, rotateY, scale: 1.02 });
        setGlowPosition({ x: glowX, y: glowY });
    };

    const handleMouseLeave = () => {
        setIsHovering(false);
        setTransform({ rotateX: 0, rotateY: 0, scale: 1 });
        setGlowPosition({ x: 50, y: 50 });
    };

    const handleMouseEnter = () => {
        setIsHovering(true);
    };

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
                className="relative w-full h-full"
                style={{
                    transform: `
            perspective(1000px)
            rotateX(${transform.rotateX}deg)
            rotateY(${transform.rotateY}deg)
            scale(${transform.scale})
          `,
                    transition: isHovering
                        ? 'transform 0.1s ease-out'
                        : 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
                    transformStyle: 'preserve-3d',
                }}
            >
                {/* Glow effect that follows cursor */}
                <div
                    className="absolute inset-0 rounded-inherit pointer-events-none"
                    style={{
                        background: `radial-gradient(
              600px circle at ${glowPosition.x}% ${glowPosition.y}%,
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
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: `linear-gradient(
              ${105 + transform.rotateY}deg,
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
