/**
 * @file __tests__/festivals.test.ts
 * @description TDD tests for festivals Firebase service
 * @changelog
 * - 2024-12-12: Initial implementation following TDD for production readiness
 */

import {
    addFestival,
    getFestivals,
    deleteFestival,
} from '@/lib/services/festivals';

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
    getFirebaseDb: jest.fn(() => ({})),
}));

const mockFestivalDocs = [
    {
        id: 'festival-1',
        data: () => ({
            name: 'Diwali',
            date: '2024-10-31',
            description: 'Festival of Lights',
            isCustom: true,
        }),
    },
    {
        id: 'festival-2',
        data: () => ({
            name: 'Holi',
            date: '2024-03-25',
            description: 'Festival of Colors',
            isCustom: false,
        }),
    },
];

jest.mock('firebase/firestore', () => ({
    collection: jest.fn(),
    doc: jest.fn(),
    addDoc: jest.fn(() => Promise.resolve({ id: 'festival-123' })),
    deleteDoc: jest.fn(() => Promise.resolve()),
    getDocs: jest.fn(() => Promise.resolve({
        docs: mockFestivalDocs,
        forEach: (callback: (doc: typeof mockFestivalDocs[0]) => void) => mockFestivalDocs.forEach(callback),
    })),
    query: jest.fn(),
    orderBy: jest.fn(),
}));

describe('Festivals Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('addFestival', () => {
        test('successfully creates a festival', async () => {
            const result = await addFestival({
                name: 'Test Festival',
                date: '2024-12-25',
                description: 'Test Description',
            });

            expect(result).toBeDefined();
            expect(typeof result).toBe('string');
            expect(result).toBe('festival-123');
        });

        test('creates festival with custom flag', async () => {
            const result = await addFestival({
                name: 'Custom Festival',
                date: '2024-12-25',
                isCustom: true,
            });

            expect(result).toBeDefined();
        });
    });

    describe('getFestivals', () => {
        test('returns array of festivals', async () => {
            const results = await getFestivals();

            expect(results).toBeDefined();
            expect(Array.isArray(results)).toBe(true);
        });

        test('festivals have required fields', async () => {
            const results = await getFestivals();

            if (results.length > 0) {
                const festival = results[0];
                expect(festival.id).toBeDefined();
                expect(festival.name).toBeDefined();
                expect(festival.date).toBeDefined();
            }
        });
    });

    describe('deleteFestival', () => {
        test('successfully deletes a festival by id', async () => {
            await expect(deleteFestival('festival-1')).resolves.not.toThrow();
        });
    });
});
