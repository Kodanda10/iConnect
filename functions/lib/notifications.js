"use strict";
// import { Timestamp } from 'firebase-admin/firestore';
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
exports.determinePushTimes = determinePushTimes;
exports.formatAudioMessage = formatAudioMessage;
exports.schedulePushForLeader = schedulePushForLeader;
/**
 * Calculate push notification times for a scheduled meeting
 * - Evening before: 8:00 PM (20:00) the day before
 * - 10 min before: Scheduled time - 10 minutes
 */
function determinePushTimes(scheduledTime) {
    // Clone to reset time
    const eveningBefore = new Date(scheduledTime);
    eveningBefore.setDate(eveningBefore.getDate() - 1);
    eveningBefore.setHours(20, 0, 0, 0); // 8:00 PM
    const tenMinBefore = new Date(scheduledTime);
    tenMinBefore.setMinutes(tenMinBefore.getMinutes() - 10);
    return { eveningBefore, tenMinBefore };
}
/**
 * Format the audio/SMS message payload
 */
function formatAudioMessage(details, lang = 'HINDI') {
    const { dialInNumber, accessCode } = details;
    let greeting = "Please join the conference call.";
    if (lang === 'HINDI') {
        greeting = "कृपया कॉन्फ्रेंस कॉल में शामिल हों।";
    }
    else if (lang === 'ODIA') {
        greeting = "ଦୟାକରି କନଫରେନ୍ସ କଲରେ ଯୋଗ ଦିଅନ୍ତୁ।";
    }
    return `${greeting} Dial: ${dialInNumber}, Code: ${accessCode}`;
}
/**
 * Schedule push notifications for the leader
 * Stores scheduled notifications in Firestore for a Cloud Scheduler job to pick up
 */
async function schedulePushForLeader(leaderUid, title, scheduledTime) {
    const admin = (await Promise.resolve().then(() => __importStar(require('firebase-admin')))).default;
    const db = admin.firestore();
    const { eveningBefore, tenMinBefore } = determinePushTimes(scheduledTime);
    const notifications = [
        {
            leaderUid,
            title: `Reminder: ${title}`,
            body: `Your conference call is scheduled for tomorrow.`,
            scheduledFor: admin.firestore.Timestamp.fromDate(eveningBefore),
            type: 'EVENING_REMINDER',
            sent: false,
        },
        {
            leaderUid,
            title: `Starting Soon: ${title}`,
            body: `Your conference call starts in 10 minutes. Prepare to join!`,
            scheduledFor: admin.firestore.Timestamp.fromDate(tenMinBefore),
            type: 'TEN_MIN_REMINDER',
            sent: false,
        },
    ];
    const batch = db.batch();
    for (const notif of notifications) {
        const ref = db.collection('scheduled_notifications').doc();
        batch.set(ref, notif);
    }
    await batch.commit();
    console.log(`[PUSH] Scheduled 2 notifications for leader ${leaderUid}:`);
    console.log(`  - Evening before (${eveningBefore.toISOString()})`);
    console.log(`  - 10 min before (${tenMinBefore.toISOString()})`);
}
//# sourceMappingURL=notifications.js.map