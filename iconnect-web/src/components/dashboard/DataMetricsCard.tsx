/**
 * @file components/dashboard/DataMetricsCard.tsx
 * @description Data Metrics Dashboard component - 50/50 layout with animated GP hover
 * @changelog
 * - 2025-12-17: Initial implementation (TDD GREEN phase)
 * - 2025-12-17: Fixed layout - 50% Total + 50% Block breakdown, dark theme
 * - 2025-12-17: Added animated GP hover modal with lazy loading and progress bars
 * - 2024-05-20: Performance optimization - Memoized BlockItem and callbacks to prevent unnecessary re-renders
 */

'use client';

import React, { useState, useEffect, useCallback, memo } from 'react';
import { Database, Users, ChevronRight, Loader2, AlertCircle, BarChart3, MapPin } from 'lucide-react';
import { fetchConstituentMetrics, fetchGPMetricsForBlock, ConstituentMetrics, BlockMetric, GPMetric } from '@/lib/services/metrics';

export default function DataMetricsCard() {
    const [metrics, setMetrics] = useState<ConstituentMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);
    const [gpData, setGpData] = useState<Record<string, GPMetric[]>>({});
    const [gpLoading, setGpLoading] = useState<Record<string, boolean>>({});

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

    // Lazy load GP data on hover
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

    // Optimize: Memoize event handlers
    const handleBlockHover = useCallback((blockName: string) => {
        setHoveredBlock(blockName);
        loadGPData(blockName);
    }, [loadGPData]);

    const handleBlockLeave = useCallback(() => {
        setHoveredBlock(null);
    }, []);

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
            {/* LEFT: Dynamic Info Card (50%) */}
            {/* Changes based on hover state */}
            <div className="glass-card-light p-6 rounded-2xl transition-all duration-300 relative overflow-hidden">
                {hoveredBlock ? (
                    // BLOCK DETAILS VIEW
                    <div className="animate-fade-in space-y-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                                <MapPin className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white">
                                    {hoveredBlock} Breakdown
                                </h3>
                                <p className="text-xs text-white/50">
                                    Gram Panchayat Stats
                                </p>
                            </div>
                        </div>

                        {gpLoading[hoveredBlock] ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-3 text-white/50">
                                <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                                <span className="text-sm">Fetching GP data...</span>
                            </div>
                        ) : gpData[hoveredBlock]?.length === 0 ? (
                            <div className="py-12 text-center text-white/40 text-sm">
                                No GP data available for {hoveredBlock}
                            </div>
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
                    </div>
                ) : (
                    // DEFAULT TOTAL VIEW
                    <div className="animate-fade-in">
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
                )}
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
                            Hover list to see GP details
                        </p>
                    </div>
                </div>

                {/* Block List */}
                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                    {metrics.blocks.map((block) => (
                        <BlockItem
                            key={block.name}
                            block={block}
                            total={metrics.total}
                            isHovered={hoveredBlock === block.name}
                            onHover={handleBlockHover}
                            onLeave={handleBlockLeave}
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
    onHover: (name: string) => void;
    onLeave: () => void;
}

// Optimize: React.memo to prevent re-rendering all blocks when one is hovered
const BlockItem = memo(function BlockItem({ block, total, isHovered, onHover, onLeave }: BlockItemProps) {
    const percentage = total > 0 ? Math.round((block.count / total) * 100) : 0;

    return (
        <div
            data-testid={`block-${block.name}`}
            className={`
                p-3 rounded-xl transition-all cursor-pointer relative overflow-hidden group
                ${isHovered
                    ? 'bg-emerald-500/10 ring-1 ring-emerald-500/30 translate-x-1'
                    : 'bg-white/5 hover:bg-white/10'
                }
            `}
            onMouseEnter={() => onHover(block.name)}
            onMouseLeave={onLeave}
        >
            {/* Progress bar background */}
            <div
                className="absolute inset-0 bg-emerald-500/5 transition-all duration-500"
                style={{ width: `${percentage}%` }}
            />

            <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Users className={`w-4 h-4 transition-colors ${isHovered ? 'text-emerald-400' : 'text-white/40'}`} />
                    <span className={`font-medium transition-colors ${isHovered ? 'text-emerald-300' : 'text-white'}`}>
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
                    <ChevronRight
                        className={`w-4 h-4 text-white/40 transition-transform duration-300 ${isHovered ? 'rotate-90 text-emerald-400' : ''
                            }`}
                    />
                </div>
            </div>
        </div>
    );
});

interface GPProgressBarProps {
    gp: GPMetric;
    maxCount: number;
    delay: number;
    index: number;
}

// Beautiful multi-color palette for GP bars
const GP_BAR_COLORS = [
    { from: '#818CF8', to: '#6366F1', shadow: 'rgba(99, 102, 241, 0.5)' },   // Indigo (Primary for Detail View)
    { from: '#10B981', to: '#34D399', shadow: 'rgba(16, 185, 129, 0.5)' },   // Emerald
    { from: '#F59E0B', to: '#FBBF24', shadow: 'rgba(245, 158, 11, 0.5)' },   // Amber
    { from: '#EC4899', to: '#F472B6', shadow: 'rgba(236, 72, 153, 0.5)' },   // Pink
    { from: '#8B5CF6', to: '#A78BFA', shadow: 'rgba(139, 92, 246, 0.5)' },   // Violet
    { from: '#14B8A6', to: '#2DD4BF', shadow: 'rgba(20, 184, 166, 0.5)' },   // Teal
    { from: '#F97316', to: '#FB923C', shadow: 'rgba(249, 115, 22, 0.5)' },   // Orange
    { from: '#06B6D4', to: '#22D3EE', shadow: 'rgba(6, 182, 212, 0.5)' },    // Cyan
];

function GPProgressBar({ gp, maxCount, delay, index }: GPProgressBarProps) {
    const [animatedWidth, setAnimatedWidth] = useState(0);
    const percentage = maxCount > 0 ? (gp.count / maxCount) * 100 : 0;
    const colorScheme = GP_BAR_COLORS[index % GP_BAR_COLORS.length];

    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimatedWidth(percentage);
        }, delay);
        return () => clearTimeout(timer);
    }, [percentage, delay]);

    return (
        <div className="group">
            <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-white/80 font-medium truncate max-w-[70%]">
                    {gp.name}
                </span>
                <span
                    className="text-sm font-bold tabular-nums"
                    style={{ color: colorScheme.from }}
                >
                    {gp.count.toLocaleString()}
                </span>
            </div>
            <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                        width: `${animatedWidth}%`,
                        background: `linear-gradient(90deg, ${colorScheme.from}, ${colorScheme.to})`,
                        boxShadow: `0 0 12px ${colorScheme.shadow}`
                    }}
                />
            </div>
        </div>
    );
}
