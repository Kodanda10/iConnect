import React from 'react';
import { render, screen } from '@testing-library/react';
import GlassCalendar from '../GlassCalendar';
import '@testing-library/jest-dom';

describe('GlassCalendar Accessibility', () => {
    const mockOnSelect = jest.fn();
    // Using a fixed date for reliable testing: January 15, 2024
    const testDate = new Date(2024, 0, 15);

    test('should have accessible navigation buttons', () => {
        render(<GlassCalendar selectedDate={testDate} onSelect={mockOnSelect} />);

        expect(screen.getByLabelText('Previous month')).toBeInTheDocument();
        expect(screen.getByLabelText('Next month')).toBeInTheDocument();
    });

    test('should have accessible dropdown toggles', () => {
        render(<GlassCalendar selectedDate={testDate} onSelect={mockOnSelect} />);

        // Month dropdown
        const monthButton = screen.getByLabelText(/Select month/);
        expect(monthButton).toBeInTheDocument();
        expect(monthButton).toHaveAttribute('aria-haspopup', 'true');
        expect(monthButton).toHaveAttribute('aria-expanded', 'false');

        // Year dropdown
        const yearButton = screen.getByLabelText(/Select year/);
        expect(yearButton).toBeInTheDocument();
        expect(yearButton).toHaveAttribute('aria-haspopup', 'true');
        expect(yearButton).toHaveAttribute('aria-expanded', 'false');
    });

    test('should have accessible day buttons', () => {
        render(<GlassCalendar selectedDate={testDate} onSelect={mockOnSelect} />);

        // Check for the selected date (Jan 15, 2024)
        // Note: Formatting depends on how we implement the label in the component.
        // We'll aim for "Select January 15, 2024" or similar clear instruction.
        const selectedDay = screen.getByLabelText(/January 15, 2024/);
        expect(selectedDay).toBeInTheDocument();
        expect(selectedDay).toHaveAttribute('aria-pressed', 'true');
    });

    test('should indicate current date with aria-current', () => {
        // Render with today's date selected to simplify finding it,
        // or finding the current date in the grid regardless of selection.
        const today = new Date();
        render(<GlassCalendar selectedDate={today} onSelect={mockOnSelect} />);

        // Construct the expected label for today
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const todayLabel = `${monthNames[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;

        // Find by label part to be flexible, but check attribute
        const todayButtons = screen.getAllByLabelText(new RegExp(todayLabel));
        // There might be overlap if selected date is today, but we just need to find the element that represents today
        const todayButton = todayButtons.find(btn => btn.getAttribute('aria-current') === 'date');

        expect(todayButton).toBeInTheDocument();
    });
});
