/**
 * @file lib/utils/__tests__/csvValidation.test.ts
 * @description TDD tests for CSV constituent validation
 * @changelog
 * - 2024-12-17: Initial TDD implementation - CSV row validation
 */

import { validateCsvRow, CsvRowValidation, validateCsvData } from '../csvValidation';

describe('CSV Row Validation', () => {
    // ============================================
    // Individual Row Validation Tests
    // ============================================
    describe('validateCsvRow', () => {
        test('valid row with all required fields passes', () => {
            const row = {
                name: 'John Doe',
                mobile: '9876543210',
                dob: '1990-05-15',
            };

            const result = validateCsvRow(row, 1);

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        test('rejects row with missing name', () => {
            const row = {
                name: '',
                mobile: '9876543210',
                dob: '1990-05-15',
            };

            const result = validateCsvRow(row, 1);

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Missing name');
        });

        test('rejects row with missing mobile', () => {
            const row = {
                name: 'John Doe',
                mobile: '',
                dob: '1990-05-15',
            };

            const result = validateCsvRow(row, 1);

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Missing mobile number');
        });

        test('rejects row with invalid mobile format', () => {
            const row = {
                name: 'John Doe',
                mobile: '123',
                dob: '1990-05-15',
            };

            const result = validateCsvRow(row, 1);

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Invalid mobile number format');
        });

        test('rejects row with neither DOB nor Anniversary', () => {
            const row = {
                name: 'John Doe',
                mobile: '9876543210',
                dob: '',
                anniversary: '',
            };

            const result = validateCsvRow(row, 1);

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Either Date of Birth or Anniversary is required');
        });

        test('accepts row with only DOB', () => {
            const row = {
                name: 'John Doe',
                mobile: '9876543210',
                dob: '1990-05-15',
                anniversary: '',
            };

            const result = validateCsvRow(row, 1);

            expect(result.isValid).toBe(true);
        });

        test('accepts row with only Anniversary', () => {
            const row = {
                name: 'John Doe',
                mobile: '9876543210',
                dob: '',
                anniversary: '2010-06-20',
            };

            const result = validateCsvRow(row, 1);

            expect(result.isValid).toBe(true);
        });

        test('includes row number in validation result', () => {
            const row = {
                name: '',
                mobile: '',
                dob: '',
            };

            const result = validateCsvRow(row, 5);

            expect(result.rowNumber).toBe(5);
        });
    });

    // ============================================
    // Batch CSV Validation Tests
    // ============================================
    describe('validateCsvData', () => {
        test('returns summary of valid and invalid rows', () => {
            const rows = [
                { name: 'John', mobile: '9876543210', dob: '1990-01-01' },
                { name: '', mobile: '9876543211', dob: '1991-01-01' },
                { name: 'Jane', mobile: '9876543212', anniversary: '2010-01-01' },
            ];

            const result = validateCsvData(rows);

            expect(result.validCount).toBe(2);
            expect(result.invalidCount).toBe(1);
            expect(result.invalidRows).toHaveLength(1);
            expect(result.invalidRows[0].rowNumber).toBe(2);
        });

        test('returns all valid when no errors', () => {
            const rows = [
                { name: 'John', mobile: '9876543210', dob: '1990-01-01' },
                { name: 'Jane', mobile: '9876543212', anniversary: '2010-01-01' },
            ];

            const result = validateCsvData(rows);

            expect(result.validCount).toBe(2);
            expect(result.invalidCount).toBe(0);
            expect(result.isAllValid).toBe(true);
        });
    });
});
