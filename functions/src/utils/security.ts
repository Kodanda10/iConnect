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
 * Sanitizes input to prevent prompt injection and XSS
 */
export function sanitizeInput(input: string | undefined): string {
    if (!input) return '';

    // 1. Trim whitespace
    let sanitized = input.trim();

    // 2. Remove control characters and potential XML/HTML tags
    // This is crucial for preventing prompt injection in XML-structured prompts
    sanitized = sanitized.replace(/[<>]/g, '');

    // 3. Remove newlines to prevent prompt injection via line breaks
    sanitized = sanitized.replace(/[\r\n]+/g, ' ');

    // 4. Enforce reasonable length limit (100 chars for names is plenty)
    if (sanitized.length > 100) {
        sanitized = sanitized.substring(0, 100);
    }

    return sanitized;
}
