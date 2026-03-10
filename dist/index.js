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

// src/plugins/physics/index.ts
var GridPhysics = {
  name: "grid",
  update(p, ctx) {
    const lerp = 0.05;
    p.vx += (0 - p.vx) * lerp;
    p.vy += (0 - p.vy) * lerp;
    p.x += (p.baseX - p.x) * (lerp * 0.5);
    p.y += (p.baseY - p.y) * (lerp * 0.5);
    const distFromCenter = Math.sqrt(
      Math.pow(p.x - ctx.width / 2, 2) + Math.pow(p.y - ctx.height / 2, 2)
    );
    const ripple = Math.sin(distFromCenter * 0.02 - ctx.time * 2) * 0.5;
    p.radius = p.baseRadius + (ripple > 0.2 ? ripple * 0.5 : 0);
    p.targetAlpha = 0.15;
  }
};
function createRainPhysics(options = {}) {
  const speed = options.speed ?? 1;
  const wind = options.wind ?? 0.5;
  return {
    name: "rain",
    update(p, ctx) {
      const lerp = 0.05;
      const targetVy = (3 + p.life * 2) * speed;
      p.vy += (targetVy - p.vy) * lerp;
      p.vx += (wind - p.vx) * lerp;
      p.targetAlpha = 0.55;
    }
  };
}
var RainPhysics = createRainPhysics();
var SparkPhysics = {
  name: "spark",
  update(p, ctx) {
    const lerp = 0.05;
    const targetVy = -4 - p.life * 3;
    p.vy += (targetVy - p.vy) * lerp;
    p.vy = Math.max(p.vy, -7);
    p.vx += (Math.sin(p.life * 100 + ctx.time * 5) * 1.5 - p.vx) * lerp;
    p.vx = Math.max(-3, Math.min(3, p.vx));
    p.targetAlpha = 0.7 + p.life * 0.3;
  }
};
var FireflyPhysics = {
  name: "firefly",
  update(p, ctx) {
    const lerp = 0.05;
    p.rotation += 0.02;
    const targetVx = Math.cos(p.rotation) * 0.5;
    const targetVy = Math.sin(p.rotation) * 0.5 - 0.2;
    p.vx += (targetVx - p.vx) * lerp;
    p.vy += (targetVy - p.vy) * lerp;
    if (Math.random() < 0.01) p.targetAlpha = 0.9;
    if (p.alpha > 0.6) p.targetAlpha = 0.05;
  }
};
var SmokePhysics = {
  name: "smoke",
  update(p, _ctx) {
    if (Math.random() < 0.05) {
      p.vx += (Math.random() - 0.5) * 1.5;
      p.vy += (Math.random() - 0.5) * 1.5 - 0.2;
      p.radius = p.baseRadius * (1.5 + Math.random() * 2);
    }
    p.vx *= 0.98;
    p.vy *= 0.98;
    p.targetAlpha = 0.55;
    p.radius += (p.baseRadius * 1.5 - p.radius) * 0.1;
  }
};
var JitterPhysics = {
  name: "jitter",
  update(p, _ctx) {
    if (Math.random() < 0.1) {
      p.x = p.baseX + (Math.random() - 0.5) * 20;
      p.y = p.baseY + (Math.random() - 0.5) * 20;
      p.targetAlpha = Math.random() > 0.8 ? 0.9 : 0.1;
    }
    p.vx *= 0.8;
    p.vy *= 0.8;
  }
};
var HeartbeatPhysics = {
  name: "heartbeat",
  update(p, ctx) {
    const lerp = 0.05;
    p.vx += (0 - p.vx) * lerp;
    p.vy += (0 - p.vy) * lerp;
    p.x += (p.baseX - p.x) * (lerp * 0.5);
    p.y += (p.baseY - p.y) * (lerp * 0.5);
    const beat1 = Math.max(0, Math.sin(ctx.time * 5));
    const beat2 = Math.max(0, Math.sin(ctx.time * 5 - 0.7));
    const beatVal = Math.max(beat1, beat2);
    if (beatVal > 0.6) {
      p.targetAlpha = beatVal;
      p.radius = p.baseRadius * (1 + beatVal * 2.5);
    } else {
      p.targetAlpha = 0.04;
      p.radius = p.baseRadius;
    }
  }
};
var ConfettiPhysics = {
  name: "confetti",
  update(p, ctx) {
    p.vy += 0.12;
    if (p.vy > 6) p.vy = 6;
    p.x += Math.sin(p.life * 100 + ctx.time * 5) * 1.5;
    if (p.y > ctx.height - 10 && p.vy > 0) {
      p.vy = -p.vy * 0.8;
      if (Math.abs(p.vy) < 1.5) p.vy = -8 - Math.random() * 8;
    }
    p.targetAlpha = 0.85;
  }
};
function createSwarmPhysics(options = {}) {
  const repelRadius = options.repelRadius ?? 300;
  return {
    name: "swarm",
    update(p, ctx) {
      const dx = p.x - ctx.mouse.x;
      const dy = p.y - ctx.mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < repelRadius && dist > 1) {
        const force = Math.pow((repelRadius - dist) / repelRadius, 2);
        p.vx += dx / dist * force * 6;
        p.vy += dy / dist * force * 6;
      }
      p.vx *= 0.92;
      p.vy *= 0.92;
      p.x += (p.baseX - p.x) * 0.02;
      p.y += (p.baseY - p.y) * 0.02;
      p.radius += (p.baseRadius * 1.5 - p.radius) * 0.1;
      if (Math.random() < 0.03) {
        p.targetAlpha = 0.9;
        p.radius = p.baseRadius * 3;
      } else if (p.alpha > 0.5) {
        p.targetAlpha = 0.35;
      } else {
        p.targetAlpha = 0.35;
      }
    }
  };
}
var SwarmPhysics = createSwarmPhysics();
var VortexPhysics = {
  name: "vortex",
  update(p, ctx) {
    const dx = p.x - ctx.mouse.x;
    const dy = p.y - ctx.mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxRange = 350;
    if (dist < maxRange && dist > 1) {
      const force = Math.pow((maxRange - dist) / maxRange, 2);
      const tangentX = -dy / dist;
      const tangentY = dx / dist;
      const swirlStrength = force * ctx.mouse.speed * 0.4;
      p.vx += tangentX * swirlStrength;
      p.vy += tangentY * swirlStrength;
      p.vx += dx / dist * force * 0.5;
      p.vy += dy / dist * force * 0.5;
      p.targetRotation = Math.atan2(p.vy, p.vx);
      p.targetAlpha = 0.35 + force * 0.55;
    } else {
      p.targetAlpha = 0.25;
      p.targetRotation = p.rotation;
    }
    p.vx *= 0.95;
    p.vy *= 0.95;
    p.x += (p.baseX - p.x) * 0.01;
    p.y += (p.baseY - p.y) * 0.01;
  }
};

// src/plugins/renderers/index.ts
var DotRenderer = {
  name: "dot",
  draw(ctx, p, rgb) {
    ctx.arc(p.x, p.y, Math.max(0.1, p.radius), 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${p.alpha})`;
    ctx.fill();
  }
};
var GlowRenderer = {
  name: "glow",
  draw(ctx, p, rgb) {
    ctx.shadowBlur = p.alpha > 0.5 ? 18 : 6;
    ctx.shadowColor = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 1)`;
    ctx.arc(p.x, p.y, Math.max(0.1, p.radius), 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${p.alpha})`;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
};
var RaindropRenderer = {
  name: "raindrop",
  draw(ctx, p, rgb) {
    ctx.moveTo(p.x - p.vx * 3, p.y - p.vy * 3);
    ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${p.alpha})`;
    ctx.lineWidth = Math.max(0.6, p.radius);
    ctx.lineCap = "round";
    ctx.stroke();
  },
  beforeFrame(ctx, w, h) {
    ctx.fillStyle = "rgba(3, 0, 20, 0.25)";
    ctx.fillRect(0, 0, w, h);
  }
};
var SparkRenderer = {
  name: "spark",
  draw(ctx, p, rgb) {
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
  beforeFrame(ctx, w, h) {
    ctx.fillStyle = "rgba(3, 0, 20, 0.35)";
    ctx.fillRect(0, 0, w, h);
  }
};
var ConfettiRenderer = {
  name: "confetti",
  draw(ctx, p, rgb, time) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.life * 10 + time * 2);
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color || `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
    const size = Math.max(3, p.radius * 2.5);
    ctx.fillRect(-size / 2, -size / 2, size, size * 1.6);
    ctx.restore();
  }
};
var SmokeRenderer = {
  name: "smoke",
  draw(ctx, p, rgb) {
    ctx.shadowBlur = 22;
    ctx.shadowColor = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${p.alpha})`;
    ctx.arc(p.x, p.y, Math.max(0.1, p.radius), 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${p.alpha * 0.75})`;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
};
var SwarmRenderer = {
  name: "swarm",
  draw(ctx, p, rgb) {
    ctx.shadowBlur = p.alpha > 0.6 ? 14 : 2;
    ctx.shadowColor = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 1)`;
    ctx.arc(p.x, p.y, Math.max(0.1, p.radius), 0, Math.PI * 2);
    if (p.color) {
      ctx.fillStyle = p.color.replace(")", `, ${p.alpha})`).replace("rgb", "rgba");
    } else {
      ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${p.alpha})`;
    }
    ctx.fill();
    ctx.shadowBlur = 0;
  }
};
var HeartbeatRenderer = {
  name: "heartbeat",
  draw(ctx, p, rgb) {
    const onBeat = p.radius > p.baseRadius * 1.5;
    ctx.shadowBlur = onBeat ? 25 : 0;
    ctx.shadowColor = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 1)`;
    ctx.arc(p.x, p.y, Math.max(0.1, p.radius), 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${p.alpha})`;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
};
var DashRenderer = {
  name: "dash",
  draw(ctx, p, rgb) {
    const len = Math.max(3, p.radius * 4);
    const cos = Math.cos(p.rotation);
    const sin = Math.sin(p.rotation);
    ctx.moveTo(p.x - cos * len / 2, p.y - sin * len / 2);
    ctx.lineTo(p.x + cos * len / 2, p.y + sin * len / 2);
    ctx.strokeStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${p.alpha})`;
    ctx.lineWidth = 1.2;
    ctx.lineCap = "round";
    ctx.stroke();
  }
};
var TrailRenderer = {
  name: "trail",
  draw(ctx, p, rgb) {
    ctx.moveTo(p.x - p.vx * 3, p.y - p.vy * 3);
    ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${p.alpha * 0.6})`;
    ctx.lineWidth = Math.max(0.5, p.radius);
    ctx.lineCap = "round";
    ctx.stroke();
  },
  beforeFrame(ctx, w, h) {
    ctx.fillStyle = "rgba(3, 0, 20, 0.15)";
    ctx.fillRect(0, 0, w, h);
  }
};

// src/plugins/interactions/index.ts
var AttractInteraction = {
  name: "attract",
  apply(p, mouse, ctx) {
    const dx = mouse.x - p.x;
    const dy = mouse.y - p.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < ctx.maxDist) {
      const scale = Math.pow((ctx.maxDist - dist) / ctx.maxDist, 2);
      p.radius = p.baseRadius + scale * 2.5;
      p.targetAlpha = 0.1 + scale * 0.5;
    } else {
      p.radius += (p.baseRadius - p.radius) * 0.1;
      p.targetAlpha = 0.1;
    }
  }
};
var RepelInteraction = {
  name: "repel",
  apply(p, mouse, ctx) {
    const dx = p.x - mouse.x;
    const dy = p.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 200 && dist > 1) {
      const force = Math.pow((200 - dist) / 200, 2);
      p.vx += dx / dist * force * 3;
      p.vy += dy / dist * force * 3;
    }
    p.radius += (p.baseRadius * 1.5 - p.radius) * 0.1;
  }
};
var VortexInteraction = {
  name: "vortex",
  apply(p, mouse, ctx) {
    const dx = p.x - mouse.x;
    const dy = p.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxRange = 350;
    if (dist < maxRange && dist > 1) {
      const force = Math.pow((maxRange - dist) / maxRange, 2);
      const tangentX = -dy / dist;
      const tangentY = dx / dist;
      const swirlStrength = force * mouse.speed * 0.3;
      p.vx += tangentX * swirlStrength;
      p.vy += tangentY * swirlStrength;
      p.vx += dx / dist * force * 0.5;
      p.vy += dy / dist * force * 0.5;
      p.targetAlpha = 0.3 + force * 0.6;
    }
  }
};
var OrientInteraction = {
  name: "orient",
  apply(p, mouse, ctx) {
    const dx = mouse.x - p.x;
    const dy = mouse.y - p.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < ctx.maxDist) {
      const scale = Math.pow((ctx.maxDist - dist) / ctx.maxDist, 2);
      if (mouse.speed > 1) {
        p.targetRotation = mouse.angle;
      } else {
        p.targetRotation = Math.atan2(dy, dx);
      }
      p.radius = p.baseRadius + scale * 1.5;
      p.targetAlpha = 0.1 + scale * 0.5;
    } else {
      p.radius += (p.baseRadius - p.radius) * 0.1;
      p.targetAlpha = 0.1;
    }
  }
};
var NoInteraction = {
  name: "none",
  apply() {
  }
};

// src/presets/index.ts
var _SwarmDefault = createSwarmPhysics();
var NeutralPreset = {
  name: "neutral",
  physics: GridPhysics,
  renderer: DotRenderer,
  interaction: AttractInteraction,
  rgb: [168, 85, 247]
};
var MelancholicPreset = {
  name: "melancholic",
  physics: RainPhysics,
  renderer: RaindropRenderer,
  interaction: AttractInteraction,
  rgb: [59, 130, 246]
};
var EpicPreset = {
  name: "epic",
  physics: SparkPhysics,
  renderer: SparkRenderer,
  interaction: AttractInteraction,
  rgb: [245, 158, 11]
};
var SerenePreset = {
  name: "serene",
  physics: FireflyPhysics,
  renderer: GlowRenderer,
  interaction: AttractInteraction,
  rgb: [20, 184, 166]
};
var DarkPreset = {
  name: "dark",
  physics: SmokePhysics,
  renderer: SmokeRenderer,
  interaction: NoInteraction,
  rgb: [153, 27, 27]
};
var TensePreset = {
  name: "tense",
  physics: JitterPhysics,
  renderer: DotRenderer,
  interaction: AttractInteraction,
  rgb: [220, 38, 38]
};
var RomanticPreset = {
  name: "romantic",
  physics: HeartbeatPhysics,
  renderer: HeartbeatRenderer,
  interaction: AttractInteraction,
  rgb: [244, 63, 94]
};
var HappyPreset = {
  name: "happy",
  physics: ConfettiPhysics,
  renderer: ConfettiRenderer,
  interaction: AttractInteraction,
  rgb: [250, 204, 21]
};
var MysteriousPreset = {
  name: "mysterious",
  physics: _SwarmDefault,
  renderer: SwarmRenderer,
  interaction: NoInteraction,
  rgb: [124, 58, 237]
};
var AntigravityPreset = {
  name: "antigravity",
  physics: VortexPhysics,
  renderer: DashRenderer,
  // VortexPhysics already handles orientation internally
  // NoInteraction avoids double-applying rotation logic
  interaction: NoInteraction,
  rgb: [66, 133, 244]
};
var MinimalPreset = {
  name: "minimal",
  physics: GridPhysics,
  renderer: DotRenderer,
  interaction: AttractInteraction,
  rgb: [100, 100, 100]
};
var PRESETS = {
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
  minimal: MinimalPreset
};
export {
  AntigravityPreset,
  AttractInteraction,
  ConfettiPhysics,
  ConfettiRenderer,
  DarkPreset,
  DashRenderer,
  DotRenderer,
  EpicPreset,
  FireflyPhysics,
  GlowRenderer,
  GridPhysics,
  HappyPreset,
  HeartbeatPhysics,
  HeartbeatRenderer,
  JitterPhysics,
  MelancholicPreset,
  MinimalPreset,
  MysteriousPreset,
  NeutralPreset,
  NoInteraction,
  OrientInteraction,
  PRESETS,
  RainPhysics,
  RaindropRenderer,
  RepelInteraction,
  RomanticPreset,
  SerenePreset,
  SmokePhysics,
  SmokeRenderer,
  SparkPhysics,
  SparkRenderer,
  SwarmPhysics,
  SwarmRenderer,
  TensePreset,
  TrailRenderer,
  VibeEngine,
  VortexInteraction,
  VortexPhysics,
  createParticle,
  createRainPhysics,
  createSwarmPhysics
};
//# sourceMappingURL=index.js.map