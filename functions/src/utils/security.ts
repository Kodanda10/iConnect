/**
 * @file functions/src/utils/security.ts
 * @description Security utilities for PII redaction and safe logging
 */

/**
 * Redacts a mobile number, keeping only the last 4 digits.
 * Example: "+911234567890" -> "*******7890"
 * Example: "1234567890" -> "******7890"
 * @param mobile The mobile number to redact
 * @returns The redacted mobile number
 */
export function redactMobile(mobile: string): string {
    if (!mobile || mobile.length < 4) return '****';
    return '*'.repeat(mobile.length - 4) + mobile.slice(-4);
}

/**
 * Redacts a message, showing only the length and a snippet if safe.
 * For now, we will just show the length to be safe.
 * @param message The message to redact
 * @returns A string indicating the message length
 */
export function redactMessage(message: string): string {
    if (!message) return '[EMPTY]';
    return `[REDACTED CONTENT: ${message.length} chars]`;
}

/**
 * Redacts an email address, masking the username but keeping the domain.
 * Example: "user@example.com" -> "u***@example.com"
 * @param email The email address to redact
 * @returns The redacted email address
 */
export function redactEmail(email: string): string {
    if (!email) return '[EMPTY]';
    const parts = email.split('@');
    if (parts.length !== 2) return '[INVALID EMAIL]';

    const [user, domain] = parts;
    if (user.length <= 1) return `*@${domain}`;

    return `${user[0]}***@${domain}`;
}

/**
 * Redacts an authentication token or key, showing only the first few characters.
 * Example: "abcdef123456" -> "ab...[12 chars]"
 * @param token The token to redact
 * @returns The redacted token
 */
export function redactToken(token: string): string {
    if (!token) return '[EMPTY]';
    if (token.length <= 4) return '***';
    return `${token.slice(0, 2)}...[${token.length} chars]`;
}
