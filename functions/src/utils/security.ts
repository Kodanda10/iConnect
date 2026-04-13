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
 * Sanitizes user input to prevent XSS and prompt injection
 * Strips HTML tags, angle brackets, and limits length
 */
export function sanitizeInput(input: string | null | undefined): string {
    if (!input) return '';

    // 1. Enforce max length of 100 characters to mitigate large prompt injection
    let sanitized = input.slice(0, 100);

    // 2. Remove HTML tags completely (e.g., <script>...</script>)
    sanitized = sanitized.replace(/<[^>]*>/g, '');

    // 3. Remove standalone angle brackets to prevent unclosed tag issues
    sanitized = sanitized.replace(/[<>]/g, '');

    // 4. Remove control characters
    // eslint-disable-next-line no-control-regex
    sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');

    return sanitized.trim();
}
