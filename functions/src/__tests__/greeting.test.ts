import { generateGreetingMessage } from '../greeting';

// Mock the Generative AI library
jest.mock('@google/generative-ai', () => {
    return {
        GoogleGenerativeAI: jest.fn().mockImplementation(() => {
            return {
                getGenerativeModel: jest.fn().mockReturnValue({
                    generateContent: jest.fn().mockResolvedValue({
                        response: {
                            text: () => 'Mocked response'
                        }
                    })
                })
            };
        })
    };
});

describe('Greeting Service', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    describe('generateGreetingMessage', () => {
        it('throws an error if name is empty', async () => {
            await expect(generateGreetingMessage({ name: '', type: 'BIRTHDAY', language: 'ENGLISH' }))
                .rejects
                .toThrow('Name is required');
        });

        it('throws an error if type is invalid', async () => {
            await expect(generateGreetingMessage({ name: 'John Doe', type: 'INVALID' as any, language: 'ENGLISH' }))
                .rejects
                .toThrow('Invalid type');
        });

        it('throws an error if language is invalid', async () => {
            await expect(generateGreetingMessage({ name: 'John Doe', type: 'BIRTHDAY', language: 'INVALID' as any }))
                .rejects
                .toThrow('Invalid language');
        });

        it('returns template fallback if GEMINI_API_KEY is not set', async () => {
            delete process.env.GEMINI_API_KEY;

            const response = await generateGreetingMessage({
                name: 'Alice',
                type: 'BIRTHDAY',
                language: 'ENGLISH'
            });

            expect(response).toContain('Alice');
            // We know our English templates contain phrases like "Happy Birthday" or "happy returns"
            expect(response).toMatch(/Happy Birthday|happy returns/);
        });

        it('sanitizes malicious input when using template fallback', async () => {
            delete process.env.GEMINI_API_KEY;

            const response = await generateGreetingMessage({
                name: '<script>alert("XSS")</script>Alice',
                type: 'BIRTHDAY',
                language: 'ENGLISH'
            });

            // The <script> tag should be removed
            expect(response).toContain('Alice');
            expect(response).not.toContain('<script>');
        });

        it('uses safe default when input is fully stripped', async () => {
            delete process.env.GEMINI_API_KEY;

            const response = await generateGreetingMessage({
                name: '<script></script>',
                type: 'BIRTHDAY',
                language: 'ENGLISH'
            });

            // The entire name was stripped, so it should fallback to 'the constituent'
            expect(response).toContain('the constituent');
        });

        it('returns Gemini response when GEMINI_API_KEY is configured', async () => {
            process.env.GEMINI_API_KEY = 'test-api-key';

            const response = await generateGreetingMessage({
                name: 'Bob',
                type: 'ANNIVERSARY',
                language: 'ENGLISH'
            });

            expect(response).toBe('Mocked response');
        });
    });
});