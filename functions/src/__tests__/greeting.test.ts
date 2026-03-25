import { generateGreetingMessage, GreetingRequest } from '../greeting';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Mock the Gemini API
jest.mock('@google/generative-ai', () => {
    return {
        GoogleGenerativeAI: jest.fn().mockImplementation(() => {
            return {
                getGenerativeModel: jest.fn().mockReturnValue({
                    generateContent: jest.fn().mockResolvedValue({
                        response: { text: () => 'Mocked AI Greeting' }
                    })
                })
            };
        })
    };
});

describe('greeting module', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    describe('generateGreetingMessage', () => {
        const validRequest: GreetingRequest = {
            name: 'John Doe',
            type: 'BIRTHDAY',
            language: 'ENGLISH'
        };

        test('validates input correctly', async () => {
            await expect(generateGreetingMessage({ ...validRequest, name: '' }))
                .rejects.toThrow('Name is required');
            await expect(generateGreetingMessage({ ...validRequest, type: 'INVALID' as any }))
                .rejects.toThrow('Invalid type');
            await expect(generateGreetingMessage({ ...validRequest, language: 'INVALID' as any }))
                .rejects.toThrow('Invalid language');
        });

        test('uses templates when API key is missing', async () => {
            delete process.env.GEMINI_API_KEY;
            const message = await generateGreetingMessage(validRequest);
            expect(message).toContain('John Doe');
            // The template might be "Many happy returns...", so check for case-insensitive 'happy'
            expect(message.toLowerCase()).toContain('happy');
            expect(GoogleGenerativeAI).not.toHaveBeenCalled();
        });

        test('sanitizes input before using template fallback', async () => {
            delete process.env.GEMINI_API_KEY;
            const maliciousRequest: GreetingRequest = {
                ...validRequest,
                name: '<script>alert("hacked")</script>John Doe'
            };
            const message = await generateGreetingMessage(maliciousRequest);
            expect(message).toContain('alert("hacked")John Doe');
            expect(message).not.toContain('<script>');
        });

        test('uses fallback string if input is completely stripped in template fallback', async () => {
            delete process.env.GEMINI_API_KEY;
            const maliciousRequest: GreetingRequest = {
                ...validRequest,
                name: '<script></script>'
            };
            const message = await generateGreetingMessage(maliciousRequest);
            expect(message).toContain('the constituent');
            expect(message).not.toContain('<script>');
        });

        test('uses Gemini API when key is available', async () => {
            process.env.GEMINI_API_KEY = 'test-key';
            const message = await generateGreetingMessage(validRequest);
            expect(message).toBe('Mocked AI Greeting');
            expect(GoogleGenerativeAI).toHaveBeenCalledWith('test-key');
        });

        test('sanitizes inputs when building Gemini prompt', async () => {
            process.env.GEMINI_API_KEY = 'test-key';
            const maliciousRequest: GreetingRequest = {
                ...validRequest,
                name: '<script>alert("hacked")</script>John Doe',
                leaderName: '<img src="x" onerror="alert(1)">Leader'
            };

            await generateGreetingMessage(maliciousRequest);

            const mockGenAI = (GoogleGenerativeAI as jest.Mock).mock.results[0].value;
            const mockModel = mockGenAI.getGenerativeModel();
            const generateContentArgs = mockModel.generateContent.mock.calls[0][0];

            expect(generateContentArgs).toContain('alert("hacked")John Doe');
            expect(generateContentArgs).not.toContain('<script>');
            expect(generateContentArgs).toContain('Leader');
            expect(generateContentArgs).not.toContain('<img');
        });
    });
});
