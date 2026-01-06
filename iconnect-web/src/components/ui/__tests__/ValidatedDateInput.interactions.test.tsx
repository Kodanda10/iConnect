/**
 * @file components/ui/__tests__/ValidatedDateInput.interactions.test.tsx
 * @description Interaction tests for ValidatedDateInput component focusing on keyboard accessibility
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ValidatedDateInput from '../ValidatedDateInput';

// Mock ReactDOM.createPortal to simply render children in place for tests
// This allows us to query the portal content easily
jest.mock('react-dom', () => ({
    ...jest.requireActual('react-dom'),
    createPortal: (node: React.ReactNode) => node,
}));

describe('ValidatedDateInput Interactions', () => {

    test('opens calendar on input focus', async () => {
        render(<ValidatedDateInput value="" onChange={() => {}} />);
        const input = screen.getByRole('textbox');

        await userEvent.click(input);

        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    test('closes calendar on Escape key and restores focus', async () => {
        render(<ValidatedDateInput value="" onChange={() => {}} />);
        const input = screen.getByRole('textbox');

        // Open calendar
        await userEvent.click(input);
        expect(screen.getByRole('dialog')).toBeInTheDocument();

        // Press Escape
        await userEvent.keyboard('{Escape}');

        // Calendar should be gone
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

        // Focus should be returned to input
        expect(input).toHaveFocus();
    });

    test('opens calendar on ArrowDown key when focused on input', async () => {
        render(<ValidatedDateInput value="" onChange={() => {}} />);
        const input = screen.getByRole('textbox');

        // Focus input without clicking (if possible, or just focus)
        input.focus();

        // Ensure closed initially (though onFocus opens it in current implementation,
        // let's assume we want to test explicit key trigger if onFocus didn't do it,
        // but current implementation has onFocus={openCalendar}.
        // So checking if ArrowDown works might be redundant if focus already opens it.
        // But if the user closes it with Escape, ArrowDown should re-open it.

        // Open then close
        await userEvent.click(input);
        await userEvent.keyboard('{Escape}');
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

        // Press ArrowDown
        await userEvent.keyboard('{ArrowDown}');

        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
});
