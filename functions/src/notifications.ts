
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
