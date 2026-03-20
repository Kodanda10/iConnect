import { generateGreetingMessage, GreetingRequest } from '../greeting';
import { GoogleGenerativeAI } from '@google/generative-ai';

jest.mock('@google/generative-ai');

describe('generateGreetingMessage', () => {
    let mockGenerateContent: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.GEMINI_API_KEY = 'test-api-key';

        mockGenerateContent = jest.fn().mockResolvedValue({
            response: {
                text: () => 'Mocked response'
            }
        });

        (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
            getGenerativeModel: () => ({
                generateContent: mockGenerateContent
            })
        }));
    });

    afterEach(() => {
        delete process.env.GEMINI_API_KEY;
    });

    it('sanitizes input to prevent prompt injection', async () => {
        const request: GreetingRequest = {
            name: '<script>alert(1)</script>John Doe',
            type: 'BIRTHDAY',
            language: 'ENGLISH',
            leaderName: '<b>Leader</b>'
        };

        const result = await generateGreetingMessage(request);

        expect(result).toBe('Mocked response');
        expect(mockGenerateContent).toHaveBeenCalledTimes(1);

        const prompt = mockGenerateContent.mock.calls[0][0];
        expect(prompt).not.toContain('<script>');
        expect(prompt).not.toContain('<b>');
        expect(prompt).toContain('John Doe');
        expect(prompt).toContain('Leader');
    });

    it('falls back to "the constituent" if name is stripped entirely', async () => {
        const request: GreetingRequest = {
            name: '<script></script>',
            type: 'ANNIVERSARY',
            language: 'HINDI'
        };

        const result = await generateGreetingMessage(request);

        expect(result).toBe('Mocked response');
        expect(mockGenerateContent).toHaveBeenCalledTimes(1);

        const prompt = mockGenerateContent.mock.calls[0][0];
        expect(prompt).not.toContain('<script>');
        expect(prompt).toContain('the constituent');
    });
});
