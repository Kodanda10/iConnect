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
exports.dailyScan = exports.generateGreeting = exports.onMeetingCreated = exports.createConferenceBridge = exports.createMeetingTicker = exports.generateGreetingMessage = exports.scanForTasks = void 0;
const https_1 = require("firebase-functions/v2/https");
const scheduler_1 = require("firebase-functions/v2/scheduler");
const admin = __importStar(require("firebase-admin"));
const greeting_1 = require("./greeting");
const dailyScan_1 = require("./dailyScan");
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
// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();
/**
 * Generate greeting message via Gemini API proxy
 * Callable function to secure API key on server side
 */
exports.generateGreeting = (0, https_1.onCall)(async (request) => {
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
 */
exports.dailyScan = (0, scheduler_1.onSchedule)({
    schedule: '1 0 * * *',
    timeZone: 'Asia/Kolkata',
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
        const todayStr = today.toISOString().split('T')[0];
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        const tasksSnapshot = await db
            .collection('tasks')
            .where('due_date', 'in', [todayStr, tomorrowStr])
            .get();
        const existingTasks = [];
        tasksSnapshot.forEach((doc) => {
            existingTasks.push({ id: doc.id, ...doc.data() });
        });
        // Run the scan
        const result = (0, dailyScan_1.scanForTasks)(constituents, existingTasks);
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