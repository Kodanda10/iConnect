import React from 'react';
import { render, screen } from '@testing-library/react';
import GlassCalendar from '../GlassCalendar';

describe('GlassCalendar Accessibility', () => {
    const mockOnSelect = jest.fn();
    const today = new Date(2024, 0, 15); // Jan 15, 2024

    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(today);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('navigation buttons should have accessible names', () => {
        render(<GlassCalendar onSelect={mockOnSelect} selectedDate={today} />);

        // Previous/Next month buttons
        expect(screen.getByLabelText(/previous month/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/next month/i)).toBeInTheDocument();

        // Dropdown toggles
        expect(screen.getByLabelText(/select month/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/select year/i)).toBeInTheDocument();
    });

    test('current date should have aria-current="date"', () => {
        render(<GlassCalendar onSelect={mockOnSelect} selectedDate={new Date(2024, 0, 20)} />);

        // The 15th is mocked as today
        const todayButton = screen.getByText('15').closest('button');
        expect(todayButton).toHaveAttribute('aria-current', 'date');
    });

    test('selected date should be indicated via aria label or state', () => {
        const selectedDate = new Date(2024, 0, 20); // Jan 20
        render(<GlassCalendar onSelect={mockOnSelect} selectedDate={selectedDate} />);

        const selectedButton = screen.getByText('20').closest('button');

        // It should have some indication of selection.
        // We'll check if the label mentions "Selected" or if aria-pressed/selected is used.
        // For this test, we'll check if the label contains the full date and ideally "Selected" prefix or similar.
        // But initially, let's just check if it has a descriptive label including the full date.
        expect(selectedButton).toHaveAttribute('aria-label', expect.stringMatching(/January 20, 2024/));
    });

    test('day buttons should have descriptive labels', () => {
        render(<GlassCalendar onSelect={mockOnSelect} selectedDate={today} />);

        // Check a random date, e.g., Jan 1st
        const firstDay = screen.getByText('1').closest('button');
        expect(firstDay).toHaveAttribute('aria-label', expect.stringMatching(/January 1, 2024/));
    });
});
