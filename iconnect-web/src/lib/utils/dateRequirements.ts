/**
 * @file lib/utils/dateRequirements.ts
 * @description Validation utilities for constituent date requirements
 * @changelog
 * - 2024-12-17: Initial TDD implementation - DOB/Anniversary mandatory validation
 */

export interface ConstituentDateValidation {
    isValid: boolean;
    error?: string;
}

/**
 * Validates that a constituent has at least one date (DOB or Anniversary) for communication purposes.
 * 
 * @param dob - Date of birth in YYYY-MM-DD format or undefined/empty
 * @param anniversary - Anniversary date in YYYY-MM-DD format or undefined/empty
 * @returns Validation result with isValid flag and error message if invalid
 */
export function validateConstituentDates(
    dob?: string,
    anniversary?: string
): ConstituentDateValidation {
    // Treat empty strings as undefined
    const hasDob = dob && dob.trim().length > 0;
    const hasAnniversary = anniversary && anniversary.trim().length > 0;

    // At least one date is required for communication platform
    if (!hasDob && !hasAnniversary) {
        return {
            isValid: false,
            error: 'Either Date of Birth or Anniversary is required'
        };
    }

    // Future date check
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (hasDob) {
        const d = new Date(dob);
        if (d > today) return { isValid: false, error: 'Date of Birth cannot be in the future' };
    }

    if (hasAnniversary) {
        const a = new Date(anniversary);
        if (a > today) return { isValid: false, error: 'Anniversary cannot be in the future' };
    }

    return { isValid: true };
}
