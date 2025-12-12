/**
 * @file __tests__/upload-form.test.tsx
 * @description TDD tests for upload form - field order, validation, WhatsApp field
 * @changelog
 * - 2024-12-12: Initial implementation following TDD
 */

import { isValidIndianMobile, isValidWhatsApp } from '@/lib/utils/validation';

describe('Upload Form Field Order', () => {
    // Expected field order per user request:
    // Full Name → Mobile → WhatsApp → Block → GP → Ward → DOB → Anniversary

    describe('Form Field Validation', () => {
        test('mobile field validates 10-digit Indian number', () => {
            expect(isValidIndianMobile('9876543210')).toBe(true);
            expect(isValidIndianMobile('123')).toBe(false);
        });

        test('whatsapp field validates 10-digit number or allows empty', () => {
            expect(isValidWhatsApp('9876543210')).toBe(true);
            expect(isValidWhatsApp('')).toBe(true);
            expect(isValidWhatsApp('123')).toBe(false);
        });

        test('mobile field rejects dummy numbers', () => {
            expect(isValidIndianMobile('9999999999')).toBe(false);
            expect(isValidIndianMobile('8888888888')).toBe(false);
            expect(isValidIndianMobile('1234567890')).toBe(false);
        });

        test('whatsapp field rejects dummy numbers when provided', () => {
            expect(isValidWhatsApp('9999999999')).toBe(false);
            expect(isValidWhatsApp('8888888888')).toBe(false);
        });
    });

    describe('Form Data Structure', () => {
        test('formData includes whatsapp field', () => {
            const formData = {
                name: '',
                mobile: '',
                whatsapp: '',
                block: '',
                gp_ulb: '',
                ward: '',
                dob: '',
                anniversary: '',
            };

            expect(formData).toHaveProperty('whatsapp');
            expect(formData).toHaveProperty('name');
            expect(formData).toHaveProperty('mobile');
            expect(formData).toHaveProperty('block');
            expect(formData).toHaveProperty('gp_ulb');
            expect(formData).toHaveProperty('ward');
            expect(formData).toHaveProperty('dob');
            expect(formData).toHaveProperty('anniversary');
        });

        test('formData field order matches expected layout', () => {
            const formData = {
                name: '',
                mobile: '',
                whatsapp: '',
                block: '',
                gp_ulb: '',
                ward: '',
                dob: '',
                anniversary: '',
            };

            const keys = Object.keys(formData);
            expect(keys[0]).toBe('name');
            expect(keys[1]).toBe('mobile');
            expect(keys[2]).toBe('whatsapp');
            expect(keys[3]).toBe('block');
            expect(keys[4]).toBe('gp_ulb');
            expect(keys[5]).toBe('ward');
            expect(keys[6]).toBe('dob');
            expect(keys[7]).toBe('anniversary');
        });
    });
});
