/**
 * @file index.ts
 * @description Firebase Cloud Functions entry point
 * @changelog
 * - 2024-12-11: Initial implementation with generateGreeting and dailyScan
 * - 2024-12-15: Optimized dailyScan to use indexed queries (O(1) vs O(N))
 */

import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from 'firebase-admin';
import { generateGreetingMessage, GreetingRequest } from './greeting';
import { scanForTasks, Constituent, Task } from './dailyScan';

// Explicit re-exports to avoid ambiguity
export { scanForTasks, Constituent, Task, TaskType, ScanResult } from './dailyScan';
export { generateGreetingMessage, GreetingRequest } from './greeting';
export { createMeetingTicker, createConferenceBridge } from "./meeting";
export { onMeetingCreated } from "./triggers";

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

/**
 * Generate greeting message via Gemini API proxy
 * Callable function to secure API key on server side
 * Region: asia-south1 (matches Flutter client)
 */
export const generateGreeting = onCall<GreetingRequest>(
    { region: 'asia-south1' },
    async (request) => {
        // Verify authentication
        if (!request.auth) {
            throw new HttpsError(
                'unauthenticated',
                'User must be authenticated'
            );
        }

        try {
            const message = await generateGreetingMessage(request.data);
            return { greeting: message };
        } catch (error) {
            if (error instanceof Error) {
                throw new HttpsError('invalid-argument', error.message);
            }
            throw new HttpsError('internal', 'Failed to generate greeting');
        }
    }
);

/**
 * Helper: Fetch constituents by indexed date fields (optimized O(1) query)
 */
async function fetchConstituentsByDateFields(
    monthField: string,
    dayField: string,
    month: number,
    day: number
): Promise<Constituent[]> {
    const snapshot = await db.collection('constituents')
        .where(monthField, '==', month)
        .where(dayField, '==', day)
        .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Constituent));
}

/**
 * Daily scan cron job - runs at 00:01 AM IST every day
 * Scans constituents for birthdays/anniversaries and creates tasks
 * OPTIMIZED: Uses indexed date fields if available, falls back to full scan
 * Region: asia-south1
 */
export const dailyScan = onSchedule({
    schedule: '1 0 * * *',
    timeZone: 'Asia/Kolkata',
    region: 'asia-south1',
}, async () => {
    console.log('[DAILY_SCAN] Starting at', new Date().toISOString());

    try {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const todayMonth = today.getMonth() + 1;
        const todayDay = today.getDate();
        const tomorrowMonth = tomorrow.getMonth() + 1;
        const tomorrowDay = tomorrow.getDate();

        let constituents: Constituent[] = [];

        // Try optimized queries first (requires indexed fields: dob_month, dob_day, anniversary_month, anniversary_day)
        try {
            console.log('[DAILY_SCAN] Attempting optimized indexed queries...');

            // Query birthdays for today and tomorrow
            const birthdaysToday = await fetchConstituentsByDateFields('dob_month', 'dob_day', todayMonth, todayDay);
            const birthdaysTomorrow = await fetchConstituentsByDateFields('dob_month', 'dob_day', tomorrowMonth, tomorrowDay);

            // Query anniversaries for today and tomorrow
            const anniversariesToday = await fetchConstituentsByDateFields('anniversary_month', 'anniversary_day', todayMonth, todayDay);
            const anniversariesTomorrow = await fetchConstituentsByDateFields('anniversary_month', 'anniversary_day', tomorrowMonth, tomorrowDay);

            // Merge unique constituents
            const constituentMap = new Map<string, Constituent>();
            [...birthdaysToday, ...birthdaysTomorrow, ...anniversariesToday, ...anniversariesTomorrow].forEach(c => {
                constituentMap.set(c.id, c);
            });
            constituents = Array.from(constituentMap.values());

            console.log(`[DAILY_SCAN] Optimized query found ${constituents.length} constituents with events`);
        } catch (indexError) {
            // Fallback to full scan if indexed fields don't exist
            console.warn('[DAILY_SCAN] Indexed query failed, falling back to full scan:', indexError);

            const constituentsSnapshot = await db.collection('constituents').get();
            constituentsSnapshot.forEach((doc) => {
                constituents.push({ id: doc.id, ...doc.data() } as Constituent);
            });
            console.log(`[DAILY_SCAN] Full scan loaded ${constituents.length} constituents`);
        }

        // Fetch existing tasks for today and tomorrow
        const todayStr = today.toISOString().split('T')[0];
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        const tasksSnapshot = await db
            .collection('tasks')
            .where('due_date', 'in', [todayStr, tomorrowStr])
            .get();

        const existingTasks: Task[] = [];
        tasksSnapshot.forEach((doc) => {
            existingTasks.push({ id: doc.id, ...doc.data() } as Task);
        });

        // Run the scan
        const result = scanForTasks(constituents, existingTasks);

        // Write new tasks to Firestore
        if (result.newTasks.length > 0) {
            const batch = db.batch();
            for (const task of result.newTasks) {
                const docRef = db.collection('tasks').doc(task.id);
                batch.set(docRef, task);
            }
            await batch.commit();
        }

        console.log(`[DAILY_SCAN] Complete. Created ${result.count} new tasks.`);
    } catch (error) {
        console.error('[DAILY_SCAN] Failed:', error);
        throw error;
    }
});
