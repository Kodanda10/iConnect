"use strict";
/**
 * @file functions/src/utils/security.ts
 * @description Security utilities for data redaction and protection
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.redactMobile = redactMobile;
exports.redactMessage = redactMessage;
exports.redactEmail = redactEmail;
exports.redactToken = redactToken;
/**
 * Redacts a mobile number, keeping only the last 4 digits
 * Example: +919876543210 -> ********3210
 */
function redactMobile(mobile) {
    if (!mobile)
        return '[MISSING]';
    if (mobile.length < 4)
        return '***';
    return '*'.repeat(Math.max(0, mobile.length - 4)) + mobile.slice(-4);
}
/**
 * Redacts message content, showing only length and first few chars
 */
function redactMessage(message) {
    if (!message)
        return '[EMPTY]';
    // Just show length to be safe, or maybe first 3 chars if critical
    // Ideally, message content shouldn't be logged at all, but for debugging flow:
    const preview = message.slice(0, 10);
    return `[${message.length} chars] ${preview}...`;
}
/**
 * Redacts email addresses
 */
function redactEmail(email) {
    if (!email)
        return '[MISSING]';
    const parts = email.split('@');
    if (parts.length !== 2)
        return '[INVALID_EMAIL]';
    const [local, domain] = parts;
    const redactedLocal = local.length > 2 ? local.slice(0, 2) + '***' : '***';
    return `${redactedLocal}@${domain}`;
}
/**
 * Redacts long tokens or IDs (like FCM tokens)
 */
function redactToken(token) {
    if (!token)
        return '[MISSING]';
    if (token.length < 8)
        return '***';
    return `${token.slice(0, 4)}...${token.slice(-4)}`;
}
//# sourceMappingURL=security.js.map