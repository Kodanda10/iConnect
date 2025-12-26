/**
 * @file dailyScan.ts
 * @description System Brain - Daily scan for birthdays and anniversaries
 * @changelog
 * - 2024-12-11: Initial implementation with TDD
 */
import * as admin from 'firebase-admin';
export type TaskType = 'BIRTHDAY' | 'ANNIVERSARY';
export type TaskStatus = 'PENDING' | 'COMPLETED';
export interface Constituent {
    id: string;
    name: string;
    mobile_number: string;
    dob: string;
    anniversary?: string;
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
    due_date: any;
    status: TaskStatus;
    notes?: string;
    action_taken?: 'CALL' | 'SMS' | 'WHATSAPP';
    completed_by?: 'LEADER' | 'STAFF';
    created_at: any;
}
export interface ScanResult {
    count: number;
    newTasks: Task[];
}
/**
 * Scan constituents for upcoming birthdays and anniversaries
 * Creates tasks for today and tomorrow
 */
export declare function scanForTasks(constituents: Constituent[], existingTasks: Task[], TimestampClass: any): ScanResult;
/**
 * Schedule daily push notifications (Action Reminder & Heads Up)
 */
export declare function scheduleDailyNotifications(db: admin.firestore.Firestore, constituents: Constituent[]): Promise<void>;
