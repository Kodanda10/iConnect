"use strict";
/**
 * @file functions/src/audienceQuery.ts
 * @description Query constituents by audience targeting (ALL/BLOCK/GP)
 * @changelog
 * - 2025-12-17: Initial TDD implementation for Conference Call broadcast
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryConstituentsByAudience = queryConstituentsByAudience;
exports.sendBulkSMS = sendBulkSMS;
const admin = __importStar(require("firebase-admin"));
/**
 * Query constituents based on audience targeting
 * @param audience - 'ALL' | 'BLOCK' | 'GP'
 * @param block - Block name (required if audience is BLOCK or GP)
 * @param gp - GP/ULB name (required if audience is GP)
 * @returns Array of constituents with mobile numbers
 */
async function queryConstituentsByAudience(audience, block, gp) {
    const db = admin.firestore();
    let query = db.collection('constituents');
    // Apply filters based on audience type
    if (audience === 'BLOCK' && block) {
        query = query.where('block', '==', block);
        console.log(`[AUDIENCE] Filtering by Block: ${block}`);
    }
    else if (audience === 'GP' && block && gp) {
        query = query.where('block', '==', block).where('gram_panchayat', '==', gp);
        console.log(`[AUDIENCE] Filtering by GP: ${block} > ${gp}`);
    }
    else if (audience === 'ALL') {
        console.log(`[AUDIENCE] Target: ALL constituents`);
    }
    // Only get constituents with valid mobile numbers
    query = query.where('mobile', '!=', '');
    try {
        const snapshot = await query.get();
        const constituents = snapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name || '',
            mobile: doc.data().mobile || '',
            block: doc.data().block,
            gram_panchayat: doc.data().gram_panchayat,
        }));
        console.log(`[AUDIENCE] Found ${constituents.length} constituents for ${audience}`);
        return constituents;
    }
    catch (error) {
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
async function sendBulkSMS(constituents, message) {
    const { sendSMS } = await Promise.resolve().then(() => __importStar(require('./messaging')));
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
            }
            catch (e) {
                console.error(`[BULK SMS] Failed for ${mobile}:`, e);
                return false;
            }
        }));
        for (const ok of results) {
            if (ok)
                sent += 1;
            else
                failed += 1;
        }
    }
    console.log(`[BULK SMS] Complete. Sent=${sent}, Failed=${failed}`);
    return { sent, failed };
}
//# sourceMappingURL=audienceQuery.js.map