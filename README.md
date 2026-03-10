# vibe-particles

A framework-agnostic, plugin-based Canvas 2D particle physics engine. Drop-in animated backgrounds for any web app.

## Install

```bash
npm install vibe-particles
```

## Quick Start

```typescript
import { VibeEngine, MelancholicPreset } from 'vibe-particles';

const canvas = document.querySelector('canvas');
const engine = new VibeEngine(canvas, { spacing: 40 });
engine.applyPreset(MelancholicPreset);
engine.start();
```

## React

```tsx
import { useVibeEngine } from 'vibe-particles/react';
import { AntigravityPreset } from 'vibe-particles';

function Background() {
  const { canvasRef } = useVibeEngine({ preset: AntigravityPreset });
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" />;
}
```

## Presets

| Preset | Physics | Visual |
|--------|---------|--------|
| `NeutralPreset` | Grid ripple | Dots |
| `MelancholicPreset` | Gravity rain | Raindrop streaks |
| `EpicPreset` | Ascending sparks | Glowing lines |
| `SerenePreset` | Floating drift | Firefly glow |
| `DarkPreset` | Brownian smoke | Fuzzy blur |
| `TensePreset` | Erratic jitter | Flickering dots |
| `RomanticPreset` | Heartbeat pulse | Pulsing glow |
| `HappyPreset` | Bouncing confetti | Colored rectangles |
| `MysteriousPreset` | Mouse repulsion | Swarm glow |
| `AntigravityPreset` | Vortex flow | Oriented dashes |
| `MinimalPreset` | Gentle grid | Subtle dots |

## Custom Plugins

```typescript
import { VibeEngine } from 'vibe-particles';
import type { PhysicsPlugin, RendererPlugin } from 'vibe-particles';

const myPhysics: PhysicsPlugin = {
  name: 'spiral',
  update(p, ctx) {
    p.vx = Math.cos(ctx.time + p.life) * 2;
    p.vy = Math.sin(ctx.time + p.life) * 2;
  },
};

const engine = new VibeEngine(canvas);
engine.setPhysics(myPhysics);
engine.start();
```

## License

MIT
