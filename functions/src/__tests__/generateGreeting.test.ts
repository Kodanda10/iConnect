import { generateGreetingMessage, GreetingRequest } from '../greeting';

// Mock GoogleGenerativeAI
const mockGenerateContent = jest.fn();
const mockGetGenerativeModel = jest.fn().mockReturnValue({
    generateContent: mockGenerateContent
});

jest.mock('@google/generative-ai', () => {
    return {
        GoogleGenerativeAI: jest.fn().mockImplementation(() => {
            return {
                getGenerativeModel: mockGetGenerativeModel
            };
        })
    };
});

describe('generateGreetingMessage', () => {
    const validRequest: GreetingRequest = {
        name: 'John Doe',
        type: 'BIRTHDAY',
        language: 'ENGLISH'
    };

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.GEMINI_API_KEY = 'test-key';
    });

    afterEach(() => {
        delete process.env.GEMINI_API_KEY;
    });

    it('should throw error if name is missing', async () => {
        await expect(generateGreetingMessage({ ...validRequest, name: '' }))
            .rejects.toThrow('Name is required');
    });

    it('should throw error if name is too long', async () => {
        const longName = 'a'.repeat(101);
        await expect(generateGreetingMessage({ ...validRequest, name: longName }))
            .rejects.toThrow('Name is too long');
    });

    it('should throw error if leaderName is too long', async () => {
        const longName = 'a'.repeat(101);
        await expect(generateGreetingMessage({ ...validRequest, leaderName: longName }))
            .rejects.toThrow('Leader name is too long');
    });

    it('should use sanitized input in prompt', async () => {
        mockGenerateContent.mockResolvedValue({
            response: { text: () => 'Happy Birthday!' }
        });

        const maliciousName = '<script>alert(1)</script>';
        await generateGreetingMessage({ ...validRequest, name: maliciousName });

        const prompt = mockGenerateContent.mock.calls[0][0];

        // Verify XML structure and sanitization
        expect(prompt).toContain('<name>&lt;script&gt;alert(1)&lt;/script&gt;</name>');
        expect(prompt).toContain('<instruction>');
        expect(prompt).toContain('</instruction>');
    });

    it('should include leader instruction if provided', async () => {
        mockGenerateContent.mockResolvedValue({
            response: { text: () => 'Happy Birthday!' }
        });

        await generateGreetingMessage({ ...validRequest, leaderName: 'Leader X' });

        const prompt = mockGenerateContent.mock.calls[0][0];
        expect(prompt).toContain('on behalf of Leader X');
    });
});
