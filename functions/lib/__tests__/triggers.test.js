"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import * as admin from 'firebase-admin';
const triggers_1 = require("../triggers");
const messaging_1 = require("../messaging");
const notifications_1 = require("../notifications");
// Mock dependencies
jest.mock('firebase-admin', () => ({
    apps: [],
    initializeApp: jest.fn(),
    firestore: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnThis(),
        doc: jest.fn().mockReturnThis(),
        add: jest.fn(),
    }),
}));
jest.mock('../messaging', () => ({
    sendPushNotification: jest.fn(),
    sendSMS: jest.fn(),
}));
jest.mock('../notifications', () => ({
    determinePushTimes: jest.fn().mockReturnValue({
        eveningBefore: new Date('2025-12-17T20:00:00'),
        tenMinBefore: new Date('2025-12-18T09:50:00'),
    }),
    formatAudioMessage: jest.fn().mockReturnValue('Formatted Message'),
}));
describe('Triggers', () => {
    describe('handleMeetingCreated', () => {
        it('calculates notification times and schedules tasks', async () => {
            const mockMeeting = {
                id: 'meeting-123',
                title: 'Test Meeting',
                scheduled_time: { toDate: () => new Date('2025-12-18T10:00:00') },
                dial_in_number: '1800-123',
                access_code: '9999',
                created_by: 'user-abc', // Leader UID
                fcm_token: 'fcm-token-abc' // Assuming we have this or fetch it
            };
            await (0, triggers_1.handleMeetingCreated)(mockMeeting);
            // Should verify times were calculated
            expect(notifications_1.determinePushTimes).toHaveBeenCalled();
            // Should send IMMEDIATE confirmation push to creator
            expect(messaging_1.sendPushNotification).toHaveBeenCalledWith('fcm-token-abc', 'Meeting Scheduled', expect.stringContaining('Test Meeting'));
        });
    });
});
//# sourceMappingURL=triggers.test.js.map