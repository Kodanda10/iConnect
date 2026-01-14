import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '../app/(auth)/login/page';
import { signInWithEmailAndPassword } from 'firebase/auth';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));

// Mock Firebase
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  onAuthStateChanged: jest.fn((auth, callback) => {
    // Simulate no user initially to show login form
    callback(null);
    return () => {};
  }),
}));

jest.mock('../lib/firebase', () => ({
  getFirebaseAuth: jest.fn(() => ({})),
}));

describe('LoginPage Security', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('prevents account enumeration when user does not exist', async () => {
    (signInWithEmailAndPassword as jest.Mock).mockRejectedValue({
      code: 'auth/user-not-found',
    });

    render(<LoginPage />);

    // Wait for loading to finish
    await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const emailInput = screen.getByPlaceholderText('admin@admin.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /Sign In/i });

    fireEvent.change(emailInput, { target: { value: 'nonexistent@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Expect generic message
    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
    });

    // Ensure "User not found" is NOT present
    expect(screen.queryByText('User not found')).not.toBeInTheDocument();
  });

  it('prevents account enumeration when password is wrong', async () => {
    (signInWithEmailAndPassword as jest.Mock).mockRejectedValue({
      code: 'auth/wrong-password',
    });

    render(<LoginPage />);

    // Wait for loading to finish
    await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const emailInput = screen.getByPlaceholderText('admin@admin.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /Sign In/i });

    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    // Expect generic message
    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
    });

    // Ensure "Incorrect password" is NOT present
    expect(screen.queryByText('Incorrect password')).not.toBeInTheDocument();
  });
});
