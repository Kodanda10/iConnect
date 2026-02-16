
import React from 'react';
import { render, screen } from '@testing-library/react';
import GlassCalendar from '../GlassCalendar';
import '@testing-library/jest-dom';

describe('GlassCalendar Accessibility', () => {
    test('navigation buttons should have accessible names', () => {
        render(<GlassCalendar onSelect={() => {}} />);

        // Check for Previous/Next month buttons
        expect(screen.getByLabelText('Previous month')).toBeInTheDocument();
        expect(screen.getByLabelText('Next month')).toBeInTheDocument();
    });

    test('day buttons should have full date labels', () => {
        const testDate = new Date(2024, 0, 15); // Jan 15, 2024
        render(<GlassCalendar selectedDate={testDate} onSelect={() => {}} />);

        // The button for the 15th should have a label like "15 January 2024" or similar
        // We'll use a regex to be flexible with locale but ensure full date parts are present
        // Using getByRole 'button' with name matching the full date pattern
        const dayButton = screen.getByRole('button', {
            name: /15.*January.*2024|January.*15.*2024/i
        });
        expect(dayButton).toBeInTheDocument();
    });

    test('dropdown toggles should have accessible labels', () => {
        const testDate = new Date(2024, 0, 15); // Jan 15, 2024
        render(<GlassCalendar selectedDate={testDate} onSelect={() => {}} />);

        // Month dropdown
        expect(screen.getByLabelText(/Select month/i)).toBeInTheDocument();

        // Year dropdown
        expect(screen.getByLabelText(/Select year/i)).toBeInTheDocument();
    });
});
