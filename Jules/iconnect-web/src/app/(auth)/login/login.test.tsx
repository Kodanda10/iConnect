/**
 * @file login.test.tsx
 * @description Unit tests for the Login Page component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from './page';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';

// Mock dependencies
jest.mock('firebase/auth');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));
jest.mock('@/lib/firebase', () => ({
  getFirebaseAuth: jest.fn(),
}));

describe('LoginPage', () => {
  const mockPush = jest.fn();
  const mockReplace = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: mockReplace,
    });
    jest.clearAllMocks();
  });

  it('renders login form correctly', () => {
    render(<LoginPage />);
    
    expect(screen.getByPlaceholderText(/admin@admin.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows validation error when fields are empty', async () => {
    render(<LoginPage />);
    
    const submitBtn = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/email and password are required/i)).toBeInTheDocument();
  });

  it('calls firebase auth on valid submission', async () => {
    (signInWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({
      user: { email: 'test@test.com' },
    });

    render(<LoginPage />);
    
    const emailInput = screen.getByPlaceholderText(/admin@admin.com/i);
    const passInput = screen.getByPlaceholderText(/••••••••/i);
    const submitBtn = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passInput, { target: { value: 'password123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@test.com',
        'password123'
      );
    });

    // Check redirect
    expect(mockReplace).toHaveBeenCalledWith('/settings');
  });

  it('handles auth errors gracefully', async () => {
    (signInWithEmailAndPassword as jest.Mock).mockRejectedValueOnce({
      code: 'auth/wrong-password',
    });

    render(<LoginPage />);
    
    const emailInput = screen.getByPlaceholderText(/admin@admin.com/i);
    const passInput = screen.getByPlaceholderText(/••••••••/i);
    const submitBtn = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passInput, { target: { value: 'wrongpass' } });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/incorrect password/i)).toBeInTheDocument();
  });
});
