
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GlassCalendar from '../components/ui/GlassCalendar';

// Mock Lucide icons as they are not JSDOM compatible
jest.mock('lucide-react', () => ({
    ChevronLeft: () => <span data-testid="chevron-left">Left</span>,
    ChevronRight: () => <span data-testid="chevron-right">Right</span>,
    ChevronDown: () => <span data-testid="chevron-down">Down</span>,
}));

describe('GlassCalendar Accessibility', () => {
    const mockOnSelect = jest.fn();
    const defaultDate = new Date(2024, 0, 15); // Jan 15, 2024

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('navigation buttons should have accessible labels', () => {
        render(
            <GlassCalendar
                selectedDate={defaultDate}
                onSelect={mockOnSelect}
            />
        );

        const prevButton = screen.getByRole('button', { name: /previous month/i });
        const nextButton = screen.getByRole('button', { name: /next month/i });

        expect(prevButton).toBeInTheDocument();
        expect(nextButton).toBeInTheDocument();
    });

    test('dropdown triggers should have aria attributes', () => {
        render(
            <GlassCalendar
                selectedDate={defaultDate}
                onSelect={mockOnSelect}
            />
        );

        const monthButton = screen.getByRole('button', { name: /select month/i });
        const yearButton = screen.getByRole('button', { name: /select year/i });

        expect(monthButton).toHaveAttribute('aria-haspopup', 'true');
        expect(yearButton).toHaveAttribute('aria-haspopup', 'true');

        expect(monthButton).toHaveAttribute('aria-expanded', 'false');

        // Open dropdown
        fireEvent.click(monthButton);
        expect(monthButton).toHaveAttribute('aria-expanded', 'true');
    });

    test('selected date should have aria-current="date" or aria-selected="true"', () => {
        render(
            <GlassCalendar
                selectedDate={defaultDate}
                onSelect={mockOnSelect}
            />
        );

        // Find button for 15th
        // Since we don't have unique accessible names yet, we might need to look by text
        // But better to check for aria-label once implemented
        const dayButton = screen.getByRole('button', { name: /15 january 2024, selected/i });

        expect(dayButton).toBeInTheDocument();
    });
});
