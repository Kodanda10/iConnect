import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GlassCalendar from '../GlassCalendar';

describe('GlassCalendar Accessibility', () => {
    const mockOnSelect = jest.fn();
    const defaultDate = new Date(2024, 11, 15); // December 15, 2024

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders navigation buttons with accessible labels', () => {
        render(<GlassCalendar selectedDate={defaultDate} onSelect={mockOnSelect} />);

        expect(screen.getByLabelText('Previous month')).toBeInTheDocument();
        expect(screen.getByLabelText('Next month')).toBeInTheDocument();
    });

    test('renders dropdown toggles with accessible labels and expanded state', () => {
        render(<GlassCalendar selectedDate={defaultDate} onSelect={mockOnSelect} />);

        const monthDropdown = screen.getByLabelText('Select month');
        const yearDropdown = screen.getByLabelText('Select year');

        expect(monthDropdown).toBeInTheDocument();
        expect(yearDropdown).toBeInTheDocument();

        expect(monthDropdown).toHaveAttribute('aria-expanded', 'false');
        fireEvent.click(monthDropdown);
        expect(monthDropdown).toHaveAttribute('aria-expanded', 'true');
    });

    test('renders calendar days with accessible labels', () => {
        render(<GlassCalendar selectedDate={defaultDate} onSelect={mockOnSelect} />);

        // Use the same formatting as the component
        const expectedLabel = defaultDate.toLocaleDateString('default', { day: 'numeric', month: 'long', year: 'numeric' });

        // Should find button for the 15th
        // Note: The component appends ", selected" to the label
        // We verify the label contains "selected" instead of checking aria-selected
        // because aria-selected is not valid on role="button" without a grid/listbox context
        const selectedDay = screen.getByRole('button', { name: new RegExp(expectedLabel, 'i') });
        expect(selectedDay).toBeInTheDocument();
        expect(selectedDay).toHaveAttribute('aria-label');
        expect(selectedDay.getAttribute('aria-label')).toMatch(/selected/i);
    });

    test('marks today with aria-current', () => {
        const today = new Date();
        render(<GlassCalendar selectedDate={today} onSelect={mockOnSelect} />);

        const expectedLabel = today.toLocaleDateString('default', { day: 'numeric', month: 'long', year: 'numeric' });

        const todayButton = screen.getByRole('button', { name: new RegExp(expectedLabel, 'i') });
        expect(todayButton).toHaveAttribute('aria-current', 'date');
    });
});
