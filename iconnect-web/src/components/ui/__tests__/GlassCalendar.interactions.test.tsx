
import React from 'react';
import { render, screen } from '@testing-library/react';
import GlassCalendar from '../GlassCalendar';
import '@testing-library/jest-dom';

describe('GlassCalendar Accessibility Interactions', () => {
    test('renders navigation buttons with accessible labels', () => {
        render(<GlassCalendar onSelect={() => {}} />);

        // These are expected to fail initially
        expect(screen.getByRole('button', { name: /previous month/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /next month/i })).toBeInTheDocument();
    });

    test('renders dropdown triggers with accessible labels and expanded state', () => {
        const date = new Date(2024, 11, 25); // Dec 25, 2024
        render(<GlassCalendar selectedDate={date} onSelect={() => {}} />);

        // These are expected to fail initially
        expect(screen.getByRole('button', { name: /select month, currently december/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /select year, currently 2024/i })).toBeInTheDocument();

        const monthTrigger = screen.getByRole('button', { name: /select month/i });
        expect(monthTrigger).toHaveAttribute('aria-expanded', 'false');
    });

    test('renders day buttons with accessible date labels', () => {
        const date = new Date(2024, 11, 25); // Dec 25, 2024
        render(<GlassCalendar selectedDate={date} onSelect={() => {}} />);

        // Expected to fail
        expect(screen.getByRole('button', { name: /25 december 2024/i })).toBeInTheDocument();
    });

    test('identifies current date with aria-current', () => {
        render(<GlassCalendar onSelect={() => {}} />);

        // Expected to fail
        const todayButton = screen.getByRole('button', { current: 'date' });
        expect(todayButton).toBeInTheDocument();
    });
});
