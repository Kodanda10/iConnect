/**
 * @file index.ts
 * @description Firebase Cloud Functions entry point
 * @changelog
 * - 2024-12-11: Initial implementation with generateGreeting and dailyScan
 */
import { GreetingRequest } from './greeting';
/**
 * Generate greeting message via Gemini API proxy
 * Callable function to secure API key on server side
 */
export declare const generateGreeting: import("firebase-functions/v2/https").CallableFunction<GreetingRequest, any, unknown>;
/**
 * Daily scan cron job - runs at 00:01 AM IST every day
 * Scans constituents for birthdays/anniversaries and creates tasks
 */
export declare const dailyScan: import("firebase-functions/v2/scheduler").ScheduleFunction;
export { GreetingRequest } from './greeting';
export { Constituent, Task, ScanResult } from './dailyScan';
