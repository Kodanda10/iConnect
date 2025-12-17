"use strict";
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
const admin = __importStar(require("firebase-admin"));
const messaging_1 = require("../messaging");
// Mock Firebase Admin
jest.mock('firebase-admin', () => ({
    messaging: jest.fn().mockReturnValue({
        send: jest.fn().mockResolvedValue('projects/id/messages/123'),
        sendEachForMulticast: jest.fn().mockResolvedValue({ successCount: 1, failureCount: 0 }),
    }),
}));
describe('Messaging Service', () => {
    describe('sendPushNotification', () => {
        it('sends FCM message to a specific token', async () => {
            const token = 'fcm-token-123';
            const title = 'Meeting Scheduled';
            const body = 'Join now';
            const messageId = await (0, messaging_1.sendPushNotification)(token, title, body);
            expect(messageId).toBe('projects/id/messages/123');
            expect(admin.messaging().send).toHaveBeenCalledWith(expect.objectContaining({
                token,
                notification: { title, body }
            }));
        });
    });
    describe('sendSMS', () => {
        it('logs SMS to console (Mock Only)', async () => {
            const mobile = '+919999999999';
            const message = 'Hello World';
            const success = await (0, messaging_1.sendSMS)(mobile, message);
            expect(success).toBe(true);
            // In real impl, checking console or mock axios
        });
    });
});
//# sourceMappingURL=messaging.test.js.map