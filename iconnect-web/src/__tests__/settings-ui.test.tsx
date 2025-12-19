
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SettingsPage from '../app/(dashboard)/settings/page';
import { getSettings } from '@/lib/services/settings';

// Mock Global Fetch
global.fetch = jest.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve({}),
        ok: true,
        text: () => Promise.resolve(""),
    })
) as jest.Mock;

// Mock dependencies
jest.mock('@/lib/services/settings', () => ({
    getSettings: jest.fn(),
    updateSettings: jest.fn(),
    uploadHeaderImage: jest.fn(),
}));

jest.mock('@/lib/services/constituents', () => ({
    getConstituentsForDate: jest.fn().mockImplementation(async (m, d, type) => {
        // Return dummy data to trigger list rendering
        if (type === 'birthday') return [{ name: 'Test Birthday 1' }, { name: 'Test Birthday 2' }];
        return [{ name: 'Test Anniversary 1' }];
    }),
}));

// Mock Firebase (implicitly used by components)
jest.mock('@/lib/firebase', () => ({
    getFirebaseDb: jest.fn(),
    getFirebaseStorage: jest.fn(),
}));

// Mock useAuth to avoid Firebase Auth initialization in tests
jest.mock('@/lib/hooks/useAuth', () => ({
    useAuth: () => ({
        user: { uid: 'test-user', email: 'test@example.com' },
        loading: false,
        isStaff: true, // Grant access
        isLeader: true,
        signIn: jest.fn(),
        signOut: jest.fn(),
    }),
}));

describe('Settings Page UI', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (getSettings as jest.Mock).mockResolvedValue({
            appName: 'iConnect',
            leaderName: 'Test Leader',
            headerImageUrl: '',
            alertSettings: {
                headsUp: true,
                action: true,
                headsUpMessage: 'Test Heads Up',
                actionMessage: 'Test Action',
            },
        });
    });

    it('should render Notification Preview lists with TRUNCATE class for responsiveness', async () => {
        // 1. Render Page
        render(<SettingsPage />);

        // 2. Wait for data to load
        await waitFor(() => {
            const elements = screen.getAllByText(/Test Birthday 1/i);
            expect(elements[0]).toBeInTheDocument();
        });

        // 3. Find list items
        const listItems = screen.getAllByRole('listitem');
        expect(listItems.length).toBeGreaterThan(0);

        // 4. Verify TRUNCATE class is present on the specific items
        // This ensures the responsive fix is applied to the content we care about
        const birthdayItems = screen.getAllByText(/Test Birthday 1/i);
        const anniversaryItems = screen.getAllByText(/Test Anniversary 1/i);

        // Check the first occurrence (or all of them)
        expect(birthdayItems[0]).toHaveClass('truncate');
        expect(anniversaryItems[0]).toHaveClass('truncate');
    });
});
