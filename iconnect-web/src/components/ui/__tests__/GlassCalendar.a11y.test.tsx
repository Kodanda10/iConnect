import React from 'react';
import { render, screen } from '@testing-library/react';
import GlassCalendar from '../GlassCalendar';
import '@testing-library/jest-dom';

describe('GlassCalendar Accessibility', () => {
    test('renders with accessible navigation buttons', () => {
        render(<GlassCalendar onSelect={() => {}} />);

        expect(screen.getByLabelText('Previous month')).toBeInTheDocument();
        expect(screen.getByLabelText('Next month')).toBeInTheDocument();
    });

    test('renders with accessible dropdown toggles', () => {
        render(<GlassCalendar onSelect={() => {}} />);

        const monthSelector = screen.getByLabelText('Select month');
        const yearSelector = screen.getByLabelText('Select year');

        expect(monthSelector).toBeInTheDocument();
        expect(yearSelector).toBeInTheDocument();
        expect(monthSelector).toHaveAttribute('aria-haspopup', 'listbox');
        expect(yearSelector).toHaveAttribute('aria-haspopup', 'listbox');
    });

    test('renders days with accessible labels', () => {
        // Use a fixed date to ensure the label matches the generated one
        // Note: Logic inside GlassCalendar relies on viewDate, which defaults to selectedDate or today.
        const testDate = new Date(2024, 0, 15); // Jan 15, 2024
        render(<GlassCalendar selectedDate={testDate} onSelect={() => {}} />);

        // Should find the specific date
        expect(screen.getByLabelText('15 January 2024')).toBeInTheDocument();
    });

    test('marks selected date with aria-pressed', () => {
        const testDate = new Date(2024, 0, 15);
        render(<GlassCalendar selectedDate={testDate} onSelect={() => {}} />);

        const selectedDay = screen.getByLabelText('15 January 2024');
        expect(selectedDay).toHaveAttribute('aria-pressed', 'true');
    });
});
