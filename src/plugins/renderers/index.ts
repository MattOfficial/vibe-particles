import type { RendererPlugin, Particle, RGB } from '../../core/types';

/** Standard circular dot */
export const DotRenderer: RendererPlugin = {
    name: 'dot',
    draw(ctx: CanvasRenderingContext2D, p: Particle, rgb: RGB) {
        ctx.arc(p.x, p.y, Math.max(0.1, p.radius), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${p.alpha})`;
        ctx.fill();
    },
};

/** Glowing dot (firefly-style) */
export const GlowRenderer: RendererPlugin = {
    name: 'glow',
    draw(ctx: CanvasRenderingContext2D, p: Particle, rgb: RGB) {
        ctx.shadowBlur = p.alpha > 0.5 ? 18 : 6;
        ctx.shadowColor = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 1)`;
        ctx.arc(p.x, p.y, Math.max(0.1, p.radius), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${p.alpha})`;
        ctx.fill();
        ctx.shadowBlur = 0;
    },
};

/** Rain streak lines with trail blur */
export const RaindropRenderer: RendererPlugin = {
    name: 'raindrop',
    draw(ctx: CanvasRenderingContext2D, p: Particle, rgb: RGB) {
        ctx.moveTo(p.x - p.vx * 3, p.y - p.vy * 3);
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${p.alpha})`;
        ctx.lineWidth = Math.max(0.6, p.radius);
        ctx.lineCap = 'round';
        ctx.stroke();
    },
    beforeFrame(ctx: CanvasRenderingContext2D, w: number, h: number) {
        // Slower fade to keep streaks visible longer
        ctx.fillStyle = 'rgba(3, 0, 20, 0.25)';
        ctx.fillRect(0, 0, w, h);
    },
};

/** Bright glowing ascending spark — velocity capped to prevent tearing */
export const SparkRenderer: RendererPlugin = {
    name: 'spark',
    draw(ctx: CanvasRenderingContext2D, p: Particle, rgb: RGB) {
        // Clamp trail length
        const trailVy = Math.max(-6, p.vy);
        const trailVx = Math.max(-2, Math.min(2, p.vx));
        ctx.shadowBlur = 8;
        ctx.shadowColor = `rgba(255, 200, 0, ${p.alpha})`;
        ctx.moveTo(p.x - trailVx * 2, p.y - trailVy * 2);
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = `rgba(255, 240, 180, ${p.alpha})`;
        ctx.lineWidth = Math.max(1, p.radius);
        ctx.stroke();
        ctx.shadowBlur = 0;
    },
    beforeFrame(ctx: CanvasRenderingContext2D, w: number, h: number) {
        // Faster fade = less accumulation of old trails
        ctx.fillStyle = 'rgba(3, 0, 20, 0.35)';
        ctx.fillRect(0, 0, w, h);
    },
};

/** Multi-colored tumbling confetti rectangles — bright, no blur */
export const ConfettiRenderer: RendererPlugin = {
    name: 'confetti',
    draw(ctx: CanvasRenderingContext2D, p: Particle, rgb: RGB, time: number) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.life * 10 + time * 2);
        ctx.globalAlpha = p.alpha;
        // Solid bright color — no shadow blur (performance + clarity)
        ctx.fillStyle = p.color || `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
        const size = Math.max(3, p.radius * 2.5);
        ctx.fillRect(-size / 2, -size / 2, size, size * 1.6);
        ctx.restore();
    },
};

/** Smoke: blurry glow — brighter effective alpha */
export const SmokeRenderer: RendererPlugin = {
    name: 'smoke',
    draw(ctx: CanvasRenderingContext2D, p: Particle, rgb: RGB) {
        ctx.shadowBlur = 22;
        ctx.shadowColor = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${p.alpha})`;
        ctx.arc(p.x, p.y, Math.max(0.1, p.radius), 0, Math.PI * 2);
        // Raised from 0.5× to 0.75× so smoke is more visible
        ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${p.alpha * 0.75})`;
        ctx.fill();
        ctx.shadowBlur = 0;
    },
};

/** Swarm: glowing hot point cluster */
export const SwarmRenderer: RendererPlugin = {
    name: 'swarm',
    draw(ctx: CanvasRenderingContext2D, p: Particle, rgb: RGB) {
        ctx.shadowBlur = p.alpha > 0.6 ? 14 : 2;
        ctx.shadowColor = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 1)`;
        ctx.arc(p.x, p.y, Math.max(0.1, p.radius), 0, Math.PI * 2);
        // Use per-particle color if set (supports swarmColors palette)
        if (p.color) {
            ctx.fillStyle = p.color.replace(')', `, ${p.alpha})`).replace('rgb', 'rgba');
        } else {
            ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${p.alpha})`;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
    },
};

/** Heartbeat: dramatic pulse glow — bright on beat, invisible between */
export const HeartbeatRenderer: RendererPlugin = {
    name: 'heartbeat',
    draw(ctx: CanvasRenderingContext2D, p: Particle, rgb: RGB) {
        const onBeat = p.radius > p.baseRadius * 1.5;
        ctx.shadowBlur = onBeat ? 25 : 0;
        ctx.shadowColor = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 1)`;
        ctx.arc(p.x, p.y, Math.max(0.1, p.radius), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${p.alpha})`;
        ctx.fill();
        ctx.shadowBlur = 0;
    },
};

/**
 * Oriented line-segment dashes (antigravity-style).
 * Draws a dash aligned to p.rotation — always visible.
 */
export const DashRenderer: RendererPlugin = {
    name: 'dash',
    draw(ctx: CanvasRenderingContext2D, p: Particle, rgb: RGB) {
        const len = Math.max(3, p.radius * 4);
        const cos = Math.cos(p.rotation);
        const sin = Math.sin(p.rotation);
        ctx.moveTo(p.x - cos * len / 2, p.y - sin * len / 2);
        ctx.lineTo(p.x + cos * len / 2, p.y + sin * len / 2);
        ctx.strokeStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${p.alpha})`;
        ctx.lineWidth = 1.2;
        ctx.lineCap = 'round';
        ctx.stroke();
    },
};

/** Motion-blur trail */
export const TrailRenderer: RendererPlugin = {
    name: 'trail',
    draw(ctx: CanvasRenderingContext2D, p: Particle, rgb: RGB) {
        ctx.moveTo(p.x - p.vx * 3, p.y - p.vy * 3);
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${p.alpha * 0.6})`;
        ctx.lineWidth = Math.max(0.5, p.radius);
        ctx.lineCap = 'round';
        ctx.stroke();
    },
    beforeFrame(ctx: CanvasRenderingContext2D, w: number, h: number) {
        ctx.fillStyle = 'rgba(3, 0, 20, 0.15)';
        ctx.fillRect(0, 0, w, h);
    },
};
