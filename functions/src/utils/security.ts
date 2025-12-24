/**
 * @file functions/src/utils/security.ts
 * @description Security utility functions for PII redaction and safe logging.
 *
 * @changelog
 * - 2024-12-18: Initial implementation to support PII redaction in logs.
 */

/**
 * Redacts a phone number, keeping only the last 4 digits visible.
 * Example: "+919876543210" -> "*******3210"
 */
export function redactPhoneNumber(phone: string | null | undefined): string {
    if (!phone) return '[MISSING]';
    if (phone.length < 4) return '****'; // Too short to show anything safely
    return '*'.repeat(phone.length - 4) + phone.slice(-4);
}

/**
 * Redacts message content to prevent sensitive information leakage in logs.
 * Truncates and masks the content.
 */
export function redactMessageContent(message: string | null | undefined): string {
    if (!message) return '[EMPTY]';
    const maxLength = 20;
    const truncated = message.length > maxLength ? message.substring(0, maxLength) + '...' : message;
    return `[REDACTED CONTENT (${message.length} chars)]: ${truncated.replace(/./g, '*')}`;
}

/**
 * Safely stringifies an error object, removing potential secrets or PII if possible.
 * (Basic implementation - in future can strip specific keys)
 */
export function safeError(error: any): string {
    if (error instanceof Error) {
        return error.message; // Avoid stack traces in production logs if possible
    }
    return String(error);
}
