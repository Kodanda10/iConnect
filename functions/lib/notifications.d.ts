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
export declare function determinePushTimes(scheduledTime: Date): NotificationSchedule;
/**
 * Format the audio/SMS message payload
 */
export declare function formatAudioMessage(details: MeetingDetails, lang?: 'HINDI' | 'ODIA' | 'ENGLISH'): string;
/**
 * Schedule push notifications for the leader
 * Stores scheduled notifications in Firestore for a Cloud Scheduler job to pick up
 */
export declare function schedulePushForLeader(leaderUid: string, title: string, scheduledTime: Date): Promise<void>;
