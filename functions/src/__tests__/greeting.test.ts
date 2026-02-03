
import { buildPrompt, GreetingRequest } from '../greeting';

describe('Greeting Prompt Generation', () => {
    it('should generate a secure prompt with XML structure', () => {
        const request: GreetingRequest = {
            name: 'John Doe',
            type: 'BIRTHDAY',
            language: 'ENGLISH',
            leaderName: 'Jane Smith'
        };

        const prompt = buildPrompt(request);

        expect(prompt).toContain('<instruction>');
        expect(prompt).toContain('<recipient_name>John Doe</recipient_name>');
        expect(prompt).toContain('<constraint>');
        expect(prompt).toContain('on behalf of Jane Smith');
    });

    it('should sanitize input to prevent injection', () => {
        const request: GreetingRequest = {
            name: 'John <script>alert(1)</script>',
            type: 'BIRTHDAY',
            language: 'ENGLISH',
            leaderName: 'Jane <style>body{color:red}</style>'
        };

        const prompt = buildPrompt(request);

        expect(prompt).not.toContain('<script>');
        expect(prompt).not.toContain('<style>');
        expect(prompt).toContain('<recipient_name>John alert(1)</recipient_name>'); // Assumes basic stripping
        expect(prompt).toContain('on behalf of Jane body{color:red}');
    });

    it('should handle missing leader name correctly', () => {
        const request: GreetingRequest = {
            name: 'Alice',
            type: 'ANNIVERSARY',
            language: 'HINDI'
        };

        const prompt = buildPrompt(request);

        expect(prompt).not.toContain('on behalf of');
        expect(prompt).toContain('<recipient_name>Alice</recipient_name>');
    });
});
