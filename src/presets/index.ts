import type { Preset, RGB } from '../core/types';

// Physics
import {
    GridPhysics, RainPhysics, SparkPhysics, FireflyPhysics,
    SmokePhysics, JitterPhysics, HeartbeatPhysics, ConfettiPhysics,
    createSwarmPhysics, VortexPhysics,
} from '../plugins/physics';

const _SwarmDefault = createSwarmPhysics();

// Renderers
import {
    DotRenderer, GlowRenderer, RaindropRenderer, SparkRenderer,
    ConfettiRenderer, SmokeRenderer, SwarmRenderer, HeartbeatRenderer,
    DashRenderer, TrailRenderer,
} from '../plugins/renderers';

// Interactions
import {
    AttractInteraction, RepelInteraction, VortexInteraction,
    OrientInteraction, NoInteraction,
} from '../plugins/interactions';

// --- Moodbound Vibes ----------------------------------------

export const NeutralPreset: Preset = {
    name: 'neutral',
    physics: GridPhysics,
    renderer: DotRenderer,
    interaction: AttractInteraction,
    rgb: [168, 85, 247],
};

export const MelancholicPreset: Preset = {
    name: 'melancholic',
    physics: RainPhysics,
    renderer: RaindropRenderer,
    interaction: AttractInteraction,
    rgb: [59, 130, 246],
};

export const EpicPreset: Preset = {
    name: 'epic',
    physics: SparkPhysics,
    renderer: SparkRenderer,
    interaction: AttractInteraction,
    rgb: [245, 158, 11],
};

export const SerenePreset: Preset = {
    name: 'serene',
    physics: FireflyPhysics,
    renderer: GlowRenderer,
    interaction: AttractInteraction,
    rgb: [20, 184, 166],
};

export const DarkPreset: Preset = {
    name: 'dark',
    physics: SmokePhysics,
    renderer: SmokeRenderer,
    interaction: NoInteraction,
    rgb: [153, 27, 27],
};

export const TensePreset: Preset = {
    name: 'tense',
    physics: JitterPhysics,
    renderer: DotRenderer,
    interaction: AttractInteraction,
    rgb: [220, 38, 38],
};

export const RomanticPreset: Preset = {
    name: 'romantic',
    physics: HeartbeatPhysics,
    renderer: HeartbeatRenderer,
    interaction: AttractInteraction,
    rgb: [244, 63, 94],
};

export const HappyPreset: Preset = {
    name: 'happy',
    physics: ConfettiPhysics,
    renderer: ConfettiRenderer,
    interaction: AttractInteraction,
    rgb: [250, 204, 21],
};

export const MysteriousPreset: Preset = {
    name: 'mysterious',
    physics: _SwarmDefault,
    renderer: SwarmRenderer,
    interaction: NoInteraction,
    rgb: [124, 58, 237],
};

// --- New Effects --------------------------------------------

export const AntigravityPreset: Preset = {
    name: 'antigravity',
    physics: VortexPhysics,
    renderer: DashRenderer,
    // VortexPhysics already handles orientation internally
    // NoInteraction avoids double-applying rotation logic
    interaction: NoInteraction,
    rgb: [66, 133, 244],
};

export const MinimalPreset: Preset = {
    name: 'minimal',
    physics: GridPhysics,
    renderer: DotRenderer,
    interaction: AttractInteraction,
    rgb: [100, 100, 100],
};

// --- Preset Map (lookup by string key) ----------------------

export const PRESETS: Record<string, Preset> = {
    neutral: NeutralPreset,
    melancholic: MelancholicPreset,
    epic: EpicPreset,
    serene: SerenePreset,
    dark: DarkPreset,
    tense: TensePreset,
    romantic: RomanticPreset,
    happy: HappyPreset,
    mysterious: MysteriousPreset,
    antigravity: AntigravityPreset,
    minimal: MinimalPreset,
};
