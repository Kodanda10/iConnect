/**
 * @file __tests__/messaging.test.ts
 * @description TDD RED PHASE - Tests for plug-and-play messaging architecture
 * @changelog
 * - 2025-12-17: Initial TDD tests for SMS/WhatsApp messaging providers
 */

// Mock Firebase modules
jest.mock('@/lib/firebase', () => ({
    getFirebaseDb: jest.fn(),
}));

import {
    MessageProvider,
    SMSProvider,
    WhatsAppProvider,
    MessagingService,
    MessagePayload,
    MessageResult,
} from '@/lib/services/messaging';

describe('Messaging Service - Plug-and-Play Architecture', () => {
    describe('MessagePayload', () => {
        it('should have required fields for message sending', () => {
            const payload: MessagePayload = {
                to: '+919876543210',
                body: 'Test message',
                type: 'SMS',
            };

            expect(payload.to).toBeDefined();
            expect(payload.body).toBeDefined();
            expect(payload.type).toBe('SMS');
        });

        it('should support optional metadata for tracking', () => {
            const payload: MessagePayload = {
                to: '+919876543210',
                body: 'Test message',
                type: 'WHATSAPP',
                metadata: {
                    constituentId: 'const-123',
                    taskId: 'task-456',
                    campaignId: 'camp-789',
                },
            };

            expect(payload.metadata?.constituentId).toBe('const-123');
        });
    });

    describe('SMSProvider (Stub)', () => {
        it('should implement MessageProvider interface', () => {
            const smsProvider = new SMSProvider();

            expect(typeof smsProvider.send).toBe('function');
            expect(typeof smsProvider.getProviderName).toBe('function');
            expect(typeof smsProvider.isConfigured).toBe('function');
        });

        it('should return not configured when no API key is set', () => {
            const smsProvider = new SMSProvider();

            expect(smsProvider.isConfigured()).toBe(false);
        });

        it('should return provider name', () => {
            const smsProvider = new SMSProvider();

            expect(smsProvider.getProviderName()).toBe('SMS_STUB');
        });

        it('should return simulated success when sending (stub mode)', async () => {
            const smsProvider = new SMSProvider();
            const payload: MessagePayload = {
                to: '+919876543210',
                body: 'Test SMS',
                type: 'SMS',
            };

            const result = await smsProvider.send(payload);

            expect(result.success).toBe(true);
            expect(result.provider).toBe('SMS_STUB');
            expect(result.messageId).toBeDefined();
        });
    });

    describe('WhatsAppProvider (Stub)', () => {
        it('should implement MessageProvider interface', () => {
            const waProvider = new WhatsAppProvider();

            expect(typeof waProvider.send).toBe('function');
            expect(typeof waProvider.getProviderName).toBe('function');
            expect(typeof waProvider.isConfigured).toBe('function');
        });

        it('should return not configured when no API key is set', () => {
            const waProvider = new WhatsAppProvider();

            expect(waProvider.isConfigured()).toBe(false);
        });

        it('should return provider name', () => {
            const waProvider = new WhatsAppProvider();

            expect(waProvider.getProviderName()).toBe('WHATSAPP_STUB');
        });

        it('should return simulated success when sending (stub mode)', async () => {
            const waProvider = new WhatsAppProvider();
            const payload: MessagePayload = {
                to: '+919876543210',
                body: 'Test WhatsApp message',
                type: 'WHATSAPP',
            };

            const result = await waProvider.send(payload);

            expect(result.success).toBe(true);
            expect(result.provider).toBe('WHATSAPP_STUB');
            expect(result.messageId).toBeDefined();
        });
    });

    describe('MessagingService', () => {
        it('should register and use SMS provider', async () => {
            const service = new MessagingService();
            const smsProvider = new SMSProvider();

            service.registerProvider('SMS', smsProvider);

            const result = await service.send({
                to: '+919876543210',
                body: 'Test',
                type: 'SMS',
            });

            expect(result.success).toBe(true);
        });

        it('should register and use WhatsApp provider', async () => {
            const service = new MessagingService();
            const waProvider = new WhatsAppProvider();

            service.registerProvider('WHATSAPP', waProvider);

            const result = await service.send({
                to: '+919876543210',
                body: 'Test',
                type: 'WHATSAPP',
            });

            expect(result.success).toBe(true);
        });

        it('should throw error when provider not registered', async () => {
            const service = new MessagingService();

            await expect(service.send({
                to: '+919876543210',
                body: 'Test',
                type: 'SMS',
            })).rejects.toThrow('No provider registered for type: SMS');
        });

        it('should support bulk messaging', async () => {
            const service = new MessagingService();
            service.registerProvider('SMS', new SMSProvider());

            const payloads: MessagePayload[] = [
                { to: '+919876543210', body: 'Message 1', type: 'SMS' },
                { to: '+919876543211', body: 'Message 2', type: 'SMS' },
                { to: '+919876543212', body: 'Message 3', type: 'SMS' },
            ];

            const results = await service.sendBulk(payloads);

            expect(results).toHaveLength(3);
            expect(results.every(r => r.success)).toBe(true);
        });

        it('should format conference call message correctly', () => {
            const service = new MessagingService();

            const message = service.formatConferenceMessage({
                title: 'Block A Town Hall',
                dialInNumber: '1800-123-4567',
                accessCode: '9876',
                scheduledTime: new Date('2025-12-18T10:00:00'),
                language: 'HINDI',
            });

            expect(message).toContain('1800-123-4567');
            expect(message).toContain('9876');
            expect(message).toContain('Block A Town Hall');
        });
    });
});
