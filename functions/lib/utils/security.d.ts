/**
 * @file security.ts
 * @description Security utilities for redaction and data protection
 */
/**
 * Redacts a mobile number for safe logging.
 * Keeps the last 4 digits visible for debugging.
 * Example: +919876543210 -> *******3210
 */
export declare function redactMobile(mobile: string | undefined | null): string;
/**
 * Redacts message content for safe logging.
 * Keeps the first 10 characters to identify the message type.
 */
export declare function redactMessage(message: string | undefined | null): string;
/**
 * Redacts an email address.
 * Example: user@example.com -> u***@example.com
 */
export declare function redactEmail(email: string | undefined | null): string;
/**
 * Redacts sensitive tokens or keys (like FCM tokens).
 * Shows first 5 and last 5 characters.
 */
export declare function redactToken(token: string | undefined | null): string;
