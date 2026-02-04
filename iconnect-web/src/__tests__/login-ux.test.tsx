import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginPage from '../app/(auth)/login/page';

// Mocks
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));

jest.mock('@/lib/firebase', () => ({
  getFirebaseAuth: jest.fn(() => ({})),
}));

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  onAuthStateChanged: jest.fn((auth, callback) => {
    // Simulate no user logged in initially to show the form
    callback(null);
    return jest.fn(); // unsubscribe
  }),
  getAuth: jest.fn(),
}));

describe('Login Page UX', () => {
  test('inputs are accessible via labels', async () => {
    await act(async () => {
        render(<LoginPage />);
    });

    // Check if we can find inputs by their labels
    // This verifies htmlFor/id association
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    // Use selector to ensure we are getting the input, not the button which also mentions "password"
    expect(screen.getByLabelText('Password', { selector: 'input' })).toBeInTheDocument();
  });

  test('password visibility toggle works', async () => {
    await act(async () => {
        render(<LoginPage />);
    });

    // Use selector to specifically target the input field
    const passwordInput = screen.getByLabelText('Password', { selector: 'input' });
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Find the toggle button
    // checking for button by aria-label "Show password"
    const toggleButton = screen.getByLabelText('Show password');
    expect(toggleButton).toBeInTheDocument();

    // Click to show
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(toggleButton).toHaveAttribute('aria-label', 'Hide password');

    // Click to hide
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(toggleButton).toHaveAttribute('aria-label', 'Show password');
  });
});
