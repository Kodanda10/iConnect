/**
 * @file functions/src/audienceQuery.ts
 * @description Query constituents by audience targeting (ALL/BLOCK/GP)
 * @changelog
 * - 2025-12-17: Initial TDD implementation for Conference Call broadcast
 */

import * as admin from 'firebase-admin';

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
export async function queryConstituentsByAudience(
    audience: 'ALL' | 'BLOCK' | 'GP',
    block?: string,
    gp?: string
): Promise<ConstituentRecord[]> {
    const db = admin.firestore();
    let query: FirebaseFirestore.Query = db.collection('constituents');

    // Apply filters based on audience type
    if (audience === 'BLOCK' && block) {
        query = query.where('block', '==', block);
        console.log(`[AUDIENCE] Filtering by Block: ${block}`);
    } else if (audience === 'GP' && block && gp) {
        query = query.where('block', '==', block).where('gram_panchayat', '==', gp);
        console.log(`[AUDIENCE] Filtering by GP: ${block} > ${gp}`);
    } else if (audience === 'ALL') {
        console.log(`[AUDIENCE] Target: ALL constituents`);
    }

    // Only get constituents with valid mobile numbers
    query = query.where('mobile', '!=', '');

    try {
        const snapshot = await query.get();
        const constituents: ConstituentRecord[] = snapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name || '',
            mobile: doc.data().mobile || '',
            block: doc.data().block,
            gram_panchayat: doc.data().gram_panchayat,
        }));

        console.log(`[AUDIENCE] Found ${constituents.length} constituents for ${audience}`);
        return constituents;
    } catch (error) {
        console.error('[AUDIENCE] Query failed:', error);
        throw error;
    }
}

/**
 * Send bulk SMS to a list of constituents
 * @param constituents - Array of constituents with mobile numbers
 * @param message - SMS message content
 * @returns Summary of sent/failed counts
 */
export async function sendBulkSMS(
    constituents: ConstituentRecord[],
    message: string
): Promise<{ sent: number; failed: number }> {
    const { sendSMS } = await import('./messaging');

    const BATCH_SIZE = 25;
    const TIME_BUDGET_MS = 50000;
    const start = Date.now();
    let sent = 0;
    let failed = 0;

    const mobiles = constituents.map(c => c.mobile).filter(Boolean);
    console.log(`[BULK SMS] Starting send to ${mobiles.length} recipients`);

    for (let i = 0; i < mobiles.length; i += BATCH_SIZE) {
        if (Date.now() - start > TIME_BUDGET_MS) {
            console.warn(`[BULK SMS] Time budget exceeded; sent=${sent}, failed=${failed}, remaining=${mobiles.length - i}`);
            break;
        }

        const batch = mobiles.slice(i, i + BATCH_SIZE);
        const results = await Promise.all(batch.map(async (mobile) => {
            try {
                await sendSMS(mobile, message);
                return true;
            } catch (e) {
                console.error(`[BULK SMS] Failed for ${mobile}:`, e);
                return false;
            }
        }));

        for (const ok of results) {
            if (ok) sent += 1;
            else failed += 1;
        }
    }

    console.log(`[BULK SMS] Complete. Sent=${sent}, Failed=${failed}`);
    return { sent, failed };
}
