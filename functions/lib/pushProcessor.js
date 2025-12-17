"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.processPushNotifications = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const admin = __importStar(require("firebase-admin"));
const messaging_1 = require("./messaging");
// Ensure Admin SDK is initialized
if (admin.apps.length === 0) {
    admin.initializeApp();
}
/**
 * Process scheduled push notifications every minute
 * Queries scheduled_notifications where scheduledFor <= now AND sent == false
 */
exports.processPushNotifications = (0, scheduler_1.onSchedule)({
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
                const fcmToken = userData === null || userData === void 0 ? void 0 : userData.fcmToken;
                if (fcmToken) {
                    await (0, messaging_1.sendPushNotification)(fcmToken, title, body);
                    console.log(`[PUSH_PROCESSOR] Sent to ${leaderUid}`);
                    sent++;
                }
                else {
                    console.warn(`[PUSH_PROCESSOR] No FCM token for ${leaderUid}`);
                }
                // Mark as sent (even without token to avoid infinite retries)
                await doc.ref.update({
                    sent: true,
                    sentAt: admin.firestore.FieldValue.serverTimestamp(),
                    fcmTokenFound: !!fcmToken,
                });
            }
            catch (error) {
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
                }
                else {
                    await doc.ref.update({ retryCount });
                }
            }
        }
        console.log(`[PUSH_PROCESSOR] Complete. Sent=${sent}, Failed=${failed}`);
    }
    catch (error) {
        console.error("[PUSH_PROCESSOR] Fatal error:", error);
        throw error;
    }
});
//# sourceMappingURL=pushProcessor.js.map