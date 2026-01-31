
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LoginPage from '../app/(auth)/login/page';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  getFirebaseAuth: jest.fn(() => ({})),
}));

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback(null); // Simulate no user logged in
    return jest.fn();
  }),
  getAuth: jest.fn(),
}));

describe('Login Page UX', () => {
  it('should have accessible email and password inputs', () => {
    render(<LoginPage />);

    // These queries look for labels associated with inputs
    // If id/htmlFor are missing, these will fail
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
  });

  it('should toggle password visibility', () => {
    render(<LoginPage />);

    // Use exact match or selector to avoid matching the "Show password" button
    const passwordInput = screen.getByLabelText(/^Password$/i, { selector: 'input' });

    // Initial state: password type
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Find toggle button by aria-label
    // This will fail if the button doesn't exist or has no label
    const toggleButton = screen.getByRole('button', { name: /Show password/i });
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
