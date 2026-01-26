/**
 * @file components/ui/__tests__/GlassCalendar.a11y.test.tsx
 * @description Accessibility tests for GlassCalendar component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import GlassCalendar from '../GlassCalendar';

describe('GlassCalendar Accessibility', () => {
    const mockOnSelect = jest.fn();
    const testDate = new Date(2024, 11, 15); // December 15, 2024

    test('navigation buttons have accessible names', () => {
        render(<GlassCalendar selectedDate={testDate} onSelect={mockOnSelect} />);

        expect(screen.getByLabelText('Previous month')).toBeInTheDocument();
        expect(screen.getByLabelText('Next month')).toBeInTheDocument();
    });

    test('dropdown toggles have accessible names and state', () => {
        render(<GlassCalendar selectedDate={testDate} onSelect={mockOnSelect} />);

        const monthButton = screen.getByLabelText('Select month');
        const yearButton = screen.getByLabelText('Select year');

        expect(monthButton).toBeInTheDocument();
        expect(yearButton).toBeInTheDocument();

        expect(monthButton).toHaveAttribute('aria-haspopup', 'listbox');
        expect(monthButton).toHaveAttribute('aria-expanded', 'false');

        expect(yearButton).toHaveAttribute('aria-haspopup', 'listbox');
        expect(yearButton).toHaveAttribute('aria-expanded', 'false');
    });

    test('day buttons have descriptive accessible names', () => {
        render(<GlassCalendar selectedDate={testDate} onSelect={mockOnSelect} />);

        // Check for specific date labels
        // December 1, 2024
        expect(screen.getByLabelText('Select 1 December 2024')).toBeInTheDocument();

        // December 31, 2024
        expect(screen.getByLabelText('Select 31 December 2024')).toBeInTheDocument();
    });

    test('selected date uses label to indicate selection', () => {
        render(<GlassCalendar selectedDate={testDate} onSelect={mockOnSelect} />);

        // The selected date is Dec 15, 2024
        // Logic: "Selected date, 15 December 2024"
        const selectedDay = screen.getByLabelText('Selected date, 15 December 2024');
        expect(selectedDay).toBeInTheDocument();

        // Another date should not have "Selected date" prefix
        const otherDay = screen.getByLabelText('Select 16 December 2024');
        expect(otherDay).toBeInTheDocument();
    });
});
