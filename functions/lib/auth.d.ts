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
export type UserRole = 'STAFF' | 'LEADER' | 'UNASSIGNED';
/**
 * Set custom claims for a user
 * Called programmatically or from admin tools
 */
export declare function setUserRole(uid: string, role: UserRole): Promise<{
    success: boolean;
}>;
/**
 * Firestore trigger: Sync role changes to custom claims
 * Fires on users/{userId} document create/update
 */
export declare const syncRoleToClaims: import("firebase-functions/core").CloudFunction<import("firebase-functions/v2/firestore").FirestoreEvent<import("firebase-functions/v2/firestore").Change<import("firebase-functions/v2/firestore").DocumentSnapshot> | undefined, {
    userId: string;
}>>;
/**
 * Get current custom claims for a user (for debugging)
 */
export declare function getUserClaims(uid: string): Promise<Record<string, any> | undefined>;
