import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { VibeEngine } from '../core/Engine';
import { PRESETS } from '../presets';

describe('VibeEngine', () => {
    let canvas: HTMLCanvasElement;

    beforeEach(() => {
        canvas = document.createElement('canvas');
        document.body.appendChild(canvas);
        vi.useFakeTimers();
    });

    afterEach(() => {
        document.body.removeChild(canvas);
        vi.useRealTimers();
    });

    it('initializes correctly', () => {
        const engine = new VibeEngine(canvas);
        expect(engine).toBeInstanceOf(VibeEngine);
        expect(engine.getParticles().length).toBeGreaterThan(0);
    });

    it('applies presets correctly', () => {
        const engine = new VibeEngine(canvas);
        engine.applyPreset(PRESETS.melancholic);

        // Melancholic preset sets specific physics, renderer, and rgb
        const ctx = engine.getContext();
        expect(ctx.rgb).toEqual([59, 130, 246]);
    });

    it('starts and stops animation loop', () => {
        const engine = new VibeEngine(canvas);
        const rafSpy = vi.spyOn(window, 'requestAnimationFrame');
        const cafSpy = vi.spyOn(window, 'cancelAnimationFrame');

        engine.start();
        expect(rafSpy).toHaveBeenCalled();

        engine.stop();
        expect(cafSpy).toHaveBeenCalled();
    });
});
