
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginPage from '../app/(auth)/login/page';

// Mock Next.js router
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        replace: jest.fn(),
    }),
}));

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
    getFirebaseAuth: jest.fn(() => ({})), // Return dummy auth object
}));

jest.mock('firebase/auth', () => ({
    signInWithEmailAndPassword: jest.fn(),
    onAuthStateChanged: jest.fn((auth, callback) => {
        // Simulate no user initially
        callback(null);
        return () => {}; // Unsubscribe function
    }),
}));

describe('Login Page UX', () => {
    it('should toggle password visibility when eye icon is clicked', async () => {
        render(<LoginPage />);

        // Wait for "loading" state to pass
        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });

        const passwordInput = screen.getByPlaceholderText('••••••••');

        // 1. Initial State: Password should be hidden
        expect(passwordInput).toHaveAttribute('type', 'password');

        // 2. Find the toggle button
        // Since we haven't implemented it yet, this test is expected to fail initially if run against current code.
        // But since I'm implementing TDD-ish style, I'll write the test for the desired state.
        // I'll look for it by aria-label which is best practice.
        const toggleButton = screen.getByLabelText('Show password');
        expect(toggleButton).toBeInTheDocument();

        // 3. Click to Show
        fireEvent.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'text');
        expect(toggleButton).toHaveAttribute('aria-label', 'Hide password');

        // 4. Click to Hide
        fireEvent.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'password');
        expect(toggleButton).toHaveAttribute('aria-label', 'Show password');
    });
});
