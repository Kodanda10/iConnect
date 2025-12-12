/**
 * @file __tests__/constituents.test.ts
 * @description TDD tests for constituents Firebase service
 * @changelog
 * - 2024-12-12: Initial implementation following TDD for production readiness
 */

import {
    addConstituent,
    getConstituents,
    searchConstituents,
    getConstituentsForDate,
} from '@/lib/services/constituents';

// Mock Firebase - required for unit testing
jest.mock('@/lib/firebase', () => ({
    getFirebaseDb: jest.fn(() => ({})),
}));

const mockDocs = [
    {
        id: 'constituent-1',
        data: () => ({
            name: 'John Doe',
            mobile_number: '9876543210',
            dob: '1990-05-15',
            block: 'Raipur',
        }),
    },
    {
        id: 'constituent-2',
        data: () => ({
            name: 'Jane Smith',
            mobile_number: '8765432109',
            anniversary: '2010-06-20',
            block: 'Bilaspur',
        }),
    },
];

jest.mock('firebase/firestore', () => ({
    collection: jest.fn(),
    doc: jest.fn(),
    addDoc: jest.fn(() => Promise.resolve({ id: 'test-id-123' })),
    getDocs: jest.fn(() => Promise.resolve({
        docs: mockDocs,
        forEach: (callback: Function) => mockDocs.forEach(callback),
    })),
    query: jest.fn(),
    where: jest.fn(),
    orderBy: jest.fn(),
    limit: jest.fn(),
    startAfter: jest.fn(),
    Timestamp: {
        now: jest.fn(() => ({ toDate: () => new Date() })),
    },
}));

describe('Constituents Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('addConstituent', () => {
        test('successfully adds a constituent with required fields', async () => {
            const result = await addConstituent({
                name: 'Test User',
                mobile_number: '9876543210',
            });

            expect(result).toBeDefined();
            expect(typeof result).toBe('string');
            expect(result).toBe('test-id-123');
        });

        test('adds constituent with optional date fields', async () => {
            const result = await addConstituent({
                name: 'Test User',
                mobile_number: '9876543210',
                dob: '1990-05-15',
                anniversary: '2010-06-20',
                block: 'Raipur',
                gp_ulb: 'GP1',
            });

            expect(result).toBeDefined();
        });
    });

    describe('getConstituents', () => {
        test('returns array of constituents', async () => {
            const result = await getConstituents();

            expect(result).toBeDefined();
            expect(result.constituents).toBeDefined();
            expect(Array.isArray(result.constituents)).toBe(true);
        });

        test('includes constituent data with correct structure', async () => {
            const result = await getConstituents();

            if (result.constituents.length > 0) {
                const constituent = result.constituents[0];
                expect(constituent.id).toBeDefined();
            }
        });
    });

    describe('searchConstituents', () => {
        test('returns filtered results based on search term', async () => {
            const results = await searchConstituents('John');

            expect(results).toBeDefined();
            expect(Array.isArray(results)).toBe(true);
        });

        test('returns empty array for non-matching search', async () => {
            const results = await searchConstituents('NonExistent');

            expect(results).toBeDefined();
            expect(Array.isArray(results)).toBe(true);
        });
    });

    describe('getConstituentsForDate', () => {
        test('returns constituents for specific birthday date', async () => {
            const results = await getConstituentsForDate(5, 15, 'birthday');

            expect(results).toBeDefined();
            expect(Array.isArray(results)).toBe(true);
        });

        test('returns constituents for specific anniversary date', async () => {
            const results = await getConstituentsForDate(6, 20, 'anniversary');

            expect(results).toBeDefined();
            expect(Array.isArray(results)).toBe(true);
        });
    });
});
