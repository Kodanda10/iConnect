import { sanitizeInput } from '../utils/security';

describe('Security Utils', () => {
    describe('sanitizeInput', () => {
        it('should return empty string for null or undefined', () => {
            expect(sanitizeInput(null)).toBe('');
            expect(sanitizeInput(undefined)).toBe('');
        });

        it('should return string as is if no special characters', () => {
            expect(sanitizeInput('Hello World')).toBe('Hello World');
        });

        it('should escape XML special characters', () => {
            const input = '<script>alert("xss")&</script>';
            const expected = '&lt;script&gt;alert(&quot;xss&quot;)&amp;&lt;/script&gt;';
            expect(sanitizeInput(input)).toBe(expected);
        });

        it('should handle single quotes', () => {
            expect(sanitizeInput("It's me")).toBe("It&apos;s me");
        });
    });
});
