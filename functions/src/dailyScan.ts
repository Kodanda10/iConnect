/**
 * @file dailyScan.ts
 * @description System Brain - Daily scan for birthdays and anniversaries
 * @changelog
 * - 2024-12-11: Initial implementation with TDD
 */

import { v4 as uuidv4 } from 'uuid';

export type TaskType = 'BIRTHDAY' | 'ANNIVERSARY';
export type TaskStatus = 'PENDING' | 'COMPLETED';

export interface Constituent {
    id: string;
    name: string;
    mobile_number: string;
    dob: string; // YYYY-MM-DD
    anniversary?: string; // YYYY-MM-DD
    ward_number: string;
    address: string;
    created_at: string;
}

export interface Task {
    id: string;
    constituentId: string;  // Schema alignment: camelCase to match Flutter
    type: TaskType;
    dueDate: string;        // Schema alignment: camelCase
    status: TaskStatus;
    notes?: string;
    actionTaken?: 'CALL' | 'SMS' | 'WHATSAPP';  // camelCase
    completedBy?: 'LEADER' | 'STAFF';            // camelCase
    createdAt: string;                           // camelCase
}

export interface ScanResult {
    count: number;
    newTasks: Task[];
}

/**
 * Check if a date string (YYYY-MM-DD) matches a target date (month and day only)
 */
function isDateMatch(dateStr: string | undefined, targetDate: Date): boolean {
    if (!dateStr) return false;

    const date = new Date(dateStr);
    return (
        date.getDate() === targetDate.getDate() &&
        date.getMonth() === targetDate.getMonth()
    );
}

/**
 * Create a new task object
 */
function createTask(
    constituentId: string,
    type: TaskType,
    dueDate: Date
): Task {
    return {
        id: uuidv4(),
        constituentId: constituentId,
        type,
        dueDate: dueDate.toISOString().split('T')[0],
        status: 'PENDING',
        createdAt: new Date().toISOString(),
    };
}

/**
 * Check if a task already exists for this constituent, type, and date
 */
function taskExists(
    existingTasks: Task[],
    constituentId: string,
    type: TaskType,
    dueDate: string
): boolean {
    return existingTasks.some(
        (task) =>
            task.constituentId === constituentId &&
            task.type === type &&
            task.dueDate === dueDate
    );
}

/**
 * Scan constituents for upcoming birthdays and anniversaries
 * Creates tasks for today and tomorrow
 */
export function scanForTasks(
    constituents: Constituent[],
    existingTasks: Task[]
): ScanResult {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const newTasks: Task[] = [];

    for (const constituent of constituents) {
        // Check Birthday - Today
        if (isDateMatch(constituent.dob, today)) {
            const dueDate = today.toISOString().split('T')[0];
            if (!taskExists(existingTasks, constituent.id, 'BIRTHDAY', dueDate)) {
                newTasks.push(createTask(constituent.id, 'BIRTHDAY', today));
            }
        }

        // Check Birthday - Tomorrow
        if (isDateMatch(constituent.dob, tomorrow)) {
            const dueDate = tomorrow.toISOString().split('T')[0];
            if (!taskExists(existingTasks, constituent.id, 'BIRTHDAY', dueDate)) {
                newTasks.push(createTask(constituent.id, 'BIRTHDAY', tomorrow));
            }
        }

        // Check Anniversary - Today
        if (isDateMatch(constituent.anniversary, today)) {
            const dueDate = today.toISOString().split('T')[0];
            if (!taskExists(existingTasks, constituent.id, 'ANNIVERSARY', dueDate)) {
                newTasks.push(createTask(constituent.id, 'ANNIVERSARY', today));
            }
        }

        // Check Anniversary - Tomorrow
        if (isDateMatch(constituent.anniversary, tomorrow)) {
            const dueDate = tomorrow.toISOString().split('T')[0];
            if (!taskExists(existingTasks, constituent.id, 'ANNIVERSARY', dueDate)) {
                newTasks.push(createTask(constituent.id, 'ANNIVERSARY', tomorrow));
            }
        }
    }

    return {
        count: newTasks.length,
        newTasks,
    };
}
