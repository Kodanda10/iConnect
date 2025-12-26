/**
 * @file security.ts
 * @description Security utilities for PII redaction and safe logging
 */
/**
 * Redacts a mobile number to hide middle digits
 * Example: +919876543210 -> +9198*****210
 */
export declare function redactMobile(mobile: string | undefined): string;
/**
 * Redacts message content
 * Example: "Hello World" -> "He..." (or specific length check)
 */
export declare function redactMessage(message: string | undefined): string;
