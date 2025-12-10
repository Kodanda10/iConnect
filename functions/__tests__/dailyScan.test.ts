/**
 * @file dailyScan.test.ts
 * @description TDD Tests for the dailyScan Cloud Function (System Brain)
 * 
 * RED Phase: These tests are written BEFORE the implementation.
 * They should FAIL until we implement dailyScan in src/index.ts
 */

import { scanForTasks, ScanResult, Constituent, Task } from '../src/dailyScan';

describe('scanForTasks', () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Helper to create constituent with specific dates
    const createConstituent = (
        id: string,
        name: string,
        dobMonth: number,
        dobDay: number,
        anniversaryMonth?: number,
        anniversaryDay?: number
    ): Constituent => ({
        id,
        name,
        mobile_number: '9876543210',
        dob: `1990-${String(dobMonth).padStart(2, '0')}-${String(dobDay).padStart(2, '0')}`,
        anniversary: anniversaryMonth && anniversaryDay
            ? `2015-${String(anniversaryMonth).padStart(2, '0')}-${String(anniversaryDay).padStart(2, '0')}`
            : undefined,
        ward_number: '1',
        address: 'Test Address',
        created_at: new Date().toISOString(),
    });

    describe('Birthday Detection', () => {
        it('creates BIRTHDAY task for constituent with birthday today', () => {
            const constituents: Constituent[] = [
                createConstituent('c1', 'Birthday Today', today.getMonth() + 1, today.getDate()),
            ];
            const existingTasks: Task[] = [];

            const result = scanForTasks(constituents, existingTasks);

            expect(result.newTasks).toHaveLength(1);
            expect(result.newTasks[0].type).toBe('BIRTHDAY');
            expect(result.newTasks[0].constituent_id).toBe('c1');
        });

        it('creates BIRTHDAY task for constituent with birthday tomorrow', () => {
            const constituents: Constituent[] = [
                createConstituent('c2', 'Birthday Tomorrow', tomorrow.getMonth() + 1, tomorrow.getDate()),
            ];
            const existingTasks: Task[] = [];

            const result = scanForTasks(constituents, existingTasks);

            expect(result.newTasks).toHaveLength(1);
            expect(result.newTasks[0].type).toBe('BIRTHDAY');
        });

        it('does not create task for past birthday', () => {
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);

            const constituents: Constituent[] = [
                createConstituent('c3', 'Birthday Yesterday', yesterday.getMonth() + 1, yesterday.getDate()),
            ];
            const existingTasks: Task[] = [];

            const result = scanForTasks(constituents, existingTasks);

            expect(result.newTasks).toHaveLength(0);
        });
    });

    describe('Anniversary Detection', () => {
        it('creates ANNIVERSARY task for constituent with anniversary today', () => {
            const constituents: Constituent[] = [
                createConstituent(
                    'c4',
                    'Anniversary Today',
                    1, // DOB month
                    15, // DOB day
                    today.getMonth() + 1, // Anniversary month
                    today.getDate() // Anniversary day
                ),
            ];
            const existingTasks: Task[] = [];

            const result = scanForTasks(constituents, existingTasks);

            expect(result.newTasks).toHaveLength(1);
            expect(result.newTasks[0].type).toBe('ANNIVERSARY');
        });

        it('creates ANNIVERSARY task for constituent with anniversary tomorrow', () => {
            const constituents: Constituent[] = [
                createConstituent(
                    'c5',
                    'Anniversary Tomorrow',
                    1,
                    15,
                    tomorrow.getMonth() + 1,
                    tomorrow.getDate()
                ),
            ];
            const existingTasks: Task[] = [];

            const result = scanForTasks(constituents, existingTasks);

            expect(result.newTasks).toHaveLength(1);
            expect(result.newTasks[0].type).toBe('ANNIVERSARY');
        });
    });

    describe('Duplicate Prevention', () => {
        it('does not create duplicate task if one already exists', () => {
            const constituents: Constituent[] = [
                createConstituent('c6', 'Existing Task', today.getMonth() + 1, today.getDate()),
            ];

            const todayStr = today.toISOString().split('T')[0];
            const existingTasks: Task[] = [
                {
                    id: 'existing-task-1',
                    constituent_id: 'c6',
                    type: 'BIRTHDAY',
                    due_date: todayStr,
                    status: 'PENDING',
                    created_at: new Date().toISOString(),
                },
            ];

            const result = scanForTasks(constituents, existingTasks);

            expect(result.newTasks).toHaveLength(0);
        });
    });

    describe('Combined Events', () => {
        it('creates both BIRTHDAY and ANNIVERSARY tasks if both occur', () => {
            // Same day for both birthday and anniversary
            const constituents: Constituent[] = [
                createConstituent(
                    'c7',
                    'Double Event',
                    today.getMonth() + 1,
                    today.getDate(),
                    today.getMonth() + 1,
                    today.getDate()
                ),
            ];
            const existingTasks: Task[] = [];

            const result = scanForTasks(constituents, existingTasks);

            expect(result.newTasks).toHaveLength(2);
            expect(result.newTasks.map((t) => t.type).sort()).toEqual(['ANNIVERSARY', 'BIRTHDAY']);
        });
    });

    describe('Result Summary', () => {
        it('returns correct count of new tasks', () => {
            const constituents: Constituent[] = [
                createConstituent('c8', 'Person 1', today.getMonth() + 1, today.getDate()),
                createConstituent('c9', 'Person 2', tomorrow.getMonth() + 1, tomorrow.getDate()),
            ];
            const existingTasks: Task[] = [];

            const result = scanForTasks(constituents, existingTasks);

            expect(result.count).toBe(2);
            expect(result.newTasks).toHaveLength(2);
        });
    });
});
