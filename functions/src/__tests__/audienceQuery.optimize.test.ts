
// functions/src/__tests__/audienceQuery.optimize.test.ts

describe('audienceQuery Optimization', () => {
    let queryConstituentsByAudience: any;
    let mockSelect: any;
    let mockWhere: any;
    let mockGet: any;
    let mockCollection: any;

    beforeEach(async () => {
        jest.resetModules(); // crucial for clean mocking
        jest.clearAllMocks();

        mockSelect = jest.fn().mockReturnThis();
        mockWhere = jest.fn().mockReturnThis();
        mockGet = jest.fn().mockResolvedValue({
            docs: [
                {
                    id: '1',
                    data: () => ({ name: 'Test', mobile: '123', block: 'B1', gram_panchayat: 'GP1' })
                }
            ]
        });

        // Return 'this' for chaining methods
        const mockQuery = {
            where: mockWhere,
            select: mockSelect,
            get: mockGet,
        };

        // Mock implementation of firestore().collection(...)
        // Need to return the query object, and also support chaining where().select() etc.
        // The mockQuery object has all methods and returns itself.
        mockSelect.mockReturnValue(mockQuery);
        mockWhere.mockReturnValue(mockQuery);

        mockCollection = jest.fn().mockReturnValue(mockQuery);

        // Mock firebase-admin
        jest.doMock('firebase-admin', () => ({
            firestore: jest.fn(() => ({
                collection: mockCollection,
            })),
            // Mock other needed parts if necessary
        }));

        // Import module under test AFTER mocking
        const module = await import('../audienceQuery');
        queryConstituentsByAudience = module.queryConstituentsByAudience;
    });

    it('should select specific fields to optimize query performance', async () => {
        await queryConstituentsByAudience('ALL');

        // Verify .select() was called with the correct fields
        // Expecting: 'name', 'mobile', 'block', 'gram_panchayat'
        expect(mockSelect).toHaveBeenCalledWith('name', 'mobile', 'block', 'gram_panchayat');

        // Verify other calls to ensure the query was constructed correctly
        expect(mockCollection).toHaveBeenCalledWith('constituents');
        expect(mockWhere).toHaveBeenCalledWith('mobile', '!=', ''); // Ensure existing filters are kept
        expect(mockGet).toHaveBeenCalled();
    });
});
