"use strict";
/**
 * @file security.ts
 * @description Security utilities for redaction and data protection
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.redactMobile = redactMobile;
exports.redactMessage = redactMessage;
exports.redactEmail = redactEmail;
exports.redactToken = redactToken;
/**
 * Redacts a mobile number for safe logging.
 * Keeps the last 4 digits visible for debugging.
 * Example: +919876543210 -> *******3210
 */
function redactMobile(mobile) {
    if (!mobile)
        return '[NO_MOBILE]';
    if (mobile.length < 5)
        return '***'; // Too short to safely redact partial
    return '*******' + mobile.slice(-4);
}
/**
 * Redacts message content for safe logging.
 * Keeps the first 10 characters to identify the message type.
 */
function redactMessage(message) {
    if (!message)
        return '[NO_MESSAGE]';
    if (message.length <= 10)
        return message;
    return message.slice(0, 10) + '...[REDACTED]';
}
/**
 * Redacts an email address.
 * Example: user@example.com -> u***@example.com
 */
function redactEmail(email) {
    if (!email)
        return '[NO_EMAIL]';
    const parts = email.split('@');
    if (parts.length !== 2)
        return '[INVALID_EMAIL]';
    const [local, domain] = parts;
    if (local.length <= 2)
        return `${local}***@${domain}`;
    return `${local.charAt(0)}***${local.charAt(local.length - 1)}@${domain}`;
}
/**
 * Redacts sensitive tokens or keys (like FCM tokens).
 * Shows first 5 and last 5 characters.
 */
function redactToken(token) {
    if (!token)
        return '[NO_TOKEN]';
    if (token.length < 15)
        return '***';
    return `${token.slice(0, 5)}...${token.slice(-5)}`;
}
//# sourceMappingURL=security.js.map