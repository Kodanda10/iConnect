/**
 * @file components/dashboard/DataMetricsCard.tsx
 * @description Data Metrics Dashboard component - 50/50 layout
 * @changelog
 * - 2025-12-17: Initial implementation (TDD GREEN phase)
 * - 2025-12-17: Fixed layout - 50% Total + 50% Block breakdown, dark theme
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Database, Users, ChevronRight, Loader2, AlertCircle, BarChart3 } from 'lucide-react';
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
                className="glass-card-light p-6 rounded-2xl animate-pulse col-span-2"
            >
                <div className="flex items-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                    <span className="text-white/60">Loading metrics...</span>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="glass-card-light p-6 rounded-2xl border border-red-500/20 col-span-2">
                <div className="flex items-center gap-3 text-red-400">
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
        <div className="grid lg:grid-cols-2 gap-6 col-span-2">
            {/* LEFT: Total Constituents Card (50%) */}
            <div className="glass-card-light p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                        <Database className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white">
                            Total Constituents
                        </h3>
                        <p className="text-xs text-white/50">
                            Database overview
                        </p>
                    </div>
                </div>

                {/* Big Number Display */}
                <div className="flex items-end gap-4">
                    <p
                        data-testid="total-count"
                        className="text-6xl font-bold text-white tracking-tight"
                    >
                        {metrics.total.toLocaleString()}
                    </p>
                    <div className="pb-2">
                        <span className="text-emerald-400 text-sm font-medium">
                            across {metrics.blocks.length} blocks
                        </span>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl bg-white/5">
                        <p className="text-xs text-white/50 mb-1">Largest Block</p>
                        <p className="font-bold text-white">
                            {metrics.blocks[0]?.name || '-'}
                        </p>
                        <p className="text-sm text-emerald-400">
                            {metrics.blocks[0]?.count.toLocaleString() || 0}
                        </p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5">
                        <p className="text-xs text-white/50 mb-1">Average/Block</p>
                        <p className="font-bold text-white">
                            {metrics.blocks.length > 0
                                ? Math.round(metrics.total / metrics.blocks.length).toLocaleString()
                                : 0
                            }
                        </p>
                        <p className="text-sm text-white/40">constituents</p>
                    </div>
                </div>
            </div>

            {/* RIGHT: Block-wise Breakdown (50%) */}
            <div className="glass-card-light p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white">
                            Block-wise Breakdown
                        </h3>
                        <p className="text-xs text-white/50">
                            Hover for GP details
                        </p>
                    </div>
                </div>

                {/* Block List */}
                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
                    {metrics.blocks.map((block) => (
                        <BlockItem
                            key={block.name}
                            block={block}
                            total={metrics.total}
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
    total: number;
    isHovered: boolean;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}

function BlockItem({ block, total, isHovered, onMouseEnter, onMouseLeave }: BlockItemProps) {
    const percentage = total > 0 ? Math.round((block.count / total) * 100) : 0;

    return (
        <div
            data-testid={`block-${block.name}`}
            className={`
                p-3 rounded-xl transition-all cursor-pointer relative overflow-hidden
                ${isHovered
                    ? 'bg-emerald-500/10 ring-1 ring-emerald-500/30'
                    : 'bg-white/5 hover:bg-white/10'
                }
            `}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {/* Progress bar background */}
            <div
                className="absolute inset-0 bg-emerald-500/5 transition-all"
                style={{ width: `${percentage}%` }}
            />

            <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-white/40" />
                    <span className="font-medium text-white">
                        {block.name}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-emerald-400">
                        {block.count.toLocaleString()}
                    </span>
                    <span className="text-xs text-white/40 w-10 text-right">
                        {percentage}%
                    </span>
                    {block.gps.length > 0 && (
                        <ChevronRight
                            className={`w-4 h-4 text-white/40 transition-transform ${isHovered ? 'rotate-90' : ''
                                }`}
                        />
                    )}
                </div>
            </div>

            {/* GP Dropdown on Hover */}
            {isHovered && block.gps.length > 0 && (
                <div className="relative mt-3 pt-3 border-t border-white/10 space-y-1 animate-fade-in">
                    {block.gps.map((gp) => (
                        <div
                            key={gp.name}
                            className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-white/5"
                        >
                            <span className="text-sm text-white/70">
                                {gp.name}
                            </span>
                            <span className="text-sm font-medium text-emerald-400">
                                {gp.count.toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
