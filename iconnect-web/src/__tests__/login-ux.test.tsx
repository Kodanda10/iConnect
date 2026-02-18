
import { render, screen, fireEvent } from '@testing-library/react';
import LoginPage from '../app/(auth)/login/page';
import '@testing-library/jest-dom';

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  onAuthStateChanged: jest.fn((auth, callback) => {
    // Simulate user not logged in so we see the form
    callback(null);
    return jest.fn(); // unsubscribe
  }),
}));

// Mock Firebase Init
jest.mock('../lib/firebase', () => ({
  getFirebaseAuth: jest.fn(),
}));

// Mock Next Navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

describe('LoginPage UX', () => {
  it('toggles password visibility', () => {
    render(<LoginPage />);

    // Find password input
    // We expect it to be type="password" initially
    const passwordInput = screen.getByLabelText(/password/i, { selector: 'input' });
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Find toggle button
    const toggleButton = screen.getByRole('button', { name: /show password/i });

    // Click toggle
    fireEvent.click(toggleButton);

    // Should be type="text"
    expect(passwordInput).toHaveAttribute('type', 'text');

    // Button label should update
    expect(toggleButton).toHaveAttribute('aria-label', expect.stringMatching(/hide password/i));

    // Click again
    fireEvent.click(toggleButton);

    // Should be type="password" again
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(toggleButton).toHaveAttribute('aria-label', expect.stringMatching(/show password/i));
  });

  it('has accessible labels for inputs', () => {
    render(<LoginPage />);

    // Check Email input has associated label
    const emailInput = screen.getByLabelText(/email address/i);
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('id', 'email');

    // Check Password input has associated label
    const passwordInput = screen.getByLabelText(/password/i, { selector: 'input' });
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute('id', 'password');
  });
});
