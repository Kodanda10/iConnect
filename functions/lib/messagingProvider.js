"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.messagingProvider = void 0;
exports.createMessagingProvider = createMessagingProvider;
const security_1 = require("./utils/security");
/**
 * Factory function to create messaging provider based on environment
 */
function createMessagingProvider(providerType) {
    const type = providerType || process.env.SMS_PROVIDER || 'mock';
    switch (type.toLowerCase()) {
        case 'twilio':
            return new TwilioProvider();
        case 'msg91':
            return new MSG91Provider();
        default:
            return new MockProvider();
    }
}
/**
 * Mock Provider - for development and testing
 */
class MockProvider {
    constructor() {
        this.name = 'MockProvider';
    }
    async sendSMS(mobile, message) {
        console.log(`[MOCK SMS] To: ${(0, security_1.redactMobile)(mobile)} | Message: ${(0, security_1.redactMessage)(message)}`);
        return {
            success: true,
            messageId: `mock-${Date.now()}`,
            provider: this.name,
        };
    }
    async sendWhatsApp(mobile, template, params) {
        console.log(`[MOCK WhatsApp] To: ${(0, security_1.redactMobile)(mobile)} | Template: ${template} | Params: [REDACTED]`);
        return {
            success: true,
            messageId: `mock-wa-${Date.now()}`,
            provider: this.name,
        };
    }
    async sendBulkSMS(mobiles, message) {
        return Promise.all(mobiles.map(m => this.sendSMS(m, message)));
    }
}
/**
 * Twilio Provider - plug in with TWILIO_* env vars
 */
class TwilioProvider {
    constructor() {
        this.name = 'TwilioProvider';
    }
    getCredentials() {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const fromNumber = process.env.TWILIO_PHONE_NUMBER;
        if (!accountSid || !authToken || !fromNumber) {
            throw new Error('Twilio credentials missing. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER');
        }
        return { accountSid, authToken, fromNumber };
    }
    async sendSMS(mobile, message) {
        const { accountSid, authToken, fromNumber } = this.getCredentials();
        try {
            // Dynamic import to avoid bundling when not used
            const twilio = require('twilio');
            const client = twilio(accountSid, authToken);
            const result = await client.messages.create({
                body: message,
                from: fromNumber,
                to: mobile,
            });
            return {
                success: true,
                messageId: result.sid,
                provider: this.name,
            };
        }
        catch (error) {
            return {
                success: false,
                provider: this.name,
                error: error.message,
            };
        }
    }
    async sendWhatsApp(mobile, template, params) {
        // Twilio WhatsApp uses similar API with whatsapp: prefix
        const { accountSid, authToken, fromNumber } = this.getCredentials();
        try {
            const twilio = require('twilio');
            const client = twilio(accountSid, authToken);
            const result = await client.messages.create({
                body: `Template: ${template}, Params: ${JSON.stringify(params)}`,
                from: `whatsapp:${fromNumber}`,
                to: `whatsapp:${mobile}`,
            });
            return {
                success: true,
                messageId: result.sid,
                provider: this.name,
            };
        }
        catch (error) {
            return {
                success: false,
                provider: this.name,
                error: error.message,
            };
        }
    }
    async sendBulkSMS(mobiles, message) {
        return Promise.all(mobiles.map(m => this.sendSMS(m, message)));
    }
}
/**
 * MSG91 Provider - plug in with MSG91_* env vars
 */
class MSG91Provider {
    constructor() {
        this.name = 'MSG91Provider';
    }
    getCredentials() {
        const authKey = process.env.MSG91_AUTH_KEY;
        const senderId = process.env.MSG91_SENDER_ID;
        const route = process.env.MSG91_ROUTE || '4'; // Transactional
        if (!authKey || !senderId) {
            throw new Error('MSG91 credentials missing. Set MSG91_AUTH_KEY, MSG91_SENDER_ID');
        }
        return { authKey, senderId, route };
    }
    async sendSMS(mobile, message) {
        const { authKey, senderId, route } = this.getCredentials();
        try {
            const response = await fetch('https://api.msg91.com/api/v5/flow/', {
                method: 'POST',
                headers: {
                    'authkey': authKey,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sender: senderId,
                    route: route,
                    mobiles: mobile.replace('+', ''),
                    message: message,
                }),
            });
            const data = await response.json();
            return {
                success: data.type === 'success',
                messageId: data.request_id,
                provider: this.name,
                error: data.type !== 'success' ? data.message : undefined,
            };
        }
        catch (error) {
            return {
                success: false,
                provider: this.name,
                error: error.message,
            };
        }
    }
    async sendWhatsApp(mobile, template, params) {
        // MSG91 WhatsApp API
        const { authKey } = this.getCredentials();
        try {
            const response = await fetch('https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/', {
                method: 'POST',
                headers: {
                    'authkey': authKey,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    integrated_number: process.env.MSG91_WA_NUMBER,
                    content_type: 'template',
                    payload: {
                        to: mobile.replace('+', ''),
                        type: 'template',
                        template: {
                            name: template,
                            language: { code: 'hi' },
                            components: Object.entries(params).map(([k, v]) => ({
                                type: 'body',
                                parameters: [{ type: 'text', text: v }],
                            })),
                        },
                    },
                }),
            });
            const data = await response.json();
            return {
                success: data.type === 'success',
                messageId: data.request_id,
                provider: this.name,
            };
        }
        catch (error) {
            return {
                success: false,
                provider: this.name,
                error: error.message,
            };
        }
    }
    async sendBulkSMS(mobiles, message) {
        return Promise.all(mobiles.map(m => this.sendSMS(m, message)));
    }
}
// Export singleton instance for convenience
exports.messagingProvider = createMessagingProvider();
//# sourceMappingURL=messagingProvider.js.map