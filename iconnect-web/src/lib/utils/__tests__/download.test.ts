
import { generateCSVContent } from '../download';
import { Constituent } from '@/types';

describe('download utils', () => {
    describe('generateCSVContent', () => {
        it('should escape CSV injection characters', () => {
            const maliciousConstituents: Constituent[] = [
                {
                    id: '1',
                    name: '=cmd| /C calc!A0', // Malicious payload
                    mobile_number: '+1234567890',
                    ward_number: '@SUM(1+1)', // Malicious payload
                    block: '-1+1', // Malicious payload
                    gp_ulb: 'Normal',
                    birthday_mmdd: '01-01',
                    anniversary_mmdd: '02-02'
                }
            ];

            const csv = generateCSVContent(maliciousConstituents);
            const lines = csv.split('\n');
            const dataRow = lines[1]; // Header is line 0

            // The fields should be wrapped in quotes and ideally prefixed with a single quote or similar mechanism to prevent execution
            // Common mitigation is to prepend a single quote "'" to fields starting with =, +, -, @
            // And then wrap in double quotes as usual.

            // Expected output for '=cmd...' should be "'=cmd..." (wrapped in quotes if it contains other chars)
            // But verify what the fix will implement.
            // Usually:
            // If value starts with =, +, -, @
            // Prefix with ' (tab) or similar.
            // Let's assume we want to prefix with single quote '.

            const columns = dataRow.split(',');
            // CSV split by comma is naive here because of quoted fields, but let's check the raw string.

            expect(csv).toContain("'\=cmd| /C calc!A0");
            expect(csv).toContain("'@SUM(1+1)");
            expect(csv).toContain("'-1+1");
        });

        it('should handle normal fields correctly', () => {
             const constituents: Constituent[] = [
                {
                    id: '1',
                    name: 'John Doe',
                    mobile_number: '1234567890',
                }
            ];
            const csv = generateCSVContent(constituents);
            expect(csv).toContain('John Doe');
            expect(csv).not.toContain("'John Doe");
        });

        it('should handle fields with commas and quotes', () => {
            const constituents: Constituent[] = [
               {
                   id: '1',
                   name: 'Doe, John',
                   mobile_number: '1234567890',
               }
           ];
           const csv = generateCSVContent(constituents);
           expect(csv).toContain('"Doe, John"');
       });
    });
});
