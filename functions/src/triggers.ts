import { onDocumentCreated, onDocumentWritten } from "firebase-functions/v2/firestore";
import * as admin from 'firebase-admin';
import { determinePushTimes, formatAudioMessage } from './notifications';
import { sendPushNotification, sendSMS } from './messaging';
import { redactToken } from './utils/security';

// Ensure Admin SDK is initialized
if (admin.apps.length === 0) {
    admin.initializeApp();
}

type MonthDay = { month: number; day: number };

/**
 * Helper to get maximum days in a month (considers leap years for February)
 */
function getDaysInMonth(month: number, year?: number): number {
    // Use a safe year for validation; leap years only affect February
    const safeYear = year ?? 2000; // 2000 is a leap year
    // Create date for first day of next month, then go back one day
    return new Date(safeYear, month, 0).getDate();
}

/**
 * Validates if day is valid for the given month
 */
function isValidDayForMonth(month: number, day: number): boolean {
    if (month < 1 || month > 12) return false;
    if (day < 1) return false;
    // Check against maximum days in that month (using leap year to be lenient for Feb)
    return day <= getDaysInMonth(month);
}

function parseMonthDay(value: unknown): MonthDay | null {
    if (!value) return null;

    // Firestore Timestamp-like (admin.firestore.Timestamp or Firebase Timestamp)
    if (typeof value === 'object' && value !== null) {
        const maybeToDate = (value as any).toDate;
        if (typeof maybeToDate === 'function') {
            const date = maybeToDate.call(value) as Date;
            if (date instanceof Date && !Number.isNaN(date.getTime())) {
                return { month: date.getMonth() + 1, day: date.getDate() };
            }
        }
    }

    // Strict YYYY-MM-DD
    if (typeof value === 'string') {
        const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (match) {
            const month = Number(match[2]);
            const day = Number(match[3]);
            // FIX: Validate days per month instead of fixed 1-31
            if (isValidDayForMonth(month, day)) {
                return { month, day };
            }
            // Invalid date like Feb 30 - reject it
            console.warn(`[parseMonthDay] Rejected invalid date: month=${month}, day=${day}`);
            return null;
        }

        const parsed = new Date(value);
        if (!Number.isNaN(parsed.getTime())) {
            return { month: parsed.getMonth() + 1, day: parsed.getDate() };
        }
    }

    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return { month: value.getMonth() + 1, day: value.getDate() };
    }

    return null;
}

function buildConstituentIndexUpdates(data: Record<string, any>): Record<string, any> {
    const updates: Record<string, any> = {};

    const dob = parseMonthDay(data.dob);
    const anniversary = parseMonthDay(data.anniversary);

    if (dob) {
        if (data.dob_month !== dob.month) updates.dob_month = dob.month;
        if (data.dob_day !== dob.day) updates.dob_day = dob.day;
    } else {
        if (data.dob_month !== undefined) updates.dob_month = admin.firestore.FieldValue.delete();
        if (data.dob_day !== undefined) updates.dob_day = admin.firestore.FieldValue.delete();
    }

    if (anniversary) {
        if (data.anniversary_month !== anniversary.month) updates.anniversary_month = anniversary.month;
        if (data.anniversary_day !== anniversary.day) updates.anniversary_day = anniversary.day;
    } else {
        if (data.anniversary_month !== undefined) updates.anniversary_month = admin.firestore.FieldValue.delete();
        if (data.anniversary_day !== undefined) updates.anniversary_day = admin.firestore.FieldValue.delete();
    }

    return updates;
}

/**
 * Logic to handle new meeting creation
 * - Calculates notification schedule
 * - Sends immediate confirmation to creator
 * - Sends SMS/WhatsApp to all constituents
 */
export async function handleMeetingCreated(meetingData: any) {
    console.log(`[TRIGGER] New Meeting: ${meetingData.id} | Title: ${meetingData.title} `);

    // 1. Calculate Notification Schedule
    const scheduledTime = meetingData.scheduled_time?.toDate ? meetingData.scheduled_time.toDate() : new Date(meetingData.scheduled_time);
    const notificationTimes = determinePushTimes(scheduledTime);
    console.log(`[TRIGGER] Scheduled Notifications: Evening Before: ${notificationTimes.eveningBefore.toISOString()} | 10m Before: ${notificationTimes.tenMinBefore.toISOString()} `);

    // 2. Send Immediate Confirmation to Creator (if token available)
    const fcmToken = meetingData.fcm_token;

    if (fcmToken) {
        await sendPushNotification(
            fcmToken,
            'Meeting Scheduled',
            `You scheduled "${meetingData.title}" for ${scheduledTime.toLocaleString('en-IN')}`
        );
        console.log(`[TRIGGER] Sent confirmation push to ${redactToken(fcmToken)} `);
    } else {
        console.log('[TRIGGER] No FCM token found for creator, skipping confirmation push');
    }

    // 3. Send Bulk SMS to Constituents
    const constituents = meetingData.notified_constituents || []; // Array of { id, mobile, name } or just ids?
    // Assuming schema stores objects or we fetched them. For MVP assuming objects with mobile.
    // If just IDs, we would need to fetch. Let's assume the scheduled_meeting doc has a denormalized list or we just iterate.
    // Actually, normally we shouldn't do unbounded loops in Cloud Functions.
    // But for this feature implementation, we'll do a simple loop.

    if (constituents.length > 0) {
        const MAX_RECIPIENTS = 500; // Safety cap to avoid timeouts on very large meetings
        const BATCH_SIZE = 25;
        const DIRECT_SEND_THRESHOLD = 100; // Beyond this, prefer Cloud Tasks fan-out

        const message = formatAudioMessage({
            dialInNumber: meetingData.dial_in_number,
            accessCode: meetingData.access_code,
            lang: 'HINDI' // Default
        }, 'HINDI');

        const recipients = constituents
            .filter((c: any) => c && c.mobile)
            .slice(0, MAX_RECIPIENTS);

        console.log(`[TRIGGER] Preparing SMS for ${recipients.length}/${constituents.length} constituents...`);

        const mobiles = recipients.map((c: any) => c.mobile).filter(Boolean);

        // Prefer Cloud Tasks fan-out for larger sends to avoid trigger timeouts.
        if (mobiles.length > DIRECT_SEND_THRESHOLD) {
            try {
                const { getFunctions } = await import("firebase-admin/functions");
                const queue = getFunctions().taskQueue('locations/asia-south1/functions/sendMeetingSmsBatch');

                for (let i = 0; i < mobiles.length; i += BATCH_SIZE) {
                    const batch = mobiles.slice(i, i + BATCH_SIZE);
                    await queue.enqueue({
                        dialInNumber: meetingData.dial_in_number,
                        accessCode: meetingData.access_code,
                        recipients: batch,
                        lang: 'HINDI',
                    });
                }

                console.log(`[TRIGGER] Enqueued ${Math.ceil(mobiles.length / BATCH_SIZE)} SMS tasks for ${mobiles.length} recipients.`);
                return;
            } catch (e) {
                console.warn('[TRIGGER] Failed to enqueue Cloud Tasks, falling back to direct send:', e);
                // Fall through to direct sending below.
            }
        }

        // Direct send path (small batches, bounded concurrency).
        const TIME_BUDGET_MS = 50_000; // Try to finish well within default timeout
        const start = Date.now();
        let sent = 0;
        let failed = 0;

        for (let i = 0; i < mobiles.length; i += BATCH_SIZE) {
            if (Date.now() - start > TIME_BUDGET_MS) {
                console.warn(`[TRIGGER] SMS sending time budget exceeded; sent=${sent}, failed=${failed}, remaining=${mobiles.length - i}`);
                break;
            }

            const batch = mobiles.slice(i, i + BATCH_SIZE);
            const results = await Promise.all(batch.map(async (mobile: string) => {
                try {
                    await sendSMS(mobile, message);
                    return true;
                } catch (e) {
                    console.error('[TRIGGER] SMS send failed:', e);
                    return false;
                }
            }));

            for (const ok of results) {
                if (ok) sent += 1;
                else failed += 1;
            }
        }

        if (sent === 0 && mobiles.length > 0) {
            throw new Error('Failed to send any SMS notifications');
        }

        console.log(`[TRIGGER] SMS complete. Sent=${sent}, Failed=${failed}`);
    }
}

/**
 * Firestore Trigger: Run when a new document is added to 'scheduled_meetings'
 */
export const onMeetingCreated = onDocumentCreated("scheduled_meetings/{meetingId}", async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
        console.log("No data associated with the event");
        return;
    }

    const data = snapshot.data();
    const meetingId = event.params.meetingId;

    await handleMeetingCreated({ id: meetingId, ...data });
});

/**
 * Firestore Trigger: Normalize constituent DOB/anniversary index fields.
 *
 * Ensures `dob_month`, `dob_day`, `anniversary_month`, `anniversary_day` are
 * present and correct regardless of which client wrote the document.
 */
export const onConstituentWritten = onDocumentWritten("constituents/{constituentId}", async (event) => {
    const after = event.data?.after;
    if (!after?.exists) return;

    const data = after.data() as Record<string, any> | undefined;
    if (!data) return;

    const updates = buildConstituentIndexUpdates(data);
    if (Object.keys(updates).length === 0) return;

    await after.ref.update(updates);
});
