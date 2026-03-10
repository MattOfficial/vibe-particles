import type { PhysicsPlugin, Particle, EngineContext } from '../../core/types';

/** Neutral: Grid with gentle sine-wave rippling */
export const GridPhysics: PhysicsPlugin = {
    name: 'grid',
    update(p: Particle, ctx: EngineContext) {
        const lerp = 0.05;
        p.vx += (0 - p.vx) * lerp;
        p.vy += (0 - p.vy) * lerp;
        p.x += (p.baseX - p.x) * (lerp * 0.5);
        p.y += (p.baseY - p.y) * (lerp * 0.5);

        const distFromCenter = Math.sqrt(
            Math.pow(p.x - ctx.width / 2, 2) + Math.pow(p.y - ctx.height / 2, 2)
        );
        const ripple = Math.sin(distFromCenter * 0.02 - ctx.time * 2) * 0.5;
        p.radius = p.baseRadius + (ripple > 0.2 ? ripple * 0.5 : 0);
        p.targetAlpha = 0.15;
    },
};

// ─── Melancholic Rain ─────────────────────────────────────────────────────────

export interface RainOptions {
    /** Falling speed multiplier (default 1) */
    speed?: number;
    /** Wind strength (default 0.5) */
    wind?: number;
}

/** Factory: Melancholic gravity rain — configurable speed and wind */
export function createRainPhysics(options: RainOptions = {}): PhysicsPlugin {
    const speed = options.speed ?? 1;
    const wind = options.wind ?? 0.5;
    return {
        name: 'rain',
        update(p: Particle, ctx: EngineContext) {
            const lerp = 0.05;
            const targetVy = (3 + p.life * 2) * speed;
            p.vy += (targetVy - p.vy) * lerp;
            p.vx += (wind - p.vx) * lerp;
            p.targetAlpha = 0.55;
        },
    };
}

/** Default rain preset (no options) */
export const RainPhysics = createRainPhysics();

// ─── Epic Sparks ─────────────────────────────────────────────────────────────

export const SparkPhysics: PhysicsPlugin = {
    name: 'spark',
    update(p: Particle, ctx: EngineContext) {
        const lerp = 0.05;
        const targetVy = -4 - p.life * 3; // slightly lower cap to reduce tearing
        p.vy += (targetVy - p.vy) * lerp;
        // Clamp velocity to prevent screen tearing at extremes
        p.vy = Math.max(p.vy, -7);
        p.vx += ((Math.sin(p.life * 100 + ctx.time * 5) * 1.5) - p.vx) * lerp;
        p.vx = Math.max(-3, Math.min(3, p.vx));
        p.targetAlpha = 0.7 + p.life * 0.3;
    },
};

// ─── Serene Fireflies ─────────────────────────────────────────────────────────

export const FireflyPhysics: PhysicsPlugin = {
    name: 'firefly',
    update(p: Particle, ctx: EngineContext) {
        const lerp = 0.05;
        p.rotation += 0.02;
        const targetVx = Math.cos(p.rotation) * 0.5;
        const targetVy = Math.sin(p.rotation) * 0.5 - 0.2;
        p.vx += (targetVx - p.vx) * lerp;
        p.vy += (targetVy - p.vy) * lerp;

        if (Math.random() < 0.01) p.targetAlpha = 0.9;
        if (p.alpha > 0.6) p.targetAlpha = 0.05;
    },
};

// ─── Dark Smoke ───────────────────────────────────────────────────────────────

export const SmokePhysics: PhysicsPlugin = {
    name: 'smoke',
    update(p: Particle, _ctx: EngineContext) {
        if (Math.random() < 0.05) {
            p.vx += (Math.random() - 0.5) * 1.5;
            p.vy += (Math.random() - 0.5) * 1.5 - 0.2;
            p.radius = p.baseRadius * (1.5 + Math.random() * 2);
        }
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.targetAlpha = 0.55; // raised from 0.4 — more visible
        p.radius += ((p.baseRadius * 1.5) - p.radius) * 0.1;
    },
};

// ─── Tense Jitter ─────────────────────────────────────────────────────────────

export const JitterPhysics: PhysicsPlugin = {
    name: 'jitter',
    update(p: Particle, _ctx: EngineContext) {
        if (Math.random() < 0.1) {
            p.x = p.baseX + (Math.random() - 0.5) * 20;
            p.y = p.baseY + (Math.random() - 0.5) * 20;
            p.targetAlpha = Math.random() > 0.8 ? 0.9 : 0.1;
        }
        p.vx *= 0.8;
        p.vy *= 0.8;
    },
};

// ─── Romantic Heartbeat ───────────────────────────────────────────────────────
// True fade-in/out: ramps to 1.0 on beat, back to near-0 between beats.

export const HeartbeatPhysics: PhysicsPlugin = {
    name: 'heartbeat',
    update(p: Particle, ctx: EngineContext) {
        const lerp = 0.05;
        p.vx += (0 - p.vx) * lerp;
        p.vy += (0 - p.vy) * lerp;
        p.x += (p.baseX - p.x) * (lerp * 0.5);
        p.y += (p.baseY - p.y) * (lerp * 0.5);

        // Two-beat cycle: sharp ramp up, slow decay (like real EKG)
        const beat1 = Math.max(0, Math.sin(ctx.time * 5));
        const beat2 = Math.max(0, Math.sin(ctx.time * 5 - 0.7));
        const beatVal = Math.max(beat1, beat2);

        if (beatVal > 0.6) {
            // On the beat — bright, large
            p.targetAlpha = beatVal;
            p.radius = p.baseRadius * (1 + beatVal * 2.5);
        } else {
            // Between beats — fade nearly to black
            p.targetAlpha = 0.04;
            p.radius = p.baseRadius;
        }
    },
};

// ─── Happy Confetti ───────────────────────────────────────────────────────────

export const ConfettiPhysics: PhysicsPlugin = {
    name: 'confetti',
    update(p: Particle, ctx: EngineContext) {
        p.vy += 0.12; // gravity
        if (p.vy > 6) p.vy = 6; // terminal velocity

        p.x += Math.sin(p.life * 100 + ctx.time * 5) * 1.5; // wobble

        // Floor bounce
        if (p.y > ctx.height - 10 && p.vy > 0) {
            p.vy = -p.vy * 0.8;
            if (Math.abs(p.vy) < 1.5) p.vy = -8 - (Math.random() * 8);
        }
        p.targetAlpha = 0.85;
    },
};

// ─── Mysterious Swarm ─────────────────────────────────────────────────────────

export interface SwarmOptions {
    /** Repulsion radius in pixels (default 300) */
    repelRadius?: number;
    /** Per-particle color override palette (mirrors the engine colorPalette) */
    swarmColors?: string[];
}

/** Factory: Mysterious swarm that flees the cursor — configurable repel radius */
export function createSwarmPhysics(options: SwarmOptions = {}): PhysicsPlugin {
    const repelRadius = options.repelRadius ?? 300;
    return {
        name: 'swarm',
        update(p: Particle, ctx: EngineContext) {
            const dx = p.x - ctx.mouse.x;
            const dy = p.y - ctx.mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < repelRadius && dist > 1) {
                const force = Math.pow((repelRadius - dist) / repelRadius, 2);
                p.vx += (dx / dist) * force * 6;
                p.vy += (dy / dist) * force * 6;
            }

            // Friction + spring back to origin
            p.vx *= 0.92;
            p.vy *= 0.92;
            p.x += (p.baseX - p.x) * 0.02;
            p.y += (p.baseY - p.y) * 0.02;
            p.radius += ((p.baseRadius * 1.5) - p.radius) * 0.1;

            // Pulse opacity
            if (Math.random() < 0.03) {
                p.targetAlpha = 0.9;
                p.radius = p.baseRadius * 3;
            } else if (p.alpha > 0.5) {
                p.targetAlpha = 0.35;
            } else {
                p.targetAlpha = 0.35;
            }
        },
    };
}

/** Default swarm preset */
export const SwarmPhysics = createSwarmPhysics();

// ─── Antigravity Vortex ───────────────────────────────────────────────────────
// Velocity-aware dash field. Particles always visible at rest.

export const VortexPhysics: PhysicsPlugin = {
    name: 'vortex',
    update(p: Particle, ctx: EngineContext) {
        const dx = p.x - ctx.mouse.x;
        const dy = p.y - ctx.mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxRange = 350;

        if (dist < maxRange && dist > 1) {
            const force = Math.pow((maxRange - dist) / maxRange, 2);
            // Tangential (swirl) force
            const tangentX = -dy / dist;
            const tangentY = dx / dist;
            const swirlStrength = force * ctx.mouse.speed * 0.4;

            p.vx += tangentX * swirlStrength;
            p.vy += tangentY * swirlStrength;
            // Slight radial repulsion
            p.vx += (dx / dist) * force * 0.5;
            p.vy += (dy / dist) * force * 0.5;

            p.targetRotation = Math.atan2(p.vy, p.vx);
            p.targetAlpha = 0.35 + force * 0.55;
        } else {
            // ALWAYS visible at rest
            p.targetAlpha = 0.25;
            p.targetRotation = p.rotation; // hold current angle
        }

        // Friction + spring back
        p.vx *= 0.95;
        p.vy *= 0.95;
        p.x += (p.baseX - p.x) * 0.01;
        p.y += (p.baseY - p.y) * 0.01;
    },
};
