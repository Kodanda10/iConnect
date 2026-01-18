/**
 * @file generateTasksForDateRange.ts
 * @description Production-ready task generation from constituents
 * 
 * Features:
 * - Date range support (for APK testing and backfill)
 * - Idempotency (safe to re-run)
 * - Comprehensive metrics
 * - Error handling
 * - Denormalized constituent data on tasks
 * 
 * @changelog
 * - 2025-12-26: Initial TDD implementation
 * - 2025-05-20: Optimized performance by inverting loop (Constituents * 1 parse) instead of (Dates * Constituents parses)
 */

import { v4 as uuidv4 } from 'uuid';

export type TaskType = 'BIRTHDAY' | 'ANNIVERSARY';
export type TaskStatus = 'PENDING' | 'COMPLETED';

export interface Constituent {
    id: string;
    name: string;
    mobile_number?: string;
    dob?: string; // YYYY-MM-DD
    anniversary?: string; // YYYY-MM-DD
    ward_number?: string;
    block?: string;
    gram_panchayat?: string;
    address?: string;
    created_at?: string;
}

export interface Task {
    id: string;
    constituent_id: string;
    constituent_name: string;
    constituent_mobile: string;
    ward_number: string;
    block: string;
    gram_panchayat: string;
    type: TaskType;
    due_date: any; // Firestore Timestamp or string
    status: TaskStatus;
    notes?: string;
    action_taken?: 'CALL' | 'SMS' | 'WHATSAPP';
    completed_by?: 'LEADER' | 'STAFF';
    created_at: any;
    // Optional tracking flags
    call_sent?: boolean;
    sms_sent?: boolean;
    whatsapp_sent?: boolean;
}

export interface GenerateTasksOptions {
    startDate: Date;
    endDate: Date;
    TimestampClass: {
        fromDate: (date: Date) => any;
        now: () => any;
    };
}

export interface GenerateTasksResult {
    newTasks: Task[];
    count: number;
    skippedDuplicates: number;
    birthdayCount: number;
    anniversaryCount: number;
    dateRange: {
        start: string;
        end: string;
    };
    errors: string[];
}

/**
 * Parse date string (YYYY-MM-DD) and extract month/day
 * Returns null if invalid
 */
function parseDateParts(dateStr: string | undefined): { month: number; day: number } | null {
    if (!dateStr || typeof dateStr !== 'string') return null;

    const parts = dateStr.split('-');
    if (parts.length !== 3) return null;

    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);

    if (isNaN(month) || isNaN(day) || month < 1 || month > 12 || day < 1 || day > 31) {
        return null;
    }

    return { month, day };
}

/**
 * Format date as YYYY-MM-DD string
 */
function formatDateStr(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Generate a unique task key for deduplication
 */
function getTaskKey(constituentId: string, type: TaskType, dueDateStr: string): string {
    return `${constituentId}:${type}:${dueDateStr}`;
}

/**
 * Create a new task with denormalized constituent data
 */
function createTask(
    constituent: Constituent,
    type: TaskType,
    dueDate: Date,
    TimestampClass: GenerateTasksOptions['TimestampClass']
): Task {
    return {
        id: uuidv4(),
        constituent_id: constituent.id,
        constituent_name: constituent.name || 'Unknown',
        constituent_mobile: constituent.mobile_number || '',
        ward_number: constituent.ward_number || '',
        block: constituent.block || '',
        gram_panchayat: constituent.gram_panchayat || '',
        type,
        due_date: TimestampClass.fromDate(dueDate),
        status: 'PENDING',
        created_at: TimestampClass.now(),
        call_sent: false,
        sms_sent: false,
        whatsapp_sent: false,
    };
}

/**
 * Generate all dates in a range (inclusive)
 */
function* dateRange(start: Date, end: Date): Generator<Date> {
    const current = new Date(start);
    current.setHours(0, 0, 0, 0);

    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);

    while (current <= endDate) {
        yield new Date(current);
        current.setDate(current.getDate() + 1);
    }
}

/**
 * Build a set of existing task keys for O(1) duplicate lookup
 */
function buildExistingTaskKeys(existingTasks: Task[]): Set<string> {
    const keys = new Set<string>();

    for (const task of existingTasks) {
        let dueDateStr = '';

        // Handle Firestore Timestamp
        if (task.due_date && typeof task.due_date.toDate === 'function') {
            dueDateStr = formatDateStr(task.due_date.toDate());
        } else if (typeof task.due_date === 'string') {
            dueDateStr = task.due_date.split('T')[0]; // Handle ISO string
        }

        const constituentId = task.constituent_id || (task as any).constituentId;
        if (constituentId && task.type && dueDateStr) {
            keys.add(getTaskKey(constituentId, task.type, dueDateStr));
        }
    }

    return keys;
}

/**
 * Generate tasks for all birthdays and anniversaries within a date range
 * 
 * Production Features:
 * - Supports arbitrary date ranges for backfill/testing
 * - Idempotent: safely re-runnable
 * - Returns comprehensive metrics
 * - Denormalizes constituent data onto tasks for efficient queries
 * - Performance optimized: O(C + D) instead of O(C * D) where C=Constituents, D=Days
 * 
 * @param constituents - Array of constituents to scan
 * @param existingTasks - Array of existing tasks (for deduplication)
 * @param options - Date range and Timestamp class
 * @returns Result with new tasks and metrics
 */
export function generateTasksForDateRange(
    constituents: Constituent[],
    existingTasks: Task[],
    options: GenerateTasksOptions
): GenerateTasksResult {
    const { startDate, endDate, TimestampClass } = options;

    const newTasks: Task[] = [];
    const errors: string[] = [];
    let skippedDuplicates = 0;
    let birthdayCount = 0;
    let anniversaryCount = 0;

    // Build existing task lookup for O(1) deduplication
    const existingTaskKeys = buildExistingTaskKeys(existingTasks);

    // OPTIMIZATION: Build a map of target dates (MM-DD) -> Date[]
    // This allows us to iterate constituents once and look up if their dates match any target date
    const targetDatesMap = new Map<string, Date[]>();

    // We also track the "due date strings" for these target dates to avoid re-formatting later
    // Map<string, string[]> -> key MM-DD -> array of YYYY-MM-DD
    const targetDateStringsMap = new Map<string, string[]>();

    for (const date of dateRange(startDate, endDate)) {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const key = `${month}-${day}`;

        if (!targetDatesMap.has(key)) {
            targetDatesMap.set(key, []);
            targetDateStringsMap.set(key, []);
        }
        targetDatesMap.get(key)!.push(new Date(date));
        targetDateStringsMap.get(key)!.push(formatDateStr(date));
    }

    // Iterate constituents ONCE
    for (const constituent of constituents) {
        // Check Birthday
        if (constituent.dob) {
            const parts = parseDateParts(constituent.dob);
            if (parts) {
                const key = `${parts.month}-${parts.day}`;
                const matchingDates = targetDatesMap.get(key);

                if (matchingDates) {
                    const dateStrings = targetDateStringsMap.get(key)!;

                    // Create task for each matching date (usually just one, unless range spans years)
                    matchingDates.forEach((date, index) => {
                        const dueDateStr = dateStrings[index];
                        const taskKey = getTaskKey(constituent.id, 'BIRTHDAY', dueDateStr);

                        if (existingTaskKeys.has(taskKey)) {
                            skippedDuplicates++;
                        } else {
                            const task = createTask(constituent, 'BIRTHDAY', date, TimestampClass);
                            newTasks.push(task);
                            existingTaskKeys.add(taskKey);
                            birthdayCount++;
                        }
                    });
                }
            }
        }

        // Check Anniversary
        if (constituent.anniversary) {
             const parts = parseDateParts(constituent.anniversary);
            if (parts) {
                const key = `${parts.month}-${parts.day}`;
                const matchingDates = targetDatesMap.get(key);

                if (matchingDates) {
                    const dateStrings = targetDateStringsMap.get(key)!;

                    matchingDates.forEach((date, index) => {
                        const dueDateStr = dateStrings[index];
                        const taskKey = getTaskKey(constituent.id, 'ANNIVERSARY', dueDateStr);

                        if (existingTaskKeys.has(taskKey)) {
                            skippedDuplicates++;
                        } else {
                            const task = createTask(constituent, 'ANNIVERSARY', date, TimestampClass);
                            newTasks.push(task);
                            existingTaskKeys.add(taskKey);
                            anniversaryCount++;
                        }
                    });
                }
            }
        }
    }

    return {
        newTasks,
        count: newTasks.length,
        skippedDuplicates,
        birthdayCount,
        anniversaryCount,
        dateRange: {
            start: formatDateStr(startDate),
            end: formatDateStr(endDate),
        },
        errors,
    };
}
