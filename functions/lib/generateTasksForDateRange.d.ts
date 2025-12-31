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
 */
export type TaskType = 'BIRTHDAY' | 'ANNIVERSARY';
export type TaskStatus = 'PENDING' | 'COMPLETED';
export interface Constituent {
    id: string;
    name: string;
    mobile_number?: string;
    dob?: string;
    anniversary?: string;
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
    due_date: any;
    status: TaskStatus;
    notes?: string;
    action_taken?: 'CALL' | 'SMS' | 'WHATSAPP';
    completed_by?: 'LEADER' | 'STAFF';
    created_at: any;
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
 * Generate tasks for all birthdays and anniversaries within a date range
 *
 * Production Features:
 * - Supports arbitrary date ranges for backfill/testing
 * - Idempotent: safely re-runnable
 * - Returns comprehensive metrics
 * - Denormalizes constituent data onto tasks for efficient queries
 *
 * @param constituents - Array of constituents to scan
 * @param existingTasks - Array of existing tasks (for deduplication)
 * @param options - Date range and Timestamp class
 * @returns Result with new tasks and metrics
 */
export declare function generateTasksForDateRange(constituents: Constituent[], existingTasks: Task[], options: GenerateTasksOptions): GenerateTasksResult;
