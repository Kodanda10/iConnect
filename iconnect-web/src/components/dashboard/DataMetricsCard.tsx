/**
 * @file components/dashboard/DataMetricsCard.tsx
 * @description Data Metrics Dashboard component showing constituent counts
 * @changelog
 * - 2025-12-17: Initial implementation (TDD GREEN phase)
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Database, Users, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { fetchConstituentMetrics, ConstituentMetrics, BlockMetric } from '@/lib/services/metrics';

export default function DataMetricsCard() {
    const [metrics, setMetrics] = useState<ConstituentMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);

    useEffect(() => {
        loadMetrics();
    }, []);

    const loadMetrics = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchConstituentMetrics();
            setMetrics(data);
        } catch (err) {
            setError('Failed to load metrics');
            console.error('Error fetching metrics:', err);
        } finally {
            setLoading(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div
                data-testid="metrics-loading"
                className="glass-card-light p-6 rounded-2xl animate-pulse"
            >
                <div className="flex items-center gap-3 mb-6">
                    <Loader2 className="w-6 h-6 animate-spin text-[var(--color-primary)]" />
                    <span className="text-[var(--color-text-secondary)]">Loading metrics...</span>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="glass-card-light p-6 rounded-2xl border border-red-500/20">
                <div className="flex items-center gap-3 text-red-500">
                    <AlertCircle className="w-6 h-6" />
                    <span>Error loading metrics</span>
                </div>
            </div>
        );
    }

    // No data state
    if (!metrics) {
        return null;
    }

    return (
        <div className="glass-card-light p-6 rounded-2xl">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                    <Database className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="font-bold text-[var(--color-text-primary)]">
                        Data Metrics
                    </h3>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                        Constituent database overview
                    </p>
                </div>
            </div>

            {/* Total Count - Prominent Display */}
            <div className="mb-6 p-4 bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10 rounded-xl">
                <p className="text-xs text-[var(--color-text-secondary)] mb-1">
                    Total Constituents
                </p>
                <p
                    data-testid="total-count"
                    className="text-4xl font-bold text-[var(--color-text-primary)]"
                >
                    {metrics.total.toLocaleString()}
                </p>
            </div>

            {/* Block-wise Breakdown */}
            <div>
                <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-3">
                    Block-wise Breakdown
                </p>
                <div className="space-y-2">
                    {metrics.blocks.map((block) => (
                        <BlockItem
                            key={block.name}
                            block={block}
                            isHovered={hoveredBlock === block.name}
                            onMouseEnter={() => setHoveredBlock(block.name)}
                            onMouseLeave={() => setHoveredBlock(null)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

interface BlockItemProps {
    block: BlockMetric;
    isHovered: boolean;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}

function BlockItem({ block, isHovered, onMouseEnter, onMouseLeave }: BlockItemProps) {
    return (
        <div
            data-testid={`block-${block.name}`}
            className={`
                p-3 rounded-xl transition-all cursor-pointer
                ${isHovered
                    ? 'bg-[var(--color-primary)]/10 ring-1 ring-[var(--color-primary)]/30'
                    : 'bg-black/5 hover:bg-black/10'
                }
            `}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[var(--color-text-secondary)]" />
                    <span className="font-medium text-[var(--color-text-primary)]">
                        {block.name}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[var(--color-primary)]">
                        {block.count.toLocaleString()}
                    </span>
                    {block.gps.length > 0 && (
                        <ChevronRight
                            className={`w-4 h-4 text-[var(--color-text-secondary)] transition-transform ${isHovered ? 'rotate-90' : ''
                                }`}
                        />
                    )}
                </div>
            </div>

            {/* GP Dropdown on Hover */}
            {isHovered && block.gps.length > 0 && (
                <div className="mt-3 pt-3 border-t border-black/10 space-y-1 animate-fade-in">
                    {block.gps.map((gp) => (
                        <div
                            key={gp.name}
                            className="flex items-center justify-between py-1 px-2 rounded hover:bg-black/5"
                        >
                            <span className="text-sm text-[var(--color-text-secondary)]">
                                {gp.name}
                            </span>
                            <span className="text-sm font-medium text-[var(--color-text-primary)]">
                                {gp.count.toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
