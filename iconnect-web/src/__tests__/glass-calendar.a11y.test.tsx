
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import GlassCalendar from '../components/ui/GlassCalendar';

// Mock Lucide icons to avoid rendering issues
jest.mock('lucide-react', () => ({
  ChevronLeft: () => <span data-testid="chevron-left" />,
  ChevronRight: () => <span data-testid="chevron-right" />,
  ChevronDown: () => <span data-testid="chevron-down" />,
}));

describe('GlassCalendar Accessibility', () => {
  const mockOnSelect = jest.fn();
  const testDate = new Date(2024, 0, 15); // January 15, 2024

  test('navigation buttons have aria labels', () => {
    render(<GlassCalendar onSelect={mockOnSelect} selectedDate={testDate} />);

    expect(screen.getByLabelText('Previous Month')).toBeInTheDocument();
    expect(screen.getByLabelText('Next Month')).toBeInTheDocument();
  });

  test('dropdown toggles have aria attributes', () => {
    render(<GlassCalendar onSelect={mockOnSelect} selectedDate={testDate} />);

    const monthButton = screen.getByLabelText(/select month/i);
    expect(monthButton).toHaveAttribute('aria-haspopup', 'true');
    expect(monthButton).toHaveAttribute('aria-expanded', 'false');

    const yearButton = screen.getByLabelText(/select year/i);
    expect(yearButton).toHaveAttribute('aria-haspopup', 'true');
    expect(yearButton).toHaveAttribute('aria-expanded', 'false');
  });

  test('current date has aria-current', () => {
    // We need to match "today". The component uses new Date() internally for "today".
    // So we can't easily mock "today" without mocking Date, but we can check if *some* element has aria-current="date".
    render(<GlassCalendar onSelect={mockOnSelect} />);

    // There should be exactly one element representing today
    const todayElement = screen.getByLabelText(/today/i);
    expect(todayElement).toHaveAttribute('aria-current', 'date');
  });

  test('selected date has aria-selected', () => {
    render(<GlassCalendar onSelect={mockOnSelect} selectedDate={testDate} />);

    // Jan 15, 2024
    const selectedDay = screen.getByRole('button', { name: /15 january 2024, selected/i });
    expect(selectedDay).toHaveAttribute('aria-selected', 'true');
  });
});
