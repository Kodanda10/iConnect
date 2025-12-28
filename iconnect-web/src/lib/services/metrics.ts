/**
 * @file lib/services/metrics.ts
 * @description Firestore service for constituent metrics aggregation
 * @changelog
 * - 2025-12-17: Initial implementation for Data Metrics Dashboard (TDD GREEN phase)
 */

import {
    collection,
    query,
    where,
    getDocs,
    getCountFromServer,
} from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';

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

interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

// In-memory cache
let metricsCache: {
    constituentMetrics?: CacheEntry<ConstituentMetrics>;
    blockMetrics: Record<string, CacheEntry<GPMetric[]>>;
} = {
    blockMetrics: {}
};

/**
 * Clear the metrics cache.
 * Useful for testing or when data needs to be explicitly refreshed.
 */
export function clearMetricsCache() {
    metricsCache = {
        blockMetrics: {}
    };
}

/**
 * Fetch constituent metrics with block-wise breakdown
 * Optimized for dashboard display with aggregation
 */
export async function fetchConstituentMetrics(): Promise<ConstituentMetrics> {
    // Check cache first
    const now = Date.now();
    if (metricsCache.constituentMetrics && (now - metricsCache.constituentMetrics.timestamp < CACHE_TTL)) {
        console.log('[Metrics] Returning cached constituent metrics');
        return metricsCache.constituentMetrics.data;
    }

    const db = getFirebaseDb();
    const constituentsRef = collection(db, 'constituents');

    try {
        // Get total count using Firestore aggregation
        const countSnapshot = await getCountFromServer(constituentsRef);
        const total = countSnapshot.data().count;
        console.log('[Metrics] Total count from server:', total);

        // Get all constituents to calculate block breakdown
        // Note: For large datasets, consider Cloud Functions aggregation
        const snapshot = await getDocs(constituentsRef);
        console.log('[Metrics] Docs fetched:', snapshot.size);

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
        metricsCache.constituentMetrics = {
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
    // Check cache first
    const now = Date.now();
    const cachedBlock = metricsCache.blockMetrics[blockName];
    if (cachedBlock && (now - cachedBlock.timestamp < CACHE_TTL)) {
        console.log(`[Metrics] Returning cached metrics for block: ${blockName}`);
        return cachedBlock.data;
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

    // Update cache
    metricsCache.blockMetrics[blockName] = {
        data: gps,
        timestamp: now
    };

    return gps;
}
