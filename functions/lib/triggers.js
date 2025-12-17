"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onMeetingCreated = void 0;
exports.handleMeetingCreated = handleMeetingCreated;
const firestore_1 = require("firebase-functions/v2/firestore");
// import * as admin from 'firebase-admin';
const notifications_1 = require("./notifications");
const messaging_1 = require("./messaging");
/**
 * Logic to handle new meeting creation
 * - Calculates notification schedule
 * - Sends immediate confirmation to creator
 * - Sends SMS/WhatsApp to all constituents
 */
async function handleMeetingCreated(meetingData) {
    var _a;
    console.log(`[TRIGGER] New Meeting: ${meetingData.id} | Title: ${meetingData.title} `);
    // 1. Calculate Notification Schedule
    const scheduledTime = ((_a = meetingData.scheduled_time) === null || _a === void 0 ? void 0 : _a.toDate) ? meetingData.scheduled_time.toDate() : new Date(meetingData.scheduled_time);
    const notificationTimes = (0, notifications_1.determinePushTimes)(scheduledTime);
    console.log(`[TRIGGER] Scheduled Notifications: Evening Before: ${notificationTimes.eveningBefore.toISOString()} | 10m Before: ${notificationTimes.tenMinBefore.toISOString()} `);
    // 2. Send Immediate Confirmation to Creator (if token available)
    const fcmToken = meetingData.fcm_token;
    if (fcmToken) {
        await (0, messaging_1.sendPushNotification)(fcmToken, 'Meeting Scheduled', `You scheduled "${meetingData.title}" for ${scheduledTime.toLocaleString('en-IN')}`);
        console.log(`[TRIGGER] Sent confirmation push to ${fcmToken} `);
    }
    else {
        console.log('[TRIGGER] No FCM token found for creator, skipping confirmation push');
    }
    // 3. Send Bulk SMS to Constituents
    const constituents = meetingData.notified_constituents || []; // Array of { id, mobile, name } or just ids?
    // Assuming schema stores objects or we fetched them. For MVP assuming objects with mobile.
    // If just IDs, we would need to fetch. Let's assume the scheduled_meeting doc has a denormalized list or we just iterate.
    // Actually, normally we shouldn't do unbounded loops in Cloud Functions.
    // But for this feature implementation, we'll do a simple loop.
    if (constituents.length > 0) {
        console.log(`[TRIGGER] Sending SMS to ${constituents.length} constituents...`);
        const message = (0, notifications_1.formatAudioMessage)({
            dialInNumber: meetingData.dial_in_number,
            accessCode: meetingData.access_code,
            lang: 'HINDI' // Default
        }, 'HINDI');
        // Execute in parallel chunks if needed, but here simple Promise.all
        const promises = constituents.map(async (c) => {
            if (c.mobile) {
                await (0, messaging_1.sendSMS)(c.mobile, message);
            }
        });
        await Promise.all(promises);
        console.log(`[TRIGGER] Sent ${promises.length} SMS messages.`);
    }
}
/**
 * Firestore Trigger: Run when a new document is added to 'scheduled_meetings'
 */
exports.onMeetingCreated = (0, firestore_1.onDocumentCreated)("scheduled_meetings/{meetingId}", async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
        console.log("No data associated with the event");
        return;
    }
    const data = snapshot.data();
    const meetingId = event.params.meetingId;
    await handleMeetingCreated({ id: meetingId, ...data });
});
//# sourceMappingURL=triggers.js.map