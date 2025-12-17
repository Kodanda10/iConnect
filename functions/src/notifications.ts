
// import { Timestamp } from 'firebase-admin/firestore';

export interface NotificationSchedule {
    eveningBefore: Date;
    tenMinBefore: Date;
}

export interface MeetingDetails {
    dialInNumber: string;
    accessCode: string;
    lang?: 'HINDI' | 'ODIA' | 'ENGLISH';
}

/**
 * Calculate push notification times for a scheduled meeting
 * - Evening before: 8:00 PM (20:00) the day before
 * - 10 min before: Scheduled time - 10 minutes
 */
export function determinePushTimes(scheduledTime: Date): NotificationSchedule {
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
export function formatAudioMessage(details: MeetingDetails, lang: 'HINDI' | 'ODIA' | 'ENGLISH' = 'HINDI'): string {
    const { dialInNumber, accessCode } = details;

    let greeting = "Please join the conference call.";
    if (lang === 'HINDI') {
        greeting = "कृपया कॉन्फ्रेंस कॉल में शामिल हों।";
    } else if (lang === 'ODIA') {
        greeting = "ଦୟାକରି କନଫରେନ୍ସ କଲରେ ଯୋଗ ଦିଅନ୍ତୁ।";
    }

    return `${greeting} Dial: ${dialInNumber}, Code: ${accessCode}`;
}

/**
 * Schedule push notifications for the leader
 * Stores scheduled notifications in Firestore for a Cloud Scheduler job to pick up
 */
export async function schedulePushForLeader(
    leaderUid: string,
    title: string,
    scheduledTime: Date
): Promise<void> {
    const admin = (await import('firebase-admin')).default;
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

