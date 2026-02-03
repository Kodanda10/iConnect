
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginPage from '../app/(auth)/login/page';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';

// Mock Next.js Navigation
const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        replace: mockReplace,
    }),
}));

// Mock Firebase Auth
const mockSignIn = jest.fn();
const mockOnAuthStateChanged = jest.fn((auth, callback) => {
    // Simulate no user initially (loading finishes)
    callback(null);
    return () => {}; // Unsubscribe function
});

jest.mock('firebase/auth', () => ({
    signInWithEmailAndPassword: jest.fn(),
    onAuthStateChanged: jest.fn(),
    getAuth: jest.fn(() => ({})),
}));

// Mock Lib Firebase
jest.mock('@/lib/firebase', () => ({
    getFirebaseAuth: jest.fn(() => ({})),
}));

// Setup mocks implementation
(signInWithEmailAndPassword as jest.Mock).mockImplementation(mockSignIn);
(onAuthStateChanged as jest.Mock).mockImplementation(mockOnAuthStateChanged);


describe('Login Security', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should show generic error message when user is not found (Account Enumeration Protection)', async () => {
        // Arrange
        mockSignIn.mockRejectedValue({ code: 'auth/user-not-found' });

        render(<LoginPage />);

        // Act
        // Wait for loading to finish (isCheckingAuth)
        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });

        const emailInput = screen.getByPlaceholderText(/admin@admin.com/i);
        const passwordInput = screen.getByPlaceholderText(/••••••••/i);
        const submitButton = screen.getByRole('button', { name: /Sign In/i });

        fireEvent.change(emailInput, { target: { value: 'nonexistent@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        // Assert
        await waitFor(() => {
            // Should NOT see "User not found"
            expect(screen.queryByText('User not found')).not.toBeInTheDocument();
            // Should see generic message
            expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
        });
    });

    it('should show generic error message when password is wrong', async () => {
        // Arrange
        mockSignIn.mockRejectedValue({ code: 'auth/wrong-password' });

        render(<LoginPage />);

        // Act
        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });

        const emailInput = screen.getByPlaceholderText(/admin@admin.com/i);
        const passwordInput = screen.getByPlaceholderText(/••••••••/i);
        const submitButton = screen.getByRole('button', { name: /Sign In/i });

        fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
        fireEvent.click(submitButton);

        // Assert
        await waitFor(() => {
            // Should NOT see "Incorrect password"
            expect(screen.queryByText('Incorrect password')).not.toBeInTheDocument();
            // Should see generic message
            expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
        });
    });

    it('should still handle rate limiting specifically', async () => {
         // Arrange
         mockSignIn.mockRejectedValue({ code: 'auth/too-many-requests' });

         render(<LoginPage />);

         // Act
         await waitFor(() => {
             expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
         });

         const emailInput = screen.getByPlaceholderText(/admin@admin.com/i);
         const passwordInput = screen.getByPlaceholderText(/••••••••/i);
         const submitButton = screen.getByRole('button', { name: /Sign In/i });

         fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
         fireEvent.change(passwordInput, { target: { value: 'password' } });
         fireEvent.click(submitButton);

         // Assert
         await waitFor(() => {
             expect(screen.getByText('Too many attempts. Try again later.')).toBeInTheDocument();
         });
    });
});
