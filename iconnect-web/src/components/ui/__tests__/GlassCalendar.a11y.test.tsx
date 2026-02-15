import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import GlassCalendar from '../GlassCalendar';

describe('GlassCalendar Accessibility', () => {
    const mockOnSelect = jest.fn();
    const defaultProps = {
        onSelect: mockOnSelect,
        selectedDate: new Date(2024, 0, 15), // Jan 15, 2024
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('navigation buttons should have accessible labels', () => {
        render(<GlassCalendar {...defaultProps} />);

        // These should fail initially
        expect(screen.getByLabelText('Previous month')).toBeInTheDocument();
        expect(screen.getByLabelText('Next month')).toBeInTheDocument();
    });

    test('month and year dropdowns should have accessible labels and state', () => {
        render(<GlassCalendar {...defaultProps} />);

        // Month dropdown
        const monthButton = screen.getByLabelText('Select month');
        expect(monthButton).toBeInTheDocument();
        expect(monthButton).toHaveAttribute('aria-haspopup', 'listbox');
        expect(monthButton).toHaveAttribute('aria-expanded', 'false');

        // Year dropdown
        const yearButton = screen.getByLabelText('Select year');
        expect(yearButton).toBeInTheDocument();
        expect(yearButton).toHaveAttribute('aria-haspopup', 'listbox');
        expect(yearButton).toHaveAttribute('aria-expanded', 'false');
    });

    test('current date should have aria-current="date"', () => {
        // Set view date to today
        const today = new Date();
        render(<GlassCalendar onSelect={mockOnSelect} selectedDate={today} />);

        const todayButton = screen.getByText(today.getDate().toString(), { selector: 'button span' }).closest('button');

        // The implementation uses a visual dot for "today", but we want semantic indication
        // Note: The current implementation might need adjustment to put aria-current on the button
        // For now, let's see if we can find it by the visual indicator or if we need to add the attribute first
        // We expect this to fail
        expect(todayButton).toHaveAttribute('aria-current', 'date');
    });

    test('date cells should have full date labels', () => {
        render(<GlassCalendar {...defaultProps} />);

        // Should find "15 January 2024" or similar full date format
        // The implementation currently only has the day number text
        // We'll look for a button that has the label

        // We'll construct the expected label for the selected date (Jan 15, 2024)
        // Adjust format as per implementation choice, usually "Day, DD Month YYYY" or "DD Month YYYY"
        // Let's go with a standard readable format
        const expectedLabel = /15 January 2024/i;

        expect(screen.getByLabelText(expectedLabel)).toBeInTheDocument();
    });
});
