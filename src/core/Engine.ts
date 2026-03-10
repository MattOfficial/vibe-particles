import type {
    Particle,
    MouseState,
    EngineContext,
    EngineOptions,
    PhysicsPlugin,
    RendererPlugin,
    InteractionPlugin,
    Preset,
    RGB,
} from './types';
import { createParticle } from './Particle';

/**
 * VibeEngine — the core animation loop.
 *
 * Framework-agnostic. Accepts a raw HTMLCanvasElement and
 * orchestrates particles through swappable plugin pipelines.
 */
export class VibeEngine {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private particles: Particle[] = [];
    private width = 0;
    private height = 0;
    private animationFrameId: number | null = null;
    private time = 0;

    // --- Config ------------------------------------------------
    private spacing: number;
    private maxDist: number;
    private baseRadius: number;
    private rgb: RGB;
    private colorPalette?: string[];

    // --- Plugins -----------------------------------------------
    private physics: PhysicsPlugin | null = null;
    private renderer: RendererPlugin | null = null;
    private interaction: InteractionPlugin | null = null;

    // --- Mouse -------------------------------------------------
    private mouse: MouseState = {
        x: 0, y: 0,
        vx: 0, vy: 0,
        speed: 0, angle: 0,
        isDown: false,
    };
    private prevMouseX = 0;
    private prevMouseY = 0;

    constructor(canvas: HTMLCanvasElement, options: EngineOptions = {}) {
        this.canvas = canvas;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('vibe-particles: Could not get 2D context');
        this.ctx = ctx;

        this.spacing = options.spacing ?? 40;
        this.maxDist = options.maxDist ?? 250;
        this.baseRadius = options.baseRadius ?? 0.8;
        this.rgb = options.rgb ?? [168, 85, 247];
        this.colorPalette = options.colorPalette;

        if (options.physics) this.physics = options.physics;
        if (options.renderer) this.renderer = options.renderer;
        if (options.interaction) this.interaction = options.interaction;

        this.handleResize = this.handleResize.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);

        this.resize();
        this.initParticles();
    }

    // --- Public API --------------------------------------------

    public start(): void {
        window.addEventListener('resize', this.handleResize);
        window.addEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('mousedown', this.handleMouseDown);
        window.addEventListener('mouseup', this.handleMouseUp);
        this.animate();
    }

    public stop(): void {
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('mousedown', this.handleMouseDown);
        window.removeEventListener('mouseup', this.handleMouseUp);
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    public setPhysics(plugin: PhysicsPlugin): void {
        if (this.physics?.onExit) {
            this.physics.onExit(this.particles, this.getContext());
        }
        this.physics = plugin;
        if (plugin.onEnter) {
            plugin.onEnter(this.particles, this.getContext());
        }
    }

    public setRenderer(plugin: RendererPlugin): void {
        this.renderer = plugin;
    }

    public setInteraction(plugin: InteractionPlugin): void {
        this.interaction = plugin;
    }

    public setRgb(rgb: RGB): void {
        this.rgb = rgb;
    }

    public applyPreset(preset: Preset): void {
        if (preset.rgb) this.rgb = preset.rgb;
        this.setPhysics(preset.physics);
        this.setRenderer(preset.renderer);
        this.setInteraction(preset.interaction);
    }

    public getContext(): EngineContext {
        return {
            width: this.width,
            height: this.height,
            time: this.time,
            mouse: { ...this.mouse },
            rgb: this.rgb,
            spacing: this.spacing,
            maxDist: this.maxDist,
            particles: this.particles,
        };
    }

    public getParticles(): Particle[] {
        return this.particles;
    }

    // --- Internal ----------------------------------------------

    private handleResize(): void {
        this.resize();
        this.initParticles();
    }

    private handleMouseMove(e: MouseEvent): void {
        this.prevMouseX = this.mouse.x;
        this.prevMouseY = this.mouse.y;
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;

        // Compute velocity on each move event
        const dx = this.mouse.x - this.prevMouseX;
        const dy = this.mouse.y - this.prevMouseY;
        this.mouse.vx = dx;
        this.mouse.vy = dy;
        this.mouse.speed = Math.sqrt(dx * dx + dy * dy);
        this.mouse.angle = Math.atan2(dy, dx);
    }

    private handleMouseDown(): void {
        this.mouse.isDown = true;
    }

    private handleMouseUp(): void {
        this.mouse.isDown = false;
    }

    private resize(): void {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        if (this.mouse.x === 0 && this.mouse.y === 0) {
            this.mouse.x = this.width / 2;
            this.mouse.y = this.height / 2;
            this.prevMouseX = this.mouse.x;
            this.prevMouseY = this.mouse.y;
        }
    }

    private initParticles(): void {
        this.particles = [];
        for (let x = 0; x < this.width + this.spacing; x += this.spacing) {
            for (let y = 0; y < this.height + this.spacing; y += this.spacing) {
                const xOffset = (y / this.spacing) % 2 === 0 ? 0 : this.spacing / 2;
                this.particles.push(
                    createParticle(x + xOffset, y, this.baseRadius, this.colorPalette)
                );
            }
        }
    }

    private animate = (): void => {
        this.time = Date.now() * 0.0005;

        // Decay mouse velocity each frame (smooth deceleration)
        this.mouse.vx *= 0.9;
        this.mouse.vy *= 0.9;
        this.mouse.speed = Math.sqrt(
            this.mouse.vx * this.mouse.vx + this.mouse.vy * this.mouse.vy
        );

        const ctx2d = this.ctx;
        const engineCtx = this.getContext();

        // --- Before-frame hook (e.g. trail clearing) ---
        if (this.renderer?.beforeFrame) {
            this.renderer.beforeFrame(ctx2d, this.width, this.height, this.time);
        } else {
            ctx2d.clearRect(0, 0, this.width, this.height);
        }

        ctx2d.lineWidth = 0.5;

        // --- Per-particle update + draw ---
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            p.age += 1;

            // Physics
            if (this.physics) {
                this.physics.update(p, engineCtx);
            }

            // Apply velocity
            p.x += p.vx;
            p.y += p.vy;

            // Interaction
            if (this.interaction) {
                this.interaction.apply(p, this.mouse, engineCtx);
            }

            // Alpha lerp
            p.alpha += (p.targetAlpha - p.alpha) * 0.1;

            // Rotation lerp
            p.rotation += (p.targetRotation - p.rotation) * 0.1;

            // Boundary wrapping
            if (p.y > this.height + 50) p.y = -50;
            if (p.x > this.width + 50) p.x = -50;
            if (p.y < -50) p.y = this.height + 50;
            if (p.x < -50) p.x = this.width + 50;

            // Draw
            ctx2d.beginPath();
            if (this.renderer) {
                this.renderer.draw(ctx2d, p, this.rgb, this.time);
            } else {
                // Fallback: simple dot
                ctx2d.arc(p.x, p.y, Math.max(0.1, p.radius), 0, Math.PI * 2);
                ctx2d.fillStyle = `rgba(${this.rgb[0]}, ${this.rgb[1]}, ${this.rgb[2]}, ${p.alpha})`;
                ctx2d.fill();
            }
        }

        this.animationFrameId = requestAnimationFrame(this.animate);
    };
}
