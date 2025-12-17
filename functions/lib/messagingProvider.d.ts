/**
 * @file functions/src/messagingProvider.ts
 * @description Plug-and-play messaging provider abstraction
 *
 * ARCHITECTURE: Factory pattern for seamless third-party integration
 * - MockProvider: For development/testing
 * - TwilioProvider: Production SMS
 * - MSG91Provider: Alternative SMS for India
 * - WhatsAppProvider: Meta Business API (future)
 *
 * When real API keys are available, just set environment variables:
 * - SMS_PROVIDER=twilio
 * - TWILIO_ACCOUNT_SID=xxx
 * - TWILIO_AUTH_TOKEN=xxx
 *
 * @changelog
 * - 2025-12-17: Initial TDD implementation (P0 System Integrity)
 */
export interface SMSResult {
    success: boolean;
    messageId?: string;
    provider: string;
    error?: string;
}
export interface MessagingProvider {
    name: string;
    sendSMS(mobile: string, message: string): Promise<SMSResult>;
    sendWhatsApp(mobile: string, template: string, params: Record<string, string>): Promise<SMSResult>;
    sendBulkSMS(mobiles: string[], message: string): Promise<SMSResult[]>;
}
/**
 * Factory function to create messaging provider based on environment
 */
export declare function createMessagingProvider(providerType?: string): MessagingProvider;
export declare const messagingProvider: MessagingProvider;
