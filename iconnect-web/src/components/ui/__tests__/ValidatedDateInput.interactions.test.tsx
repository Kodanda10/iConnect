
/**
 * @file components/ui/__tests__/ValidatedDateInput_UX.test.tsx
 * @description UX & Accessibility tests for ValidatedDateInput
 */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ValidatedDateInput from '../ValidatedDateInput';
import userEvent from '@testing-library/user-event';

describe('ValidatedDateInput UX Enhancements', () => {

    test('Accessibility: should not show error state immediately while typing partial input', async () => {
        const onChange = jest.fn();
        render(<ValidatedDateInput value="" onChange={onChange} />);

        const input = screen.getByRole('textbox');

        // User types "1"
        await userEvent.type(input, '1');

        // Should NOT be invalid yet (user is still typing)
        expect(input).not.toHaveAttribute('aria-invalid', 'true');
        // Border class is on the parent wrapper
        expect(input.parentElement).not.toHaveClass('border-red-500');
    });

    test('Accessibility: should show error state after blur if input is incomplete', async () => {
        const onChange = jest.fn();
        render(<ValidatedDateInput value="" onChange={onChange} />);

        const input = screen.getByRole('textbox');

        // User types "12" then tabs away
        await userEvent.type(input, '12');
        fireEvent.blur(input);

        // NOW it should be invalid
        expect(input).toHaveAttribute('aria-invalid', 'true');
        // Border class is on the parent wrapper
        expect(input.parentElement).toHaveClass('border-red-500');
    });

    test('Accessibility: should have accessible error message linked via aria-errormessage', async () => {
        const onChange = jest.fn();
        render(<ValidatedDateInput value="" onChange={onChange} />);

        const input = screen.getByRole('textbox');

        // Trigger error
        await userEvent.type(input, '99/99/9999'); // Invalid date
        fireEvent.blur(input);

        const errorId = input.getAttribute('aria-errormessage');
        expect(errorId).toBeTruthy();

        const errorMessage = document.getElementById(errorId!);
        expect(errorMessage).toBeInTheDocument();
        // Should contain helpful text
        expect(errorMessage).toHaveTextContent(/invalid/i);
    });

    test('Interaction: should NOT open calendar on focus (too aggressive)', () => {
        const onChange = jest.fn();
        render(<ValidatedDateInput value="" onChange={onChange} />);

        const input = screen.getByRole('textbox');
        fireEvent.focus(input);

        // Calendar should NOT be visible
        const dialog = screen.queryByRole('dialog');
        expect(dialog).not.toBeInTheDocument();
    });

    test('Interaction: should open calendar on Alt+ArrowDown', async () => {
        const onChange = jest.fn();
        render(<ValidatedDateInput value="" onChange={onChange} />);

        const input = screen.getByRole('textbox');
        input.focus();

        // Press Alt+ArrowDown
        await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');

        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();
    });
});
