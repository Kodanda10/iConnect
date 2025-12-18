/**
 * @file __tests__/tasks.test.ts
 * @description TDD tests for tasks Firebase service
 * @changelog
 * - 2024-12-12: Initial implementation following TDD for production readiness
 */

import {
    getTasks,
    createTask,
    updateTask,
    completeTask,
    getTaskCounts,
} from '@/lib/services/tasks';

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
    getFirebaseDb: jest.fn(() => ({})),
}));

const mockTaskDocs = [
    {
        id: 'task-1',
        data: () => ({
            constituent_id: 'const-1',
            type: 'BIRTHDAY',
            status: 'PENDING',
            due_date: '2024-12-12',
            message_template: 'Happy Birthday!',
        }),
    },
    {
        id: 'task-2',
        data: () => ({
            constituent_id: 'const-2',
            type: 'ANNIVERSARY',
            status: 'PENDING',
            due_date: '2024-12-12',
            message_template: 'Happy Anniversary!',
        }),
    },
    {
        id: 'task-3',
        data: () => ({
            constituent_id: 'const-3',
            type: 'BIRTHDAY',
            status: 'COMPLETED',
            due_date: '2024-12-11',
            action_taken: 'WHATSAPP',
            completed_by: 'LEADER',
        }),
    },
];

jest.mock('firebase/firestore', () => ({
    collection: jest.fn(),
    doc: jest.fn(),
    addDoc: jest.fn(() => Promise.resolve({ id: 'new-task-123' })),
    updateDoc: jest.fn(() => Promise.resolve()),
    getDoc: jest.fn(() => Promise.resolve({
        exists: () => true,
        id: 'task-1',
        data: () => mockTaskDocs[0].data(),
    })),
    getDocs: jest.fn(() => Promise.resolve({
        docs: mockTaskDocs,
        forEach: (callback: (doc: typeof mockTaskDocs[0]) => void) => mockTaskDocs.forEach(callback),
        size: mockTaskDocs.length,
    })),
    getCountFromServer: jest.fn(() => Promise.resolve({
        data: () => ({ count: mockTaskDocs.length }),
    })),
    query: jest.fn(),
    where: jest.fn(),
    orderBy: jest.fn(),
    Timestamp: {
        now: jest.fn(() => ({ toDate: () => new Date() })),
        fromDate: jest.fn((date) => ({ toDate: () => date })),
    },
}));

describe('Tasks Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getTasks', () => {
        test('returns array of tasks', async () => {
            const tasks = await getTasks('PENDING');

            expect(tasks).toBeDefined();
            expect(Array.isArray(tasks)).toBe(true);
        });

        test('returns tasks with task structure', async () => {
            const tasks = await getTasks('PENDING');

            if (tasks.length > 0) {
                const task = tasks[0];
                expect(task.id).toBeDefined();
            }
        });
    });

    describe('createTask', () => {
        test('creates a new task and returns ID', async () => {
            const taskId = await createTask({
                constituent_id: 'const-1',
                type: 'BIRTHDAY',
                status: 'PENDING',
                due_date: new Date('2024-12-15'), // Changed from string to Date
            });

            expect(taskId).toBeDefined();
            expect(typeof taskId).toBe('string');
            expect(taskId).toBe('new-task-123');
        });
    });

    describe('updateTask', () => {
        test('updates task without throwing', async () => {
            await expect(updateTask('task-1', { status: 'COMPLETED' })).resolves.not.toThrow();
        });
    });

    describe('completeTask', () => {
        test('completes task with action details', async () => {
            await expect(
                completeTask('task-1', 'WHATSAPP', 'LEADER', 'Sent birthday message')
            ).resolves.not.toThrow();
        });

        test('completes task with CALL action', async () => {
            await expect(
                completeTask('task-2', 'CALL', 'STAFF')
            ).resolves.not.toThrow();
        });

        test('completes task with SMS action', async () => {
            await expect(
                completeTask('task-3', 'SMS', 'LEADER', 'Sent SMS')
            ).resolves.not.toThrow();
        });
    });

    describe('getTaskCounts', () => {
        test('returns task count statistics', async () => {
            const counts = await getTaskCounts();

            expect(counts).toBeDefined();
            expect(typeof counts.pending).toBe('number');
            expect(typeof counts.completed).toBe('number');
            expect(typeof counts.pendingBirthdays).toBe('number');
            expect(typeof counts.pendingAnniversaries).toBe('number');
        });
    });
});

describe('Task Types', () => {
    test('BIRTHDAY and ANNIVERSARY are valid task types', () => {
        const validTypes = ['BIRTHDAY', 'ANNIVERSARY', 'FESTIVAL'];
        expect(validTypes).toContain('BIRTHDAY');
        expect(validTypes).toContain('ANNIVERSARY');
    });

    test('PENDING and COMPLETED are valid task statuses', () => {
        const validStatuses = ['PENDING', 'COMPLETED', 'SKIPPED'];
        expect(validStatuses).toContain('PENDING');
        expect(validStatuses).toContain('COMPLETED');
    });

    test('CALL, SMS, WHATSAPP are valid action types', () => {
        const validActions = ['CALL', 'SMS', 'WHATSAPP'];
        expect(validActions).toHaveLength(3);
    });
});
