/**
 * @file dailyScan.ts
 * @description System Brain - Daily scan for birthdays and anniversaries
 * @changelog
 * - 2024-12-11: Initial implementation with TDD
 * - 2025-05-20: Performance optimizations (Bolt) - Single pass iteration & allocation-free date parsing
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
 * Optimized date matcher that avoids string allocation (split) for standard ISO format
 * @param dateStr Date string (YYYY-MM-DD)
 * @param targetMonth Target month (1-12)
 * @param targetDay Target day (1-31)
 */
function isDateMatchParts(dateStr: string | undefined, targetMonth: number, targetDay: number): boolean {
    if (!dateStr) return false;

    // Fast path for standard YYYY-MM-DD format (0123-56-89)
    // Avoids split() memory allocation and parseInt() overhead
    if (dateStr.length === 10 && dateStr.charCodeAt(4) === 45 && dateStr.charCodeAt(7) === 45) { // 45 is '-'
        // Parse month (chars 5,6)
        const m = (dateStr.charCodeAt(5) - 48) * 10 + (dateStr.charCodeAt(6) - 48);
        // Parse day (chars 8,9)
        const d = (dateStr.charCodeAt(8) - 48) * 10 + (dateStr.charCodeAt(9) - 48);
        return m === targetMonth && d === targetDay;
    }

    // Fallback for non-standard formats (e.g. YYYY-M-D)
    const parts = dateStr.split('-');
    if (parts.length !== 3) return false;

    const day = parseInt(parts[2], 10);
    const month = parseInt(parts[1], 10); // 1-indexed

    return day === targetDay && month === targetMonth;
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

    // Pre-calculate target date parts (1-indexed month)
    const todayM = today.getMonth() + 1;
    const todayD = today.getDate();
    const tomorrowM = tomorrow.getMonth() + 1;
    const tomorrowD = tomorrow.getDate();

    const newTasks: Task[] = [];
    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    for (const constituent of constituents) {
        // Check Birthday - Today
        if (isDateMatchParts(constituent.dob, todayM, todayD)) {
            if (!taskExists(existingTasks, constituent.id, 'BIRTHDAY', todayStr)) {
                newTasks.push(createTask(constituent, 'BIRTHDAY', today, TimestampClass));
            }
        }

        // Check Birthday - Tomorrow
        if (isDateMatchParts(constituent.dob, tomorrowM, tomorrowD)) {
            if (!taskExists(existingTasks, constituent.id, 'BIRTHDAY', tomorrowStr)) {
                newTasks.push(createTask(constituent, 'BIRTHDAY', tomorrow, TimestampClass));
            }
        }

        // Check Anniversary - Today
        if (isDateMatchParts(constituent.anniversary, todayM, todayD)) {
            if (!taskExists(existingTasks, constituent.id, 'ANNIVERSARY', todayStr)) {
                newTasks.push(createTask(constituent, 'ANNIVERSARY', today, TimestampClass));
            }
        }

        // Check Anniversary - Tomorrow
        if (isDateMatchParts(constituent.anniversary, tomorrowM, tomorrowD)) {
            if (!taskExists(existingTasks, constituent.id, 'ANNIVERSARY', tomorrowStr)) {
                newTasks.push(createTask(constituent, 'ANNIVERSARY', tomorrow, TimestampClass));
            }
        }
    }

    return {
        count: newTasks.length,
        newTasks,
    };
}

// Helper to get IST Date
function getISTDate(): Date {
    const now = new Date();
    // Get date parts in IST
    const istString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    const istDate = new Date(istString);
    return istDate;
}

/**
 * Schedule daily push notifications (Action Reminder & Heads Up)
 */
export async function scheduleDailyNotifications(
    db: admin.firestore.Firestore,
    constituents: Constituent[]
): Promise<void> {
    // 1. Force IST Date consistency
    const today = getISTDate();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Pre-calculate target date parts (1-indexed month)
    const todayM = today.getMonth() + 1;
    const todayD = today.getDate();
    const tomorrowM = tomorrow.getMonth() + 1;
    const tomorrowD = tomorrow.getDate();

    // 1. Single Pass: Calculate Counts & Collect Names
    // Optimized to avoid iterating constituents multiple times
    let todayCount = { birthdays: 0, anniversaries: 0 };
    let tomorrowCount = { birthdays: 0, anniversaries: 0 };
    const tomorrowNames: string[] = [];

    for (const c of constituents) {
        // Check Today
        const isBdayToday = isDateMatchParts(c.dob, todayM, todayD);
        const isAnnivToday = isDateMatchParts(c.anniversary, todayM, todayD);

        if (isBdayToday) todayCount.birthdays++;
        if (isAnnivToday) todayCount.anniversaries++;

        // Check Tomorrow
        const isBdayTmw = isDateMatchParts(c.dob, tomorrowM, tomorrowD);
        const isAnnivTmw = isDateMatchParts(c.anniversary, tomorrowM, tomorrowD);

        if (isBdayTmw) tomorrowCount.birthdays++;
        if (isAnnivTmw) tomorrowCount.anniversaries++;

        // Collect names for Tomorrow (if any event matches)
        if (isBdayTmw || isAnnivTmw) {
            tomorrowNames.push(c.name.split(' ')[0]);
        }
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
        headsUpTemplate = headsUpTemplate.replace(/\d+ constituents have birthdays tomorrow\.?/gi, "").trim();
    }
    if (actionTemplate) {
        actionTemplate = actionTemplate.replace(/\d+ people celebrating today\.?/gi, "").trim();
    }
    // Also remove any double spaces created by removal
    headsUpTemplate = headsUpTemplate.replace(/\s\s+/g, ' ');
    actionTemplate = actionTemplate.replace(/\s\s+/g, ' ');

    const batch = db.batch();
    const Timestamp = admin.firestore.Timestamp;

    // --- Prepare Summary String ---
    let nameSummary = "";
    if (tomorrowNames.length > 0) {
        const displayCount = 2; // Show first 2 names
        const firstNames = tomorrowNames.slice(0, displayCount).join(', ');
        const remaining = tomorrowNames.length - displayCount;

        if (remaining > 0) {
            nameSummary = `(${firstNames} & ${remaining} others)`;
        } else {
            nameSummary = `(${firstNames})`;
        }
    }

    let prefixParts = [];
    if (tomorrowCount.birthdays > 0) prefixParts.push(`${tomorrowCount.birthdays} birthdays`);
    if (tomorrowCount.anniversaries > 0) prefixParts.push(`${tomorrowCount.anniversaries} anniversaries`);
    const prefixBase = prefixParts.length > 0 ? prefixParts.join(' & ') : "";


    // --- 3. Action Reminder (Tomorrow 8:00 AM) ---
    // Note: Since scan runs at 7 PM, we schedule the Action Reminder for the NEXT morning (Tomorrow 8 AM).
    // It should target 'tomorrow's' events but say "Today" in the text (since it's read tomorrow).
    if (actionEnabled && (tomorrowCount.birthdays + tomorrowCount.anniversaries > 0)) {
        let prefix = "";
        if (prefixBase) prefix = `${prefixBase} today ${nameSummary}. `;

        // ID keyed by Tomorrow's date since it's an action for that day
        const docId = `action_${tomorrow.toISOString().split('T')[0]}_${targetUid}`;
        const scheduledFor = new Date(tomorrow);
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
    // Scan at 7 PM -> Notify at 8 PM about Tomorrow's events
    if (headsUpEnabled && (tomorrowCount.birthdays + tomorrowCount.anniversaries > 0)) {
        let prefix = "";
        if (prefixBase) prefix = `${prefixBase} tomorrow ${nameSummary}. `;

        // ID keyed by Today because it's the Heads Up sent today
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
