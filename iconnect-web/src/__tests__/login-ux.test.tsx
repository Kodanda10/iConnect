import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '../app/(auth)/login/page';
import '@testing-library/jest-dom';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: jest.fn(),
    push: jest.fn(),
  }),
}));

// Mock firebase
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  onAuthStateChanged: jest.fn((auth, callback) => {
    // Simulate no user logged in initially
    callback(null);
    return () => {};
  }),
}));

// Mock lib/firebase
jest.mock('@/lib/firebase', () => ({
  getFirebaseAuth: jest.fn(() => ({})), // Return empty object as auth instance
}));

describe('Login Page UX', () => {
  it('toggles password visibility when eye icon is clicked', async () => {
    render(<LoginPage />);

    // Wait for the auth check to complete (loading state to disappear)
    await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Find the password input
    const passwordInput = screen.getByPlaceholderText('••••••••');

    // Initially it should be type="password"
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Find the toggle button
    const toggleButton = screen.getByLabelText('Show password');
    expect(toggleButton).toBeInTheDocument();

    // Click to show password
    fireEvent.click(toggleButton);

    // Should now be type="text"
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(toggleButton).toHaveAttribute('aria-label', 'Hide password');

    // Click again to hide
    fireEvent.click(toggleButton);

    // Should revert to type="password"
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(toggleButton).toHaveAttribute('aria-label', 'Show password');
  });
});
