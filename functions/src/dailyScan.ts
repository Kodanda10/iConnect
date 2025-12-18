/**
 * @file dailyScan.ts
 * @description System Brain - Daily scan for birthdays and anniversaries
 * @changelog
 * - 2024-12-11: Initial implementation with TDD
 * - 2025-05-20: Optimized date parsing in scanForTasks
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
 * Helper to extract month and date from YYYY-MM-DD string or Date object.
 * Returns null if invalid.
 */
function getMonthDate(dateStr: string): { month: number, date: number } | null {
    // Optimization: avoid new Date() if string is strictly YYYY-MM-DD
    // However, sticking to new Date() for safety but doing it once.
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return { month: d.getMonth(), date: d.getDate() };
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

    // Optimization: Pre-calculate target dates
    const todayMonth = today.getMonth();
    const todayDate = today.getDate();
    const tomorrowMonth = tomorrow.getMonth();
    const tomorrowDate = tomorrow.getDate();

    const newTasks: Task[] = [];

    // Helper map to speed up lookups if existingTasks is large, but for now linear scan is likely small
    // If existingTasks grows large, we should optimize this too.

    for (const constituent of constituents) {
        // Optimize: Parse dates only once per constituent
        let dobParts: { month: number, date: number } | null = null;
        if (constituent.dob) {
            dobParts = getMonthDate(constituent.dob);
        }

        let annParts: { month: number, date: number } | null = null;
        if (constituent.anniversary) {
            annParts = getMonthDate(constituent.anniversary);
        }

        if (dobParts) {
            // Check Birthday - Today
            if (dobParts.month === todayMonth && dobParts.date === todayDate) {
                const dueDate = today.toISOString().split('T')[0];
                if (!taskExists(existingTasks, constituent.id, 'BIRTHDAY', dueDate)) {
                    newTasks.push(createTask(constituent.id, 'BIRTHDAY', today));
                }
            }

            // Check Birthday - Tomorrow
            if (dobParts.month === tomorrowMonth && dobParts.date === tomorrowDate) {
                const dueDate = tomorrow.toISOString().split('T')[0];
                if (!taskExists(existingTasks, constituent.id, 'BIRTHDAY', dueDate)) {
                    newTasks.push(createTask(constituent.id, 'BIRTHDAY', tomorrow));
                }
            }
        }

        if (annParts) {
            // Check Anniversary - Today
            if (annParts.month === todayMonth && annParts.date === todayDate) {
                const dueDate = today.toISOString().split('T')[0];
                if (!taskExists(existingTasks, constituent.id, 'ANNIVERSARY', dueDate)) {
                    newTasks.push(createTask(constituent.id, 'ANNIVERSARY', today));
                }
            }

            // Check Anniversary - Tomorrow
            if (annParts.month === tomorrowMonth && annParts.date === tomorrowDate) {
                const dueDate = tomorrow.toISOString().split('T')[0];
                if (!taskExists(existingTasks, constituent.id, 'ANNIVERSARY', dueDate)) {
                    newTasks.push(createTask(constituent.id, 'ANNIVERSARY', tomorrow));
                }
            }
        }
    }

    return {
        count: newTasks.length,
        newTasks,
    };
}
