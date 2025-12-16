/**
 * @file __tests__/DataMetricsCard.test.tsx
 * @description TDD RED PHASE - Failing tests for DataMetricsCard component
 * @changelog
 * - 2025-12-17: Initial TDD tests for Data Metrics Dashboard component
 */

// Mock Firebase modules FIRST
jest.mock('@/lib/firebase', () => ({
    getFirebaseDb: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
    collection: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    getDocs: jest.fn(),
    getCountFromServer: jest.fn(),
}));

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DataMetricsCard from '@/components/dashboard/DataMetricsCard';
import * as metricsService from '@/lib/services/metrics';

// Mock the metrics service
jest.mock('@/lib/services/metrics');

const mockMetrics: metricsService.ConstituentMetrics = {
    total: 800,
    blocks: [
        {
            name: 'Block A',
            count: 500,
            gps: [
                { name: 'GP1', count: 200 },
                { name: 'GP2', count: 300 },
            ]
        },
        { name: 'Block B', count: 300, gps: [] },
    ],
};

describe('DataMetricsCard Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders total constituent count prominently', async () => {
        // Arrange
        (metricsService.fetchConstituentMetrics as jest.Mock).mockResolvedValue(mockMetrics);

        // Act
        render(<DataMetricsCard />);

        // Assert
        await waitFor(() => {
            expect(screen.getByTestId('total-count')).toHaveTextContent('800');
        });
    });

    it('displays block-wise breakdown', async () => {
        // Arrange
        (metricsService.fetchConstituentMetrics as jest.Mock).mockResolvedValue(mockMetrics);

        // Act
        render(<DataMetricsCard />);

        // Assert
        await waitFor(() => {
            expect(screen.getByText('Block A')).toBeInTheDocument();
            expect(screen.getByText('500')).toBeInTheDocument();
            expect(screen.getByText('Block B')).toBeInTheDocument();
            expect(screen.getByText('300')).toBeInTheDocument();
        });
    });

    it('shows GP breakdown on block hover', async () => {
        // Arrange
        (metricsService.fetchConstituentMetrics as jest.Mock).mockResolvedValue(mockMetrics);

        // Act
        render(<DataMetricsCard />);

        await waitFor(() => screen.getByText('Block A'));

        // Hover over Block A
        fireEvent.mouseEnter(screen.getByTestId('block-Block A'));

        // Assert - GP details should appear
        await waitFor(() => {
            expect(screen.getByText('GP1')).toBeInTheDocument();
            expect(screen.getByText('GP2')).toBeInTheDocument();
        });
    });

    it('hides GP breakdown on mouse leave', async () => {
        // Arrange
        (metricsService.fetchConstituentMetrics as jest.Mock).mockResolvedValue(mockMetrics);

        // Act
        render(<DataMetricsCard />);

        await waitFor(() => screen.getByText('Block A'));

        // Hover then leave
        fireEvent.mouseEnter(screen.getByTestId('block-Block A'));
        await waitFor(() => screen.getByText('GP1'));

        fireEvent.mouseLeave(screen.getByTestId('block-Block A'));

        // Assert - GP details should hide
        await waitFor(() => {
            expect(screen.queryByText('GP1')).not.toBeInTheDocument();
        });
    });

    it('shows loading state initially', () => {
        // Arrange
        (metricsService.fetchConstituentMetrics as jest.Mock).mockImplementation(
            () => new Promise(() => { }) // Never resolves
        );

        // Act
        render(<DataMetricsCard />);

        // Assert
        expect(screen.getByTestId('metrics-loading')).toBeInTheDocument();
    });

    it('handles error state gracefully', async () => {
        // Arrange
        (metricsService.fetchConstituentMetrics as jest.Mock).mockRejectedValue(
            new Error('Failed to fetch')
        );

        // Act
        render(<DataMetricsCard />);

        // Assert
        await waitFor(() => {
            expect(screen.getByText(/error/i)).toBeInTheDocument();
        });
    });
});
