import * as react from 'react';

interface Particle {
    x: number;
    y: number;
    baseX: number;
    baseY: number;
    vx: number;
    vy: number;
    rotation: number;
    targetRotation: number;
    scale: number;
    life: number;
    age: number;
    radius: number;
    baseRadius: number;
    alpha: number;
    targetAlpha: number;
    color?: string;
    meta?: Record<string, any>;
}
interface MouseState {
    x: number;
    y: number;
    vx: number;
    vy: number;
    speed: number;
    angle: number;
    isDown: boolean;
}
interface EngineContext {
    width: number;
    height: number;
    time: number;
    mouse: MouseState;
    rgb: RGB;
    spacing: number;
    maxDist: number;
    particles: Particle[];
}
type RGB = [number, number, number];
interface PhysicsPlugin {
    readonly name: string;
    update(p: Particle, ctx: EngineContext): void;
    /** Called once when switching TO this plugin */
    onEnter?(particles: Particle[], ctx: EngineContext): void;
    /** Called once when switching AWAY from this plugin */
    onExit?(particles: Particle[], ctx: EngineContext): void;
}
interface RendererPlugin {
    readonly name: string;
    draw(ctx2d: CanvasRenderingContext2D, p: Particle, rgb: RGB, time: number): void;
    /** Called once before the frame loop iterates over particles */
    beforeFrame?(ctx2d: CanvasRenderingContext2D, w: number, h: number, time: number): void;
}
interface InteractionPlugin {
    readonly name: string;
    apply(p: Particle, mouse: MouseState, ctx: EngineContext): void;
}
interface Preset {
    readonly name: string;
    physics: PhysicsPlugin;
    renderer: RendererPlugin;
    interaction: InteractionPlugin;
    rgb?: RGB;
}
interface EngineOptions {
    spacing?: number;
    maxDist?: number;
    baseRadius?: number;
    rgb?: RGB;
    physics?: PhysicsPlugin;
    renderer?: RendererPlugin;
    interaction?: InteractionPlugin;
    /** Confetti-style multi-color palette for particles */
    colorPalette?: string[];
}

/**
 * VibeEngine — the core animation loop.
 *
 * Framework-agnostic. Accepts a raw HTMLCanvasElement and
 * orchestrates particles through swappable plugin pipelines.
 */
declare class VibeEngine {
    private canvas;
    private ctx;
    private particles;
    private width;
    private height;
    private animationFrameId;
    private time;
    private spacing;
    private maxDist;
    private baseRadius;
    private rgb;
    private colorPalette?;
    private physics;
    private renderer;
    private interaction;
    private mouse;
    private prevMouseX;
    private prevMouseY;
    constructor(canvas: HTMLCanvasElement, options?: EngineOptions);
    start(): void;
    stop(): void;
    setPhysics(plugin: PhysicsPlugin): void;
    setRenderer(plugin: RendererPlugin): void;
    setInteraction(plugin: InteractionPlugin): void;
    setRgb(rgb: RGB): void;
    applyPreset(preset: Preset): void;
    getContext(): EngineContext;
    getParticles(): Particle[];
    private handleResize;
    private handleMouseMove;
    private handleMouseDown;
    private handleMouseUp;
    private resize;
    private initParticles;
    private animate;
}

interface UseVibeEngineOptions extends EngineOptions {
    preset?: Preset;
}
/**
 * React hook that manages a VibeEngine instance tied to a canvas ref.
 *
 * @example
 * ```tsx
 * import { useVibeEngine } from 'vibe-particles/react';
 * import { MelancholicPreset } from 'vibe-particles';
 *
 * function Background() {
 *   const { canvasRef } = useVibeEngine({ preset: MelancholicPreset });
 *   return <canvas ref={canvasRef} className="fixed inset-0" />;
 * }
 * ```
 */
declare function useVibeEngine(options?: UseVibeEngineOptions): {
    canvasRef: react.RefObject<HTMLCanvasElement>;
    engineRef: react.MutableRefObject<VibeEngine | null>;
};

export { type EngineOptions, type Preset, type UseVibeEngineOptions, VibeEngine, useVibeEngine };
