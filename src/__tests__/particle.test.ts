import { describe, it, expect } from 'vitest';
import { createParticle } from '../core/Particle';

describe('Particle', () => {
    it('creates a basic particle with correct defaults', () => {
        const p = createParticle(10, 20);
        expect(p.x).toBe(10);
        expect(p.y).toBe(20);
        expect(p.baseX).toBe(10);
        expect(p.baseY).toBe(20);
        expect(p.alpha).toBe(0.1);
        expect(p.radius).toBe(0.8);
    });

    it('applies color palette correctly if provided', () => {
        const p = createParticle(0, 0, 1, ['#ff0000']);
        expect(p.color).toBe('#ff0000');
    });
});
