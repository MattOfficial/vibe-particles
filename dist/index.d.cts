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

/**
 * Factory function to create a new Particle with sensible defaults.
 */
declare function createParticle(x: number, y: number, baseRadius?: number, colorPalette?: string[]): Particle;

/** Neutral: Grid with gentle sine-wave rippling */
declare const GridPhysics: PhysicsPlugin;
interface RainOptions {
    /** Falling speed multiplier (default 1) */
    speed?: number;
    /** Wind strength (default 0.5) */
    wind?: number;
}
/** Factory: Melancholic gravity rain — configurable speed and wind */
declare function createRainPhysics(options?: RainOptions): PhysicsPlugin;
/** Default rain preset (no options) */
declare const RainPhysics: PhysicsPlugin;
declare const SparkPhysics: PhysicsPlugin;
declare const FireflyPhysics: PhysicsPlugin;
declare const SmokePhysics: PhysicsPlugin;
declare const JitterPhysics: PhysicsPlugin;
declare const HeartbeatPhysics: PhysicsPlugin;
declare const ConfettiPhysics: PhysicsPlugin;
interface SwarmOptions {
    /** Repulsion radius in pixels (default 300) */
    repelRadius?: number;
    /** Per-particle color override palette (mirrors the engine colorPalette) */
    swarmColors?: string[];
}
/** Factory: Mysterious swarm that flees the cursor — configurable repel radius */
declare function createSwarmPhysics(options?: SwarmOptions): PhysicsPlugin;
/** Default swarm preset */
declare const SwarmPhysics: PhysicsPlugin;
declare const VortexPhysics: PhysicsPlugin;

/** Standard circular dot */
declare const DotRenderer: RendererPlugin;
/** Glowing dot (firefly-style) */
declare const GlowRenderer: RendererPlugin;
/** Rain streak lines with trail blur */
declare const RaindropRenderer: RendererPlugin;
/** Bright glowing ascending spark — velocity capped to prevent tearing */
declare const SparkRenderer: RendererPlugin;
/** Multi-colored tumbling confetti rectangles — bright, no blur */
declare const ConfettiRenderer: RendererPlugin;
/** Smoke: blurry glow — brighter effective alpha */
declare const SmokeRenderer: RendererPlugin;
/** Swarm: glowing hot point cluster */
declare const SwarmRenderer: RendererPlugin;
/** Heartbeat: dramatic pulse glow — bright on beat, invisible between */
declare const HeartbeatRenderer: RendererPlugin;
/**
 * Oriented line-segment dashes (antigravity-style).
 * Draws a dash aligned to p.rotation — always visible.
 */
declare const DashRenderer: RendererPlugin;
/** Motion-blur trail */
declare const TrailRenderer: RendererPlugin;

/** Attract: particles glow & connect lines to the cursor */
declare const AttractInteraction: InteractionPlugin;
/** Repel: particles are pushed away from the cursor */
declare const RepelInteraction: InteractionPlugin;
/** Vortex: swirling tangential force based on mouse velocity */
declare const VortexInteraction: InteractionPlugin;
/** Orient: dashes rotate to follow cursor velocity direction */
declare const OrientInteraction: InteractionPlugin;
/** No interaction — for vibes that handle everything in physics (e.g. Mysterious, Dark) */
declare const NoInteraction: InteractionPlugin;

declare const NeutralPreset: Preset;
declare const MelancholicPreset: Preset;
declare const EpicPreset: Preset;
declare const SerenePreset: Preset;
declare const DarkPreset: Preset;
declare const TensePreset: Preset;
declare const RomanticPreset: Preset;
declare const HappyPreset: Preset;
declare const MysteriousPreset: Preset;
declare const AntigravityPreset: Preset;
declare const MinimalPreset: Preset;
declare const PRESETS: Record<string, Preset>;

export { AntigravityPreset, AttractInteraction, ConfettiPhysics, ConfettiRenderer, DarkPreset, DashRenderer, DotRenderer, type EngineContext, type EngineOptions, EpicPreset, FireflyPhysics, GlowRenderer, GridPhysics, HappyPreset, HeartbeatPhysics, HeartbeatRenderer, type InteractionPlugin, JitterPhysics, MelancholicPreset, MinimalPreset, type MouseState, MysteriousPreset, NeutralPreset, NoInteraction, OrientInteraction, PRESETS, type Particle, type PhysicsPlugin, type Preset, type RGB, type RainOptions, RainPhysics, RaindropRenderer, type RendererPlugin, RepelInteraction, RomanticPreset, SerenePreset, SmokePhysics, SmokeRenderer, SparkPhysics, SparkRenderer, type SwarmOptions, SwarmPhysics, SwarmRenderer, TensePreset, TrailRenderer, VibeEngine, VortexInteraction, VortexPhysics, createParticle, createRainPhysics, createSwarmPhysics };
