import { generateGreetingMessage, GreetingRequest } from '../greeting';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Mock the Gemini API
jest.mock('@google/generative-ai', () => {
    const mockGenerateContent = jest.fn();
    return {
        GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
            getGenerativeModel: jest.fn().mockReturnValue({
                generateContent: mockGenerateContent,
            }),
        })),
    };
});

describe('generateGreetingMessage', () => {
    const ORIGINAL_ENV = process.env;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env = { ...ORIGINAL_ENV, GEMINI_API_KEY: 'fake-key' };
    });

    afterEach(() => {
        process.env = ORIGINAL_ENV;
    });

    it('should sanitize input to prevent prompt injection and fallback safely', async () => {
        const mockGenAI = new GoogleGenerativeAI('fake');
        const mockModel = mockGenAI.getGenerativeModel({ model: 'fake' });
        (mockModel.generateContent as jest.Mock).mockResolvedValue({
            response: { text: () => 'Mocked response' },
        });

        // Request with purely malicious/strippable characters
        const request: GreetingRequest = {
            name: '<script>alert("xss")</script>', // Stripped to 'alert("xss")'
            leaderName: '<>', // Fully stripped to ''
            type: 'BIRTHDAY',
            language: 'ENGLISH',
        };

        const result = await generateGreetingMessage(request);

        expect(result).toBe('Mocked response');

        const generateContentCallArgs = (mockModel.generateContent as jest.Mock).mock.calls[0][0];
        // Expect prompt to contain the partially sanitized name and no leader mention since leaderName was fully stripped
        expect(generateContentCallArgs).toContain('for alert("xss") in English.');
        expect(generateContentCallArgs).not.toContain('on behalf of');
        expect(generateContentCallArgs).not.toContain('<script>');
        expect(generateContentCallArgs).not.toContain('<>');
    });

    it('should fallback to safe default when name is completely stripped', async () => {
        const mockGenAI = new GoogleGenerativeAI('fake');
        const mockModel = mockGenAI.getGenerativeModel({ model: 'fake' });
        (mockModel.generateContent as jest.Mock).mockResolvedValue({
            response: { text: () => 'Mocked response' },
        });

        // Request with purely malicious/strippable characters
        const request: GreetingRequest = {
            name: '<>', // Fully stripped to ''
            type: 'BIRTHDAY',
            language: 'ENGLISH',
        };

        const result = await generateGreetingMessage(request);

        expect(result).toBe('Mocked response');

        const generateContentCallArgs = (mockModel.generateContent as jest.Mock).mock.calls[0][0];
        // Expect prompt to fallback to 'the constituent' since name was fully stripped
        expect(generateContentCallArgs).toContain('for the constituent in English.');
        expect(generateContentCallArgs).not.toContain('<>');
    });
});
