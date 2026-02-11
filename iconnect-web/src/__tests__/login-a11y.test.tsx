
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LoginPage from '../app/(auth)/login/page';
import { signInWithEmailAndPassword } from 'firebase/auth';

// --- Mocks ---
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        replace: jest.fn(),
    }),
}));

// Mock Firebase Auth
jest.mock('@/lib/firebase', () => ({
    getFirebaseAuth: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
    signInWithEmailAndPassword: jest.fn(),
    onAuthStateChanged: jest.fn((auth, callback) => {
        callback(null); // Simulate no user logged in immediately
        return jest.fn();
    }),
}));

describe('LoginPage Accessibility', () => {

    test('form inputs have associated labels', () => {
        render(<LoginPage />);

        // These should pass ONLY if htmlFor matches id
        const emailInput = screen.getByLabelText(/Email Address/i);
        const passwordInput = screen.getByLabelText(/Password/i);

        expect(emailInput).toBeInTheDocument();
        expect(passwordInput).toBeInTheDocument();

        // Additional check for IDs
        expect(emailInput).toHaveAttribute('id', 'email');
        expect(passwordInput).toHaveAttribute('id', 'password');
    });

    test('error message has role="alert"', async () => {
        // Mock sign in failure
        (signInWithEmailAndPassword as jest.Mock).mockRejectedValue({ code: 'auth/invalid-credential' });

        render(<LoginPage />);

        // Fill form
        const emailInput = screen.getByLabelText(/Email Address/i); // This will fail if labels aren't fixed yet
        const passwordInput = screen.getByLabelText(/Password/i);
        const submitBtn = screen.getByRole('button', { name: /Sign In/i });

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        fireEvent.click(submitBtn);

        // Wait for error
        const alert = await screen.findByRole('alert');
        expect(alert).toHaveTextContent('Invalid email or password');
    });

    test('inputs have aria-invalid when error is present', async () => {
        // Mock sign in failure
        (signInWithEmailAndPassword as jest.Mock).mockRejectedValue({ code: 'auth/wrong-password' });

        render(<LoginPage />);

        const emailInput = screen.getByLabelText(/Email Address/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const submitBtn = screen.getByRole('button', { name: /Sign In/i });

        // Initial state: not invalid
        expect(emailInput).toHaveAttribute('aria-invalid', 'false');

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });

        fireEvent.click(submitBtn);

        // Wait for error to appear
        await screen.findByRole('alert');

        // Check for invalid state
        expect(emailInput).toHaveAttribute('aria-invalid', 'true');
        expect(passwordInput).toHaveAttribute('aria-invalid', 'true');

        // Check for aria-describedby
        expect(emailInput).toHaveAttribute('aria-describedby', 'login-error');
    });
});
