"use strict";
/**
 * @file security.ts
 * @description Security utilities for PII redaction and safe logging
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.redactMobile = redactMobile;
exports.redactMessage = redactMessage;
/**
 * Redacts a mobile number to hide middle digits
 * Example: +919876543210 -> +9198*****210
 */
function redactMobile(mobile) {
    if (!mobile)
        return "[UNDEFINED]";
    if (mobile.length < 8)
        return "****"; // Too short to mask safely
    // Keep first 5 and last 3 chars
    const prefix = mobile.substring(0, 5);
    const suffix = mobile.substring(mobile.length - 3);
    return `${prefix}*****${suffix}`;
}
/**
 * Redacts message content
 * Example: "Hello World" -> "He..." (or specific length check)
 */
function redactMessage(message) {
    if (!message)
        return "[UNDEFINED]";
    return "[REDACTED]";
}
//# sourceMappingURL=security.js.map