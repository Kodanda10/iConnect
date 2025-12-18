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
    constituent_id: string;
    constituent_name: string;
    constituent_mobile: string;
    ward_number: string;
    type: TaskType;
    due_date: any; // Firestore Timestamp
    status: TaskStatus;
    notes?: string;
    action_taken?: 'CALL' | 'SMS' | 'WHATSAPP';
    completed_by?: 'LEADER' | 'STAFF';
    created_at: any; // Firestore Timestamp
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

    // Handle YYYY-MM-DD format
    const parts = dateStr.split('-');
    if (parts.length !== 3) return false;
    
    const day = parseInt(parts[2], 10);
    const month = parseInt(parts[1], 10) - 1; // JS months are 0-indexed

    return (
        day === targetDate.getDate() &&
        month === targetDate.getMonth()
    );
}

/**
 * Create a new task object with denormalized data
 */
function createTask(
    constituent: Constituent,
    type: TaskType,
    dueDate: Date,
    TimestampClass: any
): Task {
    return {
        id: uuidv4(),
        constituent_id: constituent.id,
        constituent_name: constituent.name,
        constituent_mobile: constituent.mobile_number,
        ward_number: constituent.ward_number,
        type,
        due_date: TimestampClass.fromDate(dueDate),
        status: 'PENDING',
        created_at: TimestampClass.now(),
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
    return existingTasks.some((task) => {
        // Handle both Timestamp and String for backward compatibility during migration
        let taskDateStr = '';
        if (task.due_date && typeof task.due_date.toDate === 'function') {
            taskDateStr = task.due_date.toDate().toISOString().split('T')[0];
        } else if (typeof task.due_date === 'string') {
            taskDateStr = task.due_date;
        }
        
        return (
            (task.constituent_id === constituentId || (task as any).constituentId === constituentId) &&
            task.type === type &&
            taskDateStr === dueDate
        );
    });
}

/**
 * Scan constituents for upcoming birthdays and anniversaries
 * Creates tasks for today and tomorrow
 */
export function scanForTasks(
    constituents: Constituent[],
    existingTasks: Task[],
    TimestampClass: any
): ScanResult {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const newTasks: Task[] = [];

    for (const constituent of constituents) {
        // Check Birthday - Today
        if (isDateMatch(constituent.dob, today)) {
            const dueDateStr = today.toISOString().split('T')[0];
            if (!taskExists(existingTasks, constituent.id, 'BIRTHDAY', dueDateStr)) {
                newTasks.push(createTask(constituent, 'BIRTHDAY', today, TimestampClass));
            }
        }

        // Check Birthday - Tomorrow
        if (isDateMatch(constituent.dob, tomorrow)) {
            const dueDateStr = tomorrow.toISOString().split('T')[0];
            if (!taskExists(existingTasks, constituent.id, 'BIRTHDAY', dueDateStr)) {
                newTasks.push(createTask(constituent, 'BIRTHDAY', tomorrow, TimestampClass));
            }
        }

        // Check Anniversary - Today
        if (isDateMatch(constituent.anniversary, today)) {
            const dueDateStr = today.toISOString().split('T')[0];
            if (!taskExists(existingTasks, constituent.id, 'ANNIVERSARY', dueDateStr)) {
                newTasks.push(createTask(constituent, 'ANNIVERSARY', today, TimestampClass));
            }
        }

        // Check Anniversary - Tomorrow
        if (isDateMatch(constituent.anniversary, tomorrow)) {
            const dueDateStr = tomorrow.toISOString().split('T')[0];
            if (!taskExists(existingTasks, constituent.id, 'ANNIVERSARY', dueDateStr)) {
                newTasks.push(createTask(constituent, 'ANNIVERSARY', tomorrow, TimestampClass));
            }
        }
    }

    return {
        count: newTasks.length,
        newTasks,
    };
}
