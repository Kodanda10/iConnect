/**
 * @file functions/src/__tests__/auth.test.ts
 * @description TDD tests for RBAC custom claims sync
 */

import { syncRoleToClaims, setUserRole } from '../auth';

// Mock firebase-admin
jest.mock('firebase-admin', () => ({
    apps: [],
    initializeApp: jest.fn(),
    auth: () => ({
        setCustomUserClaims: jest.fn().mockResolvedValue(undefined),
        getUser: jest.fn().mockResolvedValue({ customClaims: { role: 'LEADER' } }),
    }),
    firestore: () => ({
        collection: jest.fn().mockReturnThis(),
        doc: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({
            exists: true,
            data: () => ({ role: 'LEADER' }),
        }),
    }),
}));

describe('RBAC Custom Claims Sync', () => {
    describe('setUserRole', () => {
        it('sets custom claims on user', async () => {
            const result = await setUserRole('user123', 'LEADER');
            expect(result.success).toBe(true);
        });

        it('throws on invalid role', async () => {
            await expect(setUserRole('user123', 'INVALID' as any))
                .rejects.toThrow(/invalid role/i);
        });

        it('accepts STAFF role', async () => {
            const result = await setUserRole('user456', 'STAFF');
            expect(result.success).toBe(true);
        });

        it('accepts LEADER role', async () => {
            const result = await setUserRole('user789', 'LEADER');
            expect(result.success).toBe(true);
        });
    });

    describe('syncRoleToClaims trigger', () => {
        it('exports syncRoleToClaims function', () => {
            expect(syncRoleToClaims).toBeDefined();
        });
    });
});
