/**
 * @file lib/utils/validation.ts
 * @description Phone number and form field validation utilities
 * @changelog
 * - 2024-12-12: Initial implementation following TDD (phone validation)
 */

// Dummy/test numbers that should be rejected
const DUMMY_NUMBERS = [
    '0000000000',
    '1111111111',
    '2222222222',
    '3333333333',
    '4444444444',
    '5555555555',
    '6666666666',
    '7777777777',
    '8888888888',
    '9999999999',
    '1234567890',
    '0123456789',
];

/**
 * Validates an Indian mobile number
 * - Must be exactly 10 digits
 * - Must start with 6, 7, 8, or 9
 * - Must not be a dummy/test number
 * - Must contain only digits
 */
export function isValidIndianMobile(phone: string): boolean {
    if (!phone || typeof phone !== 'string') {
        return false;
    }

    // Trim whitespace from ends
    const trimmed = phone.trim();

    // Must be exactly 10 digits
    if (!/^\d{10}$/.test(trimmed)) {
        return false;
    }

    // Must start with 6, 7, 8, or 9
    if (!/^[6-9]/.test(trimmed)) {
        return false;
    }

    // Must not be a dummy number
    if (DUMMY_NUMBERS.includes(trimmed)) {
        return false;
    }

    return true;
}

/**
 * Validates a WhatsApp number (optional field)
 * - If empty/undefined, it's valid (field is optional)
 * - If provided, same rules as Indian mobile apply
 */
export function isValidWhatsApp(phone: string | undefined): boolean {
    // Empty is valid (optional field)
    if (!phone || phone.trim() === '') {
        return true;
    }

    // If provided, must be a valid Indian mobile number
    return isValidIndianMobile(phone);
}
