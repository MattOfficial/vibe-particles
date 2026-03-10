import type { InteractionPlugin, Particle, MouseState, EngineContext } from '../../core/types';

/** Attract: particles glow & connect lines to the cursor */
export const AttractInteraction: InteractionPlugin = {
    name: 'attract',
    apply(p: Particle, mouse: MouseState, ctx: EngineContext) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < ctx.maxDist) {
            const scale = Math.pow((ctx.maxDist - dist) / ctx.maxDist, 2);
            p.radius = p.baseRadius + (scale * 2.5);
            p.targetAlpha = 0.1 + (scale * 0.5);
        } else {
            p.radius += (p.baseRadius - p.radius) * 0.1;
            p.targetAlpha = 0.1;
        }
    },
};

/** Repel: particles are pushed away from the cursor */
export const RepelInteraction: InteractionPlugin = {
    name: 'repel',
    apply(p: Particle, mouse: MouseState, ctx: EngineContext) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 200 && dist > 1) {
            const force = Math.pow((200 - dist) / 200, 2);
            p.vx += (dx / dist) * force * 3;
            p.vy += (dy / dist) * force * 3;
        }
        p.radius += ((p.baseRadius * 1.5) - p.radius) * 0.1;
    },
};

/** Vortex: swirling tangential force based on mouse velocity */
export const VortexInteraction: InteractionPlugin = {
    name: 'vortex',
    apply(p: Particle, mouse: MouseState, ctx: EngineContext) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxRange = 350;

        if (dist < maxRange && dist > 1) {
            const force = Math.pow((maxRange - dist) / maxRange, 2);
            // Tangential (perpendicular) force = swirl effect
            const tangentX = -dy / dist;
            const tangentY = dx / dist;
            const swirlStrength = force * mouse.speed * 0.3;

            p.vx += tangentX * swirlStrength;
            p.vy += tangentY * swirlStrength;

            // Slight radial repulsion
            p.vx += (dx / dist) * force * 0.5;
            p.vy += (dy / dist) * force * 0.5;

            p.targetAlpha = 0.3 + force * 0.6;
        }
    },
};

/** Orient: dashes rotate to follow cursor velocity direction */
export const OrientInteraction: InteractionPlugin = {
    name: 'orient',
    apply(p: Particle, mouse: MouseState, ctx: EngineContext) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < ctx.maxDist) {
            const scale = Math.pow((ctx.maxDist - dist) / ctx.maxDist, 2);

            // Rotate towards mouse movement direction
            if (mouse.speed > 1) {
                p.targetRotation = mouse.angle;
            } else {
                // When mouse is still, orient towards the cursor position
                p.targetRotation = Math.atan2(dy, dx);
            }

            p.radius = p.baseRadius + (scale * 1.5);
            p.targetAlpha = 0.1 + (scale * 0.5);
        } else {
            p.radius += (p.baseRadius - p.radius) * 0.1;
            p.targetAlpha = 0.1;
        }
    },
};

/** No interaction — for vibes that handle everything in physics (e.g. Mysterious, Dark) */
export const NoInteraction: InteractionPlugin = {
    name: 'none',
    apply() {
        // intentionally empty
    },
};
