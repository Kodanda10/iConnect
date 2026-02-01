import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import GlassCalendar from '../GlassCalendar';

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  ChevronLeft: () => <svg data-testid="chevron-left" />,
  ChevronRight: () => <svg data-testid="chevron-right" />,
  ChevronDown: () => <svg data-testid="chevron-down" />,
}));

describe('GlassCalendar Accessibility', () => {
  const mockOnSelect = jest.fn();

  beforeAll(() => {
    // Set a fixed date: January 15, 2024
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-15'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  test('navigation buttons should have accessible labels', () => {
    render(<GlassCalendar onSelect={mockOnSelect} />);

    expect(screen.getByRole('button', { name: /previous month/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next month/i })).toBeInTheDocument();
  });

  test('dropdown toggles should have accessible attributes', () => {
    render(<GlassCalendar onSelect={mockOnSelect} />);

    // With fixed date Jan 15 2024, default view is Jan 2024
    const monthToggle = screen.getByRole('button', { name: /select month, current is January/i });

    expect(monthToggle).toHaveAttribute('aria-haspopup', 'listbox');
    expect(monthToggle).toHaveAttribute('aria-expanded', 'false');

    const yearToggle = screen.getByRole('button', { name: /select year, current is 2024/i });
    expect(yearToggle).toHaveAttribute('aria-haspopup', 'listbox');
    expect(yearToggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('day buttons should have accessible full date labels', () => {
    const testDate = new Date(2024, 0, 15); // Jan 15, 2024
    render(<GlassCalendar selectedDate={testDate} onSelect={mockOnSelect} />);

    // Check a non-selected date
    const dayButton = screen.getByRole('button', { name: "14 January 2024" });
    expect(dayButton).toBeInTheDocument();
  });

  test('selected date should have "Selected:" prefix in label', () => {
    const testDate = new Date(2024, 0, 15);
    render(<GlassCalendar selectedDate={testDate} onSelect={mockOnSelect} />);

    const dayButton = screen.getByRole('button', { name: "Selected: 15 January 2024" });
    expect(dayButton).toBeInTheDocument();
  });

  test('today date should have aria-current', () => {
    render(<GlassCalendar onSelect={mockOnSelect} />);

    // With fake timers, today is 15 Jan 2024

    const todayButton = screen.getByRole('button', { name: "15 January 2024" });
    expect(todayButton).toHaveAttribute('aria-current', 'date');
  });
});
