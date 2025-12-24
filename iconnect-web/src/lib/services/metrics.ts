/**
 * @file lib/services/metrics.ts
 * @description Firestore service for constituent metrics aggregation
 * @changelog
 * - 2025-12-17: Initial implementation for Data Metrics Dashboard (TDD GREEN phase)
 * - 2025-05-21: Added in-memory caching to reduce Firestore reads (Bolt optimization)
 */

import {
    collection,
    query,
    where,
    getDocs,
} from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 50; // Prevent memory leaks

interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

// Module-level cache
let constituentMetricsCache: CacheEntry<ConstituentMetrics> | null = null;
let gpMetricsCache: Record<string, CacheEntry<GPMetric[]>> = {};

/**
 * Clears the in-memory cache.
 * Useful for testing or forcing a refresh.
 */
export function clearMetricsCache() {
    constituentMetricsCache = null;
    gpMetricsCache = {};
}

export interface BlockMetric {
    name: string;
    count: number;
    gps: GPMetric[];
}

export interface GPMetric {
    name: string;
    count: number;
}

export interface ConstituentMetrics {
    total: number;
    blocks: BlockMetric[];
}

/**
 * Fetch constituent metrics with block-wise breakdown
 * Optimized for dashboard display with aggregation
 */
export async function fetchConstituentMetrics(): Promise<ConstituentMetrics> {
    // Check cache
    const now = Date.now();
    if (constituentMetricsCache && (now - constituentMetricsCache.timestamp < CACHE_TTL)) {
        console.log('[Metrics] Returning cached constituent metrics');
        return constituentMetricsCache.data;
    }

    const db = getFirebaseDb();
    const constituentsRef = collection(db, 'constituents');

    try {
        // Get all constituents to calculate block breakdown
        // Note: For large datasets, consider Cloud Functions aggregation
        const snapshot = await getDocs(constituentsRef);

        // Optimization: Use snapshot.size instead of separate getCountFromServer call
        const total = snapshot.size;
        console.log('[Metrics] Docs fetched:', total);

        // Group by block
        const blockCounts: Record<string, number> = {};

        snapshot.forEach((doc) => {
            const data = doc.data();
            const block = data.block || 'Unknown';
            blockCounts[block] = (blockCounts[block] || 0) + 1;
        });

        console.log('[Metrics] Block counts:', blockCounts);

        // Convert to array format
        const blocks: BlockMetric[] = Object.entries(blockCounts).map(([name, count]) => ({
            name,
            count,
            gps: [], // GPs loaded on-demand when block is clicked/hovered
        }));

        // Sort by count descending
        blocks.sort((a, b) => b.count - a.count);

        const result = { total, blocks };

        // Update cache
        constituentMetricsCache = {
            data: result,
            timestamp: now
        };

        return result;
    } catch (error) {
        console.error('[Metrics] Error fetching metrics:', error);
        throw error;
    }
}

/**
 * Fetch GP breakdown for a specific block
 * Called when user hovers/clicks on a block
 */
export async function fetchGPMetricsForBlock(blockName: string): Promise<GPMetric[]> {
    // Check cache
    const now = Date.now();
    const cached = gpMetricsCache[blockName];
    if (cached && (now - cached.timestamp < CACHE_TTL)) {
        console.log(`[Metrics] Returning cached GP metrics for block: ${blockName}`);
        return cached.data;
    }

    const db = getFirebaseDb();
    const constituentsRef = collection(db, 'constituents');

    // Query constituents in this block
    const q = query(constituentsRef, where('block', '==', blockName));
    const snapshot = await getDocs(q);

    // Group by GP
    const gpCounts: Record<string, number> = {};

    snapshot.forEach((doc) => {
        const data = doc.data();
        // Schema Alignment: Prefer gpUlb (new), fallback to gp_ulb (legacy)
        const gp = data.gpUlb || data.gp_ulb || 'Unknown';
        gpCounts[gp] = (gpCounts[gp] || 0) + 1;
    });

    // Convert to array format
    const gps: GPMetric[] = Object.entries(gpCounts).map(([name, count]) => ({
        name,
        count,
    }));

    // Sort by count descending
    gps.sort((a, b) => b.count - a.count);

    // Cache maintenance: simple eviction if too large
    if (Object.keys(gpMetricsCache).length >= MAX_CACHE_SIZE) {
        gpMetricsCache = {}; // Clear all if full (simple strategy)
    }

    // Update cache
    gpMetricsCache[blockName] = {
        data: gps,
        timestamp: now
    };

    return gps;
}
