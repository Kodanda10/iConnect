/**
 * @file index.ts
 * @description Firebase Cloud Functions entry point
 * @changelog
 * - 2024-12-11: Initial implementation with generateGreeting and dailyScan
 * - 2024-12-15: Optimized dailyScan to use indexed queries (O(1) vs O(N))
 */
import { GreetingRequest } from './greeting';
export { scanForTasks, Constituent, Task, TaskType, ScanResult, scheduleDailyNotifications } from './dailyScan';
export { generateGreetingMessage, GreetingRequest } from './greeting';
export { createMeetingTicker, createConferenceBridge } from "./meeting";
export { onMeetingCreated, onConstituentWritten } from "./triggers";
export { processPushNotifications } from "./pushProcessor";
export { createMessagingProvider, MessagingProvider, SMSResult } from "./messagingProvider";
export { queryConstituentsByAudience, sendBulkSMS } from "./audienceQuery";
export { schedulePushForLeader, determinePushTimes, formatAudioMessage } from "./notifications";
export { syncRoleToClaims, setUserRole, getUserClaims } from "./auth";
/**
 * Generate greeting message via Gemini API proxy
 * Callable function to secure API key on server side
 * Region: asia-south1 (matches Flutter client)
 */
export declare const generateGreeting: import("firebase-functions/v2/https").CallableFunction<GreetingRequest, any, unknown>;
export interface MeetingSmsBatchPayload {
    dialInNumber: string;
    accessCode: string;
    recipients: string[];
    lang?: "HINDI" | "ODIA" | "ENGLISH";
}
/**
 * Cloud Tasks handler: send meeting SMS notifications in small batches.
 *
 * This avoids unbounded fan-out inside Firestore triggers which can time out as
 * the notified constituent list grows.
 */
export declare const sendMeetingSmsBatch: import("firebase-functions/v2/tasks").TaskQueueFunction<MeetingSmsBatchPayload>;
/**
 * Daily scan cron job - runs at 00:01 AM IST every day
 * Scans constituents for birthdays/anniversaries and creates tasks
 * OPTIMIZED: Uses indexed date fields if available, falls back to full scan
 * Region: asia-south1
 */
export declare const dailyScan: import("firebase-functions/v2/scheduler").ScheduleFunction;
