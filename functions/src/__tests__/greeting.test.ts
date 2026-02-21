import { generateGreetingMessage, GreetingRequest } from '../greeting';

// Mock GoogleGenerativeAI
const mockGenerateContent = jest.fn();
const mockGetGenerativeModel = jest.fn().mockReturnValue({
    generateContent: mockGenerateContent,
});
jest.mock('@google/generative-ai', () => {
    return {
        GoogleGenerativeAI: jest.fn().mockImplementation(() => {
            return {
                getGenerativeModel: mockGetGenerativeModel,
            };
        }),
    };
});

describe('Greeting Service', () => {
    const validRequest: GreetingRequest = {
        name: 'Test User',
        type: 'BIRTHDAY',
        language: 'ENGLISH',
        leaderName: 'Leader Name',
    };

    beforeEach(() => {
        jest.clearAllMocks();
        // Set API key for tests
        process.env.GEMINI_API_KEY = 'test-key';

        // Mock successful response
        mockGenerateContent.mockResolvedValue({
            response: {
                text: () => 'Generated Greeting',
            },
        });
    });

    afterEach(() => {
        delete process.env.GEMINI_API_KEY;
    });

    it('should throw error if name is too long', async () => {
        const longName = 'a'.repeat(101);
        await expect(generateGreetingMessage({ ...validRequest, name: longName }))
            .rejects.toThrow('Name is too long (max 100 chars)');
    });

    it('should throw error if leaderName is too long', async () => {
        const longName = 'a'.repeat(101);
        await expect(generateGreetingMessage({ ...validRequest, leaderName: longName }))
            .rejects.toThrow('Leader name is too long (max 100 chars)');
    });

    it('should sanitize inputs in the prompt', async () => {
        const maliciousRequest: GreetingRequest = {
            name: '<script>alert(1)</script>',
            type: 'BIRTHDAY',
            language: 'ENGLISH',
            leaderName: 'Leader & Co',
        };

        await generateGreetingMessage(maliciousRequest);

        const prompt = mockGenerateContent.mock.calls[0][0];

        expect(prompt).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
        expect(prompt).toContain('Leader &amp; Co');
        expect(prompt).toContain('<recipient_name>');
        expect(prompt).toContain('<leader_name>');
    });

    it('should structure the prompt with XML tags', async () => {
        await generateGreetingMessage(validRequest);

        const prompt = mockGenerateContent.mock.calls[0][0];

        expect(prompt).toContain('<instruction>');
        expect(prompt).toContain('<recipient_name>Test User</recipient_name>');
        expect(prompt).toContain('<leader_name>Leader Name</leader_name>');
    });

    it('should fallback to template if Gemini fails', async () => {
        mockGenerateContent.mockRejectedValue(new Error('API Error'));

        const result = await generateGreetingMessage(validRequest);

        expect(result).toContain('Test User'); // Template should replace name
        expect(mockGenerateContent).toHaveBeenCalled();
    });
});
