/**
 * @file components/ui/ReactiveBackground.tsx
 * @description State-aware animated mesh background with urgency indicators
 * @changelog
 * - 2024-12-11: Initial implementation with particles and pulse effects
 */

'use client';

import React, { useEffect, useRef, useMemo } from 'react';

interface ReactiveBackgroundProps {
    urgencyLevel?: 'calm' | 'normal' | 'active' | 'urgent';
    particleCount?: number;
}

// Particle type for the floating particles
interface Particle {
    id: number;
    left: number;
    top: number;
    size: number;
    baseDuration: number;
    delay: number;
    opacity: number;
}

// Urgency-based animation speeds
const urgencyConfig = {
    calm: { speed: 0.5, saturation: 80, pulse: false },
    normal: { speed: 1, saturation: 100, pulse: false },
    active: { speed: 1.5, saturation: 110, pulse: true },
    urgent: { speed: 2.5, saturation: 130, pulse: true },
};

// Generate particles once - seed-based for consistency
function generateParticles(count: number): Particle[] {
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        left: ((i * 17 + 7) % 100),
        top: ((i * 23 + 11) % 100),
        size: 2 + ((i * 13) % 4),
        baseDuration: 4 + ((i * 7) % 4),
        delay: (i * 11) % 5,
        opacity: 0.1 + ((i * 19) % 15) / 100,
    }));
}

export function ReactiveBackground({
    urgencyLevel = 'normal',
    particleCount = 20
}: ReactiveBackgroundProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const gradientRef = useRef<HTMLDivElement>(null);
    const requestRef = useRef<number>();

    const config = urgencyConfig[urgencyLevel];

    // Track mouse for parallax effect - Optimized to avoid re-renders
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (requestRef.current) return;

            requestRef.current = requestAnimationFrame(() => {
                if (!gradientRef.current) return;

                const x = e.clientX / window.innerWidth;
                const y = e.clientY / window.innerHeight;

                const grad1X = 50 + (x - 0.5) * 20;
                const grad1Y = 50 + (y - 0.5) * 20;

                const grad2X = 70 - (x - 0.5) * 15;
                const grad2Y = 80 - (y - 0.5) * 15;

                gradientRef.current.style.background = `
                    radial-gradient(
                      ellipse 150% 100% at ${grad1X}% ${grad1Y}%,
                      hsla(158, 60%, 30%, 0.3) 0%,
                      transparent 60%
                    ),
                    radial-gradient(
                      ellipse 100% 150% at ${grad2X}% ${grad2Y}%,
                      hsla(255, 40%, 35%, 0.25) 0%,
                      transparent 50%
                    )
                `;

                requestRef.current = undefined;
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    // Generate stable particles using useMemo instead of useEffect+setState
    const particles = useMemo(() => generateParticles(particleCount), [particleCount]);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 pointer-events-none overflow-hidden z-[-1]"
            style={{
                background: `linear-gradient(
          135deg,
          hsl(158, 60%, 14%) 0%,
          hsl(235, 30%, 24%) 100%
        )`,
                filter: `saturate(${config.saturation}%)`,
                transition: 'filter 0.5s ease',
            }}
        >
            {/* Animated Mesh Gradient Layer */}
            <div
                ref={gradientRef}
                className="absolute inset-0"
                style={{
                    background: `
            radial-gradient(
              ellipse 150% 100% at 50% 50%,
              hsla(158, 60%, 30%, 0.3) 0%,
              transparent 60%
            ),
            radial-gradient(
              ellipse 100% 150% at 70% 80%,
              hsla(255, 40%, 35%, 0.25) 0%,
              transparent 50%
            )
          `,
                    transition: 'background 0.15s ease-out',
                    animation: config.pulse ? 'mesh-pulse 2s ease-in-out infinite' : 'none',
                }}
            />

            {/* Floating Particles */}
            {particles.map((p: Particle) => (
                <div
                    key={p.id}
                    className="absolute rounded-full"
                    style={{
                        left: `${p.left}%`,
                        top: `${p.top}%`,
                        width: p.size,
                        height: p.size,
                        background: `rgba(255, 255, 255, ${p.opacity})`,
                        animation: `float ${p.baseDuration / config.speed}s ease-in-out ${p.delay}s infinite`,
                        boxShadow: `0 0 ${p.size * 2}px rgba(255, 255, 255, ${p.opacity * 0.5})`,
                    }}
                />
            ))}

            {/* Urgency Pulse Ring */}
            {config.pulse && (
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{
                        width: 200,
                        height: 200,
                        border: '2px solid rgba(255, 100, 100, 0.3)',
                        animation: 'urgency-pulse 2s ease-out infinite',
                    }}
                />
            )}

            {/* CSS for animations */}
            <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-15px) translateX(5px); }
          50% { transform: translateY(-5px) translateX(-5px); }
          75% { transform: translateY(-20px) translateX(3px); }
        }
        
        @keyframes mesh-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        @keyframes urgency-pulse {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
          100% { transform: translate(-50%, -50%) scale(4); opacity: 0; }
        }
      `}</style>
        </div>
    );
}
