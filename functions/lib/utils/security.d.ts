/**
 * @file functions/src/utils/security.ts
 * @description Security utilities for data redaction and protection
 */
/**
 * Redacts a mobile number, keeping only the last 4 digits
 * Example: +919876543210 -> ********3210
 */
export declare function redactMobile(mobile: string | null | undefined): string;
/**
 * Redacts message content, showing only length and first few chars
 */
export declare function redactMessage(message: string | null | undefined): string;
/**
 * Redacts email addresses
 */
export declare function redactEmail(email: string | null | undefined): string;
/**
 * Redacts long tokens or IDs (like FCM tokens)
 */
export declare function redactToken(token: string | null | undefined): string;
