import { generateGreetingMessage, GreetingRequest } from '../greeting';
import { GoogleGenerativeAI } from '@google/generative-ai';

jest.mock('@google/generative-ai');

describe('generateGreetingMessage', () => {
    const mockGenerateContent = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        // Setup mock for GoogleGenerativeAI
        (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
            getGenerativeModel: () => ({
                generateContent: mockGenerateContent
            })
        }));

        // Set a mock API key
        process.env.GEMINI_API_KEY = 'mock-api-key';
    });

    afterAll(() => {
        delete process.env.GEMINI_API_KEY;
    });

    it('should sanitize inputs by removing HTML tags but preserving inner text', async () => {
        mockGenerateContent.mockResolvedValue({
            response: { text: () => 'Mocked response' }
        });

        const request: GreetingRequest = {
            name: '<script>alert("John")</script>Doe',
            type: 'BIRTHDAY',
            language: 'ENGLISH',
            leaderName: '<b>Jane</b> Smith'
        };

        await generateGreetingMessage(request);

        expect(mockGenerateContent).toHaveBeenCalled();
        const promptArgs = mockGenerateContent.mock.calls[0][0];
        expect(promptArgs).toContain('for alert("John")Doe');
        expect(promptArgs).toContain('on behalf of Jane Smith');
        expect(promptArgs).not.toContain('<script>');
        expect(promptArgs).not.toContain('<b>');
    });

    it('should use safe fallbacks when inputs are completely stripped by sanitization', async () => {
        mockGenerateContent.mockResolvedValue({
            response: { text: () => 'Mocked response' }
        });

        const request: GreetingRequest = {
            name: '<script></script>',
            type: 'ANNIVERSARY',
            language: 'HINDI',
            leaderName: '<img src="x" onerror="alert(1)">'
        };

        await generateGreetingMessage(request);

        expect(mockGenerateContent).toHaveBeenCalled();
        const promptArgs = mockGenerateContent.mock.calls[0][0];
        expect(promptArgs).toContain('for the constituent');
        expect(promptArgs).toContain('on behalf of the leader');
        expect(promptArgs).not.toContain('<script>');
        expect(promptArgs).not.toContain('<img>');
    });
});
