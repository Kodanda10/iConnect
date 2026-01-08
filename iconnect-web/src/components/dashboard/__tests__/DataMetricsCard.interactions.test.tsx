import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import DataMetricsCard from '../DataMetricsCard';
import * as metricsService from '@/lib/services/metrics';

// Mock the metrics service
jest.mock('@/lib/services/metrics', () => ({
  fetchConstituentMetrics: jest.fn(),
  fetchGPMetricsForBlock: jest.fn(),
}));

describe('DataMetricsCard Interactions', () => {
  const mockMetrics = {
    total: 1000,
    blocks: [
      { name: 'Block A', count: 600 },
      { name: 'Block B', count: 400 },
    ],
  };

  const mockGPData = [
    { name: 'GP 1', count: 300 },
    { name: 'GP 2', count: 300 },
  ];

  beforeEach(() => {
    (metricsService.fetchConstituentMetrics as jest.Mock).mockResolvedValue(mockMetrics);
    (metricsService.fetchGPMetricsForBlock as jest.Mock).mockResolvedValue(mockGPData);
  });

  it('reveals GP details on keyboard focus', async () => {
    // We need to wrap the render in act because of the initial useEffect
    await act(async () => {
      render(<DataMetricsCard />);
    });

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Total Constituents')).toBeInTheDocument();
    });

    // Find the block item - assuming we will add role="button" or it's identifiable
    // We changed div to button and added aria-label
    // Use getByTestId first to be precise
    const blockA = screen.getByTestId('block-Block A');

    expect(blockA.tagName).toBe('BUTTON');

    if (blockA) {
        // Fire focus event
        fireEvent.focus(blockA);

        // Check if "Block A Breakdown" appears
        await waitFor(() => {
            expect(screen.getByText('Block A Breakdown')).toBeInTheDocument();
        });

        // Fire blur event
        fireEvent.blur(blockA);

        // Should revert to Total View
        await waitFor(() => {
            expect(screen.getByText('Total Constituents')).toBeInTheDocument();
        });
    }
  });
});
