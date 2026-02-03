import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GlassCalendar from '../GlassCalendar';

// Mock Lucide icons
jest.mock('lucide-react', () => ({
    ChevronLeft: () => <span data-testid="chevron-left" />,
    ChevronRight: () => <span data-testid="chevron-right" />,
    ChevronDown: () => <span data-testid="chevron-down" />,
}));

describe('GlassCalendar Accessibility', () => {
    const mockOnSelect = jest.fn();
    const today = new Date();

    beforeEach(() => {
        mockOnSelect.mockClear();
    });

    test('renders navigation buttons with proper aria-labels', () => {
        render(<GlassCalendar onSelect={mockOnSelect} />);

        expect(screen.getByLabelText('Previous month')).toBeInTheDocument();
        expect(screen.getByLabelText('Next month')).toBeInTheDocument();
    });

    test('renders dropdown toggles with aria-labels and expanded state', () => {
        render(<GlassCalendar onSelect={mockOnSelect} />);

        const monthButton = screen.getByLabelText('Select month');
        const yearButton = screen.getByLabelText('Select year');

        expect(monthButton).toBeInTheDocument();
        expect(yearButton).toBeInTheDocument();

        expect(monthButton).toHaveAttribute('aria-expanded', 'false');
        expect(yearButton).toHaveAttribute('aria-expanded', 'false');

        // Click to expand
        fireEvent.click(monthButton);
        expect(monthButton).toHaveAttribute('aria-expanded', 'true');
    });

    test('renders day buttons with accessible labels', () => {
        // Fix the date so we know what to expect
        const testDate = new Date(2024, 0, 15); // Jan 15, 2024
        render(<GlassCalendar selectedDate={testDate} onSelect={mockOnSelect} />);

        // Find the button for the 15th
        // Since we don't know the exact locale string format on the test runner,
        // we'll look for something that contains "15" and "2024" or use a flexible matcher if needed.
        // But ideally, toLocaleDateString() is consistent enough for basic checks or we can mock it.
        // Let's check if we can find by label containing "January 15"

        // Note: The implementation should use date.toLocaleDateString() which might vary by locale.
        // For test stability, we might want to just check for existence of SOME label that isn't empty.

        const dayButton = screen.getByText('15').closest('button');
        expect(dayButton).toHaveAttribute('aria-label');
        // We expect the label to be longer than just the number
        expect(dayButton?.getAttribute('aria-label')?.length).toBeGreaterThan(2);
    });

    test('indicates current date with aria-current', () => {
        render(<GlassCalendar onSelect={mockOnSelect} />);

        const day = today.getDate();
        const todayButton = screen.getByText(day.toString()).closest('button');

        expect(todayButton).toHaveAttribute('aria-current', 'date');
    });

    test('indicates selected date with aria-pressed', () => {
        const testDate = new Date(2024, 5, 20); // June 20, 2024
        render(<GlassCalendar selectedDate={testDate} onSelect={mockOnSelect} />);

        // Navigate to June 2024 if needed?
        // Wait, the component initializes viewDate from selectedDate.

        const selectedButton = screen.getByText('20').closest('button');
        expect(selectedButton).toHaveAttribute('aria-pressed', 'true');
    });
});
