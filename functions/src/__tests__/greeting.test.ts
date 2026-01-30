import { buildPrompt, GreetingRequest } from '../greeting';

describe('Greeting Generator', () => {
    describe('buildPrompt (Security)', () => {
        it('should sanitize constituent name to prevent injection', () => {
            const request: GreetingRequest = {
                name: 'Evil<script>User',
                type: 'BIRTHDAY',
                language: 'ENGLISH'
            };

            const prompt = buildPrompt(request);

            // Should escape special characters
            expect(prompt).toContain('Evil&lt;script&gt;User');
            expect(prompt).not.toContain('<script>');

            // Should be wrapped in XML tags
            expect(prompt).toContain('<constituent_name>Evil&lt;script&gt;User</constituent_name>');
        });

        it('should sanitize leader name to prevent injection', () => {
            const request: GreetingRequest = {
                name: 'John Doe',
                leaderName: 'Dr. Evil"',
                type: 'ANNIVERSARY',
                language: 'HINDI'
            };

            const prompt = buildPrompt(request);

            // Should escape quotes
            expect(prompt).toContain('Dr. Evil&quot;');
            expect(prompt).toContain('<leader_name>Dr. Evil&quot;</leader_name>');
        });

        it('should structure prompt with XML tags', () => {
             const request: GreetingRequest = {
                name: 'Alice',
                type: 'BIRTHDAY',
                language: 'ODIA'
            };

            const prompt = buildPrompt(request);

            expect(prompt).toContain('<constituent_name>Alice</constituent_name>');
            expect(prompt).not.toContain('<leader_name>'); // No leader provided
        });
    });
});
