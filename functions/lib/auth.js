"use strict";
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
exports.syncRoleToClaims = void 0;
exports.setUserRole = setUserRole;
exports.getUserClaims = getUserClaims;
const firestore_1 = require("firebase-functions/v2/firestore");
const admin = __importStar(require("firebase-admin"));
// Ensure Admin SDK is initialized
if (admin.apps.length === 0) {
    admin.initializeApp();
}
const VALID_ROLES = ['STAFF', 'LEADER', 'UNASSIGNED'];
/**
 * Set custom claims for a user
 * Called programmatically or from admin tools
 */
async function setUserRole(uid, role) {
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
exports.syncRoleToClaims = (0, firestore_1.onDocumentWritten)({ document: "users/{userId}", region: "asia-south1" }, async (event) => {
    var _a, _b, _c, _d;
    const userId = event.params.userId;
    const before = (_b = (_a = event.data) === null || _a === void 0 ? void 0 : _a.before) === null || _b === void 0 ? void 0 : _b.data();
    const after = (_d = (_c = event.data) === null || _c === void 0 ? void 0 : _c.after) === null || _d === void 0 ? void 0 : _d.data();
    // Deleted document - clear claims
    if (!after) {
        try {
            await admin.auth().setCustomUserClaims(userId, { role: null });
            console.log(`[AUTH] Cleared claims for deleted user ${userId}`);
        }
        catch (e) {
            // User might not exist in Auth
            console.warn(`[AUTH] Could not clear claims for ${userId}`);
        }
        return;
    }
    const newRole = after.role;
    const oldRole = before === null || before === void 0 ? void 0 : before.role;
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
    }
    catch (error) {
        console.error(`[AUTH] Failed to sync claims for ${userId}:`, error.message);
    }
});
/**
 * Get current custom claims for a user (for debugging)
 */
async function getUserClaims(uid) {
    try {
        const user = await admin.auth().getUser(uid);
        return user.customClaims;
    }
    catch (error) {
        console.error(`[AUTH] Failed to get claims for ${uid}`);
        return undefined;
    }
}
//# sourceMappingURL=auth.js.map