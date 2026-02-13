/**
 * @file functions/src/__tests__/audienceQuery.optimize.test.ts
 * @description Test to verify Firestore query optimization (select)
 */

// Mock firebase-admin at top level
jest.mock('firebase-admin', () => ({
    firestore: jest.fn()
}));

describe('audienceQuery Optimization', () => {
    let mockSelect: jest.Mock;
    let mockWhere: jest.Mock;
    let mockGet: jest.Mock;
    let mockCollection: jest.Mock;

    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks();

        // Re-require admin to ensure we mock the fresh module instance
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const admin = require('firebase-admin');

        // Setup Firestore Mocks
        mockGet = jest.fn().mockResolvedValue({
            docs: [
                {
                    id: '1',
                    data: () => ({
                        name: 'Test User',
                        mobile: '1234567890',
                        block: 'TestBlock',
                        gram_panchayat: 'TestGP'
                    })
                }
            ]
        });

        // We need to return 'this' for chaining
        const mockQuery: any = {
            get: mockGet
        };
        // Use a function to bind 'this' correctly or just return the object
        mockWhere = jest.fn().mockReturnValue(mockQuery);
        mockSelect = jest.fn().mockReturnValue(mockQuery);

        mockQuery.where = mockWhere;
        mockQuery.select = mockSelect;

        mockCollection = jest.fn().mockReturnValue(mockQuery);

        // Mock implementation of admin.firestore()
        (admin.firestore as unknown as jest.Mock).mockReturnValue({
            collection: mockCollection
        });
    });

    it('should use .select() to optimize Firestore bandwidth', async () => {
        // Dynamic import to ensure fresh mock usage
        const { queryConstituentsByAudience } = await import('../audienceQuery');

        await queryConstituentsByAudience('ALL');

        // Verify .select() was called with specific fields
        expect(mockSelect).toHaveBeenCalledWith(
            'name',
            'mobile',
            'block',
            'gram_panchayat'
        );

        // Ensure it's called exactly once
        expect(mockSelect).toHaveBeenCalledTimes(1);
    });

    it('should still apply .where() filters correctly', async () => {
        const { queryConstituentsByAudience } = await import('../audienceQuery');

        await queryConstituentsByAudience('BLOCK', 'Dharmasala');

        // Verify .where() filters are applied
        expect(mockWhere).toHaveBeenCalledWith('block', '==', 'Dharmasala');
        expect(mockWhere).toHaveBeenCalledWith('mobile', '!=', '');
    });
});
