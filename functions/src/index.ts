/**
 * @file index.ts
 * @description Firebase Cloud Functions entry point
 * @changelog
 * - 2024-12-11: Initial implementation with generateGreeting and dailyScan
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { generateGreetingMessage, GreetingRequest } from './greeting';
import { scanForTasks, Constituent, Task } from './dailyScan';

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

/**
 * Generate greeting message via Gemini API proxy
 * Callable function to secure API key on server side
 */
export const generateGreeting = functions.https.onCall(
    async (data: GreetingRequest, context) => {
        // Verify authentication
        if (!context.auth) {
            throw new functions.https.HttpsError(
                'unauthenticated',
                'User must be authenticated'
            );
        }

        try {
            const message = await generateGreetingMessage(data);
            return { message };
        } catch (error) {
            if (error instanceof Error) {
                throw new functions.https.HttpsError('invalid-argument', error.message);
            }
            throw new functions.https.HttpsError('internal', 'Failed to generate greeting');
        }
    }
);

/**
 * Daily scan cron job - runs at 00:01 AM IST every day
 * Scans constituents for birthdays/anniversaries and creates tasks
 */
export const dailyScan = functions.pubsub
    .schedule('1 0 * * *') // Every day at 00:01
    .timeZone('Asia/Kolkata')
    .onRun(async (context) => {
        console.log('Starting daily scan at', new Date().toISOString());

        try {
            // Fetch all constituents
            const constituentsSnapshot = await db.collection('constituents').get();
            const constituents: Constituent[] = [];

            constituentsSnapshot.forEach((doc) => {
                constituents.push({ id: doc.id, ...doc.data() } as Constituent);
            });

            // Fetch existing tasks for today and tomorrow
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);

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
            const batch = db.batch();
            for (const task of result.newTasks) {
                const docRef = db.collection('tasks').doc(task.id);
                batch.set(docRef, task);
            }
            await batch.commit();

            console.log(`Daily scan complete. Created ${result.count} new tasks.`);
            return null;
        } catch (error) {
            console.error('Daily scan failed:', error);
            throw error;
        }
    });

// Export types for testing
export { GreetingRequest } from './greeting';
export { Constituent, Task, ScanResult } from './dailyScan';
