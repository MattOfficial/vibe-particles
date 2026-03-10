// ============================================================
// vibe-particles — Core Type Definitions
// A framework-agnostic, plugin-based Canvas particle engine.
// ============================================================

// --- Particle -----------------------------------------------

export interface Particle {
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

// --- Mouse --------------------------------------------------

export interface MouseState {
    x: number;
    y: number;
    vx: number;
    vy: number;
    speed: number;
    angle: number;
    isDown: boolean;
}

// --- Engine Context -----------------------------------------
// Passed into plugins so they can read shared engine state
// without coupling to the Engine class directly.

export interface EngineContext {
    width: number;
    height: number;
    time: number;
    mouse: MouseState;
    rgb: RGB;
    spacing: number;
    maxDist: number;
    particles: Particle[];
}

// --- RGB Tuple ----------------------------------------------

export type RGB = [number, number, number];

// --- Plugin Interfaces --------------------------------------

export interface PhysicsPlugin {
    readonly name: string;
    update(p: Particle, ctx: EngineContext): void;
    /** Called once when switching TO this plugin */
    onEnter?(particles: Particle[], ctx: EngineContext): void;
    /** Called once when switching AWAY from this plugin */
    onExit?(particles: Particle[], ctx: EngineContext): void;
}

export interface RendererPlugin {
    readonly name: string;
    draw(ctx2d: CanvasRenderingContext2D, p: Particle, rgb: RGB, time: number): void;
    /** Called once before the frame loop iterates over particles */
    beforeFrame?(ctx2d: CanvasRenderingContext2D, w: number, h: number, time: number): void;
}

export interface InteractionPlugin {
    readonly name: string;
    apply(p: Particle, mouse: MouseState, ctx: EngineContext): void;
}

// --- Preset -------------------------------------------------

export interface Preset {
    readonly name: string;
    physics: PhysicsPlugin;
    renderer: RendererPlugin;
    interaction: InteractionPlugin;
    rgb?: RGB;
    /** Optional override for the engine's particle color palette. Useful for forcing monochromatic effects. */
    colorPalette?: string[];
}

// --- Engine Options -----------------------------------------

export interface EngineOptions {
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
