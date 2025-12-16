/**
 * @file lib/services/messaging.ts
 * @description Plug-and-play messaging architecture for SMS/WhatsApp
 * @changelog
 * - 2025-12-17: Initial implementation with provider abstraction (TDD GREEN phase)
 */

/**
 * Message payload for sending SMS/WhatsApp messages
 */
export interface MessagePayload {
    to: string;
    body: string;
    type: 'SMS' | 'WHATSAPP';
    metadata?: {
        constituentId?: string;
        taskId?: string;
        campaignId?: string;
        [key: string]: string | undefined;
    };
}

/**
 * Result from message send operation
 */
export interface MessageResult {
    success: boolean;
    provider: string;
    messageId?: string;
    error?: string;
    timestamp: Date;
}

/**
 * Conference call details for message formatting
 */
export interface ConferenceDetails {
    title: string;
    dialInNumber: string;
    accessCode: string;
    scheduledTime: Date;
    language: 'HINDI' | 'ODIA' | 'ENGLISH';
}

/**
 * Abstract interface for message providers
 * Implement this for Twilio, MSG91, Gupshup, etc.
 */
export interface MessageProvider {
    send(payload: MessagePayload): Promise<MessageResult>;
    getProviderName(): string;
    isConfigured(): boolean;
}

/**
 * SMS Provider Stub - Replace with actual implementation
 * Example: Twilio, MSG91, AWS SNS, etc.
 */
export class SMSProvider implements MessageProvider {
    private apiKey?: string;
    private senderId?: string;

    constructor(config?: { apiKey?: string; senderId?: string }) {
        this.apiKey = config?.apiKey || process.env.SMS_API_KEY;
        this.senderId = config?.senderId || process.env.SMS_SENDER_ID;
    }

    async send(payload: MessagePayload): Promise<MessageResult> {
        // STUB: Replace with actual API call
        // Example for Twilio:
        // const client = require('twilio')(accountSid, authToken);
        // const message = await client.messages.create({...});

        console.log(`[SMS_STUB] Sending to ${payload.to}: ${payload.body.slice(0, 50)}...`);

        return {
            success: true,
            provider: this.getProviderName(),
            messageId: `sms_${Date.now()}_${Math.random().toString(36).slice(2)}`,
            timestamp: new Date(),
        };
    }

    getProviderName(): string {
        return 'SMS_STUB';
    }

    isConfigured(): boolean {
        return !!this.apiKey;
    }
}

/**
 * WhatsApp Provider Stub - Replace with actual implementation
 * Example: Twilio WhatsApp, Meta Business API, etc.
 */
export class WhatsAppProvider implements MessageProvider {
    private apiKey?: string;
    private phoneNumberId?: string;

    constructor(config?: { apiKey?: string; phoneNumberId?: string }) {
        this.apiKey = config?.apiKey || process.env.WHATSAPP_API_KEY;
        this.phoneNumberId = config?.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID;
    }

    async send(payload: MessagePayload): Promise<MessageResult> {
        // STUB: Replace with actual API call
        // Example for Meta WhatsApp Business API:
        // const response = await fetch(`https://graph.facebook.com/v17.0/${phoneNumberId}/messages`, {...});

        console.log(`[WHATSAPP_STUB] Sending to ${payload.to}: ${payload.body.slice(0, 50)}...`);

        return {
            success: true,
            provider: this.getProviderName(),
            messageId: `wa_${Date.now()}_${Math.random().toString(36).slice(2)}`,
            timestamp: new Date(),
        };
    }

    getProviderName(): string {
        return 'WHATSAPP_STUB';
    }

    isConfigured(): boolean {
        return !!this.apiKey;
    }
}

/**
 * Main Messaging Service - Orchestrates providers
 */
export class MessagingService {
    private providers: Map<string, MessageProvider> = new Map();

    /**
     * Register a provider for a message type
     */
    registerProvider(type: 'SMS' | 'WHATSAPP', provider: MessageProvider): void {
        this.providers.set(type, provider);
    }

    /**
     * Send a single message
     */
    async send(payload: MessagePayload): Promise<MessageResult> {
        const provider = this.providers.get(payload.type);

        if (!provider) {
            throw new Error(`No provider registered for type: ${payload.type}`);
        }

        return provider.send(payload);
    }

    /**
     * Send bulk messages (batch processing)
     */
    async sendBulk(payloads: MessagePayload[]): Promise<MessageResult[]> {
        const results: MessageResult[] = [];

        // Process in batches to avoid rate limits
        const BATCH_SIZE = 10;
        for (let i = 0; i < payloads.length; i += BATCH_SIZE) {
            const batch = payloads.slice(i, i + BATCH_SIZE);
            const batchResults = await Promise.all(
                batch.map(payload => this.send(payload))
            );
            results.push(...batchResults);

            // Add delay between batches if needed
            if (i + BATCH_SIZE < payloads.length) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        return results;
    }

    /**
     * Format conference call message in specified language
     */
    formatConferenceMessage(details: ConferenceDetails): string {
        const { title, dialInNumber, accessCode, scheduledTime, language } = details;

        const dateStr = scheduledTime.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
        const timeStr = scheduledTime.toLocaleTimeString('en-IN', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });

        const templates: Record<string, string> = {
            HINDI: `🎙️ कॉन्फ्रेंस कॉल: ${title}
📅 ${dateStr} | ⏰ ${timeStr}

📞 Dial: ${dialInNumber}
🔑 Code: ${accessCode}

कृपया समय पर जुड़ें।`,

            ODIA: `🎙️ କନଫରେନ୍ସ କଲ୍: ${title}
📅 ${dateStr} | ⏰ ${timeStr}

📞 Dial: ${dialInNumber}
🔑 Code: ${accessCode}

ଦୟାକରି ସମୟରେ ଯୋଗ ଦିଅନ୍ତୁ।`,

            ENGLISH: `🎙️ Conference Call: ${title}
📅 ${dateStr} | ⏰ ${timeStr}

📞 Dial: ${dialInNumber}
🔑 Code: ${accessCode}

Please join on time.`,
        };

        return templates[language] || templates.ENGLISH;
    }

    /**
     * Get all registered providers status
     */
    getProvidersStatus(): Record<string, { name: string; configured: boolean }> {
        const status: Record<string, { name: string; configured: boolean }> = {};

        this.providers.forEach((provider, type) => {
            status[type] = {
                name: provider.getProviderName(),
                configured: provider.isConfigured(),
            };
        });

        return status;
    }
}

/**
 * Singleton instance for app-wide use
 */
let messagingServiceInstance: MessagingService | null = null;

export function getMessagingService(): MessagingService {
    if (!messagingServiceInstance) {
        messagingServiceInstance = new MessagingService();
        // Register default stub providers
        messagingServiceInstance.registerProvider('SMS', new SMSProvider());
        messagingServiceInstance.registerProvider('WHATSAPP', new WhatsAppProvider());
    }
    return messagingServiceInstance;
}
