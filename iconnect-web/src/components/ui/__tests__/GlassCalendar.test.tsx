/**
 * @file components/ui/__tests__/GlassCalendar.test.tsx
 * @description Accessibility tests for GlassCalendar
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import GlassCalendar from '../GlassCalendar';

// Mock current date to ensure consistent testing
const MOCK_DATE = new Date(2024, 0, 15); // January 15, 2024

describe('GlassCalendar Accessibility', () => {
    const mockOnSelect = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('navigation buttons have accessible names', () => {
        render(
            <GlassCalendar
                selectedDate={MOCK_DATE}
                onSelect={mockOnSelect}
            />
        );

        // These should exist and be accessible
        expect(screen.getByRole('button', { name: /previous month/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /next month/i })).toBeInTheDocument();
    });

    test('dropdown toggles have accessible attributes', () => {
        render(
            <GlassCalendar
                selectedDate={MOCK_DATE}
                onSelect={mockOnSelect}
            />
        );

        const monthToggle = screen.getByText('Jan').closest('button');
        const yearToggle = screen.getByText('2024').closest('button');

        expect(monthToggle).toHaveAttribute('aria-expanded', 'false');
        expect(yearToggle).toHaveAttribute('aria-expanded', 'false');

        expect(monthToggle).toHaveAttribute('aria-label', expect.stringContaining('month'));
        expect(yearToggle).toHaveAttribute('aria-label', expect.stringContaining('year'));
    });

    test('day buttons have full date labels', () => {
        render(
            <GlassCalendar
                selectedDate={MOCK_DATE}
                onSelect={mockOnSelect}
            />
        );

        // Should find button for "15" but with full label
        const dayButton = screen.getByRole('button', { name: /15 january 2024/i });
        expect(dayButton).toBeInTheDocument();
    });

    test('selected date is indicated via aria-label', () => {
        render(
            <GlassCalendar
                selectedDate={MOCK_DATE}
                onSelect={mockOnSelect}
            />
        );

        const selectedDay = screen.getByRole('button', { name: /15 january 2024.*selected/i });
        expect(selectedDay).toBeInTheDocument();
    });
});
