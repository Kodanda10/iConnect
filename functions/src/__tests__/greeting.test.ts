import { generateGreetingMessage, GreetingRequest } from '../greeting';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Mock GoogleGenerativeAI
jest.mock('@google/generative-ai');

describe('generateGreetingMessage', () => {
    let mockGenerateContent: jest.Mock;
    let mockGetGenerativeModel: jest.Mock;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Setup mock implementation
        mockGenerateContent = jest.fn().mockResolvedValue({
            response: {
                text: () => 'Mocked Greeting Message'
            }
        });

        mockGetGenerativeModel = jest.fn().mockReturnValue({
            generateContent: mockGenerateContent
        });

        (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
            getGenerativeModel: mockGetGenerativeModel
        }));

        // Set API Key
        process.env.GEMINI_API_KEY = 'test-api-key';
    });

    afterEach(() => {
        delete process.env.GEMINI_API_KEY;
    });

    it('generates a prompt with sanitized input and XML tags', async () => {
        const request: GreetingRequest = {
            name: 'John Doe',
            type: 'BIRTHDAY',
            language: 'ENGLISH',
            leaderName: 'Leader X'
        };

        await generateGreetingMessage(request);

        // Verify the prompt passed to generateContent
        const prompt = mockGenerateContent.mock.calls[0][0];

        expect(prompt).toContain('<instruction>');
        expect(prompt).toContain('<recipient_name>John Doe</recipient_name>');
        expect(prompt).toContain('<leader_name>Leader X</leader_name>');
        // Check for the dynamic context injection
        expect(prompt).toContain('on behalf of <leader_name>Leader X</leader_name>');
    });

    it('sanitizes malicious input in prompt', async () => {
        const request: GreetingRequest = {
            name: '<script>alert(1)</script>',
            type: 'ANNIVERSARY',
            language: 'HINDI',
            leaderName: 'Bad <Actor>'
        };

        await generateGreetingMessage(request);

        const prompt = mockGenerateContent.mock.calls[0][0];

        // Should NOT contain raw tags
        expect(prompt).not.toContain('<script>');

        // Should contain escaped entities
        expect(prompt).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
        expect(prompt).toContain('Bad &lt;Actor&gt;');

        // Structure should still remain
        expect(prompt).toContain('<recipient_name>');
        expect(prompt).toContain('wedding anniversary');
    });

    it('falls back to templates if API key is missing', async () => {
        delete process.env.GEMINI_API_KEY;

        const request: GreetingRequest = {
            name: 'Jane',
            type: 'BIRTHDAY',
            language: 'ENGLISH'
        };

        const message = await generateGreetingMessage(request);

        expect(message).toContain('Jane');
        expect(mockGenerateContent).not.toHaveBeenCalled();
    });
});
