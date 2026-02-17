import React from 'react';
import { render, screen } from '@testing-library/react';
import GlassCalendar from '../GlassCalendar';

describe('GlassCalendar Accessibility', () => {
    const defaultDate = new Date('2024-01-15T00:00:00'); // January 15, 2024

    // Helper to render the calendar
    const renderCalendar = (props = {}) => {
        return render(
            <GlassCalendar
                selectedDate={defaultDate}
                onSelect={() => {}}
                {...props}
            />
        );
    };

    test('renders with accessible navigation buttons', () => {
        renderCalendar();

        // These should be present and accessible
        expect(screen.getByLabelText('Previous month')).toBeInTheDocument();
        expect(screen.getByLabelText('Next month')).toBeInTheDocument();
    });

    test('renders month/year selectors with accessible state', () => {
        renderCalendar();

        // Month selector
        const monthButton = screen.getByLabelText(/Select month/i);
        expect(monthButton).toBeInTheDocument();
        expect(monthButton).toHaveAttribute('aria-haspopup', 'listbox');
        expect(monthButton).toHaveAttribute('aria-expanded', 'false');

        // Year selector
        const yearButton = screen.getByLabelText(/Select year/i);
        expect(yearButton).toBeInTheDocument();
        expect(yearButton).toHaveAttribute('aria-haspopup', 'listbox');
        expect(yearButton).toHaveAttribute('aria-expanded', 'false');
    });

    test('renders day buttons with full date labels', () => {
        renderCalendar();

        // Should find "15 January 2024" specifically
        // Using a regex to be flexible but specific enough
        expect(screen.getByLabelText(/15 January 2024/i)).toBeInTheDocument();
    });

    test('marks the selected day visually and accessibly', () => {
        renderCalendar();

        // The selected day (15th) should indicate selection in its label
        const selectedDay = screen.getByLabelText(/15 January 2024.*selected/i);
        expect(selectedDay).toBeInTheDocument();
    });

    test('marks today with aria-current="date"', () => {
        // Mock today's date
        const today = new Date();
        const day = today.getDate();
        const month = today.toLocaleString('default', { month: 'long' });
        const year = today.getFullYear();

        render(<GlassCalendar onSelect={() => {}} />); // default uses today

        // Find today's button
        const labelRegex = new RegExp(`${day} ${month} ${year}`, 'i');
        const todayButton = screen.getByLabelText(labelRegex);

        expect(todayButton).toHaveAttribute('aria-current', 'date');
    });
});
