import { sanitizeInput } from '../utils/security';

describe('security utilities', () => {
    describe('sanitizeInput', () => {
        it('returns empty string for null or undefined', () => {
            expect(sanitizeInput(null)).toBe('');
            expect(sanitizeInput(undefined)).toBe('');
            expect(sanitizeInput('')).toBe('');
        });

        it('returns standard text unmodified', () => {
            expect(sanitizeInput('John Doe')).toBe('John Doe');
            expect(sanitizeInput('Jane_Smith123')).toBe('Jane_Smith123');
        });

        it('aggressively removes angle brackets to prevent HTML injection and XSS', () => {
            expect(sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
            expect(sanitizeInput('<b>Bold Name</b>')).toBe('bBold Name/b');
            expect(sanitizeInput('John <img src="x" onerror="alert(1)"> Doe')).toBe('John img src="x" onerror="alert(1)" Doe');
            expect(sanitizeInput('<img src=x onerror=alert(1)')).toBe('img src=x onerror=alert(1)');
        });

        it('truncates input to 100 characters to mitigate prompt injection', () => {
            const longInput = 'A'.repeat(150);
            expect(sanitizeInput(longInput)).toBe('A'.repeat(100));
        });

        it('removes control characters', () => {
            expect(sanitizeInput('John\x00Doe')).toBe('JohnDoe'); // Null byte
            expect(sanitizeInput('Jane\x07Smith')).toBe('JaneSmith'); // Bell character
        });

        it('preserves spaces, tabs, newlines, and carriage returns', () => {
            expect(sanitizeInput('John\tDoe')).toBe('John\tDoe');
            expect(sanitizeInput('Jane\nSmith')).toBe('Jane\nSmith');
            expect(sanitizeInput('Bob\r\nJones')).toBe('Bob\r\nJones');
        });

        it('trims whitespace from output', () => {
            expect(sanitizeInput('  John Doe  ')).toBe('John Doe');
            expect(sanitizeInput('  <b>Jane</b>  ')).toBe('bJane/b');
        });
    });
});
