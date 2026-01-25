
import { buildPrompt } from '../greeting';

describe('Greeting Service', () => {
    describe('buildPrompt', () => {
        it('should structure the prompt with XML tags', () => {
            const prompt = buildPrompt({
                name: 'John Doe',
                type: 'BIRTHDAY',
                language: 'ENGLISH'
            });

            expect(prompt).toContain('<constituent_name>John Doe</constituent_name>');
            expect(prompt).toContain('in English');
        });

        it('should sanitize constituent name injection attempts', () => {
            const prompt = buildPrompt({
                name: 'John <script>alert(1)</script>',
                type: 'BIRTHDAY',
                language: 'ENGLISH'
            });

            // Should be escaped
            expect(prompt).toContain('John &lt;script&gt;alert(1)&lt;/script&gt;');
            // Should NOT contain raw tags
            expect(prompt).not.toContain('<script>');
        });

        it('should sanitize leader name injection attempts', () => {
             const prompt = buildPrompt({
                name: 'Jane Doe',
                type: 'ANNIVERSARY',
                language: 'HINDI',
                leaderName: 'Leader "DROP TABLE"'
            });

            expect(prompt).toContain('Leader &quot;DROP TABLE&quot;');
        });

        it('should handle missing leader name', () => {
            const prompt = buildPrompt({
                name: 'John Doe',
                type: 'BIRTHDAY',
                language: 'ENGLISH'
            });
            expect(prompt).not.toContain('on behalf of');
        });
    });
});
