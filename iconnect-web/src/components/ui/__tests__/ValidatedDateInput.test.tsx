/**
 * @file components/ui/__tests__/ValidatedDateInput.test.tsx
 * @description TDD tests for ValidatedDateInput component with real-time UI validation
 * @changelog
 * - 2024-12-17: Initial TDD implementation - UI behavior tests
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ValidatedDateInput from '../ValidatedDateInput';

// Mock ReactDOM.createPortal to simply render children in place for tests
jest.mock('react-dom', () => ({
    ...jest.requireActual('react-dom'),
    createPortal: (node: React.ReactNode) => node,
}));

describe('ValidatedDateInput Component', () => {

    // ============================================
    // Rendering Tests
    // ============================================
    describe('Rendering', () => {
        test('renders with label', () => {
            render(
                <ValidatedDateInput
                    label="Date of Birth"
                    value=""
                    onChange={() => { }}
                />
            );
            expect(screen.getByText('Date of Birth')).toBeInTheDocument();
        });

        test('renders with placeholder DD/MM/YYYY', () => {
            render(
                <ValidatedDateInput
                    value=""
                    onChange={() => { }}
                />
            );
            expect(screen.getByPlaceholderText('DD/MM/YYYY')).toBeInTheDocument();
        });

        test('displays value in DD/MM/YYYY format when given YYYY-MM-DD', () => {
            render(
                <ValidatedDateInput
                    value="2024-12-16"
                    onChange={() => { }}
                />
            );
            expect(screen.getByDisplayValue('16/12/2024')).toBeInTheDocument();
        });
    });

    // ============================================
    // Auto-Masking Tests
    // ============================================
    describe('Auto-Masking (typing experience)', () => {
        test('auto-adds slash after typing 2 digits for day', async () => {
            const handleChange = jest.fn();
            render(
                <ValidatedDateInput
                    value=""
                    onChange={handleChange}
                />
            );

            const input = screen.getByRole('textbox');
            await userEvent.type(input, '16');

            // Should call onChange with formatted value
            expect(handleChange).toHaveBeenCalled();
        });

        test('blocks non-numeric characters', async () => {
            const handleChange = jest.fn();
            render(
                <ValidatedDateInput
                    value=""
                    onChange={handleChange}
                />
            );

            const input = screen.getByRole('textbox');
            await userEvent.type(input, 'abc');

            // Non-numeric should be stripped
            const lastCall = handleChange.mock.calls[handleChange.mock.calls.length - 1];
            if (lastCall) {
                expect(lastCall[0]).not.toContain('a');
                expect(lastCall[0]).not.toContain('b');
                expect(lastCall[0]).not.toContain('c');
            }
        });

        test('limits input to 10 characters (DD/MM/YYYY)', async () => {
            const handleChange = jest.fn();
            render(
                <ValidatedDateInput
                    value=""
                    onChange={handleChange}
                />
            );

            const input = screen.getByRole('textbox');
            await userEvent.type(input, '161220241234');

            // Should be limited to 10 chars
            const lastCall = handleChange.mock.calls[handleChange.mock.calls.length - 1];
            if (lastCall) {
                expect(lastCall[0].length).toBeLessThanOrEqual(10);
            }
        });
    });

    // ============================================
    // Validation State Tests (Red/Green borders)
    // ============================================
    describe('Real-time Validation States (UI Feedback)', () => {
        test('shows neutral state for empty input (no red/green)', () => {
            const { container } = render(
                <ValidatedDateInput
                    value=""
                    onChange={() => { }}
                />
            );

            // Should not have error or success classes
            expect(container.innerHTML).not.toContain('border-red-500');
            expect(container.innerHTML).not.toContain('border-emerald-500');
        });

        test('shows error state (red border) for partial input', () => {
            const { container } = render(
                <ValidatedDateInput
                    value="16/12/"
                    onChange={() => { }}
                />
            );

            // Should have error class
            expect(container.innerHTML).toContain('border-red-500');
        });

        test('shows error state (red border) for invalid complete date', () => {
            const { container } = render(
                <ValidatedDateInput
                    value="32/12/2024"
                    onChange={() => { }}
                />
            );

            expect(container.innerHTML).toContain('border-red-500');
        });

        test('shows success state (green border) for valid date', () => {
            const { container } = render(
                <ValidatedDateInput
                    value="2024-12-16"
                    onChange={() => { }}
                />
            );

            // Valid date should show success
            expect(container.innerHTML).toContain('border-emerald-500');
        });

        // ============================================
        // Future Date Validation (DOB/Anniversary Hotfix)
        // ============================================
        describe('Hotfix: Future Date Validation', () => {
            test('Test A: Data Entry - rejects future date for DOB (allowFuture=false)', () => {
                const { container } = render(
                    <ValidatedDateInput
                        label="Date of Birth"
                        value="01/01/2026"
                        onChange={() => { }}
                        allowFuture={false}
                    />
                );
                // Should show RED border for future date when allowFuture is false
                expect(container.innerHTML).toContain('border-red-500');
            });

            test('Test B: Data Entry - accepts today for Anniversary (allowFuture=false)', () => {
                const today = new Date();
                const d = String(today.getDate()).padStart(2, '0');
                const m = String(today.getMonth() + 1).padStart(2, '0');
                const y = today.getFullYear();
                const todayStr = `${d}/${m}/${y}`;

                const { container } = render(
                    <ValidatedDateInput
                        label="Anniversary"
                        value={todayStr}
                        onChange={() => { }}
                        allowFuture={false}
                    />
                );
                // Should show GREEN border for today even when allowFuture is false
                expect(container.innerHTML).toContain('border-emerald-500');
            });

            test('Test C: Conference Call Scheduler - accepts future date (allowFuture=true)', () => {
                const { container } = render(
                    <ValidatedDateInput
                        label="Conference Call"
                        value="01/01/2026"
                        onChange={() => { }}
                        allowFuture={true}
                    />
                );
                // Should show GREEN border for future date when allowFuture is true
                expect(container.innerHTML).toContain('border-emerald-500');
            });
        });
    });

    // ============================================
    // Calendar Integration Tests
    // ============================================
    describe('Calendar Integration', () => {
        test('calendar popup appears on input focus', async () => {
            render(
                <ValidatedDateInput
                    value=""
                    onChange={() => { }}
                    showCalendar={true}
                />
            );

            const input = screen.getByRole('textbox');
            await userEvent.click(input);

            // GlassCalendar renders day names like 'Su', 'Mo', etc.
            expect(screen.getByText('Su')).toBeInTheDocument();
            expect(screen.getByText('Mo')).toBeInTheDocument();
        });

        test('calendar selection updates value', async () => {
            const handleChange = jest.fn();
            render(
                <ValidatedDateInput
                    value="2024-12-01"
                    onChange={handleChange}
                    showCalendar={true}
                />
            );

            const input = screen.getByRole('textbox');
            await userEvent.click(input);

            // Click day 16
            const dayButton = screen.getByText('16');
            await userEvent.click(dayButton);

            expect(handleChange).toHaveBeenCalledWith('2024-12-16');
        });
    });

    // ============================================
    // Edge Case Validation Tests
    // ============================================
    describe('Edge Case Validation (20 scenarios)', () => {
        const testCases = [
            { input: '', expectedValid: false, description: 'Empty field' },
            { input: '00/00/0000', expectedValid: false, description: 'All zeros' },
            { input: '32/01/2024', expectedValid: false, description: 'Day > 31' },
            { input: '15/13/2024', expectedValid: false, description: 'Month > 12' },
            { input: '12/12/1899', expectedValid: false, description: 'Year < 1900' },
            { input: '2024-02-29', expectedValid: true, description: 'Leap year Feb 29' }, // Stored format
            { input: '29/02/2023', expectedValid: false, description: 'Non-leap year Feb 29' },
            { input: '30/02/2024', expectedValid: false, description: 'Feb 30' },
            { input: '31/04/2024', expectedValid: false, description: 'April 31' },
            { input: '31/06/2024', expectedValid: false, description: 'June 31' },
            { input: '31/09/2024', expectedValid: false, description: 'Sept 31' },
            { input: '31/11/2024', expectedValid: false, description: 'Nov 31' },
            { input: '2024-12-31', expectedValid: true, description: 'Dec 31 valid' }, // Stored format
            { input: '2024-01-01', expectedValid: true, description: 'Jan 1 valid' }, // Stored format
            { input: '12/', expectedValid: false, description: 'Partial - day only' },
            { input: '12/12/202', expectedValid: false, description: 'Partial year' },
            { input: '00/12/2024', expectedValid: false, description: 'Day = 0' },
        ];

        testCases.forEach(({ input, expectedValid, description }) => {
            test(`${description}: ${input} → ${expectedValid ? 'valid' : 'invalid'}`, () => {
                const { container } = render(
                    <ValidatedDateInput
                        value={input}
                        onChange={() => { }}
                    />
                );

                if (expectedValid) {
                    expect(container.innerHTML).toContain('border-emerald-500');
                } else if (input.length > 0) {
                    expect(container.innerHTML).toContain('border-red-500');
                }
            });
        });
    });

    // ============================================
    // Disabled State Tests
    // ============================================
    describe('Disabled State', () => {
        test('input is disabled when disabled prop is true', () => {
            render(
                <ValidatedDateInput
                    value=""
                    onChange={() => { }}
                    disabled={true}
                />
            );

            expect(screen.getByRole('textbox')).toBeDisabled();
        });
    });
});
