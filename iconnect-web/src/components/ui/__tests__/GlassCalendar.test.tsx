
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GlassCalendar from '../GlassCalendar';
import '@testing-library/jest-dom';

describe('GlassCalendar Accessibility', () => {
    const mockOnSelect = jest.fn();
    const testDate = new Date(2024, 0, 15); // January 15, 2024

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('navigation buttons should have accessible labels', () => {
        render(<GlassCalendar selectedDate={testDate} onSelect={mockOnSelect} />);

        expect(screen.getByRole('button', { name: /previous month/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /next month/i })).toBeInTheDocument();
    });

    test('day buttons should have full date labels', () => {
        render(<GlassCalendar selectedDate={testDate} onSelect={mockOnSelect} />);

        // Check for "15 January 2024"
        const dayButton = screen.getByRole('button', { name: /15 January 2024/i });
        expect(dayButton).toBeInTheDocument();
    });

    test('dropdown toggles should have aria attributes', () => {
        render(<GlassCalendar selectedDate={testDate} onSelect={mockOnSelect} />);

        const monthDropdown = screen.getByText('Jan').closest('button');
        const yearDropdown = screen.getByText('2024').closest('button');

        expect(monthDropdown).toHaveAttribute('aria-haspopup', 'true');
        expect(monthDropdown).toHaveAttribute('aria-expanded', 'false');

        expect(yearDropdown).toHaveAttribute('aria-haspopup', 'true');
        expect(yearDropdown).toHaveAttribute('aria-expanded', 'false');

        // Test expanded state
        if (monthDropdown) fireEvent.click(monthDropdown);
        expect(monthDropdown).toHaveAttribute('aria-expanded', 'true');
    });

    test('selected date should be indicated', () => {
        render(<GlassCalendar selectedDate={testDate} onSelect={mockOnSelect} />);

        const selectedDay = screen.getByRole('button', { name: /15 January 2024/i });
        expect(selectedDay).toHaveAttribute('aria-current', 'date');
    });
});
