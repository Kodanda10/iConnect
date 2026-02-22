import React from 'react';
import { render, screen } from '@testing-library/react';
import GlassCalendar from '../GlassCalendar';

// Mock lucide-react icons if needed, but they are usually fine.
// If tests fail due to missing icons, we can mock them.

describe('GlassCalendar Accessibility', () => {
    const mockOnSelect = jest.fn();
    const today = new Date();

    it('should have accessible navigation buttons', () => {
        render(<GlassCalendar onSelect={mockOnSelect} selectedDate={today} />);

        expect(screen.getByLabelText('Previous month')).toBeInTheDocument();
        expect(screen.getByLabelText('Next month')).toBeInTheDocument();
    });

    it('should have accessible day cells', () => {
        render(<GlassCalendar onSelect={mockOnSelect} selectedDate={today} />);

        // Check for today's date label
        const dateString = today.toLocaleDateString('en-GB', { dateStyle: 'full' });
        // Since today is selected, it should have "selected" in the label
        expect(screen.getByLabelText(new RegExp(dateString))).toBeInTheDocument();

        // Check for current date indication (today)
        const todayCell = screen.getByLabelText(new RegExp(dateString));
        expect(todayCell).toHaveAttribute('aria-current', 'date');
    });

    it('should indicate selected date in label', () => {
        render(<GlassCalendar onSelect={mockOnSelect} selectedDate={today} />);
        const dateString = today.toLocaleDateString('en-GB', { dateStyle: 'full' });
        // Expect label to contain "selected"
        expect(screen.getByLabelText(`${dateString}, selected`)).toBeInTheDocument();
    });

    it('should have accessible dropdown toggles', () => {
        render(<GlassCalendar onSelect={mockOnSelect} selectedDate={today} />);

        const monthName = today.toLocaleString('default', { month: 'long' });
        const year = today.getFullYear();

        expect(screen.getByLabelText(`Select month, current is ${monthName}`)).toBeInTheDocument();
        expect(screen.getByLabelText(`Select year, current is ${year}`)).toBeInTheDocument();
    });
});
