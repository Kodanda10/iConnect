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

        test('user can create own profile only as UNASSIGNED (or without role)', async () => {
            const db = testEnv.authenticatedContext('user1').firestore();

            // Allowed: create without role field
            await assertSucceeds(
                db.collection('users').doc('user1').set({
                    email: 'user1@test.com',
                    name: 'User One',
                })
            );

            // Allowed: create with role UNASSIGNED
            const db2 = testEnv.authenticatedContext('user2').firestore();
            await assertSucceeds(
                db2.collection('users').doc('user2').set({
                    email: 'user2@test.com',
                    name: 'User Two',
                    role: 'UNASSIGNED',
                })
            );
        });

        test('user cannot self-assign STAFF role on create', async () => {
            const db = testEnv.authenticatedContext('user3').firestore();

            await assertFails(
                db.collection('users').doc('user3').set({
                    email: 'user3@test.com',
                    name: 'User Three',
                    role: 'STAFF',
                })
            );
        });

        test('user cannot self-assign LEADER role on create', async () => {
            const db = testEnv.authenticatedContext('user4').firestore();

            await assertFails(
                db.collection('users').doc('user4').set({
                    email: 'user4@test.com',
                    name: 'User Four',
                    role: 'LEADER',
                })
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
        test('anyone can read app_config', async () => {
            await testEnv.withSecurityRulesDisabled(async (context) => {
                await context.firestore().collection('settings').doc('app_config').set({ appName: 'Test' });
            });

            const db = testEnv.unauthenticatedContext().firestore();
            await assertSucceeds(db.collection('settings').doc('app_config').get());
        });

        test('authenticated non-staff user cannot read other settings', async () => {
            await testEnv.withSecurityRulesDisabled(async (context) => {
                await context.firestore().collection('users').doc('leader1').set({ role: 'LEADER' });
                await context.firestore().collection('settings').doc('secret_config').set({ secret: '123' });
            });

            const db = testEnv.authenticatedContext('leader1').firestore();
            await assertFails(db.collection('settings').doc('secret_config').get());
        });

        test('STAFF can read other settings', async () => {
            await testEnv.withSecurityRulesDisabled(async (context) => {
                await context.firestore().collection('users').doc('staff1').set({ role: 'STAFF' });
                await context.firestore().collection('settings').doc('secret_config').set({ secret: '123' });
            });

            const db = testEnv.authenticatedContext('staff1').firestore();
            await assertSucceeds(db.collection('settings').doc('secret_config').get());
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

    describe('action_logs collection', () => {
        test('LEADER can create action logs', async () => {
            await testEnv.withSecurityRulesDisabled(async (context) => {
                await context.firestore().collection('users').doc('leader1').set({ role: 'LEADER' });
            });

            const db = testEnv.authenticatedContext('leader1').firestore();
            await assertSucceeds(
                db.collection('action_logs').doc('log1').set({
                    action_type: 'CALL',
                    constituent_id: 'c1',
                    success: true
                })
            );
        });

        test('STAFF cannot create action logs (only LEADER)', async () => {
            await testEnv.withSecurityRulesDisabled(async (context) => {
                await context.firestore().collection('users').doc('staff1').set({ role: 'STAFF' });
            });

            const db = testEnv.authenticatedContext('staff1').firestore();
            await assertFails(
                db.collection('action_logs').doc('log1').set({
                    action_type: 'SMS',
                    constituent_id: 'c1',
                    success: true
                })
            );
        });
    });

    describe('scheduled_meetings collection', () => {
        test('LEADER can create scheduled meetings', async () => {
            await testEnv.withSecurityRulesDisabled(async (context) => {
                await context.firestore().collection('users').doc('leader1').set({ role: 'LEADER' });
            });

            const db = testEnv.authenticatedContext('leader1').firestore();
            await assertSucceeds(
                db.collection('scheduled_meetings').doc('meeting1').set({
                    title: 'Town Hall',
                    dial_in_number: '+911234567890',
                    access_code: '1234'
                })
            );
        });

        test('unauthenticated user cannot read scheduled meetings', async () => {
            const db = testEnv.unauthenticatedContext().firestore();
            await assertFails(db.collection('scheduled_meetings').doc('meeting1').get());
        });
    });
});
