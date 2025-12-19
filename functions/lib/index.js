"use strict";
/**
 * @file index.ts
 * @description Firebase Cloud Functions entry point
 * @changelog
 * - 2024-12-11: Initial implementation with generateGreeting and dailyScan
 * - 2024-12-15: Optimized dailyScan to use indexed queries (O(1) vs O(N))
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
exports.dailyScan = exports.sendMeetingSmsBatch = exports.generateGreeting = exports.getUserClaims = exports.setUserRole = exports.syncRoleToClaims = exports.formatAudioMessage = exports.determinePushTimes = exports.schedulePushForLeader = exports.sendBulkSMS = exports.queryConstituentsByAudience = exports.createMessagingProvider = exports.processPushNotifications = exports.onConstituentWritten = exports.onMeetingCreated = exports.createConferenceBridge = exports.createMeetingTicker = exports.generateGreetingMessage = exports.scanForTasks = void 0;
const https_1 = require("firebase-functions/v2/https");
const scheduler_1 = require("firebase-functions/v2/scheduler");
const tasks_1 = require("firebase-functions/v2/tasks");
const admin = __importStar(require("firebase-admin"));
const greeting_1 = require("./greeting");
const dailyScan_1 = require("./dailyScan");
const notifications_1 = require("./notifications");
const messaging_1 = require("./messaging");
// Explicit re-exports to avoid ambiguity
var dailyScan_2 = require("./dailyScan");
Object.defineProperty(exports, "scanForTasks", { enumerable: true, get: function () { return dailyScan_2.scanForTasks; } });
var greeting_2 = require("./greeting");
Object.defineProperty(exports, "generateGreetingMessage", { enumerable: true, get: function () { return greeting_2.generateGreetingMessage; } });
var meeting_1 = require("./meeting");
Object.defineProperty(exports, "createMeetingTicker", { enumerable: true, get: function () { return meeting_1.createMeetingTicker; } });
Object.defineProperty(exports, "createConferenceBridge", { enumerable: true, get: function () { return meeting_1.createConferenceBridge; } });
var triggers_1 = require("./triggers");
Object.defineProperty(exports, "onMeetingCreated", { enumerable: true, get: function () { return triggers_1.onMeetingCreated; } });
Object.defineProperty(exports, "onConstituentWritten", { enumerable: true, get: function () { return triggers_1.onConstituentWritten; } });
// P0 System Integrity: New exports
var pushProcessor_1 = require("./pushProcessor");
Object.defineProperty(exports, "processPushNotifications", { enumerable: true, get: function () { return pushProcessor_1.processPushNotifications; } });
var messagingProvider_1 = require("./messagingProvider");
Object.defineProperty(exports, "createMessagingProvider", { enumerable: true, get: function () { return messagingProvider_1.createMessagingProvider; } });
var audienceQuery_1 = require("./audienceQuery");
Object.defineProperty(exports, "queryConstituentsByAudience", { enumerable: true, get: function () { return audienceQuery_1.queryConstituentsByAudience; } });
Object.defineProperty(exports, "sendBulkSMS", { enumerable: true, get: function () { return audienceQuery_1.sendBulkSMS; } });
var notifications_2 = require("./notifications");
Object.defineProperty(exports, "schedulePushForLeader", { enumerable: true, get: function () { return notifications_2.schedulePushForLeader; } });
Object.defineProperty(exports, "determinePushTimes", { enumerable: true, get: function () { return notifications_2.determinePushTimes; } });
Object.defineProperty(exports, "formatAudioMessage", { enumerable: true, get: function () { return notifications_2.formatAudioMessage; } });
// P1 RBAC: Custom claims sync
var auth_1 = require("./auth");
Object.defineProperty(exports, "syncRoleToClaims", { enumerable: true, get: function () { return auth_1.syncRoleToClaims; } });
Object.defineProperty(exports, "setUserRole", { enumerable: true, get: function () { return auth_1.setUserRole; } });
Object.defineProperty(exports, "getUserClaims", { enumerable: true, get: function () { return auth_1.getUserClaims; } });
// Initialize Firebase Admin
if (admin.apps.length === 0) {
    admin.initializeApp();
}
const db = admin.firestore();
/**
 * Generate greeting message via Gemini API proxy
 * Callable function to secure API key on server side
 * Region: asia-south1 (matches Flutter client)
 */
exports.generateGreeting = (0, https_1.onCall)({ region: 'asia-south1' }, async (request) => {
    // Verify authentication
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    try {
        const message = await (0, greeting_1.generateGreetingMessage)(request.data);
        return { greeting: message };
    }
    catch (error) {
        if (error instanceof Error) {
            throw new https_1.HttpsError('invalid-argument', error.message);
        }
        throw new https_1.HttpsError('internal', 'Failed to generate greeting');
    }
});
/**
 * Cloud Tasks handler: send meeting SMS notifications in small batches.
 *
 * This avoids unbounded fan-out inside Firestore triggers which can time out as
 * the notified constituent list grows.
 */
exports.sendMeetingSmsBatch = (0, tasks_1.onTaskDispatched)({
    region: "asia-south1",
    retryConfig: {
        maxAttempts: 5,
        minBackoffSeconds: 10,
        maxBackoffSeconds: 300,
    },
    rateLimits: {
        maxConcurrentDispatches: 10,
        maxDispatchesPerSecond: 50,
    },
    timeoutSeconds: 300,
}, async (request) => {
    const { dialInNumber, accessCode, recipients, lang } = request.data || {};
    if (!dialInNumber || !accessCode || !Array.isArray(recipients) || recipients.length === 0) {
        // Returning 2xx (no throw) prevents infinite retries on malformed payloads.
        console.warn("[TASK] sendMeetingSmsBatch: invalid payload, skipping");
        return;
    }
    const message = (0, notifications_1.formatAudioMessage)({ dialInNumber, accessCode, lang: lang !== null && lang !== void 0 ? lang : "HINDI" }, lang !== null && lang !== void 0 ? lang : "HINDI");
    let sent = 0;
    let failed = 0;
    for (const mobile of recipients) {
        try {
            await (0, messaging_1.sendSMS)(mobile, message);
            sent += 1;
        }
        catch (e) {
            failed += 1;
            console.error("[TASK] SMS send failed:", e);
        }
    }
    if (sent === 0) {
        // Throw to trigger retry when provider is down.
        throw new Error("Failed to send any SMS in batch");
    }
    console.log(`[TASK] sendMeetingSmsBatch complete. Sent=${sent}, Failed=${failed}`);
});
/**
 * Helper: Fetch constituents by indexed date fields (optimized O(1) query)
 */
async function fetchConstituentsByDateFields(monthField, dayField, month, day) {
    const snapshot = await db.collection('constituents')
        .where(monthField, '==', month)
        .where(dayField, '==', day)
        .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
/**
 * Daily scan cron job - runs at 00:01 AM IST every day
 * Scans constituents for birthdays/anniversaries and creates tasks
 * OPTIMIZED: Uses indexed date fields if available, falls back to full scan
 * Region: asia-south1
 */
exports.dailyScan = (0, scheduler_1.onSchedule)({
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
        let constituents = [];
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
            const constituentMap = new Map();
            [...birthdaysToday, ...birthdaysTomorrow, ...anniversariesToday, ...anniversariesTomorrow].forEach(c => {
                constituentMap.set(c.id, c);
            });
            constituents = Array.from(constituentMap.values());
            console.log(`[DAILY_SCAN] Optimized query found ${constituents.length} constituents with events`);
            // If optimized queries return 0 results, the index fields might not be populated yet.
            // In that case, fall back to full scan to preserve correctness (and log loudly).
            if (constituents.length === 0) {
                const sample = await db.collection('constituents').limit(1).get();
                if (!sample.empty) {
                    const sampleData = sample.docs[0].data();
                    const hasIndexFields = (typeof sampleData.dob_month === 'number' && typeof sampleData.dob_day === 'number') ||
                        (typeof sampleData.anniversary_month === 'number' && typeof sampleData.anniversary_day === 'number');
                    if (!hasIndexFields) {
                        console.warn('[DAILY_SCAN] Index fields missing on constituents; falling back to full scan for correctness.');
                        const constituentsSnapshot = await db.collection('constituents').get();
                        constituentsSnapshot.forEach((doc) => {
                            constituents.push({ id: doc.id, ...doc.data() });
                        });
                        console.log(`[DAILY_SCAN] Full scan loaded ${constituents.length} constituents`);
                    }
                }
            }
        }
        catch (indexError) {
            // Fallback to full scan if indexed fields don't exist
            console.warn('[DAILY_SCAN] Indexed query failed, falling back to full scan:', indexError);
            const constituentsSnapshot = await db.collection('constituents').get();
            constituentsSnapshot.forEach((doc) => {
                constituents.push({ id: doc.id, ...doc.data() });
            });
            console.log(`[DAILY_SCAN] Full scan loaded ${constituents.length} constituents`);
        }
        // Fetch existing tasks for today and tomorrow
        const todayStart = new Date(today);
        todayStart.setHours(0, 0, 0, 0);
        const tomorrowEnd = new Date(tomorrow);
        tomorrowEnd.setHours(23, 59, 59, 999);
        const tasksSnapshot = await db
            .collection('tasks')
            .where('due_date', '>=', admin.firestore.Timestamp.fromDate(todayStart))
            .where('due_date', '<=', admin.firestore.Timestamp.fromDate(tomorrowEnd))
            .get();
        const existingTasks = [];
        tasksSnapshot.forEach((doc) => {
            existingTasks.push({ id: doc.id, ...doc.data() });
        });
        // Run the scan with admin.firestore.Timestamp class passed for object creation
        const result = (0, dailyScan_1.scanForTasks)(constituents, existingTasks, admin.firestore.Timestamp);
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
    }
    catch (error) {
        console.error('[DAILY_SCAN] Failed:', error);
        throw error;
    }
});
//# sourceMappingURL=index.js.map