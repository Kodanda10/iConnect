/**
 * @file functions/src/auth.ts
 * @description RBAC utilities and custom claims sync
 * 
 * Syncs Firestore user roles to Firebase Auth custom claims
 * for consistent authorization across rules and callable functions.
 * 
 * @changelog
 * - 2025-12-17: Initial implementation for P1 System Integrity Fix
 */

import { onDocumentWritten } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";

// Ensure Admin SDK is initialized
if (admin.apps.length === 0) {
    admin.initializeApp();
}

export type UserRole = 'STAFF' | 'LEADER' | 'UNASSIGNED';

const VALID_ROLES: UserRole[] = ['STAFF', 'LEADER', 'UNASSIGNED'];

/**
 * Set custom claims for a user
 * Called programmatically or from admin tools
 */
export async function setUserRole(
    uid: string,
    role: UserRole
): Promise<{ success: boolean }> {
    if (!VALID_ROLES.includes(role)) {
        throw new Error(`Invalid role: ${role}. Must be one of ${VALID_ROLES.join(', ')}`);
    }

    await admin.auth().setCustomUserClaims(uid, { role });
    console.log(`[AUTH] Set custom claims for ${uid}: role=${role}`);

    return { success: true };
}

/**
 * Firestore trigger: Sync role changes to custom claims
 * Fires on users/{userId} document create/update
 */
export const syncRoleToClaims = onDocumentWritten(
    { document: "users/{userId}", region: "asia-south1" },
    async (event) => {
        const userId = event.params.userId;
        const before = event.data?.before?.data();
        const after = event.data?.after?.data();

        // Deleted document - clear claims
        if (!after) {
            try {
                await admin.auth().setCustomUserClaims(userId, { role: null });
                console.log(`[AUTH] Cleared claims for deleted user ${userId}`);
            } catch (e) {
                // User might not exist in Auth
                console.warn(`[AUTH] Could not clear claims for ${userId}`);
            }
            return;
        }

        const newRole = after.role as UserRole;
        const oldRole = before?.role as UserRole | undefined;

        // No change in role
        if (newRole === oldRole) {
            return;
        }

        // Validate role
        if (!newRole || !VALID_ROLES.includes(newRole)) {
            console.warn(`[AUTH] Invalid role ${newRole} for ${userId}, skipping sync`);
            return;
        }

        try {
            await admin.auth().setCustomUserClaims(userId, { role: newRole });
            console.log(`[AUTH] Synced role=${newRole} for ${userId} (was: ${oldRole || 'none'})`);
        } catch (error: any) {
            console.error(`[AUTH] Failed to sync claims for ${userId}:`, error.message);
        }
    }
);

/**
 * Get current custom claims for a user (for debugging)
 */
export async function getUserClaims(uid: string): Promise<Record<string, any> | undefined> {
    try {
        const user = await admin.auth().getUser(uid);
        return user.customClaims;
    } catch (error) {
        console.error(`[AUTH] Failed to get claims for ${uid}`);
        return undefined;
    }
}
