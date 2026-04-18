import { generateGreetingMessage } from '../greeting';
import { GoogleGenerativeAI } from '@google/generative-ai';

jest.mock('@google/generative-ai');

describe('generateGreetingMessage Security', () => {
    let originalEnv: NodeJS.ProcessEnv;

    beforeAll(() => {
        originalEnv = process.env;
    });

    beforeEach(() => {
        jest.clearAllMocks();
        process.env = { ...originalEnv, GEMINI_API_KEY: 'fake-key' };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it('sanitizes input completely and falls back to "the constituent"', async () => {
        const mockGenerateContent = jest.fn().mockResolvedValue({
            response: { text: () => 'Mocked generated response' }
        });

        (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
            getGenerativeModel: () => ({
                generateContent: mockGenerateContent
            })
        }));

        await generateGreetingMessage({
            name: '<malicious_tag>', // Will be stripped completely
            type: 'BIRTHDAY',
            language: 'ENGLISH'
        });

        expect(mockGenerateContent).toHaveBeenCalled();
        const prompt = mockGenerateContent.mock.calls[0][0];

        // The malicious payload should not be present
        expect(prompt).not.toContain('malicious');

        // It should fallback to "the constituent"
        expect(prompt).toContain('for the constituent in English');
    });

    it('sanitizes fallback templates as well', async () => {
        process.env.GEMINI_API_KEY = ''; // Force template fallback

        const result = await generateGreetingMessage({
            name: '<malicious>', // Will be stripped
            type: 'BIRTHDAY',
            language: 'ENGLISH'
        });

        // The name should be replaced with "the constituent" in the template
        expect(result).not.toContain('<malicious>');
        expect(result).toMatch(/the constituent/);
    });
});