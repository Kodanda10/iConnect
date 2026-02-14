import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GlassCalendar from '../GlassCalendar';
import '@testing-library/jest-dom';

describe('GlassCalendar Accessibility', () => {
    const mockOnSelect = jest.fn();
    const defaultDate = new Date(2024, 0, 1); // Jan 1, 2024

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('navigation buttons should have aria-labels', () => {
        render(<GlassCalendar onSelect={mockOnSelect} selectedDate={defaultDate} />);

        expect(screen.getByRole('button', { name: /previous month/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /next month/i })).toBeInTheDocument();
    });

    test('dropdown toggles should have aria-labels and expansion state', () => {
        render(<GlassCalendar onSelect={mockOnSelect} selectedDate={defaultDate} />);

        const monthButton = screen.getByRole('button', { name: /select month/i });
        const yearButton = screen.getByRole('button', { name: /select year/i });

        expect(monthButton).toHaveAttribute('aria-expanded', 'false');
        expect(yearButton).toHaveAttribute('aria-expanded', 'false');

        // Test expansion
        fireEvent.click(monthButton);
        expect(monthButton).toHaveAttribute('aria-expanded', 'true');
    });

    test('day cells should have descriptive aria-labels', () => {
        render(<GlassCalendar onSelect={mockOnSelect} selectedDate={defaultDate} />);

        // Jan 1, 2024 is a Monday and it is selected by defaultDate
        const dayButton = screen.getByRole('button', { name: /Selected: Mon Jan 01 2024/i });
        expect(dayButton).toBeInTheDocument();

        // Check another day (Jan 2) which is not selected
        const day2Button = screen.getByRole('button', { name: /Tue Jan 02 2024/i });
        expect(day2Button).toBeInTheDocument();
    });

    test('current date should have aria-current="date"', () => {
        // Mock system time to match defaultDate (Jan 1, 2024)
        jest.useFakeTimers();
        jest.setSystemTime(defaultDate);

        render(<GlassCalendar onSelect={mockOnSelect} selectedDate={defaultDate} />);

        // Find the button for today (1st)
        // Since we are mocking time, "today" is Jan 1, 2024.
        // We look for the button that represents the 1st.
        // Note: The previous test checked for "Mon Jan 01 2024" label.
        // Here we check that THIS specific button has aria-current="date".

        const todayButton = screen.getByRole('button', { name: /Mon Jan 01 2024/i });
        expect(todayButton).toHaveAttribute('aria-current', 'date');

        jest.useRealTimers();
    });
});
