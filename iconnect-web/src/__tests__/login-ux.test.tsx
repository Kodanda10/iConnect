import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '@/app/(auth)/login/page';
import '@testing-library/jest-dom';

// Mock dependencies
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        replace: jest.fn(),
    }),
}));

jest.mock('firebase/auth', () => ({
    signInWithEmailAndPassword: jest.fn(),
    onAuthStateChanged: jest.fn((auth, callback) => {
        // Simulate not logged in
        callback(null);
        return jest.fn(); // unsubscribe
    }),
}));

jest.mock('@/lib/firebase', () => ({
    getFirebaseAuth: jest.fn(() => ({})),
}));

describe('LoginPage UX', () => {
    it('toggles password visibility', async () => {
        render(<LoginPage />);

        // Wait for loading state to clear
        await waitFor(() => {
            expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
        });

        const passwordInput = screen.getByLabelText('Password', { selector: 'input' });

        // Use a more specific selector for the toggle button since there might be other buttons
        // ideally accessible via aria-label
        const toggleButton = screen.getByRole('button', { name: /Show password/i });

        // Initial state: password hidden
        expect(passwordInput).toHaveAttribute('type', 'password');

        // Click toggle to show
        fireEvent.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'text');
        expect(toggleButton).toHaveAttribute('aria-label', 'Hide password');

        // Click toggle to hide
        fireEvent.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'password');
        expect(toggleButton).toHaveAttribute('aria-label', 'Show password');
    });

    it('has accessible form labels', async () => {
         render(<LoginPage />);

         await waitFor(() => {
             expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
         });

         const emailInput = screen.getByLabelText(/Email Address/i);
         const passwordInput = screen.getByLabelText('Password', { selector: 'input' });

         expect(emailInput).toHaveAttribute('id', 'email');
         expect(passwordInput).toHaveAttribute('id', 'password');
    });
});
