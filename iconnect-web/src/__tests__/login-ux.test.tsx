import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../app/(auth)/login/page';

// Mock Next.js router
const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  getFirebaseAuth: jest.fn(() => ({})),
}));

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  onAuthStateChanged: jest.fn((auth, callback) => {
    // Simulate no user logged in initially
    callback(null);
    return () => {}; // unsubscribe function
  }),
  getAuth: jest.fn(),
}));

describe('LoginPage UX', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('toggles password visibility', async () => {
    render(<LoginPage />);

    // Wait for the loading state to pass
    await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const passwordInput = screen.getByLabelText('Password');

    // Check initial type
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Find toggle button
    const toggleButton = screen.getByLabelText('Show password');
    expect(toggleButton).toBeInTheDocument();

    // Click toggle
    await userEvent.click(toggleButton);

    // Check type is now text
    expect(passwordInput).toHaveAttribute('type', 'text');

    // Toggle button label should change
    expect(screen.getByLabelText('Hide password')).toBeInTheDocument();

    // Click again
    await userEvent.click(screen.getByLabelText('Hide password'));

    // Check type is back to password
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('has accessible inputs associated with labels', async () => {
    render(<LoginPage />);
     await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // These getByLabelText calls will fail if the label is not correctly associated with the input
    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');

    expect(emailInput).toHaveAttribute('id', 'email');
    expect(passwordInput).toHaveAttribute('id', 'password');
  });
});
