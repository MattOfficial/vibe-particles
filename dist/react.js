// src/adapters/react.tsx
import { useEffect, useRef } from "react";

// src/core/Particle.ts
function createParticle(x, y, baseRadius = 0.8, colorPalette) {
  return {
    x,
    y,
    baseX: x,
    baseY: y,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2,
    rotation: Math.random() * Math.PI * 2,
    targetRotation: 0,
    scale: 1,
    life: Math.random(),
    age: 0,
    baseRadius,
    radius: baseRadius,
    alpha: 0.1,
    targetAlpha: 0.1,
    color: colorPalette ? colorPalette[Math.floor(Math.random() * colorPalette.length)] : void 0
  };
}

// src/core/Engine.ts
var VibeEngine = class {
  constructor(canvas, options = {}) {
    this.particles = [];
    this.width = 0;
    this.height = 0;
    this.animationFrameId = null;
    this.time = 0;
    // --- Plugins -----------------------------------------------
    this.physics = null;
    this.renderer = null;
    this.interaction = null;
    // --- Mouse -------------------------------------------------
    this.mouse = {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      speed: 0,
      angle: 0,
      isDown: false
    };
    this.prevMouseX = 0;
    this.prevMouseY = 0;
    this.animate = () => {
      this.time = Date.now() * 5e-4;
      this.mouse.vx *= 0.9;
      this.mouse.vy *= 0.9;
      this.mouse.speed = Math.sqrt(
        this.mouse.vx * this.mouse.vx + this.mouse.vy * this.mouse.vy
      );
      const ctx2d = this.ctx;
      const engineCtx = this.getContext();
      if (this.renderer?.beforeFrame) {
        this.renderer.beforeFrame(ctx2d, this.width, this.height, this.time);
      } else {
        ctx2d.clearRect(0, 0, this.width, this.height);
      }
      ctx2d.lineWidth = 0.5;
      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        p.age += 1;
        if (this.physics) {
          this.physics.update(p, engineCtx);
        }
        p.x += p.vx;
        p.y += p.vy;
        if (this.interaction) {
          this.interaction.apply(p, this.mouse, engineCtx);
        }
        p.alpha += (p.targetAlpha - p.alpha) * 0.1;
        p.rotation += (p.targetRotation - p.rotation) * 0.1;
        if (p.y > this.height + 50) p.y = -50;
        if (p.x > this.width + 50) p.x = -50;
        if (p.y < -50) p.y = this.height + 50;
        if (p.x < -50) p.x = this.width + 50;
        ctx2d.beginPath();
        if (this.renderer) {
          this.renderer.draw(ctx2d, p, this.rgb, this.time);
        } else {
          ctx2d.arc(p.x, p.y, Math.max(0.1, p.radius), 0, Math.PI * 2);
          ctx2d.fillStyle = `rgba(${this.rgb[0]}, ${this.rgb[1]}, ${this.rgb[2]}, ${p.alpha})`;
          ctx2d.fill();
        }
      }
      this.animationFrameId = requestAnimationFrame(this.animate);
    };
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("vibe-particles: Could not get 2D context");
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
  start() {
    window.addEventListener("resize", this.handleResize);
    window.addEventListener("mousemove", this.handleMouseMove);
    window.addEventListener("mousedown", this.handleMouseDown);
    window.addEventListener("mouseup", this.handleMouseUp);
    this.animate();
  }
  stop() {
    window.removeEventListener("resize", this.handleResize);
    window.removeEventListener("mousemove", this.handleMouseMove);
    window.removeEventListener("mousedown", this.handleMouseDown);
    window.removeEventListener("mouseup", this.handleMouseUp);
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
  setPhysics(plugin) {
    if (this.physics?.onExit) {
      this.physics.onExit(this.particles, this.getContext());
    }
    this.physics = plugin;
    if (plugin.onEnter) {
      plugin.onEnter(this.particles, this.getContext());
    }
  }
  setRenderer(plugin) {
    this.renderer = plugin;
  }
  setInteraction(plugin) {
    this.interaction = plugin;
  }
  setRgb(rgb) {
    this.rgb = rgb;
  }
  applyPreset(preset) {
    if (preset.rgb) this.rgb = preset.rgb;
    this.setPhysics(preset.physics);
    this.setRenderer(preset.renderer);
    this.setInteraction(preset.interaction);
  }
  getContext() {
    return {
      width: this.width,
      height: this.height,
      time: this.time,
      mouse: { ...this.mouse },
      rgb: this.rgb,
      spacing: this.spacing,
      maxDist: this.maxDist,
      particles: this.particles
    };
  }
  getParticles() {
    return this.particles;
  }
  // --- Internal ----------------------------------------------
  handleResize() {
    this.resize();
    this.initParticles();
  }
  handleMouseMove(e) {
    this.prevMouseX = this.mouse.x;
    this.prevMouseY = this.mouse.y;
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
    const dx = this.mouse.x - this.prevMouseX;
    const dy = this.mouse.y - this.prevMouseY;
    this.mouse.vx = dx;
    this.mouse.vy = dy;
    this.mouse.speed = Math.sqrt(dx * dx + dy * dy);
    this.mouse.angle = Math.atan2(dy, dx);
  }
  handleMouseDown() {
    this.mouse.isDown = true;
  }
  handleMouseUp() {
    this.mouse.isDown = false;
  }
  resize() {
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
  initParticles() {
    this.particles = [];
    for (let x = 0; x < this.width + this.spacing; x += this.spacing) {
      for (let y = 0; y < this.height + this.spacing; y += this.spacing) {
        const xOffset = y / this.spacing % 2 === 0 ? 0 : this.spacing / 2;
        this.particles.push(
          createParticle(x + xOffset, y, this.baseRadius, this.colorPalette)
        );
      }
    }
  }
};

// src/adapters/react.tsx
function useVibeEngine(options = {}) {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = new VibeEngine(canvas, options);
    if (options.preset) {
      engine.applyPreset(options.preset);
    }
    engine.start();
    engineRef.current = engine;
    return () => {
      engine.stop();
      engineRef.current = null;
    };
  }, []);
  useEffect(() => {
    if (engineRef.current && options.preset) {
      engineRef.current.applyPreset(options.preset);
    }
  }, [options.preset]);
  return { canvasRef, engineRef };
}
export {
  VibeEngine,
  useVibeEngine
};
//# sourceMappingURL=react.js.map