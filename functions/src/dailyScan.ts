/**
 * @file dailyScan.ts
 * @description System Brain - Daily scan for birthdays and anniversaries
 * @changelog
 * - 2024-12-11: Initial implementation with TDD
 * - 2025-01-28: Optimized task existence check using Set lookup (O(1))
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
 * Generates a unique key for task existence check
 */
function getTaskKey(constituentId: string, type: TaskType, dueDateStr: string): string {
    return `${constituentId}|${type}|${dueDateStr}`;
}

/**
 * Scan constituents for upcoming birthdays and anniversaries
 * Creates tasks for today and tomorrow
 * Optimized to use Set lookup for O(1) existence check
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

    // Create a Set of existing task keys for O(1) lookup
    const existingTaskKeys = new Set<string>();
    for (const task of existingTasks) {
        let taskDateStr = '';
        if (task.due_date && typeof task.due_date.toDate === 'function') {
            taskDateStr = task.due_date.toDate().toISOString().split('T')[0];
        } else if (typeof task.due_date === 'string') {
            taskDateStr = task.due_date;
        }

        // Handle potential schema inconsistency (camelCase vs snake_case)
        const cId = task.constituent_id || (task as any).constituentId;

        if (cId && taskDateStr) {
            existingTaskKeys.add(getTaskKey(cId, task.type, taskDateStr));
        }
    }

    // Helper to check and add task
    const checkAndAddTask = (constituent: Constituent, type: TaskType, date: Date) => {
        const dueDateStr = date.toISOString().split('T')[0];
        const key = getTaskKey(constituent.id, type, dueDateStr);

        if (!existingTaskKeys.has(key)) {
            newTasks.push(createTask(constituent, type, date, TimestampClass));
            // Add to Set to prevent duplicates within the same run (though unlikely)
            existingTaskKeys.add(key);
        }
    };

    for (const constituent of constituents) {
        // Check Birthday - Today
        if (isDateMatch(constituent.dob, today)) {
            checkAndAddTask(constituent, 'BIRTHDAY', today);
        }

        // Check Birthday - Tomorrow
        if (isDateMatch(constituent.dob, tomorrow)) {
            checkAndAddTask(constituent, 'BIRTHDAY', tomorrow);
        }

        // Check Anniversary - Today
        if (isDateMatch(constituent.anniversary, today)) {
            checkAndAddTask(constituent, 'ANNIVERSARY', today);
        }

        // Check Anniversary - Tomorrow
        if (isDateMatch(constituent.anniversary, tomorrow)) {
            checkAndAddTask(constituent, 'ANNIVERSARY', tomorrow);
        }
    }

    return {
        count: newTasks.length,
        newTasks,
    };
}
