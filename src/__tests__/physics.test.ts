import { describe, it, expect } from 'vitest';
import { GridPhysics, createRainPhysics, createSwarmPhysics } from '../plugins/physics';
import { createParticle } from '../core/Particle';
import type { EngineContext } from '../core/types';

describe('Physics Plugins', () => {
    const mockCtx: EngineContext = {
        width: 800,
        height: 600,
        time: 0,
        mouse: { x: 0, y: 0, vx: 0, vy: 0, speed: 0, angle: 0, isDown: false },
        rgb: [255, 255, 255],
        spacing: 40,
        maxDist: 100,
        particles: []
    };

    it('GridPhysics returns particles to target positions', () => {
        const p = createParticle(100, 100);
        // Reset random initial velocities
        p.vx = 0;
        p.vy = 0;

        p.x = 120; // Move right from base
        p.y = 80;  // Move up from base

        GridPhysics.update(p, mockCtx);

        // GridPhysics lerps position directly towards baseX (100) and baseY (100)
        expect(p.x).toBeLessThan(120); // Moved left towards 100
        expect(p.y).toBeGreaterThan(80); // Moved down towards 100
    });

    it('createRainPhysics applies gravity and wind', () => {
        const wind = 2;
        const speed = 1.5;
        const rain = createRainPhysics({ wind, speed });

        const p = createParticle(0, 0);
        // Reset random initial velocities
        p.vx = 0;
        p.vy = 0;

        rain.update(p, mockCtx);

        expect(p.vy).toBeGreaterThan(0); // Falling
        expect(p.vx).toBeGreaterThan(0); // Blown by positive wind
    });

    it('createSwarmPhysics returns a configured SwarmPhysics plugin', () => {
        const swarm = createSwarmPhysics({ repelRadius: 150 });
        expect(swarm.name).toBe('swarm');
        expect(typeof swarm.update).toBe('function');
    });
});
