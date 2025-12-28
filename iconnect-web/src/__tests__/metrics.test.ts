/**
 * @file __tests__/metrics.test.ts
 * @description TDD RED PHASE - Failing tests for constituent metrics service
 * @changelog
 * - 2025-12-17: Initial TDD tests for Data Metrics Dashboard restoration
 */

// Mock Firebase modules
jest.mock('@/lib/firebase', () => ({
    getFirebaseDb: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
    collection: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    getDocs: jest.fn(),
    getCountFromServer: jest.fn(),
}));

import { fetchConstituentMetrics, fetchGPMetricsForBlock, clearMetricsCache } from '@/lib/services/metrics';
import { getFirebaseDb } from '@/lib/firebase';
import { collection, query, where, getDocs, getCountFromServer } from 'firebase/firestore';

describe('Metrics Service - Data Metrics Dashboard', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        clearMetricsCache();
    });

    describe('fetchConstituentMetrics', () => {
        it('returns total count from Firestore aggregation', async () => {
            // Arrange
            (getFirebaseDb as jest.Mock).mockReturnValue({});
            (collection as jest.Mock).mockReturnValue({});
            (getCountFromServer as jest.Mock).mockResolvedValue({
                data: () => ({ count: 1000 })
            });
            (getDocs as jest.Mock).mockResolvedValue({
                docs: [],
                forEach: jest.fn(),
            });

            // Act
            const result = await fetchConstituentMetrics();

            // Assert
            expect(result.total).toBe(1000);
        });

        it('returns block-wise breakdown with counts', async () => {
            // Arrange
            const mockBlockDocs = [
                { id: '1', data: () => ({ block: 'Block A' }) },
                { id: '2', data: () => ({ block: 'Block A' }) },
                { id: '3', data: () => ({ block: 'Block B' }) },
            ];

            (getFirebaseDb as jest.Mock).mockReturnValue({});
            (collection as jest.Mock).mockReturnValue({});
            (getCountFromServer as jest.Mock).mockResolvedValue({
                data: () => ({ count: 3 })
            });
            (getDocs as jest.Mock).mockResolvedValue({
                docs: mockBlockDocs,
                forEach: (cb: (doc: typeof mockBlockDocs[0]) => void) => mockBlockDocs.forEach(cb),
            });

            // Act
            const result = await fetchConstituentMetrics();

            // Assert
            expect(result.blocks).toHaveLength(2);
            expect(result.blocks.find(b => b.name === 'Block A')?.count).toBe(2);
            expect(result.blocks.find(b => b.name === 'Block B')?.count).toBe(1);
        });

        it('handles empty constituents collection gracefully', async () => {
            // Arrange
            (getFirebaseDb as jest.Mock).mockReturnValue({});
            (collection as jest.Mock).mockReturnValue({});
            (getCountFromServer as jest.Mock).mockResolvedValue({
                data: () => ({ count: 0 })
            });
            (getDocs as jest.Mock).mockResolvedValue({
                docs: [],
                forEach: jest.fn(),
            });

            // Act
            const result = await fetchConstituentMetrics();

            // Assert
            expect(result.total).toBe(0);
            expect(result.blocks).toHaveLength(0);
        });

        it('uses cached data for subsequent calls within TTL', async () => {
            // Arrange
            (getFirebaseDb as jest.Mock).mockReturnValue({});
            (collection as jest.Mock).mockReturnValue({});
            (getCountFromServer as jest.Mock).mockResolvedValue({
                data: () => ({ count: 1000 })
            });
            (getDocs as jest.Mock).mockResolvedValue({
                docs: [],
                forEach: jest.fn(),
            });

            // Act
            await fetchConstituentMetrics();
            await fetchConstituentMetrics();

            // Assert
            expect(getCountFromServer).toHaveBeenCalledTimes(1);
            expect(getDocs).toHaveBeenCalledTimes(1);
        });

        it('fetches fresh data after cache TTL expires', async () => {
            // Arrange
            (getFirebaseDb as jest.Mock).mockReturnValue({});
            (collection as jest.Mock).mockReturnValue({});
            (getCountFromServer as jest.Mock).mockResolvedValue({
                data: () => ({ count: 1000 })
            });
            (getDocs as jest.Mock).mockResolvedValue({
                docs: [],
                forEach: jest.fn(),
            });

            // Mock Date.now to control time
            const now = Date.now();
            jest.spyOn(Date, 'now').mockReturnValue(now);

            // First call
            await fetchConstituentMetrics();

            // Advance time by 6 minutes (beyond 5 min TTL)
            jest.spyOn(Date, 'now').mockReturnValue(now + 6 * 60 * 1000);

            // Second call
            await fetchConstituentMetrics();

            // Assert
            expect(getCountFromServer).toHaveBeenCalledTimes(2);
            expect(getDocs).toHaveBeenCalledTimes(2);
        });
    });

    describe('fetchGPMetricsForBlock', () => {
        it('returns GP breakdown for a specific block', async () => {
            // Arrange
            const mockGPDocs = [
                { id: '1', data: () => ({ gp_ulb: 'GP1', block: 'Block A' }) },
                { id: '2', data: () => ({ gp_ulb: 'GP1', block: 'Block A' }) },
                { id: '3', data: () => ({ gp_ulb: 'GP2', block: 'Block A' }) },
            ];

            (getFirebaseDb as jest.Mock).mockReturnValue({});
            (collection as jest.Mock).mockReturnValue({});
            (query as jest.Mock).mockReturnValue({});
            (where as jest.Mock).mockReturnValue({});
            (getDocs as jest.Mock).mockResolvedValue({
                docs: mockGPDocs,
                forEach: (cb: (doc: typeof mockGPDocs[0]) => void) => mockGPDocs.forEach(cb),
            });

            // Act
            const result = await fetchGPMetricsForBlock('Block A');

            // Assert
            expect(result).toHaveLength(2);
            expect(result.find(gp => gp.name === 'GP1')?.count).toBe(2);
            expect(result.find(gp => gp.name === 'GP2')?.count).toBe(1);
        });

        it('returns empty array when block has no constituents', async () => {
            // Arrange
            (getFirebaseDb as jest.Mock).mockReturnValue({});
            (collection as jest.Mock).mockReturnValue({});
            (query as jest.Mock).mockReturnValue({});
            (where as jest.Mock).mockReturnValue({});
            (getDocs as jest.Mock).mockResolvedValue({
                docs: [],
                forEach: jest.fn(),
            });

            // Act
            const result = await fetchGPMetricsForBlock('Empty Block');

            // Assert
            expect(result).toHaveLength(0);
        });

        it('uses cached data for subsequent calls for the same block', async () => {
             // Arrange
            const mockGPDocs = [
                { id: '1', data: () => ({ gp_ulb: 'GP1', block: 'Block A' }) },
            ];
            (getFirebaseDb as jest.Mock).mockReturnValue({});
            (collection as jest.Mock).mockReturnValue({});
            (query as jest.Mock).mockReturnValue({});
            (where as jest.Mock).mockReturnValue({});
            (getDocs as jest.Mock).mockResolvedValue({
                docs: mockGPDocs,
                forEach: (cb: (doc: typeof mockGPDocs[0]) => void) => mockGPDocs.forEach(cb),
            });

            // Act
            await fetchGPMetricsForBlock('Block A');
            await fetchGPMetricsForBlock('Block A');

            // Assert
            expect(getDocs).toHaveBeenCalledTimes(1);
        });

        it('fetches separately for different blocks', async () => {
            // Arrange
            (getFirebaseDb as jest.Mock).mockReturnValue({});
            (collection as jest.Mock).mockReturnValue({});
            (query as jest.Mock).mockReturnValue({});
            (where as jest.Mock).mockReturnValue({});
            (getDocs as jest.Mock).mockResolvedValue({
                docs: [],
                forEach: jest.fn(),
            });

            // Act
            await fetchGPMetricsForBlock('Block A');
            await fetchGPMetricsForBlock('Block B');

            // Assert
            expect(getDocs).toHaveBeenCalledTimes(2);
        });
    });
});
