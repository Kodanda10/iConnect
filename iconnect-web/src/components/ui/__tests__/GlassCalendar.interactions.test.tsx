
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import GlassCalendar from '../GlassCalendar';

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  ChevronLeft: () => <span data-testid="chevron-left" />,
  ChevronRight: () => <span data-testid="chevron-right" />,
  ChevronDown: () => <span data-testid="chevron-down" />,
}));

describe('GlassCalendar Accessibility Interactions', () => {
  const mockOnSelect = jest.fn();
  const today = new Date(2024, 11, 15); // Dec 15, 2024
  const selectedDate = new Date(2024, 11, 20); // Dec 20, 2024

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(today);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  test('navigation buttons should have accessible labels', () => {
    render(<GlassCalendar onSelect={mockOnSelect} />);

    expect(screen.getByRole('button', { name: /previous month/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next month/i })).toBeInTheDocument();
  });

  test('dropdown toggles should have aria-expanded state', () => {
    render(<GlassCalendar onSelect={mockOnSelect} />);

    // Month dropdown
    const monthToggle = screen.getByText('Dec').closest('button');
    expect(monthToggle).toHaveAttribute('aria-haspopup', 'listbox');
    expect(monthToggle).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(monthToggle!);
    expect(monthToggle).toHaveAttribute('aria-expanded', 'true');

    // Year dropdown
    const yearToggle = screen.getByText('2024').closest('button');
    expect(yearToggle).toHaveAttribute('aria-haspopup', 'listbox');
    expect(yearToggle).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(yearToggle!);
    expect(yearToggle).toHaveAttribute('aria-expanded', 'true');
  });

  test('day buttons should have descriptive accessible labels', () => {
    render(<GlassCalendar onSelect={mockOnSelect} selectedDate={selectedDate} />);

    // Should find a button that describes the full date, not just the number
    // "15" is today, "20" is selected

    // We expect the label to be something like "December 15, 2024" or "Sunday, December 15, 2024"
    // Use comma to ensure we are matching the day and not the year prefix (e.g. 2024 starts with 20)
    const dayButton = screen.getByRole('button', { name: /December 15,/i });
    expect(dayButton).toBeInTheDocument();
  });

  test('current day should be marked with aria-current', () => {
    render(<GlassCalendar onSelect={mockOnSelect} />);

    const todayButton = screen.getByRole('button', { name: /December 15,/i });
    expect(todayButton).toHaveAttribute('aria-current', 'date');
  });

  test('selected day should be marked with aria-pressed', () => {
    render(<GlassCalendar onSelect={mockOnSelect} selectedDate={selectedDate} />);

    const selectedButton = screen.getByRole('button', { name: /December 20,/i });
    expect(selectedButton).toHaveAttribute('aria-pressed', 'true');

    // Other buttons shouldn't have it or be false
    const otherButton = screen.getByRole('button', { name: /December 15,/i });
    expect(otherButton).not.toHaveAttribute('aria-pressed', 'true');
  });
});
