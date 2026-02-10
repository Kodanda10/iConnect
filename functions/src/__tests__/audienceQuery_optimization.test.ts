
// Need to mock firebase-admin before importing the module under test
const mockGet = jest.fn();
const mockWhere = jest.fn();
const mockSelect = jest.fn();
const mockCollection = jest.fn();

// Setup chaining
const mockQuery = {
    where: mockWhere,
    select: mockSelect,
    get: mockGet,
};

mockWhere.mockReturnValue(mockQuery);
mockSelect.mockReturnValue(mockQuery);
mockCollection.mockReturnValue(mockQuery);

const mockFirestore = jest.fn(() => ({
    collection: mockCollection,
}));

jest.mock('firebase-admin', () => ({
    firestore: mockFirestore,
    initializeApp: jest.fn(),
}));

// Import after mocking
import { queryConstituentsByAudience } from '../audienceQuery';

describe('audienceQuery Optimization', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Ensure mocks return the chainable object
        mockWhere.mockReturnValue(mockQuery);
        mockSelect.mockReturnValue(mockQuery);
        mockCollection.mockReturnValue(mockQuery);
        mockGet.mockResolvedValue({
            docs: [
                {
                    id: '1',
                    data: () => ({
                        name: 'Test',
                        mobile: '1234567890',
                        block: 'B1',
                        gram_panchayat: 'GP1',
                        extraField: 'ShouldNotBeFetchedInOptimizedQuery'
                    })
                }
            ]
        });
    });

    it('should call select() with required fields (after optimization)', async () => {
        await queryConstituentsByAudience('ALL');

        // Verify select IS called with specific fields
        expect(mockSelect).toHaveBeenCalledWith('name', 'mobile', 'block', 'gram_panchayat');

        // Verify query structure
        expect(mockCollection).toHaveBeenCalledWith('constituents');
        expect(mockWhere).toHaveBeenCalledWith('mobile', '!=', '');
        expect(mockGet).toHaveBeenCalled();
    });
});
