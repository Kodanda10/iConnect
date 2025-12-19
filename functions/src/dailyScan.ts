/**
 * @file dailyScan.ts
 * @description System Brain - Daily scan for birthdays and anniversaries
 * @changelog
 * - 2024-12-11: Initial implementation with TDD
 */

import { v4 as uuidv4 } from 'uuid';
import * as admin from 'firebase-admin';

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

/**
 * Schedule daily push notifications (Action Reminder & Heads Up)
 */
export async function scheduleDailyNotifications(
    db: admin.firestore.Firestore,
    constituents: Constituent[]
): Promise<void> {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // 1. Calculate Counts
    let todayCount = { birthdays: 0, anniversaries: 0 };
    let tomorrowCount = { birthdays: 0, anniversaries: 0 };

    for (const c of constituents) {
        if (isDateMatch(c.dob, today)) todayCount.birthdays++;
        if (isDateMatch(c.anniversary, today)) todayCount.anniversaries++;

        if (isDateMatch(c.dob, tomorrow)) tomorrowCount.birthdays++;
        if (isDateMatch(c.anniversary, tomorrow)) tomorrowCount.anniversaries++;
    }

    // 2. Fetch Settings & Leader
    const settingsDoc = await db.collection('settings').doc('app_config').get();
    const settings = settingsDoc.data();

    // Logic matches SettingsPage.tsx
    const headsUpEnabled = settings?.alertSettings?.headsUp ?? true;
    const actionEnabled = settings?.alertSettings?.action ?? true;
    let headsUpTemplate = settings?.alertSettings?.headsUpMessage || "Tomorrow's Celebrations! Tap to view the list and prepare.";
    let actionTemplate = settings?.alertSettings?.actionMessage || "Action Required! Send wishes to people celebrating today. Don't miss out!";

    let targetUid = settings?.leaderUid;
    if (!targetUid) {
        const leaderQuery = await db.collection('users').where('role', '==', 'LEADER').limit(1).get();
        if (!leaderQuery.empty) {
            targetUid = leaderQuery.docs[0].id;
        } else {
            console.warn('[DAILY_SCAN] No LEADER found to notify.');
            return;
        }
    }

    // --- Sanitization Logic ---
    // Remove "5 constituents have birthdays tomorrow" and "5 people celebrating today" 
    // to fix legacy hardcoded templates if they exist in DB.
    if (headsUpTemplate) {
        headsUpTemplate = headsUpTemplate.replace(/5 constituents have birthdays tomorrow\.?/gi, "").trim();
    }
    if (actionTemplate) {
        actionTemplate = actionTemplate.replace(/5 people celebrating today\.?/gi, "").trim();
    }
    // Also remove any double spaces created by removal
    headsUpTemplate = headsUpTemplate.replace(/\s\s+/g, ' ');
    actionTemplate = actionTemplate.replace(/\s\s+/g, ' ');

    const batch = db.batch();
    const Timestamp = admin.firestore.Timestamp;

    // --- 3. Action Reminder (Today 8:00 AM) ---
    if (actionEnabled && (todayCount.birthdays + todayCount.anniversaries > 0)) {
        let prefix = "";
        const parts = [];
        if (todayCount.birthdays > 0) parts.push(`${todayCount.birthdays} birthdays`);
        if (todayCount.anniversaries > 0) parts.push(`${todayCount.anniversaries} anniversaries`);

        if (parts.length > 0) prefix = `${parts.join(' & ')} today. `;

        const docId = `action_${today.toISOString().split('T')[0]}_${targetUid}`;
        const scheduledFor = new Date(today);
        scheduledFor.setHours(8, 0, 0, 0);

        batch.set(db.collection('scheduled_notifications').doc(docId), {
            leaderUid: targetUid,
            title: "Action Required ⚡️",
            body: `${prefix}${actionTemplate}`,
            scheduledFor: Timestamp.fromDate(scheduledFor),
            type: 'ACTION_REMINDER',
            sent: false,
            createdAt: Timestamp.now()
        });
    }

    // --- 4. Heads Up Alert (Today 8:00 PM) ---
    if (headsUpEnabled && (tomorrowCount.birthdays + tomorrowCount.anniversaries > 0)) {
        let prefix = "";
        const parts = [];
        if (tomorrowCount.birthdays > 0) parts.push(`${tomorrowCount.birthdays} birthdays`);
        if (tomorrowCount.anniversaries > 0) parts.push(`${tomorrowCount.anniversaries} anniversaries`);

        if (parts.length > 0) prefix = `${parts.join(' & ')} tomorrow. `;

        const docId = `heads_up_${today.toISOString().split('T')[0]}_${targetUid}`;
        const scheduledFor = new Date(today);
        scheduledFor.setHours(20, 0, 0, 0);

        batch.set(db.collection('scheduled_notifications').doc(docId), {
            leaderUid: targetUid,
            title: "Tomorrow's Celebrations 🎉",
            body: `${prefix}${headsUpTemplate}`,
            scheduledFor: Timestamp.fromDate(scheduledFor),
            type: 'HEADS_UP',
            sent: false,
            createdAt: Timestamp.now()
        });
    }

    await batch.commit();
    console.log(`[DAILY_SCAN] Scheduled notifications for ${targetUid}`);
}
