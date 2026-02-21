import React from 'react';
import { render, screen } from '@testing-library/react';
import GlassCalendar from '../GlassCalendar';

describe('GlassCalendar Accessibility', () => {
    const mockOnSelect = jest.fn();
    const testDate = new Date(2024, 0, 15); // January 15, 2024

    test('renders with accessible labels for navigation buttons', () => {
        render(
            <GlassCalendar
                selectedDate={testDate}
                onSelect={mockOnSelect}
            />
        );

        // Previous/Next month buttons should have labels
        expect(screen.getByLabelText('Previous month')).toBeInTheDocument();
        expect(screen.getByLabelText('Next month')).toBeInTheDocument();

        // Dropdowns should have labels indicating current selection
        expect(screen.getByLabelText(/Select month, current is January/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Select year, current is 2024/i)).toBeInTheDocument();
    });

    test('renders day buttons with full date labels', () => {
        render(
            <GlassCalendar
                selectedDate={testDate}
                onSelect={mockOnSelect}
            />
        );

        // Check for specific date labels
        // January 15, 2024
        expect(screen.getByLabelText('15 January 2024')).toBeInTheDocument();

        // January 1, 2024
        expect(screen.getByLabelText('1 January 2024')).toBeInTheDocument();
    });

    test('marks today date with aria-current="date"', () => {
        // We need to render with today's date to check aria-current
        const today = new Date();
        render(
            <GlassCalendar
                selectedDate={today}
                onSelect={mockOnSelect}
            />
        );

        // Find the button for today (this relies on the date label existing first)
        const todayLabel = `${today.getDate()} ${today.toLocaleString('default', { month: 'long' })} ${today.getFullYear()}`;
        const todayButton = screen.getByLabelText(todayLabel);

        expect(todayButton).toHaveAttribute('aria-current', 'date');
    });
});
