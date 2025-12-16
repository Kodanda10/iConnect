/**
 * @file greeting.ts
 * @description Greeting message generation service with Gemini AI integration
 * @changelog
 * - 2024-12-11: Initial implementation with TDD
 * - 2024-12-15: Added real Gemini AI integration with template fallback
 */
export type TaskType = 'BIRTHDAY' | 'ANNIVERSARY';
export type Language = 'ODIA' | 'ENGLISH' | 'HINDI';
export interface GreetingRequest {
    name: string;
    type: TaskType;
    language: Language;
    ward?: string;
    leaderName?: string;
}
/**
 * Generate a greeting message for a constituent
 * Uses Gemini AI when available, falls back to templates
 */
export declare function generateGreetingMessage(request: GreetingRequest): Promise<string>;
