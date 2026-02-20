/**
 * @file GlassCalendar.a11y.test.tsx
 * @description Accessibility tests for GlassCalendar component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import GlassCalendar from '../GlassCalendar';
import '@testing-library/jest-dom';

describe('GlassCalendar Accessibility', () => {
    const mockOnSelect = jest.fn();
    const mockDate = new Date(2024, 0, 15); // January 15, 2024

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('navigation buttons should have accessible names', () => {
        render(
            <GlassCalendar
                selectedDate={mockDate}
                onSelect={mockOnSelect}
            />
        );

        // These should fail initially as they are missing aria-labels
        expect(screen.getByLabelText(/previous month/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/next month/i)).toBeInTheDocument();
    });

    test('dropdown toggles should have accessible names and state', () => {
        render(
            <GlassCalendar
                selectedDate={mockDate}
                onSelect={mockOnSelect}
            />
        );

        // Month dropdown
        const monthToggle = screen.getByLabelText(/select month/i);
        expect(monthToggle).toBeInTheDocument();
        expect(monthToggle).toHaveAttribute('aria-expanded', 'false');

        // Year dropdown
        const yearToggle = screen.getByLabelText(/select year/i);
        expect(yearToggle).toBeInTheDocument();
        expect(yearToggle).toHaveAttribute('aria-expanded', 'false');
    });

    test('day buttons should have full date labels', () => {
        render(
            <GlassCalendar
                selectedDate={mockDate}
                onSelect={mockOnSelect}
            />
        );

        // Should find "15 January 2024" specifically
        // Note: The visible text is just "15", but we want the aria-label to be the full date
        expect(screen.getByLabelText(/15 January 2024/i)).toBeInTheDocument();
    });

    test('current date should have aria-current', () => {
        // Mock today's date
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const day = today.getDate();

        // Render calendar showing current month
        render(
            <GlassCalendar
                selectedDate={today}
                onSelect={mockOnSelect}
            />
        );

        // Construct the expected full date string for today (e.g. "25 October 2023")
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const expectedLabel = `${day} ${monthNames[month]} ${year}`;

        const todayButton = screen.getByLabelText(new RegExp(expectedLabel, 'i'));
        expect(todayButton).toHaveAttribute('aria-current', 'date');
    });
});
