
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GlassCalendar from '../GlassCalendar';

// Mock Lucide icons
jest.mock('lucide-react', () => ({
    ChevronLeft: () => <span data-testid="chevron-left" />,
    ChevronRight: () => <span data-testid="chevron-right" />,
    ChevronDown: () => <span data-testid="chevron-down" />,
}));

describe('GlassCalendar Accessibility', () => {
    const defaultProps = {
        onSelect: jest.fn(),
    };

    test('renders navigation buttons with aria-labels', () => {
        render(<GlassCalendar {...defaultProps} />);

        expect(screen.getByLabelText('Previous month')).toBeInTheDocument();
        expect(screen.getByLabelText('Next month')).toBeInTheDocument();
    });

    test('renders dropdown toggles with correct aria attributes', () => {
        render(<GlassCalendar {...defaultProps} />);

        const monthToggle = screen.getByLabelText(/Select month/);
        const yearToggle = screen.getByLabelText(/Select year/);

        expect(monthToggle).toHaveAttribute('aria-haspopup', 'listbox');
        expect(monthToggle).toHaveAttribute('aria-expanded', 'false');

        expect(yearToggle).toHaveAttribute('aria-haspopup', 'listbox');
        expect(yearToggle).toHaveAttribute('aria-expanded', 'false');
    });

    test('updates aria-expanded when dropdowns are opened', async () => {
        render(<GlassCalendar {...defaultProps} />);

        const monthToggle = screen.getByLabelText(/Select month/);

        await userEvent.click(monthToggle);
        expect(monthToggle).toHaveAttribute('aria-expanded', 'true');

        await userEvent.click(monthToggle);
        expect(monthToggle).toHaveAttribute('aria-expanded', 'false');
    });

    test('day buttons have detailed aria-labels', () => {
        const testDate = new Date('2024-01-15T12:00:00');
        render(<GlassCalendar {...defaultProps} selectedDate={testDate} />);

        // Check for specific date format in aria-label
        // Note: The format might vary slightly depending on locale, so we'll look for key parts or exact string if we hardcode en-US
        const selectedDay = screen.getByLabelText(/15 January 2024/);
        expect(selectedDay).toBeInTheDocument();
    });

    test('selected day indicates selection in aria-label', () => {
        const testDate = new Date('2024-01-15T12:00:00');
        render(<GlassCalendar {...defaultProps} selectedDate={testDate} />);

        const selectedDay = screen.getByLabelText(/15 January 2024, selected/);
        expect(selectedDay).toBeInTheDocument();
    });

    test('current day has aria-current=date', () => {
        // Mock system time or use current date logic
        const today = new Date();
        render(<GlassCalendar {...defaultProps} />);

        const day = today.getDate();
        // We'll need to construct the expected label roughly, or just find by button text and check attr
        // But finding by text '15' is ambiguous if multiple months show.
        // Assuming the calendar shows current month by default.

        const dayButtons = screen.getAllByRole('button');
        const todayButton = dayButtons.find(btn => btn.textContent === String(day) && btn.getAttribute('aria-current') === 'date');

        expect(todayButton).toBeInTheDocument();
    });
});
