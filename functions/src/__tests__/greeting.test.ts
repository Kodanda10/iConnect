import { buildPrompt, GreetingRequest } from '../greeting';

describe('Greeting Prompt Security', () => {
    it('should use XML structure and sanitize input', () => {
        const request: GreetingRequest = {
            name: 'John <script>alert(1)</script> Doe',
            type: 'BIRTHDAY',
            language: 'ENGLISH',
            leaderName: 'Leader "The Boss" & Co',
        };

        const prompt = buildPrompt(request);

        // Check for XML structure
        expect(prompt).toContain('<instruction>');
        expect(prompt).toContain('</instruction>');
        expect(prompt).toContain('<context>');
        expect(prompt).toContain('</context>');

        // Check for sanitized inputs in specific tags
        // < becomes &lt;, > becomes &gt;, " becomes &quot;, & becomes &amp;
        expect(prompt).toContain('<recipient_name>John &lt;script&gt;alert(1)&lt;/script&gt; Doe</recipient_name>');
        expect(prompt).toContain('<sender_name>Leader &quot;The Boss&quot; &amp; Co</sender_name>');
    });

    it('should handle optional leader name correctly in XML', () => {
        const request: GreetingRequest = {
            name: 'Jane Doe',
            type: 'ANNIVERSARY',
            language: 'HINDI',
        };

        const prompt = buildPrompt(request);

        expect(prompt).toContain('<recipient_name>Jane Doe</recipient_name>');
        expect(prompt).not.toContain('<sender_name>');
    });
});
