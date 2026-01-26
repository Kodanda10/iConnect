import { sanitizeInput } from '../utils/security';

describe('sanitizeInput', () => {
    it('returns empty string for null/undefined input', () => {
        expect(sanitizeInput(null)).toBe('');
        expect(sanitizeInput(undefined)).toBe('');
    });

    it('returns original string for safe input', () => {
        expect(sanitizeInput('Hello World')).toBe('Hello World');
    });

    it('escapes XML special characters', () => {
        const input = '<script>alert("xss")&</script>';
        const expected = '&lt;script&gt;alert(&quot;xss&quot;)&amp;&lt;/script&gt;';
        expect(sanitizeInput(input)).toBe(expected);
    });

    it('escapes single quotes', () => {
        const input = "O'Brien";
        const expected = 'O&apos;Brien';
        expect(sanitizeInput(input)).toBe(expected);
    });
});
