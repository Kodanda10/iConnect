"use strict";
/**
 * @file index.ts
 * @description Firebase Cloud Functions entry point
 * @changelog
 * - 2024-12-11: Initial implementation with generateGreeting and dailyScan
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
exports.dailyScan = exports.generateGreeting = void 0;
const https_1 = require("firebase-functions/v2/https");
const scheduler_1 = require("firebase-functions/v2/scheduler");
const admin = __importStar(require("firebase-admin"));
const greeting_1 = require("./greeting");
const dailyScan_1 = require("./dailyScan");
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
        return { message };
    }
    catch (error) {
        if (error instanceof Error) {
            throw new https_1.HttpsError('invalid-argument', error.message);
        }
        throw new https_1.HttpsError('internal', 'Failed to generate greeting');
    }
});
/**
 * Daily scan cron job - runs at 00:01 AM IST every day
 * Scans constituents for birthdays/anniversaries and creates tasks
 */
exports.dailyScan = (0, scheduler_1.onSchedule)({
    schedule: '1 0 * * *',
    timeZone: 'Asia/Kolkata',
}, async (event) => {
    console.log('Starting daily scan at', new Date().toISOString());
    try {
        // Fetch all constituents
        const constituentsSnapshot = await db.collection('constituents').get();
        const constituents = [];
        constituentsSnapshot.forEach((doc) => {
            constituents.push({ id: doc.id, ...doc.data() });
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
        const existingTasks = [];
        tasksSnapshot.forEach((doc) => {
            existingTasks.push({ id: doc.id, ...doc.data() });
        });
        // Run the scan
        const result = (0, dailyScan_1.scanForTasks)(constituents, existingTasks);
        // Write new tasks to Firestore
        const batch = db.batch();
        for (const task of result.newTasks) {
            const docRef = db.collection('tasks').doc(task.id);
            batch.set(docRef, task);
        }
        await batch.commit();
        console.log(`Daily scan complete. Created ${result.count} new tasks.`);
    }
    catch (error) {
        console.error('Daily scan failed:', error);
        throw error;
    }
});
//# sourceMappingURL=index.js.map