/**
 * @file components/ui/__tests__/GlassCalendar.a11y.test.tsx
 * @description Accessibility tests for GlassCalendar component
 * @changelog
 * - 2024-12-17: Initial accessibility test suite
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import GlassCalendar from '../GlassCalendar';

describe('GlassCalendar Accessibility', () => {
    const mockOnSelect = jest.fn();
    const testDate = new Date('2024-01-15T12:00:00'); // Fixed date for testing

    test('navigation buttons have accessible names', () => {
        render(
            <GlassCalendar
                selectedDate={testDate}
                onSelect={mockOnSelect}
            />
        );

        // Should have "Previous month" and "Next month" buttons
        expect(screen.getByLabelText('Previous month')).toBeInTheDocument();
        expect(screen.getByLabelText('Next month')).toBeInTheDocument();
    });

    test('dropdown toggles communicate expansion state', () => {
        render(
            <GlassCalendar
                selectedDate={testDate}
                onSelect={mockOnSelect}
            />
        );

        // Find buttons that control the dropdowns (Month and Year)
        // We might need to find them by text content first if they don't have labels yet,
        // but the goal is to check if they have the right attributes.
        // For TDD, we expect this to fail if attributes are missing.

        // Month dropdown (Jan)
        const monthButton = screen.getByText('Jan').closest('button');
        expect(monthButton).toHaveAttribute('aria-haspopup', 'true');
        expect(monthButton).toHaveAttribute('aria-expanded', 'false');

        // Year dropdown (2024)
        const yearButton = screen.getByText('2024').closest('button');
        expect(yearButton).toHaveAttribute('aria-haspopup', 'true');
        expect(yearButton).toHaveAttribute('aria-expanded', 'false');
    });

    test('current date is indicated with aria-current', () => {
        // Mock system time to match testDate so "today" logic matches
        jest.useFakeTimers();
        jest.setSystemTime(testDate);

        render(
            <GlassCalendar
                selectedDate={testDate} // Selected is same as today
                onSelect={mockOnSelect}
            />
        );

        // The current day (15) should have aria-current="date"
        const currentDayButton = screen.getByText('15').closest('button');
        expect(currentDayButton).toHaveAttribute('aria-current', 'date');

        jest.useRealTimers();
    });

    test('selected date is indicated in aria-label', () => {
         render(
            <GlassCalendar
                selectedDate={testDate}
                onSelect={mockOnSelect}
            />
        );

        // The selected day should have text "15"
        // And its label should indicate it is selected
        // We look for the button that contains "15"
        const selectedDayButton = screen.getByText('15').closest('button');

        // Construct expected label: "Monday, 15 January 2024, selected"
        // Note: exact format depends on locale implementation in component
        // checking for substring match at least
        expect(selectedDayButton).toHaveAttribute('aria-label', expect.stringContaining('selected'));
        expect(selectedDayButton).toHaveAttribute('aria-label', expect.stringContaining('15 January 2024'));
    });

    test('day buttons have descriptive labels', () => {
        render(
            <GlassCalendar
                selectedDate={testDate}
                onSelect={mockOnSelect}
            />
        );

        // Check a non-selected day, e.g., 16th
        const dayButton = screen.getByText('16').closest('button');

        // Should have full date in label: "Tuesday, 16 January 2024"
        expect(dayButton).toHaveAttribute('aria-label', expect.stringContaining('16 January 2024'));
        expect(dayButton).not.toHaveAttribute('aria-label', expect.stringContaining('selected'));
    });
});
