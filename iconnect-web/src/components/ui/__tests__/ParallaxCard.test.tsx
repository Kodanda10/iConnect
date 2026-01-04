
import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import { ParallaxCard } from '../ParallaxCard';

describe('ParallaxCard', () => {
    it('renders children correctly', () => {
        const { getByText } = render(
            <ParallaxCard>
                <div>Test Content</div>
            </ParallaxCard>
        );
        expect(getByText('Test Content')).toBeTruthy();
    });

    it('updates styles on mouse move', () => {
        const { container } = render(
            <ParallaxCard intensity={10}>
                <div>Test Content</div>
            </ParallaxCard>
        );

        const card = container.firstChild as HTMLElement;
        const content = card.querySelector('div[style*="preserve-3d"]');

        // Initial mouse enter
        fireEvent.mouseEnter(card);

        // Simulate mouse move
        act(() => {
            fireEvent.mouseMove(card, {
                clientX: 100,
                clientY: 100,
                bubbles: true
            });
        });

        // Since we are moving to direct DOM manipulation, we will check if the styles are applied
        // Note: In the current implementation (pre-optimization), this triggers re-renders.
        // In the optimized implementation, it should update styles directly.
        // We can check if the transform contains rotate values.
        expect(content?.getAttribute('style')).toContain('rotateX');
        expect(content?.getAttribute('style')).toContain('rotateY');
    });

    it('resets styles on mouse leave', () => {
        const { container } = render(
            <ParallaxCard>
                <div>Test Content</div>
            </ParallaxCard>
        );

        const card = container.firstChild as HTMLElement;
        const content = card.querySelector('div[style*="preserve-3d"]'); // The inner div that rotates

        fireEvent.mouseEnter(card);
        fireEvent.mouseMove(card, { clientX: 100, clientY: 100 });
        fireEvent.mouseLeave(card);

        // Should reset to 0 rotation and scale 1
        expect(content?.getAttribute('style')).toContain('rotateX(0deg)');
        expect(content?.getAttribute('style')).toContain('rotateY(0deg)');
    });
});
