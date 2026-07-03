/**
 * @file functions/src/pushProcessor.ts
 * @description Cloud Scheduler job to process scheduled push notifications
 *
 * Runs every minute, picks up due notifications from scheduled_notifications,
 * sends via FCM, and marks as sent.
 *
 * @changelog
 * - 2025-12-17: Initial implementation for P0.3 System Integrity Fix
 */
/**
 * Process scheduled push notifications every minute
 * Queries scheduled_notifications where scheduledFor <= now AND sent == false
 */
export declare const processPushNotifications: import("firebase-functions/v2/scheduler").ScheduleFunction;
