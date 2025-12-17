/**
 * @file functions/src/pushProcessor.ts
 * @description Cloud Scheduler job to process scheduled push notifications
 * 
 * Runs every minute, picks up due notifications from scheduled_notifications,
 * sends via FCM, and marks as sent.
 * 
 * @changelog
 * - 2025-12-17: Initial implementation for P0.3 System Integrity Fix
 */

import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import { sendPushNotification } from "./messaging";

// Ensure Admin SDK is initialized
if (admin.apps.length === 0) {
    admin.initializeApp();
}

/**
 * Process scheduled push notifications every minute
 * Queries scheduled_notifications where scheduledFor <= now AND sent == false
 */
export const processPushNotifications = onSchedule({
    schedule: "every 1 minutes",
    region: "asia-south1",
    timeZone: "Asia/Kolkata",
}, async () => {
    const db = admin.firestore();
    const now = admin.firestore.Timestamp.now();

    console.log(`[PUSH_PROCESSOR] Running at ${now.toDate().toISOString()}`);

    try {
        // Query pending notifications
        const pending = await db.collection("scheduled_notifications")
            .where("scheduledFor", "<=", now)
            .where("sent", "==", false)
            .limit(100)
            .get();

        if (pending.empty) {
            console.log("[PUSH_PROCESSOR] No pending notifications");
            return;
        }

        console.log(`[PUSH_PROCESSOR] Processing ${pending.size} notifications`);

        let sent = 0;
        let failed = 0;

        for (const doc of pending.docs) {
            const data = doc.data();
            const { leaderUid, title, body } = data;

            try {
                // Fetch FCM token from users collection
                const userDoc = await db.collection("users").doc(leaderUid).get();
                const userData = userDoc.data();
                const fcmToken = userData?.fcmToken;

                if (fcmToken) {
                    await sendPushNotification(fcmToken, title, body);
                    console.log(`[PUSH_PROCESSOR] Sent to ${leaderUid}`);
                    sent++;
                } else {
                    console.warn(`[PUSH_PROCESSOR] No FCM token for ${leaderUid}`);
                }

                // Mark as sent (even without token to avoid infinite retries)
                await doc.ref.update({
                    sent: true,
                    sentAt: admin.firestore.FieldValue.serverTimestamp(),
                    fcmTokenFound: !!fcmToken,
                });
            } catch (error: any) {
                console.error(`[PUSH_PROCESSOR] Failed for ${leaderUid}:`, error.message);
                failed++;

                // Increment retry count
                const retryCount = (data.retryCount || 0) + 1;
                if (retryCount >= 3) {
                    // Max retries reached, mark as failed
                    await doc.ref.update({
                        sent: true,
                        sentAt: admin.firestore.FieldValue.serverTimestamp(),
                        error: error.message,
                        retryCount,
                    });
                } else {
                    await doc.ref.update({ retryCount });
                }
            }
        }

        console.log(`[PUSH_PROCESSOR] Complete. Sent=${sent}, Failed=${failed}`);
    } catch (error) {
        console.error("[PUSH_PROCESSOR] Fatal error:", error);
        throw error;
    }
});
