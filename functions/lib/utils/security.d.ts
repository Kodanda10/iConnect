/**
 * @file functions/src/utils/security.ts
 * @description Security utilities for data redaction and protection
 */
/**
 * Redacts a mobile number, keeping only the last 4 digits
 * Example: +919876543210 -> ********3210
 * @param mobile - The mobile number to redact
 * @return The redacted mobile number
 */
export declare function redactMobile(mobile: string | null | undefined): string;
/**
 * Redacts message content, showing only length and first few chars
 * @param message - The message content to redact
 * @return The redacted message
 */
export declare function redactMessage(message: string | null | undefined): string;
/**
 * Redacts email addresses
 * @param email - The email address to redact
 * @return The redacted email address
 */
export declare function redactEmail(email: string | null | undefined): string;
/**
 * Redacts long tokens or IDs (like FCM tokens)
 * @param token - The token to redact
 * @return The redacted token
 */
export declare function redactToken(token: string | null | undefined): string;
