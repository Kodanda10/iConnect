
import React from 'react';
import { render, screen } from '@testing-library/react';
import GlassCalendar from '../GlassCalendar';

describe('GlassCalendar Accessibility', () => {
  const mockSelect = jest.fn();
  const today = new Date('2024-01-15'); // Fixed date for testing

  it('renders navigation buttons with aria labels', () => {
    render(<GlassCalendar selectedDate={today} onSelect={mockSelect} />);

    expect(screen.getByRole('button', { name: /previous month/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next month/i })).toBeInTheDocument();
  });

  it('renders day buttons with full date aria labels', () => {
    render(<GlassCalendar selectedDate={today} onSelect={mockSelect} />);

    // Check for a specific date, e.g., Jan 15th
    const dayButton = screen.getByRole('button', { name: /15.*January.*2024/i });
    expect(dayButton).toBeInTheDocument();
  });

  it('indicates selected date via aria attribute', () => {
    render(<GlassCalendar selectedDate={today} onSelect={mockSelect} />);

    const selectedDay = screen.getByRole('button', { name: /15.*January.*2024/i });
    // Use aria-pressed or aria-selected depending on implementation preference for grid vs toolbar
    // Common pattern for calendars is grid/gridcell, but this is a simple list of buttons currently.
    // Let's check for a selected state indication.
    expect(selectedDay).toHaveAttribute('aria-selected', 'true');
  });
});
