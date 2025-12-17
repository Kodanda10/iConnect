/**
 * @file functions/src/__tests__/audienceQuery.test.ts
 * @description TDD tests for audience query and bulk SMS functions
 */

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
            const module = await import('../audienceQuery');
            expect(typeof module.queryConstituentsByAudience).toBe('function');
        });

        it('accepts ALL, BLOCK, and GP audience types', async () => {
            const { queryConstituentsByAudience } = await import('../audienceQuery');

            // Type check - these should not throw TypeScript errors
            // At runtime, they'll fail due to no Firebase connection, which is expected
            expect(() => {
                // We're just verifying the function accepts these argument signatures
                const typeCheck = (
                    f: (a: 'ALL' | 'BLOCK' | 'GP', b?: string, c?: string) => Promise<unknown>
                ) => f;
                typeCheck(queryConstituentsByAudience);
            }).not.toThrow();
        });
    });

    describe('sendBulkSMS', () => {
        it('sends SMS to all constituents', async () => {
            const { sendBulkSMS } = await import('../audienceQuery');
            const messaging = await import('../messaging');

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

            const { sendBulkSMS } = await import('../audienceQuery');

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

            const { sendBulkSMS } = await import('../audienceQuery');
            const messaging = await import('../messaging');

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
