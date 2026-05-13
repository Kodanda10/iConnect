/**
 * @file functions/src/utils/security.ts
 * @description Security utilities for data redaction and protection
 */

/**
 * Redacts a mobile number, keeping only the last 4 digits
 * Example: +919876543210 -> ********3210
 */
export function redactMobile(mobile: string | null | undefined): string {
    if (!mobile) return '[MISSING]';
    if (mobile.length < 4) return '***';
    return '*'.repeat(Math.max(0, mobile.length - 4)) + mobile.slice(-4);
}

/**
 * Redacts message content, showing only length and first few chars
 */
export function redactMessage(message: string | null | undefined): string {
    if (!message) return '[EMPTY]';
    // Just show length to be safe, or maybe first 3 chars if critical
    // Ideally, message content shouldn't be logged at all, but for debugging flow:
    const preview = message.slice(0, 10);
    return `[${message.length} chars] ${preview}...`;
}

/**
 * Redacts email addresses
 */
export function redactEmail(email: string | null | undefined): string {
    if (!email) return '[MISSING]';
    const parts = email.split('@');
    if (parts.length !== 2) return '[INVALID_EMAIL]';
    const [local, domain] = parts;
    const redactedLocal = local.length > 2 ? local.slice(0, 2) + '***' : '***';
    return `${redactedLocal}@${domain}`;
}

/**
 * Redacts long tokens or IDs (like FCM tokens)
 */
export function redactToken(token: string | null | undefined): string {
    if (!token) return '[MISSING]';
    if (token.length < 8) return '***';
    return `${token.slice(0, 4)}...${token.slice(-4)}`;
}

/**
 * Sanitizes input strings to mitigate XSS and prompt injection
 * Limits length and strips HTML tags, standalone angle brackets, and control characters
 */
export function sanitizeInput(input: string | null | undefined): string {
    if (!input) return '';

    // Convert to string and slice to 100 chars max
    let sanitized = String(input).slice(0, 100);

    // Strip control characters (allowing newlines/tabs if needed, but for safety stripping all < 32 except maybe \n \r \t)
    // Actually, just stripping all typical control chars except whitespace
    // eslint-disable-next-line no-control-regex
    sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');

    // Aggressively remove HTML tags
    sanitized = sanitized.replace(/<[^>]*>/g, '');

    // Remove any remaining standalone angle brackets
    sanitized = sanitized.replace(/[<>]/g, '');

    return sanitized.trim();
}
