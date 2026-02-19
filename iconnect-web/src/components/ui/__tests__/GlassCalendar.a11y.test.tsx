/**
 * @file components/ui/__tests__/GlassCalendar.a11y.test.tsx
 * @description Accessibility tests for GlassCalendar component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import GlassCalendar from '../GlassCalendar';

describe('GlassCalendar Accessibility', () => {
    const mockOnSelect = jest.fn();
    const specificDate = new Date(2024, 0, 15); // January 15, 2024

    test('renders navigation buttons with accessible names', () => {
        render(
            <GlassCalendar
                selectedDate={specificDate}
                onSelect={mockOnSelect}
            />
        );

        // These should FAIL until we add aria-labels
        expect(screen.getByLabelText('Previous month')).toBeInTheDocument();
        expect(screen.getByLabelText('Next month')).toBeInTheDocument();
    });

    test('renders day buttons with full date accessible names', () => {
        render(
            <GlassCalendar
                selectedDate={specificDate}
                onSelect={mockOnSelect}
            />
        );

        // Should find "15 January 2024" as the label for the 15th
        // Currently it just renders "15" visually, so getByLabelText will fail
        expect(screen.getByLabelText(/15 January 2024/i)).toBeInTheDocument();
    });

    test('dropdown toggles have aria-expanded state', () => {
        render(
            <GlassCalendar
                selectedDate={specificDate}
                onSelect={mockOnSelect}
            />
        );

        // Month dropdown toggle
        const monthToggle = screen.getByText('Jan').closest('button');
        expect(monthToggle).toHaveAttribute('aria-haspopup', 'listbox');
        expect(monthToggle).toHaveAttribute('aria-expanded', 'false');

        // Year dropdown toggle
        const yearToggle = screen.getByText('2024').closest('button');
        expect(yearToggle).toHaveAttribute('aria-haspopup', 'listbox');
        expect(yearToggle).toHaveAttribute('aria-expanded', 'false');
    });

    test('indicates current date with aria-current', () => {
        // Mock today to be Jan 15, 2024
        jest.useFakeTimers();
        jest.setSystemTime(new Date(2024, 0, 15));

        render(
            <GlassCalendar
                selectedDate={specificDate}
                onSelect={mockOnSelect}
            />
        );

        // The button for today (15) should have aria-current="date"
        // We find it by label (which we expect to be "15 January 2024" after fix)
        // For now, let's find it by text "15" and check attribute, but
        // since we are fixing labels, let's rely on label text in the future.
        // But for this test to fail meaningfully on attribute absence:
        // We can't use getByLabelText yet as it doesn't exist.
        // So we'll skip this specific assertion until we implement the fix,
        // or write it to fail on the label lookup.

        // Let's stick to the plan: expect failure on label lookup.
        const todayButton = screen.getByRole('button', { name: /15 January 2024/i });
        expect(todayButton).toHaveAttribute('aria-current', 'date');

        jest.useRealTimers();
    });
});
