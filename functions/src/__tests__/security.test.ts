
import { sanitizeInput } from '../utils/security';

describe('Security Utilities', () => {
    describe('sanitizeInput', () => {
        it('should return empty string for null or undefined', () => {
            expect(sanitizeInput(null as any)).toBe('');
            expect(sanitizeInput(undefined)).toBe('');
        });

        it('should trim whitespace', () => {
            expect(sanitizeInput('  Hello  ')).toBe('Hello');
        });

        it('should escape HTML/XML special characters', () => {
            const input = '<script>alert("evil")</script>';
            const expected = '&lt;script&gt;alert(&quot;evil&quot;)&lt;/script&gt;';
            expect(sanitizeInput(input)).toBe(expected);
        });

        it('should escape single quotes', () => {
            expect(sanitizeInput("O'Reilly")).toBe('O&apos;Reilly');
        });

        it('should escape ampersands', () => {
            expect(sanitizeInput('Tom & Jerry')).toBe('Tom &amp; Jerry');
        });

        it('should handle complex mixed input', () => {
            const input = '  <data value="123" />  ';
            const expected = '&lt;data value=&quot;123&quot; /&gt;';
            expect(sanitizeInput(input)).toBe(expected);
        });

        it('should preserve safe characters', () => {
            const input = 'Hello World-123!';
            expect(sanitizeInput(input)).toBe('Hello World-123!');
        });
    });
});
