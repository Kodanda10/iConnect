/**
 * @file firebase/firestore.rules.test.ts
 * @description Firestore Security Rules Test Suite
 * @changelog
 * - 2025-12-17: Initial implementation for P2 Security Validation
 */

import {
    assertFails,
    assertSucceeds,
    initializeTestEnvironment,
    RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import * as fs from 'fs';
import * as path from 'path';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
        projectId: 'iconnect-test',
        firestore: {
            rules: fs.readFileSync(path.resolve(__dirname, 'firestore.rules'), 'utf8'),
        },
    });
});

afterAll(async () => {
    await testEnv.cleanup();
});

beforeEach(async () => {
    await testEnv.clearFirestore();
});

describe('Firestore Security Rules', () => {
    describe('users collection', () => {
        test('unauthenticated user cannot read users', async () => {
            const db = testEnv.unauthenticatedContext().firestore();
            await assertFails(db.collection('users').doc('user1').get());
        });

        test('authenticated user can read own profile', async () => {
            const db = testEnv.authenticatedContext('user1').firestore();

            // Seed the user document first (as admin)
            await testEnv.withSecurityRulesDisabled(async (context) => {
                await context.firestore().collection('users').doc('user1').set({
                    email: 'user1@test.com',
                    role: 'STAFF',
                    name: 'User One'
                });
            });

            await assertSucceeds(db.collection('users').doc('user1').get());
        });

        test('user cannot read other user profiles (unless STAFF)', async () => {
            const db = testEnv.authenticatedContext('user1', { role: 'LEADER' }).firestore();

            await testEnv.withSecurityRulesDisabled(async (context) => {
                await context.firestore().collection('users').doc('user1').set({ role: 'LEADER' });
                await context.firestore().collection('users').doc('user2').set({ role: 'STAFF' });
            });

            // LEADER cannot read other users (only STAFF can)
            await assertFails(db.collection('users').doc('user2').get());
        });

        test('user cannot escalate own role', async () => {
            const db = testEnv.authenticatedContext('user1').firestore();

            await testEnv.withSecurityRulesDisabled(async (context) => {
                await context.firestore().collection('users').doc('user1').set({
                    email: 'user1@test.com',
                    role: 'STAFF',
                    name: 'User One'
                });
            });

            // Attempt to change own role from STAFF to LEADER
            await assertFails(
                db.collection('users').doc('user1').update({ role: 'LEADER' })
            );
        });

        test('LEADER can change user roles', async () => {
            await testEnv.withSecurityRulesDisabled(async (context) => {
                await context.firestore().collection('users').doc('leader1').set({ role: 'LEADER' });
                await context.firestore().collection('users').doc('user1').set({ role: 'STAFF' });
            });

            const db = testEnv.authenticatedContext('leader1').firestore();
            await assertSucceeds(
                db.collection('users').doc('user1').update({ role: 'LEADER' })
            );
        });
    });

    describe('constituents collection', () => {
        test('unauthenticated user cannot read constituents', async () => {
            const db = testEnv.unauthenticatedContext().firestore();
            await assertFails(db.collection('constituents').doc('c1').get());
        });

        test('STAFF can read constituents', async () => {
            await testEnv.withSecurityRulesDisabled(async (context) => {
                await context.firestore().collection('users').doc('staff1').set({ role: 'STAFF' });
                await context.firestore().collection('constituents').doc('c1').set({ name: 'Test' });
            });

            const db = testEnv.authenticatedContext('staff1').firestore();
            await assertSucceeds(db.collection('constituents').doc('c1').get());
        });

        test('LEADER can read constituents', async () => {
            await testEnv.withSecurityRulesDisabled(async (context) => {
                await context.firestore().collection('users').doc('leader1').set({ role: 'LEADER' });
                await context.firestore().collection('constituents').doc('c1').set({ name: 'Test' });
            });

            const db = testEnv.authenticatedContext('leader1').firestore();
            await assertSucceeds(db.collection('constituents').doc('c1').get());
        });

        test('LEADER cannot create constituents (only STAFF)', async () => {
            await testEnv.withSecurityRulesDisabled(async (context) => {
                await context.firestore().collection('users').doc('leader1').set({ role: 'LEADER' });
            });

            const db = testEnv.authenticatedContext('leader1').firestore();
            await assertFails(
                db.collection('constituents').doc('c2').set({ name: 'New Constituent' })
            );
        });
    });

    describe('tasks collection', () => {
        test('LEADER can only update status and notes, not create', async () => {
            await testEnv.withSecurityRulesDisabled(async (context) => {
                await context.firestore().collection('users').doc('leader1').set({ role: 'LEADER' });
                await context.firestore().collection('tasks').doc('t1').set({
                    constituentId: 'c1',
                    type: 'BIRTHDAY',
                    status: 'PENDING'
                });
            });

            const db = testEnv.authenticatedContext('leader1').firestore();

            // LEADER cannot create tasks
            await assertFails(
                db.collection('tasks').doc('t2').set({ type: 'BIRTHDAY', status: 'PENDING' })
            );

            // LEADER can update allowed fields
            await assertSucceeds(
                db.collection('tasks').doc('t1').update({
                    status: 'COMPLETED',
                    notes: 'Called successfully',
                    action_taken: 'CALL',
                    completed_by: 'LEADER'
                })
            );

            // LEADER cannot update disallowed fields
            await assertFails(
                db.collection('tasks').doc('t1').update({ constituentId: 'c2' })
            );
        });
    });

    describe('settings collection', () => {
        test('anyone can read settings', async () => {
            await testEnv.withSecurityRulesDisabled(async (context) => {
                await context.firestore().collection('settings').doc('app').set({ appName: 'Test' });
            });

            const db = testEnv.unauthenticatedContext().firestore();
            await assertSucceeds(db.collection('settings').doc('app').get());
        });

        test('only STAFF can write settings', async () => {
            await testEnv.withSecurityRulesDisabled(async (context) => {
                await context.firestore().collection('users').doc('leader1').set({ role: 'LEADER' });
                await context.firestore().collection('users').doc('staff1').set({ role: 'STAFF' });
            });

            const leaderDb = testEnv.authenticatedContext('leader1').firestore();
            await assertFails(leaderDb.collection('settings').doc('app').set({ appName: 'Hack' }));

            const staffDb = testEnv.authenticatedContext('staff1').firestore();
            await assertSucceeds(staffDb.collection('settings').doc('app').set({ appName: 'Official' }));
        });
    });
});
