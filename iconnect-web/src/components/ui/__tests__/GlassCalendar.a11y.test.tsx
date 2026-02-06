import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GlassCalendar from '../GlassCalendar';

// Mock current date to 2024-12-15
const MOCK_DATE = new Date(2024, 11, 15); // Dec 15 2024

describe('GlassCalendar Accessibility', () => {
    beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(MOCK_DATE);
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    const defaultProps = {
        selectedDate: MOCK_DATE,
        onSelect: jest.fn(),
    };

    test('navigation buttons should have accessible labels', () => {
        render(<GlassCalendar {...defaultProps} />);

        expect(screen.getByLabelText('Previous month')).toBeInTheDocument();
        expect(screen.getByLabelText('Next month')).toBeInTheDocument();
    });

    test('dropdown toggles should have accessible labels and states', () => {
        render(<GlassCalendar {...defaultProps} />);

        const monthToggle = screen.getByLabelText('Select month');
        const yearToggle = screen.getByLabelText('Select year');

        expect(monthToggle).toBeInTheDocument();
        expect(yearToggle).toBeInTheDocument();

        expect(monthToggle).toHaveAttribute('aria-expanded', 'false');
        fireEvent.click(monthToggle);
        expect(monthToggle).toHaveAttribute('aria-expanded', 'true');
    });

    test('current date should be programmatically indicated', () => {
        render(<GlassCalendar {...defaultProps} />);

        // Today is Dec 15th
        // aria-current="date" identifies the current date
        const todayButton = screen.getByRole('button', { name: /15, December 2024/i });
        expect(todayButton).toHaveAttribute('aria-current', 'date');
    });

    test('selected date should be programmatically indicated', () => {
        const selectedDate = new Date(2024, 11, 20); // Dec 20
        render(<GlassCalendar {...defaultProps} selectedDate={selectedDate} />);

        // Selected date should have ", selected" in its accessible name
        const selectedButton = screen.getByRole('button', { name: /20, December 2024, selected/i });
        expect(selectedButton).toBeInTheDocument();
    });
});
