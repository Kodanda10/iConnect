/**
 * @file generateTasksForDateRange.test.ts
 * @description TDD Tests for production-ready task generation
 * 
 * RED Phase: Tests written BEFORE implementation
 * Features:
 * - Date range task generation (for APK testing)
 * - Idempotency (re-running produces same result)
 * - Error handling and logging
 * - Production metrics
 */

import {
    generateTasksForDateRange,
    GenerateTasksOptions,
} from '../generateTasksForDateRange';



// Mock Firestore Timestamp
const mockTimestamp = {
    fromDate: (date: Date) => ({ toDate: () => date, _seconds: Math.floor(date.getTime() / 1000) }),
    now: () => ({ toDate: () => new Date(), _seconds: Math.floor(Date.now() / 1000) }),
};

// Helper to create constituent
const createConstituent = (
    id: string,
    name: string,
    dobMonth: number,
    dobDay: number,
    anniversaryMonth?: number,
    anniversaryDay?: number
) => ({
    id,
    name,
    mobile_number: '9876543210',
    dob: `1990-${String(dobMonth).padStart(2, '0')}-${String(dobDay).padStart(2, '0')}`,
    anniversary: anniversaryMonth && anniversaryDay
        ? `2015-${String(anniversaryMonth).padStart(2, '0')}-${String(anniversaryDay).padStart(2, '0')}`
        : undefined,
    ward_number: '01',
    block: 'Dharmasala',
    gram_panchayat: 'Jaraka',
    address: 'Test Address',
    created_at: new Date().toISOString(),
});

describe('generateTasksForDateRange', () => {
    describe('Date Range Support', () => {
        it('generates tasks for a date range (Dec 20-25)', () => {
            const constituents = [
                createConstituent('c1', 'Person Dec 20', 12, 20),
                createConstituent('c2', 'Person Dec 22', 12, 22),
                createConstituent('c3', 'Person Dec 25', 12, 25),
                createConstituent('c4', 'Person Jan 1', 1, 1), // Outside range
            ];

            const options: GenerateTasksOptions = {
                startDate: new Date(2025, 11, 20), // Dec 20, 2025
                endDate: new Date(2025, 11, 25),   // Dec 25, 2025
                TimestampClass: mockTimestamp,
            };

            const result = generateTasksForDateRange(constituents, [], options);

            expect(result.newTasks).toHaveLength(3);
            expect(result.newTasks.map(t => t.constituent_name).sort()).toEqual([
                'Person Dec 20',
                'Person Dec 22',
                'Person Dec 25',
            ]);
        });

        it('includes both birthdays and anniversaries in range', () => {
            const constituents = [
                createConstituent('c1', 'Birthday Person', 12, 24),
                createConstituent('c2', 'Anniversary Person', 1, 1, 12, 24), // DOB in Jan, Anniversary in Dec
            ];

            const options: GenerateTasksOptions = {
                startDate: new Date(2025, 11, 24),
                endDate: new Date(2025, 11, 24),
                TimestampClass: mockTimestamp,
            };

            const result = generateTasksForDateRange(constituents, [], options);

            expect(result.newTasks).toHaveLength(2);
            expect(result.newTasks.map(t => t.type).sort()).toEqual(['ANNIVERSARY', 'BIRTHDAY']);
        });

        it('handles year boundary (Dec 30 - Jan 2)', () => {
            const constituents = [
                createConstituent('c1', 'NYE Person', 12, 31),
                createConstituent('c2', 'New Year Person', 1, 1),
            ];

            const options: GenerateTasksOptions = {
                startDate: new Date(2025, 11, 30), // Dec 30, 2025
                endDate: new Date(2026, 0, 2),     // Jan 2, 2026
                TimestampClass: mockTimestamp,
            };

            const result = generateTasksForDateRange(constituents, [], options);

            expect(result.newTasks).toHaveLength(2);
        });
    });

    describe('Idempotency', () => {
        it('does not create duplicate tasks when run twice', () => {
            const constituents = [
                createConstituent('c1', 'Person 1', 12, 25),
            ];

            const options: GenerateTasksOptions = {
                startDate: new Date(2025, 11, 25),
                endDate: new Date(2025, 11, 25),
                TimestampClass: mockTimestamp,
            };

            // First run
            const result1 = generateTasksForDateRange(constituents, [], options);
            expect(result1.newTasks).toHaveLength(1);

            // Second run with existing tasks from first run
            const result2 = generateTasksForDateRange(constituents, result1.newTasks, options);
            expect(result2.newTasks).toHaveLength(0);
            expect(result2.skippedDuplicates).toBe(1);
        });

        it('tracks skipped duplicates count', () => {
            const constituents = [
                createConstituent('c1', 'Person 1', 12, 25),
                createConstituent('c2', 'Person 2', 12, 25),
            ];

            const existingTasks = [
                {
                    id: 'existing-1',
                    constituent_id: 'c1',
                    type: 'BIRTHDAY',
                    due_date: '2025-12-25',
                    status: 'PENDING',
                },
            ];

            const options: GenerateTasksOptions = {
                startDate: new Date(2025, 11, 25),
                endDate: new Date(2025, 11, 25),
                TimestampClass: mockTimestamp,
            };

            const result = generateTasksForDateRange(constituents, existingTasks as any, options);

            expect(result.newTasks).toHaveLength(1); // Only c2
            expect(result.skippedDuplicates).toBe(1); // c1 was skipped
        });
    });

    describe('Production Metrics', () => {
        it('returns comprehensive metrics', () => {
            const constituents = [
                createConstituent('c1', 'Person 1', 12, 25),
                createConstituent('c2', 'Person 2', 12, 25, 12, 25), // Both birthday and anniversary
            ];

            const options: GenerateTasksOptions = {
                startDate: new Date(2025, 11, 25),
                endDate: new Date(2025, 11, 25),
                TimestampClass: mockTimestamp,
            };

            const result = generateTasksForDateRange(constituents, [], options);

            expect(result).toMatchObject({
                newTasks: expect.any(Array),
                count: 3, // 2 birthdays + 1 anniversary
                skippedDuplicates: 0,
                birthdayCount: 2,
                anniversaryCount: 1,
                dateRange: {
                    start: '2025-12-25',
                    end: '2025-12-25',
                },
            });
        });
    });

    describe('Error Handling', () => {
        it('handles constituents with missing DOB gracefully', () => {
            const constituents = [
                { ...createConstituent('c1', 'Valid Person', 12, 25) },
                { id: 'c2', name: 'No DOB Person', mobile_number: '123' } as any,
            ];

            const options: GenerateTasksOptions = {
                startDate: new Date(2025, 11, 25),
                endDate: new Date(2025, 11, 25),
                TimestampClass: mockTimestamp,
            };

            const result = generateTasksForDateRange(constituents, [], options);

            expect(result.newTasks).toHaveLength(1);
            expect(result.errors).toHaveLength(0); // Missing DOB is not an error, just no task
        });

        it('handles invalid date formats gracefully', () => {
            const constituents = [
                { id: 'c1', name: 'Bad Date', dob: 'not-a-date', mobile_number: '123' } as any,
            ];

            const options: GenerateTasksOptions = {
                startDate: new Date(2025, 11, 25),
                endDate: new Date(2025, 11, 25),
                TimestampClass: mockTimestamp,
            };

            // Should not throw
            expect(() => generateTasksForDateRange(constituents, [], options)).not.toThrow();
        });
    });

    describe('Denormalized Data', () => {
        it('includes constituent data on task for efficient queries', () => {
            const constituents = [
                createConstituent('c1', 'Shri Ramesh Kumar', 12, 25),
            ];

            const options: GenerateTasksOptions = {
                startDate: new Date(2025, 11, 25),
                endDate: new Date(2025, 11, 25),
                TimestampClass: mockTimestamp,
            };

            const result = generateTasksForDateRange(constituents, [], options);

            expect(result.newTasks[0]).toMatchObject({
                constituent_id: 'c1',
                constituent_name: 'Shri Ramesh Kumar',
                constituent_mobile: '9876543210',
                ward_number: '01',
                block: 'Dharmasala',
                gram_panchayat: 'Jaraka',
            });
        });
    });
});
