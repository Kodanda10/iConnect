import { sanitizeInput } from '../utils/security';

describe('security utilities', () => {
    describe('sanitizeInput', () => {
        it('handles null, undefined, and empty inputs', () => {
            expect(sanitizeInput(null)).toBe('');
            expect(sanitizeInput(undefined)).toBe('');
            expect(sanitizeInput('')).toBe('');
        });

        it('removes control characters', () => {
            expect(sanitizeInput('hello\x00world')).toBe('helloworld');
            expect(sanitizeInput('test\x1Fdata')).toBe('testdata');
            expect(sanitizeInput('clean\x7Ftext')).toBe('cleantext');
        });

        it('aggressively removes HTML tags', () => {
            expect(sanitizeInput('hello <script>alert(1)</script> world')).toBe('hello alert(1) world');
            expect(sanitizeInput('<b>bold</b> and <i>italic</i>')).toBe('bold and italic');
        });

        it('removes stand-alone angle brackets', () => {
            // Note: The /<[^>]*>/g regex matches across arbitrary text enclosed by separate < and >
            expect(sanitizeInput('hello < world > and < test')).toBe('hello  and  test');
            expect(sanitizeInput('Value < 10 and Value > 5')).toBe('Value  5');
            expect(sanitizeInput('<>')).toBe('');
        });

        it('limits length to 100 characters', () => {
            const longString = 'a'.repeat(150);
            expect(sanitizeInput(longString)).toHaveLength(100);
            expect(sanitizeInput(longString)).toBe('a'.repeat(100));
        });

        it('trims whitespace', () => {
            expect(sanitizeInput('  hello world  ')).toBe('hello world');
        });
    });
});
