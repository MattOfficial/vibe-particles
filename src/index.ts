// ============================================================
// vibe-particles — Public API
// ============================================================

// Core
export { VibeEngine } from './core/Engine';
export { createParticle } from './core/Particle';

// Types
export type {
    Particle,
    MouseState,
    EngineContext,
    EngineOptions,
    PhysicsPlugin,
    RendererPlugin,
    InteractionPlugin,
    Preset,
    RGB,
} from './core/types';

// Plugins — Physics
export {
    GridPhysics, RainPhysics, SparkPhysics, FireflyPhysics,
    SmokePhysics, JitterPhysics, HeartbeatPhysics, ConfettiPhysics,
    SwarmPhysics, VortexPhysics,
    // Factory functions for configurable physics
    createRainPhysics, createSwarmPhysics,
} from './plugins/physics';
export type { RainOptions, SwarmOptions } from './plugins/physics';

// Plugins — Renderers
export {
    DotRenderer, GlowRenderer, RaindropRenderer, SparkRenderer,
    ConfettiRenderer, SmokeRenderer, SwarmRenderer, HeartbeatRenderer,
    DashRenderer, TrailRenderer,
} from './plugins/renderers';

// Plugins — Interactions
export {
    AttractInteraction, RepelInteraction, VortexInteraction,
    OrientInteraction, NoInteraction,
} from './plugins/interactions';

// Presets
export {
    NeutralPreset, MelancholicPreset, EpicPreset, SerenePreset,
    DarkPreset, TensePreset, RomanticPreset, HappyPreset,
    MysteriousPreset, AntigravityPreset, MinimalPreset,
    PRESETS,
} from './presets';
