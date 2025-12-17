/**
 * @file functions/src/audienceQuery.ts
 * @description Query constituents by audience targeting (ALL/BLOCK/GP)
 * @changelog
 * - 2025-12-17: Initial TDD implementation for Conference Call broadcast
 */
export interface ConstituentRecord {
    id: string;
    name: string;
    mobile: string;
    block?: string;
    gram_panchayat?: string;
    [key: string]: unknown;
}
/**
 * Query constituents based on audience targeting
 * @param audience - 'ALL' | 'BLOCK' | 'GP'
 * @param block - Block name (required if audience is BLOCK or GP)
 * @param gp - GP/ULB name (required if audience is GP)
 * @returns Array of constituents with mobile numbers
 */
export declare function queryConstituentsByAudience(audience: 'ALL' | 'BLOCK' | 'GP', block?: string, gp?: string): Promise<ConstituentRecord[]>;
/**
 * Send bulk SMS to a list of constituents
 * @param constituents - Array of constituents with mobile numbers
 * @param message - SMS message content
 * @returns Summary of sent/failed counts
 */
export declare function sendBulkSMS(constituents: ConstituentRecord[], message: string): Promise<{
    sent: number;
    failed: number;
}>;
