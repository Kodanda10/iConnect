/**
 * @file lib/utils/csvValidation.ts
 * @description CSV constituent data validation utilities
 * @changelog
 * - 2024-12-17: Initial TDD implementation - CSV row and batch validation
 */

import { isValidIndianMobile } from './validation';
import { validateConstituentDates } from './dateRequirements';

export interface CsvRowValidation {
    rowNumber: number;
    isValid: boolean;
    errors: string[];
    name?: string;
}

export interface CsvDataValidation {
    isAllValid: boolean;
    validCount: number;
    invalidCount: number;
    invalidRows: CsvRowValidation[];
}

export interface CsvRowData {
    name?: string;
    mobile?: string;
    whatsapp?: string;
    dob?: string;
    anniversary?: string;
    block?: string;
    gp_ulb?: string;
    ward?: string;
}

/**
 * Validates a single CSV row for required fields and formats.
 * 
 * Required fields:
 * - name: Non-empty string
 * - mobile: Valid 10-digit Indian number
 * - dob OR anniversary: At least one date required
 * 
 * @param row - CSV row data object
 * @param rowNumber - 1-indexed row number for error reporting
 * @returns Validation result with errors list
 */
export function validateCsvRow(row: CsvRowData, rowNumber: number): CsvRowValidation {
    const errors: string[] = [];

    // Validate name (required)
    if (!row.name || row.name.trim().length === 0) {
        errors.push('Missing name');
    }

    // Validate mobile (required)
    if (!row.mobile || row.mobile.trim().length === 0) {
        errors.push('Missing mobile number');
    } else if (!isValidIndianMobile(row.mobile)) {
        errors.push('Invalid mobile number format');
    }

    // Validate DOB or Anniversary (at least one required)
    const dateValidation = validateConstituentDates(row.dob, row.anniversary);
    if (!dateValidation.isValid && dateValidation.error) {
        errors.push(dateValidation.error);
    }

    return {
        rowNumber,
        isValid: errors.length === 0,
        errors,
        name: row.name,
    };
}

/**
 * Validates an array of CSV rows and returns summary.
 * 
 * @param rows - Array of CSV row data objects
 * @returns Validation summary with valid/invalid counts and error details
 */
export function validateCsvData(rows: CsvRowData[]): CsvDataValidation {
    const invalidRows: CsvRowValidation[] = [];
    let validCount = 0;

    rows.forEach((row, index) => {
        const result = validateCsvRow(row, index + 1); // 1-indexed for user display
        if (result.isValid) {
            validCount++;
        } else {
            invalidRows.push(result);
        }
    });

    return {
        isAllValid: invalidRows.length === 0,
        validCount,
        invalidCount: invalidRows.length,
        invalidRows,
    };
}
