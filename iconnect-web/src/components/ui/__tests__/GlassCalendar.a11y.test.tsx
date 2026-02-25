/**
 * @file components/ui/__tests__/GlassCalendar.a11y.test.tsx
 * @description Accessibility tests for GlassCalendar component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GlassCalendar from '../GlassCalendar';

// Mock Lucide icons
jest.mock('lucide-react', () => ({
    ChevronLeft: () => <svg data-testid="chevron-left" />,
    ChevronRight: () => <svg data-testid="chevron-right" />,
    ChevronDown: () => <svg data-testid="chevron-down" />,
}));

describe('GlassCalendar Accessibility', () => {
    const mockOnSelect = jest.fn();
    const today = new Date();

    // Helper to get today's day number as displayed in calendar
    const todayDay = today.getDate().toString();

    test('navigation buttons have aria-labels', () => {
        render(<GlassCalendar onSelect={mockOnSelect} />);

        // These should exist and be labeled
        expect(screen.getByLabelText('Previous month')).toBeInTheDocument();
        expect(screen.getByLabelText('Next month')).toBeInTheDocument();
    });

    test('dropdown toggles have aria-expanded', () => {
        render(<GlassCalendar onSelect={mockOnSelect} />);

        // Find month toggle by text (e.g., "Dec")
        const monthToggle = screen.getByText(/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/);
        const monthButton = monthToggle.closest('button');

        expect(monthButton).toHaveAttribute('aria-haspopup', 'listbox');
        expect(monthButton).toHaveAttribute('aria-expanded', 'false');

        fireEvent.click(monthButton!);
        expect(monthButton).toHaveAttribute('aria-expanded', 'true');

        // Find year toggle by text (current year)
        const yearToggle = screen.getByText(today.getFullYear().toString());
        const yearButton = yearToggle.closest('button');

        expect(yearButton).toHaveAttribute('aria-haspopup', 'listbox');
        expect(yearButton).toHaveAttribute('aria-expanded', 'false');

        fireEvent.click(yearButton!);
        expect(yearButton).toHaveAttribute('aria-expanded', 'true');
    });

    test('current day has aria-current="date"', () => {
        render(<GlassCalendar onSelect={mockOnSelect} />);

        // Find the button containing the day number
        // Note: The number is inside a span, so we look for the button containing it
        const daySpan = screen.getAllByText(todayDay).find(el => el.tagName === 'SPAN' && el.parentElement?.tagName === 'BUTTON');
        const dayButton = daySpan?.parentElement;

        expect(dayButton).toHaveAttribute('aria-current', 'date');
    });

    test('selected day has "selected" in aria-label', () => {
        // Render with today selected
        render(<GlassCalendar onSelect={mockOnSelect} selectedDate={today} />);

        const daySpan = screen.getAllByText(todayDay).find(el => el.tagName === 'SPAN' && el.parentElement?.tagName === 'BUTTON');
        const dayButton = daySpan?.parentElement;

        // Instead of aria-selected (not valid on button), we check the label
        expect(dayButton).toHaveAttribute('aria-label');
        expect(dayButton?.getAttribute('aria-label')).toMatch(/selected$/);
    });

    test('day buttons have full date aria-labels', () => {
        render(<GlassCalendar onSelect={mockOnSelect} selectedDate={today} />);

        const daySpan = screen.getAllByText(todayDay).find(el => el.tagName === 'SPAN' && el.parentElement?.tagName === 'BUTTON');
        const dayButton = daySpan?.parentElement;

        // Expect format like "Sunday, 15 December 2024" or similar full date string
        // Checking for presence of aria-label and that it contains the year
        expect(dayButton).toHaveAttribute('aria-label');
        expect(dayButton?.getAttribute('aria-label')).toContain(today.getFullYear().toString());
    });
});
