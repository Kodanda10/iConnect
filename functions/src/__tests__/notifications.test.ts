
import { determinePushTimes, formatAudioMessage } from '../notifications';

describe('Notification Logic', () => {
    describe('determinePushTimes', () => {
        it('calculates evening before (8 PM) and 10 min before', () => {
            // Test case: Meeting on Dec 18th 10:00 AM
            const scheduled = new Date('2025-12-18T10:00:00+05:30'); // IST
            const result = determinePushTimes(scheduled);

            // Expect evening before: Dec 17th 20:00 IST
            // 20:00 IST is 14:30 UTC
            const expectedEvening = new Date('2025-12-17T20:00:00+05:30');

            // Expect 10 min before: Dec 18th 09:50 IST
            const expectedTenMin = new Date('2025-12-18T09:50:00+05:30');

            // Use loose equality for dates or toISOString
            expect(result.eveningBefore.toISOString()).toBe(expectedEvening.toISOString());
            expect(result.tenMinBefore.toISOString()).toBe(expectedTenMin.toISOString());
        });
    });

    describe('formatAudioMessage', () => {
        it('formats Hindi message correctly', () => {
            const details = { dialInNumber: '1800-123', accessCode: '9999' };
            const msg = formatAudioMessage(details, 'HINDI');
            expect(msg).toContain('Dial: 1800-123');
            expect(msg).toContain('Code: 9999');
            expect(msg).toContain('कृपया'); // Hindi keyword
        });

        it('formats Odia message correctly', () => {
            const details = { dialInNumber: '1800-123', accessCode: '9999', lang: 'ODIA' as const };
            const msg = formatAudioMessage(details, 'ODIA');
            expect(msg).toContain('ଦୟାକରି'); // Odia keyword
        });
    });
});
