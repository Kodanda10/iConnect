
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GlassCalendar from '../GlassCalendar';
import '@testing-library/jest-dom';

describe('GlassCalendar Accessibility', () => {
    const mockOnSelect = jest.fn();
    const defaultProps = {
        onSelect: mockOnSelect,
        selectedDate: new Date('2024-01-15'),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders navigation buttons with aria-labels', () => {
        render(<GlassCalendar {...defaultProps} />);

        const prevButton = screen.getByRole('button', { name: /previous month/i });
        const nextButton = screen.getByRole('button', { name: /next month/i });

        expect(prevButton).toBeInTheDocument();
        expect(nextButton).toBeInTheDocument();
    });

    it('renders month and year dropdowns with accessible attributes', () => {
        render(<GlassCalendar {...defaultProps} />);

        // Month dropdown
        const monthDropdown = screen.getByLabelText(/select month/i);
        expect(monthDropdown).toHaveAttribute('aria-haspopup', 'listbox');
        expect(monthDropdown).toHaveAttribute('aria-expanded', 'false');

        // Year dropdown
        const yearDropdown = screen.getByLabelText(/select year/i);
        expect(yearDropdown).toHaveAttribute('aria-haspopup', 'listbox');
        expect(yearDropdown).toHaveAttribute('aria-expanded', 'false');
    });

    it('toggles aria-expanded when dropdowns are opened', () => {
        render(<GlassCalendar {...defaultProps} />);

        const monthDropdown = screen.getByLabelText(/select month/i);

        fireEvent.click(monthDropdown);
        expect(monthDropdown).toHaveAttribute('aria-expanded', 'true');

        fireEvent.click(monthDropdown);
        expect(monthDropdown).toHaveAttribute('aria-expanded', 'false');
    });

    it('renders calendar grid days with descriptive aria-labels', () => {
        render(<GlassCalendar {...defaultProps} />);

        // Should find a button for the 15th
        const dayButton = screen.getByRole('button', { name: /15 January 2024/i });
        expect(dayButton).toBeInTheDocument();
    });

    it('indicates the selected date via aria-label', () => {
        render(<GlassCalendar {...defaultProps} />);

        // The accessible name should now include ", selected"
        const selectedDay = screen.getByRole('button', { name: /15 January 2024, selected/i });
        expect(selectedDay).toBeInTheDocument();
    });

    it('indicates today with aria-current', () => {
        // Mock today as 2024-01-10
        jest.useFakeTimers().setSystemTime(new Date('2024-01-10'));

        render(<GlassCalendar {...defaultProps} />);

        const todayButton = screen.getByRole('button', { name: /10 January 2024/i });
        expect(todayButton).toHaveAttribute('aria-current', 'date');

        jest.useRealTimers();
    });
});
