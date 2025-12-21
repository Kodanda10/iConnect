/**
 * @file lib/services/metrics.ts
 * @description Firestore service for constituent metrics aggregation
 * @changelog
 * - 2025-12-17: Initial implementation for Data Metrics Dashboard (TDD GREEN phase)
 * - 2024-05-24: Added in-memory caching to reduce Firestore reads (Bolt Optimization)
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

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

// Module-level cache
let constituentMetricsCache: CacheEntry<ConstituentMetrics> | null = null;
const gpMetricsCache: Record<string, CacheEntry<GPMetric[]>> = {};

/**
 * Fetch constituent metrics with block-wise breakdown
 * Optimized for dashboard display with aggregation
 */
export async function fetchConstituentMetrics(): Promise<ConstituentMetrics> {
    const now = Date.now();

    // Check cache
    if (constituentMetricsCache && (now - constituentMetricsCache.timestamp < CACHE_TTL)) {
        console.log('[Metrics] Returning cached constituent metrics');
        return constituentMetricsCache.data;
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
        constituentMetricsCache = {
            data: result,
            timestamp: now,
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
    const now = Date.now();

    // Check cache
    if (gpMetricsCache[blockName] && (now - gpMetricsCache[blockName].timestamp < CACHE_TTL)) {
        // console.log(`[Metrics] Returning cached GP metrics for ${blockName}`);
        return gpMetricsCache[blockName].data;
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
    gpMetricsCache[blockName] = {
        data: gps,
        timestamp: now,
    };

    return gps;
}
