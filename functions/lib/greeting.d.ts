/**
 * @file greeting.ts
 * @description Greeting message generation service
 * @changelog
 * - 2024-12-11: Initial implementation with TDD
 */
export type TaskType = 'BIRTHDAY' | 'ANNIVERSARY';
export type Language = 'ODIA' | 'ENGLISH' | 'HINDI';
export interface GreetingRequest {
    name: string;
    type: TaskType;
    language: Language;
    ward?: string;
}
/**
 * Generate a greeting message for a constituent
 * Uses templates as fallback when Gemini API is unavailable
 */
export declare function generateGreetingMessage(request: GreetingRequest): Promise<string>;
