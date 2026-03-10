<div align="center">
  <h1>vibe-particles ✦</h1>

  <p>
    <a href="https://www.npmjs.com/package/vibe-particles"><img src="https://img.shields.io/npm/v/vibe-particles" alt="NPM Version" /></a>
    <a href="https://github.com/MattOfficial/vibe-particles"><img src="https://img.shields.io/github/license/MattOfficial/vibe-particles" alt="License" /></a>
    <img src="https://img.shields.io/badge/framework-agnostic-blue" alt="Framework Agnostic" />
    <img src="https://img.shields.io/badge/zero-dependencies-success" alt="Zero Dependencies" />
  </p>

  <p>A beautifully crafted, plugin-based Canvas 2D particle physics engine.<br/>Designed to be completely framework-agnostic, extensible, and performant.</p>

  **[✨ View the Interactive Showcase Demo →](https://mattofficial.github.io/vibe-particles/)**
  <br/><br/>
</div>

## 📦 Installation

```bash
npm install vibe-particles
```

## 🚀 Quick Start

### Vanilla JS / TS

```ts
import { VibeEngine, PRESETS } from 'vibe-particles';

const canvas = document.querySelector('canvas');

// 1. Initialize engine
const engine = new VibeEngine(canvas, { 
  spacing: 40,
  rgb: [168, 85, 247] 
});

// 2. Apply a built-in preset
engine.applyPreset(PRESETS.melancholic);

// 3. Start the loop
engine.start();
```

### React

The package includes an optional, zero-overhead React adapter (`vibe-particles/react`).

```tsx
import { useVibeEngine } from 'vibe-particles/react';
import { PRESETS } from 'vibe-particles';

export function Background() {
  const { canvasRef } = useVibeEngine({
    preset: PRESETS.antigravity,
    engineOptions: { spacing: 30 }
  });

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100vh' }} />;
}
```

## 🎨 Built-in Presets

Check the [Showcase](https://mattofficial.github.io/vibe-particles/) to see these live.

| Key | Description | Configurable via Factory? |
|-----|-------------|-------------------------|
| `neutral` | Calm dot-matrix grid with a sine-wave ripple. | - |
| `antigravity`| Oriented dashes that form vortex trails. | - |
| `melancholic`| Gravity-driven rainfall. | `createRainPhysics({ wind, speed })` |
| `epic` | Glowing gold sparks shooting upward. | - |
| `serene` | Slow floating fireflies with soft glow blinks. | - |
| `dark` | Brownian smoke expanding with a blurry effect. | Override engine `rgb`. |
| `tense` | Erratic jittering dots with flickering opacity. | - |
| `romantic` | Heartbeat EKG pulse effect. | - |
| `happy` | Bouncing multi-colored confetti. | Override engine `colorPalette`.|
| `mysterious`| Glowing swarm that flees from the cursor. | `createSwarmPhysics({ repelRadius })` |

## 🧩 Architecture: The Plugin System

The engine completely decouples behavior into three separate plugin interfaces:
- **Physics**: How particles move and behave over time.
- **Renderer**: How particles are drawn on the canvas.
- **Interaction**: How particles react to the mouse.

You can mix and match built-in plugins, or easily write your own without touching the core engine loop.

```ts
import { 
  VibeEngine, 
  RainPhysics, 
  SwarmRenderer, 
  AttractInteraction 
} from 'vibe-particles';

const engine = new VibeEngine(canvas);
engine.setPhysics(RainPhysics);
engine.setRenderer(SwarmRenderer);
engine.setInteraction(AttractInteraction);
engine.start();
```

### Writing Custom Plugins

You can effortlessly inject your own custom logic by writing an object that implements the `PhysicsPlugin`, `RendererPlugin`, or `InteractionPlugin` interfaces.

```ts
import type { PhysicsPlugin, Particle, EngineContext } from 'vibe-particles';

export const FloatPhysics: PhysicsPlugin = {
  name: 'FloatPhysics',
  update(p: Particle, ctx: EngineContext) {
    p.vy -= 0.05; // float upwards steadily 
    p.targetAlpha = 0.5; // fade in to 50% opacity
  }
};
```
Then just apply it:
```ts
engine.setPhysics(FloatPhysics);
```

## 🧑‍💻 Local Development & Contributing

1. Clone the repo and install dependencies:
   ```bash
   git clone https://github.com/MattOfficial/vibe-particles.git
   cd vibe-particles
   npm install
   ```

2. Run the unit tests (Vitest):
   ```bash
   npm run test
   ```

3. Run the local docs/showcase:
   ```bash
   cd docs
   npm install
   npm run dev
   ```

## 📝 License
MIT License. Created by [MattOfficial](https://github.com/MattOfficial).
