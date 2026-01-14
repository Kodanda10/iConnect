/**
 * @file components/ui/__tests__/GlassCalendar.test.tsx
 * @description Accessibility tests for GlassCalendar component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import GlassCalendar from '../GlassCalendar';

describe('GlassCalendar Accessibility', () => {
    test('navigation buttons have aria-labels', () => {
        render(
            <GlassCalendar
                onSelect={() => { }}
            />
        );

        expect(screen.getByLabelText('Previous month')).toBeInTheDocument();
        expect(screen.getByLabelText('Next month')).toBeInTheDocument();
    });

    test('dropdown toggles have accessibility attributes', () => {
        render(
            <GlassCalendar
                onSelect={() => { }}
            />
        );

        const monthToggle = screen.getByLabelText('Select month');
        const yearToggle = screen.getByLabelText('Select year');

        expect(monthToggle).toBeInTheDocument();
        expect(yearToggle).toBeInTheDocument();

        expect(monthToggle).toHaveAttribute('aria-haspopup', 'listbox');
        expect(yearToggle).toHaveAttribute('aria-haspopup', 'listbox');

        expect(monthToggle).toHaveAttribute('aria-expanded', 'false');
        expect(yearToggle).toHaveAttribute('aria-expanded', 'false');
    });

    test('day buttons have full date aria-labels', () => {
        // Render specifically for Jan 2024 to predict dates easily
        const testDate = new Date(2024, 0, 15); // Jan 15 2024
        render(
            <GlassCalendar
                selectedDate={testDate}
                onSelect={() => { }}
            />
        );

        // Check for Jan 15 2024 label
        // Note: The specific format depends on what we implement, let's assume standard date string for now
        // "Mon Jan 15 2024" or similar. We'll use a regex to be flexible or check exact string if we define it.
        // Let's implement formatted date: "15 January 2024" or similar.
        // For the test, we'll look for the full string including year.

        // We expect at least one button to have a label containing "15" and "2024" and "January" or "Jan"
        const dayButton = screen.getByLabelText(/15.*2024/i);
        expect(dayButton).toBeInTheDocument();
    });

    test('selected date has aria-selected state', () => {
        const testDate = new Date(2024, 0, 15);
        render(
            <GlassCalendar
                selectedDate={testDate}
                onSelect={() => { }}
            />
        );

        const selectedDay = screen.getByLabelText(/15.*2024/i);
        expect(selectedDay).toHaveAttribute('aria-pressed', 'true');
    });
});
