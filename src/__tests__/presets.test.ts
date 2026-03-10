import { describe, it, expect } from 'vitest';
import { PRESETS } from '../presets';

describe('Presets', () => {
    it('has all required presets', () => {
        const expectedKeys = [
            'neutral', 'melancholic', 'epic', 'serene', 'dark',
            'tense', 'romantic', 'happy', 'mysterious', 'antigravity', 'minimal'
        ];

        expectedKeys.forEach(key => {
            expect(PRESETS).toHaveProperty(key);
        });
    });

    it('all presets have valid physics, renderer, and interaction plugins', () => {
        Object.entries(PRESETS).forEach(([key, preset]) => {
            expect(preset.name).toBe(key);
            expect(preset.physics).toBeDefined();
            expect(preset.physics.name).toBeDefined();

            expect(preset.renderer).toBeDefined();
            expect(preset.renderer.name).toBeDefined();

            expect(preset.interaction).toBeDefined();
            expect(preset.interaction.name).toBeDefined();
        });
    });
});
