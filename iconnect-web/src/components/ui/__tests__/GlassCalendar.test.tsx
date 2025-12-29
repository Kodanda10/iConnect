/**
 * @file components/ui/__tests__/GlassCalendar.test.tsx
 * @description Unit tests for GlassCalendar component, focusing on accessibility features
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import GlassCalendar from '../GlassCalendar';

describe('GlassCalendar Component', () => {
    // ============================================
    // Accessibility Tests
    // ============================================
    describe('Accessibility', () => {
        test('month navigation buttons have aria-labels', () => {
            render(
                <GlassCalendar
                    selectedDate={new Date(2024, 0, 1)}
                    onSelect={() => { }}
                />
            );
            expect(screen.getByLabelText('Previous month')).toBeInTheDocument();
            expect(screen.getByLabelText('Next month')).toBeInTheDocument();
        });

        test('month dropdown toggle has aria attributes', () => {
            render(
                <GlassCalendar
                    selectedDate={new Date(2024, 0, 1)}
                    onSelect={() => { }}
                />
            );
            const monthToggle = screen.getByLabelText('Select month, current month is January');
            expect(monthToggle).toBeInTheDocument();
            expect(monthToggle).toHaveAttribute('aria-haspopup', 'listbox');
            expect(monthToggle).toHaveAttribute('aria-expanded', 'false');
        });

        test('year dropdown toggle has aria attributes', () => {
            render(
                <GlassCalendar
                    selectedDate={new Date(2024, 0, 1)}
                    onSelect={() => { }}
                />
            );
            const yearToggle = screen.getByLabelText('Select year, current year is 2024');
            expect(yearToggle).toBeInTheDocument();
            expect(yearToggle).toHaveAttribute('aria-haspopup', 'listbox');
            expect(yearToggle).toHaveAttribute('aria-expanded', 'false');
        });

        test('day buttons have descriptive aria-labels', () => {
            render(
                <GlassCalendar
                    selectedDate={new Date(2024, 0, 1)} // Jan 1 2024
                    onSelect={() => { }}
                />
            );
            // Check for Jan 15 2024
            const expectedDate = new Date(2024, 0, 15);
            const label = expectedDate.toLocaleDateString(undefined, { dateStyle: 'full' });
            expect(screen.getByLabelText(label)).toBeInTheDocument();
        });

        test('today indicator has aria-current', () => {
            // Mock today to be Jan 15 2024
            const mockDate = new Date(2024, 0, 15);
            jest.useFakeTimers().setSystemTime(mockDate);

            render(
                <GlassCalendar
                    selectedDate={new Date(2024, 0, 1)}
                    onSelect={() => { }}
                />
            );

            const todayButton = screen.getByLabelText(mockDate.toLocaleDateString(undefined, { dateStyle: 'full' }));
            expect(todayButton).toHaveAttribute('aria-current', 'date');

            jest.useRealTimers();
        });

        test('selected date has aria-checked', () => {
            const selectedDate = new Date(2024, 0, 20);
            render(
                <GlassCalendar
                    selectedDate={selectedDate}
                    onSelect={() => { }}
                />
            );

            const selectedButton = screen.getByLabelText(selectedDate.toLocaleDateString(undefined, { dateStyle: 'full' }));
            expect(selectedButton).toHaveAttribute('aria-checked', 'true');
        });

        test('event indicator adds info to aria-label', () => {
            const eventDate = new Date(2024, 0, 15);
            const eventDateStr = eventDate.toISOString().split('T')[0];

            render(
                <GlassCalendar
                    selectedDate={new Date(2024, 0, 1)}
                    onSelect={() => { }}
                    eventDates={[eventDateStr]}
                />
            );

            const label = `${eventDate.toLocaleDateString(undefined, { dateStyle: 'full' })}, has events`;
            expect(screen.getByLabelText(label)).toBeInTheDocument();
        });
    });
});
