
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GlassCalendar from '../GlassCalendar';

// Mock Lucide icons to avoid issues with SVG rendering in tests
jest.mock('lucide-react', () => ({
    ChevronLeft: () => <span data-testid="chevron-left">Left</span>,
    ChevronRight: () => <span data-testid="chevron-right">Right</span>,
    ChevronDown: () => <span data-testid="chevron-down">Down</span>,
}));

describe('GlassCalendar Accessibility', () => {
    const defaultProps = {
        onSelect: jest.fn(),
        selectedDate: new Date('2024-12-16T12:00:00'), // Use noon to avoid timezone issues
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('navigation buttons have accessible labels', () => {
        render(<GlassCalendar {...defaultProps} />);

        // Should find "Previous month" and "Next month" buttons
        expect(screen.getByLabelText(/previous month/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/next month/i)).toBeInTheDocument();
    });

    test('month and year dropdown toggles have accessible labels and expanded state', () => {
        render(<GlassCalendar {...defaultProps} />);

        // Month dropdown
        const monthButton = screen.getByLabelText(/select month/i);
        expect(monthButton).toBeInTheDocument();
        expect(monthButton).toHaveAttribute('aria-expanded', 'false');

        // Year dropdown
        const yearButton = screen.getByLabelText(/select year/i);
        expect(yearButton).toBeInTheDocument();
        expect(yearButton).toHaveAttribute('aria-expanded', 'false');
    });

    test('dropdown toggles update aria-expanded on click', async () => {
        const user = userEvent.setup();
        render(<GlassCalendar {...defaultProps} />);

        const monthButton = screen.getByLabelText(/select month/i);

        await user.click(monthButton);
        expect(monthButton).toHaveAttribute('aria-expanded', 'true');

        await user.click(monthButton);
        expect(monthButton).toHaveAttribute('aria-expanded', 'false');
    });

    test('current day has aria-current="date"', () => {
        // Mock system time to match our selected date for this test
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2024-12-16T12:00:00'));

        render(<GlassCalendar {...defaultProps} />);

        // The day "16" should be the current day
        const dayButton = screen.getByText('16').closest('button');
        expect(dayButton).toHaveAttribute('aria-current', 'date');

        jest.useRealTimers();
    });

    test('day names use abbreviations with full titles', () => {
        render(<GlassCalendar {...defaultProps} />);

        // Check for Sunday
        const sundayAbbr = screen.getByText('Su');
        expect(sundayAbbr.tagName).toBe('ABBR');
        expect(sundayAbbr).toHaveAttribute('title', 'Sunday');
    });

    test('day buttons have full date labels', () => {
        render(<GlassCalendar {...defaultProps} />);

        // Day 16 should have a label like "16 December 2024" or similar
        // We'll look for the button that contains "16" and check its label
        const dayButton = screen.getByText('16').closest('button');

        // The format might depend on locale, but checking for presence of month and year is good enough
        expect(dayButton).toHaveAttribute('aria-label');
        expect(dayButton?.getAttribute('aria-label')).toMatch(/16 December 2024|16 Dec 2024/i);
    });
});
