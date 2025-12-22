/**
 * @file security.ts
 * @description Security utilities for redaction and sanitization
 */

/**
 * Redacts a mobile number, keeping only the last 4 digits.
 * Example: +919876543210 -> *******3210
 */
export function redactMobile(mobile: string): string {
    if (!mobile || mobile.length < 4) return '****';
    return '*'.repeat(mobile.length - 4) + mobile.slice(-4);
}

/**
 * Redacts message content for logs.
 * Example: "Hello World" -> "Hello W... (11 chars)"
 */
export function redactMessage(message: string): string {
    if (!message) return '';
    if (message.length <= 10) return '*'.repeat(message.length);
    return `${message.substring(0, 5)}... (${message.length} chars)`;
}
