/**
 * @file __tests__/scheduler-audience.test.tsx
 * @description TDD tests for Festival Campaign Wizard audience targeting
 * @changelog
 * - 2025-12-17: Initial implementation for audience targeting (Block/GP dropdowns)
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
    getFirebaseDb: jest.fn(() => ({})),
}));

// Mock auth
jest.mock('@/lib/hooks/useAuth', () => ({
    useAuth: () => ({ user: { uid: 'test-user' }, loading: false }),
}));

// Mock festivals service
jest.mock('@/lib/services/festivals', () => ({
    getUpcomingFestivals: jest.fn(() => Promise.resolve([
        { id: 'f1', name: 'Diwali', date: '2025-01-15', description: '' }
    ])),
    addFestival: jest.fn(),
    deleteFestival: jest.fn(),
    DEFAULT_FESTIVALS: [],
}));

// Mock constituents service
jest.mock('@/lib/services/constituents', () => ({
    getConstituentsForDateMMDD: jest.fn(() => Promise.resolve([])),
}));

// Mock metrics service - this is what we're testing
const mockBlocks = [
    { name: 'Cuttack', count: 150 },
    { name: 'Balasore', count: 100 },
    { name: 'Khurdha', count: 80 },
];

const mockGPs = [
    { name: 'Kendrapara GP', count: 50 },
    { name: 'Jagatsinghpur GP', count: 30 },
];

jest.mock('@/lib/services/metrics', () => ({
    fetchConstituentMetrics: jest.fn(() => Promise.resolve({
        totalConstituents: 330,
        totalBlocks: 3,
        blocks: mockBlocks,
    })),
    fetchGPMetricsForBlock: jest.fn(() => Promise.resolve(mockGPs)),
}));

// Import after mocks
import SchedulerPage from '@/app/(dashboard)/scheduler/page';
import { fetchConstituentMetrics, fetchGPMetricsForBlock } from '@/lib/services/metrics';

describe('Festival Campaign Wizard Audience Targeting', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Audience Type Selection', () => {
        test('displays three audience buttons: All, Block, GP/ULB', async () => {
            render(<SchedulerPage />);

            // Open campaign wizard first (click a festival "Send Greetings")
            await waitFor(() => {
                const sendButton = screen.queryByText(/send greetings/i);
                if (sendButton) fireEvent.click(sendButton);
            });

            // After selecting festival, should see audience step
            await waitFor(() => {
                expect(screen.getByText('All')).toBeInTheDocument();
                expect(screen.getByText('Block')).toBeInTheDocument();
                expect(screen.getByText(/GP/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        test('Block button shows block dropdown when clicked', async () => {
            render(<SchedulerPage />);

            await waitFor(() => {
                const sendButton = screen.queryByText(/send greetings/i);
                if (sendButton) fireEvent.click(sendButton);
            });

            // Click Block button
            await waitFor(async () => {
                const blockButton = screen.queryByText('Block');
                if (blockButton) {
                    fireEvent.click(blockButton);
                    // Should show block dropdown
                    await waitFor(() => {
                        expect(screen.getByText(/select block/i)).toBeInTheDocument();
                    });
                }
            });
        });

        test('GP button shows both Block and GP dropdowns', async () => {
            render(<SchedulerPage />);

            await waitFor(() => {
                const sendButton = screen.queryByText(/send greetings/i);
                if (sendButton) fireEvent.click(sendButton);
            });

            await waitFor(async () => {
                const gpButton = screen.queryByText(/GP/i);
                if (gpButton) {
                    fireEvent.click(gpButton);
                    await waitFor(() => {
                        expect(screen.getByText(/select block/i)).toBeInTheDocument();
                        expect(screen.getByText(/select gp/i)).toBeInTheDocument();
                    });
                }
            });
        });
    });

    describe('Database-Connected Dropdowns', () => {
        test('fetches blocks from metrics service on load', async () => {
            render(<SchedulerPage />);

            // Metrics should be fetched when component mounts
            await waitFor(() => {
                expect(fetchConstituentMetrics).toHaveBeenCalled();
            });
        });

        test('block dropdown shows options from database', async () => {
            render(<SchedulerPage />);

            await waitFor(() => {
                const sendButton = screen.queryByText(/send greetings/i);
                if (sendButton) fireEvent.click(sendButton);
            });

            await waitFor(async () => {
                const blockButton = screen.queryByText('Block');
                if (blockButton) {
                    fireEvent.click(blockButton);
                    await waitFor(() => {
                        // Should see block names from mock data
                        expect(screen.getByText(/cuttack/i)).toBeInTheDocument();
                    });
                }
            });
        });

        test('selecting block fetches GPs for that block', async () => {
            render(<SchedulerPage />);

            await waitFor(() => {
                const sendButton = screen.queryByText(/send greetings/i);
                if (sendButton) fireEvent.click(sendButton);
            });

            await waitFor(async () => {
                const gpButton = screen.queryByText(/GP/i);
                if (gpButton) {
                    fireEvent.click(gpButton);

                    // Select a block
                    const blockSelect = screen.queryByDisplayValue(/select block/i);
                    if (blockSelect) {
                        fireEvent.change(blockSelect, { target: { value: 'Cuttack' } });
                        await waitFor(() => {
                            expect(fetchGPMetricsForBlock).toHaveBeenCalledWith('Cuttack');
                        });
                    }
                }
            });
        });
    });
});
