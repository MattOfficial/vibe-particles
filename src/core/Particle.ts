import type { Particle } from './types';

/**
 * Factory function to create a new Particle with sensible defaults.
 */
export function createParticle(
    x: number,
    y: number,
    baseRadius: number = 0.8,
    colorPalette?: string[]
): Particle {
    return {
        x,
        y,
        baseX: x,
        baseY: y,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        rotation: Math.random() * Math.PI * 2,
        targetRotation: 0,
        scale: 1,
        life: Math.random(),
        age: 0,
        baseRadius,
        radius: baseRadius,
        alpha: 0.1,
        targetAlpha: 0.1,
        color: colorPalette
            ? colorPalette[Math.floor(Math.random() * colorPalette.length)]
            : undefined,
    };
}
