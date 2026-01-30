/**
 * @file __tests__/GlassCalendar.a11y.test.tsx
 * @description Accessibility tests for GlassCalendar component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import GlassCalendar from '../GlassCalendar';

// Mock Lucide icons to avoid render issues if any
jest.mock('lucide-react', () => ({
    ChevronLeft: () => <span data-testid="chevron-left">Left</span>,
    ChevronRight: () => <span data-testid="chevron-right">Right</span>,
    ChevronDown: () => <span data-testid="chevron-down">Down</span>,
}));

describe('GlassCalendar Accessibility', () => {
    test('should have accessible labels for navigation buttons', () => {
        render(<GlassCalendar onSelect={() => {}} />);

        // These should fail initially
        expect(screen.getByLabelText(/previous month/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/next month/i)).toBeInTheDocument();
    });

    test('should have accessible labels for dropdown toggles', () => {
        render(<GlassCalendar onSelect={() => {}} />);

        // These should fail initially
        expect(screen.getByLabelText(/select month/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/select year/i)).toBeInTheDocument();

        // Check for aria-haspopup
        const monthBtn = screen.getByLabelText(/select month/i);
        expect(monthBtn).toHaveAttribute('aria-haspopup', 'listbox');
    });

    test('day buttons should have full date labels', () => {
        // Set a fixed date to test labels predictably: Jan 15, 2024
        const testDate = new Date(2024, 0, 15);
        render(<GlassCalendar selectedDate={testDate} onSelect={() => {}} />);

        // Should find "Monday, January 1, 2024" or similar depending on locale
        // We'll use a regex to be flexible but ensure day, month, year are present
        const dayButton = screen.getByLabelText(/January 1, 2024/i);
        expect(dayButton).toBeInTheDocument();
    });

    test('current day should be marked with aria-current', () => {
        // Mock system time to controlled date
        const mockDate = new Date(2024, 5, 15); // June 15, 2024
        jest.useFakeTimers();
        jest.setSystemTime(mockDate);

        render(<GlassCalendar selectedDate={mockDate} onSelect={() => {}} />);

        // The button for the 15th (today)
        const todayButton = screen.getByLabelText(/June 15, 2024/i);
        expect(todayButton).toHaveAttribute('aria-current', 'date');

        jest.useRealTimers();
    });

    test('selected day should be marked with aria-pressed', () => {
         const selectedDate = new Date(2024, 5, 20); // June 20, 2024
         render(<GlassCalendar selectedDate={selectedDate} onSelect={() => {}} />);

         const selectedButton = screen.getByLabelText(/June 20, 2024/i);
         // Using aria-pressed for toggle buttons, or aria-selected if it was a gridcell role.
         // Since they are buttons, aria-pressed is acceptable, or just checking class is not enough for a11y.
         // Let's stick to aria-pressed or aria-selected=true if role=gridcell (but it's a button).
         // Actually, for a date picker, aria-selected="true" is common if role="gridcell".
         // But here they are simple buttons. Let's assume we add aria-pressed for now as per plan.
         expect(selectedButton).toHaveAttribute('aria-pressed', 'true');
    });
});
