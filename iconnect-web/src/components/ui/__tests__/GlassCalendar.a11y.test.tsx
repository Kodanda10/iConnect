/**
 * @file components/ui/__tests__/GlassCalendar.a11y.test.tsx
 * @description Accessibility tests for GlassCalendar component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import GlassCalendar from '../GlassCalendar';

describe('GlassCalendar Accessibility', () => {
    test('navigation buttons should have accessible labels', () => {
        render(
            <GlassCalendar
                selectedDate={new Date(2024, 11, 1)}
                onSelect={() => {}}
            />
        );

        // Previous/Next month buttons
        expect(screen.getByLabelText('Previous month')).toBeInTheDocument();
        expect(screen.getByLabelText('Next month')).toBeInTheDocument();
    });

    test('dropdown toggles should have accessible labels', () => {
        render(
            <GlassCalendar
                selectedDate={new Date(2024, 11, 1)}
                onSelect={() => {}}
            />
        );

        // Month/Year dropdowns
        expect(screen.getByLabelText('Select month')).toBeInTheDocument();
        expect(screen.getByLabelText('Select year')).toBeInTheDocument();
    });

    test('day cells should have descriptive labels', () => {
        const testDate = new Date(2024, 11, 25); // Christmas 2024
        render(
            <GlassCalendar
                selectedDate={testDate}
                onSelect={() => {}}
                eventDates={['2024-12-31']}
            />
        );

        // Check for Selected date label
        // Using regex to match date parts regardless of exact order, but expecting "Selected" at the end
        // en-GB format is usually "Wednesday, 25 December 2024"
        const selectedDay = screen.getByRole('button', { name: /25 December 2024.*Selected/i });
        expect(selectedDay).toBeInTheDocument();

        // Check for Event date label
        const eventDay = screen.getByRole('button', { name: /31 December 2024.*Has event/i });
        expect(eventDay).toBeInTheDocument();
    });

    test('current day should be indicated in label', () => {
        const today = new Date();
        render(
            <GlassCalendar
                selectedDate={new Date(today.getFullYear(), today.getMonth() + 1, 1)} // Select next month so today isn't selected
                onSelect={() => {}}
            />
        );

        // Render again with today in view
        render(
            <GlassCalendar
                selectedDate={today}
                onSelect={() => {}}
            />
        );

        // We need to match the dynamic date string for today
        const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const dateString = today.toLocaleDateString('en-GB', options);

        // Expect "Today" to be part of the label
        expect(screen.getAllByRole('button', { name: new RegExp(`${dateString}.*Today`, 'i') })[0]).toBeInTheDocument();
    });
});
