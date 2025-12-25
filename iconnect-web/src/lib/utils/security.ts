/**
 * @file lib/utils/security.ts
 * @description Security utilities for redaction and sanitization
 */

/**
 * Redacts a mobile number to hide the middle digits.
 * Retains the country code (if present) and the last 4 digits.
 *
 * Examples:
 * - "+919876543210" -> "+91 ****** 3210"
 * - "9876543210" -> "****** 3210"
 * - "+1234567890" -> "+1 ****** 7890"
 */
export function redactMobile(mobile: string): string {
    if (!mobile || mobile.length < 4) return '***';

    // Normalize slightly to handle + prefix better in logic
    const hasPlus = mobile.startsWith('+');
    const cleanNumber = hasPlus ? mobile.slice(1) : mobile;

    // If it's short, just return last 2 or 3
    if (cleanNumber.length <= 6) {
        if (cleanNumber.length <= 3) return '***'; // Very short numbers fully hidden
        return '***' + cleanNumber.slice(-2);
    }

    // Keep first 2 (plus country code context) and last 4
    // If it has country code like 91, we might want to keep it visible
    // Simple heuristic: keep first 2-3 chars if they look like country code, else hide

    const visibleEnd = cleanNumber.slice(-4);
    let visibleStart = "";

    if (hasPlus) {
        // Keep the plus and maybe first 2 digits (country code approximation)
        visibleStart = "+" + cleanNumber.slice(0, 2) + " ";
    } else if (cleanNumber.length > 10) {
        // Assume country code at start
        visibleStart = cleanNumber.slice(0, 2) + " ";
    }

    return `${visibleStart}****** ${visibleEnd}`;
}

/**
 * Redacts message content to just show length and a secure summary if needed.
 * Prevents PII leakage in logs.
 */
export function redactMessage(message: string): string {
    if (!message) return '[EMPTY]';
    return `[REDACTED] (${message.length} chars)`;
}
