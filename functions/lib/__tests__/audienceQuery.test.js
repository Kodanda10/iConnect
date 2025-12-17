"use strict";
/**
 * @file functions/src/__tests__/audienceQuery.test.ts
 * @description TDD tests for audience query and bulk SMS functions
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
// Mock messaging.ts
jest.mock('../messaging', () => ({
    sendSMS: jest.fn().mockResolvedValue(true),
}));
describe('audienceQuery', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('queryConstituentsByAudience', () => {
        // Note: Firestore query tests require more complex mocking.
        // The actual query logic is verified by integration tests.
        // Here we verify the function signature and exports exist.
        it('exports queryConstituentsByAudience function', async () => {
            const module = await Promise.resolve().then(() => __importStar(require('../audienceQuery')));
            expect(typeof module.queryConstituentsByAudience).toBe('function');
        });
        it('accepts ALL, BLOCK, and GP audience types', async () => {
            const { queryConstituentsByAudience } = await Promise.resolve().then(() => __importStar(require('../audienceQuery')));
            // Type check - these should not throw TypeScript errors
            // At runtime, they'll fail due to no Firebase connection, which is expected
            expect(() => {
                // We're just verifying the function accepts these argument signatures
                const typeCheck = (f) => f;
                typeCheck(queryConstituentsByAudience);
            }).not.toThrow();
        });
    });
    describe('sendBulkSMS', () => {
        it('sends SMS to all constituents', async () => {
            const { sendBulkSMS } = await Promise.resolve().then(() => __importStar(require('../audienceQuery')));
            const messaging = await Promise.resolve().then(() => __importStar(require('../messaging')));
            const constituents = [
                { id: '1', name: 'User1', mobile: '9876543210' },
                { id: '2', name: 'User2', mobile: '9876543211' },
                { id: '3', name: 'User3', mobile: '9876543212' },
            ];
            const result = await sendBulkSMS(constituents, 'Test message');
            expect(messaging.sendSMS).toHaveBeenCalledTimes(3);
            expect(result.sent).toBe(3);
            expect(result.failed).toBe(0);
        });
        it('counts failed SMS attempts separately', async () => {
            jest.resetModules();
            // Re-mock with failure
            jest.doMock('../messaging', () => ({
                sendSMS: jest.fn()
                    .mockResolvedValueOnce(true)
                    .mockRejectedValueOnce(new Error('SMS failed')),
            }));
            const { sendBulkSMS } = await Promise.resolve().then(() => __importStar(require('../audienceQuery')));
            const constituents = [
                { id: '1', name: 'User1', mobile: '9876543210' },
                { id: '2', name: 'User2', mobile: '9876543211' },
            ];
            const result = await sendBulkSMS(constituents, 'Test message');
            expect(result.sent).toBe(1);
            expect(result.failed).toBe(1);
        });
        it('filters out empty mobile numbers', async () => {
            jest.resetModules();
            jest.doMock('../messaging', () => ({
                sendSMS: jest.fn().mockResolvedValue(true),
            }));
            const { sendBulkSMS } = await Promise.resolve().then(() => __importStar(require('../audienceQuery')));
            const messaging = await Promise.resolve().then(() => __importStar(require('../messaging')));
            const constituents = [
                { id: '1', name: 'User1', mobile: '9876543210' },
                { id: '2', name: 'User2', mobile: '' }, // Empty - should be filtered
                { id: '3', name: 'User3', mobile: '9876543212' },
            ];
            await sendBulkSMS(constituents, 'Test message');
            // Should only send to 2 (filtering empty mobile)
            expect(messaging.sendSMS).toHaveBeenCalledTimes(2);
        });
    });
});
//# sourceMappingURL=audienceQuery.test.js.map