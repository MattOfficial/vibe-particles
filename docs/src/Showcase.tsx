import React, { useEffect, useRef, useState } from 'react';
import { VibeEngine, PRESETS, createSwarmPhysics } from 'vibe-particles';
import type { Preset, RGB } from 'vibe-particles';

// ─── Data ────────────────────────────────────────────────────────────────────

interface PresetEntry {
    key: string;
    label: string;
    emoji: string;
    description: string;
    physics: string;
    renderer: string;
    interaction: string;
    preset: Preset;
    rgbOverride?: RGB;
    accentColor: string;
    gradFrom: string;
    gradTo: string;
    badge?: string;
}

const _MysteriousPreset: Preset = {
    ...PRESETS.mysterious,
    physics: createSwarmPhysics({ repelRadius: 200 }),
};

const ENTRIES: PresetEntry[] = [
    {
        key: 'neutral', label: 'Neutral', emoji: '✦',
        description: 'Sine-wave grid ripple. Hover to attract nearby particles.',
        physics: 'GridPhysics', renderer: 'DotRenderer', interaction: 'AttractInteraction',
        preset: PRESETS.neutral, accentColor: '#a855f7',
        gradFrom: 'rgba(168,85,247,0.22)', gradTo: 'rgba(4,0,16,0.5)',
    },
    {
        key: 'antigravity', label: 'Antigravity', emoji: '🌀',
        description: 'Oriented line-segment dashes. Move the mouse fast to create vortex swirl trails.',
        physics: 'VortexPhysics', renderer: 'DashRenderer', interaction: 'NoInteraction',
        preset: PRESETS.antigravity, accentColor: '#4285f4',
        gradFrom: 'rgba(66,133,244,0.22)', gradTo: 'rgba(4,0,16,0.5)',
    },
    {
        key: 'melancholic', label: 'Melancholic', emoji: '🌧',
        description: 'Gravity-driven rainfall. Tune speed & wind via createRainPhysics factory.',
        physics: 'RainPhysics', renderer: 'RaindropRenderer', interaction: 'AttractInteraction',
        preset: PRESETS.melancholic, accentColor: '#3b82f6',
        gradFrom: 'rgba(59,130,246,0.22)', gradTo: 'rgba(4,0,16,0.5)',
        badge: 'createRainPhysics({ speed, wind })',
    },
    {
        key: 'epic', label: 'Epic', emoji: '⚡',
        description: 'Glowing gold sparks shoot upward. Velocity-capped to prevent screen tearing.',
        physics: 'SparkPhysics', renderer: 'SparkRenderer', interaction: 'AttractInteraction',
        preset: PRESETS.epic, accentColor: '#f59e0b',
        gradFrom: 'rgba(245,158,11,0.22)', gradTo: 'rgba(4,0,16,0.5)',
    },
    {
        key: 'serene', label: 'Serene', emoji: '🌿',
        description: 'Fireflies drift in slow arcs and randomly blink with a soft glow.',
        physics: 'FireflyPhysics', renderer: 'GlowRenderer', interaction: 'AttractInteraction',
        preset: PRESETS.serene, accentColor: '#14b8a6',
        gradFrom: 'rgba(20,184,166,0.22)', gradTo: 'rgba(4,0,16,0.5)',
    },
    {
        key: 'dark', label: 'Dark', emoji: '🌑',
        description: 'Brownian smoke. Override rgb to control smoke color and density.',
        physics: 'SmokePhysics', renderer: 'SmokeRenderer', interaction: 'NoInteraction',
        preset: PRESETS.dark, rgbOverride: [220, 80, 80], accentColor: '#991b1b',
        gradFrom: 'rgba(153,27,27,0.30)', gradTo: 'rgba(4,0,16,0.7)',
        badge: 'rgb: [r, g, b] override',
    },
    {
        key: 'tense', label: 'Tense', emoji: '⚠️',
        description: 'Erratic jitter, flickering opacity. The grid is unstable.',
        physics: 'JitterPhysics', renderer: 'DotRenderer', interaction: 'AttractInteraction',
        preset: PRESETS.tense, accentColor: '#dc2626',
        gradFrom: 'rgba(220,38,38,0.22)', gradTo: 'rgba(4,0,16,0.5)',
    },
    {
        key: 'romantic', label: 'Romantic', emoji: '❤️',
        description: 'True EKG heartbeat: dots fade to black between beats, then bloom bright.',
        physics: 'HeartbeatPhysics', renderer: 'HeartbeatRenderer', interaction: 'AttractInteraction',
        preset: PRESETS.romantic, accentColor: '#f43f5e',
        gradFrom: 'rgba(244,63,94,0.22)', gradTo: 'rgba(4,0,16,0.5)',
    },
    {
        key: 'happy', label: 'Happy', emoji: '🎉',
        description: 'Multi-colored confetti falls and bounces off the floor.',
        physics: 'ConfettiPhysics', renderer: 'ConfettiRenderer', interaction: 'AttractInteraction',
        preset: PRESETS.happy, accentColor: '#eab308',
        gradFrom: 'rgba(234,179,8,0.22)', gradTo: 'rgba(4,0,16,0.5)',
    },
    {
        key: 'mysterious', label: 'Mysterious', emoji: '👁',
        description: 'A glowing swarm that flees the cursor. repelRadius tuned via createSwarmPhysics.',
        physics: 'createSwarmPhysics', renderer: 'SwarmRenderer', interaction: 'NoInteraction',
        preset: _MysteriousPreset, accentColor: '#7c3aed',
        gradFrom: 'rgba(124,58,237,0.28)', gradTo: 'rgba(4,0,16,0.6)',
        badge: 'createSwarmPhysics({ repelRadius: 200 })',
    },
];

// ─── Lazy Canvas ─────────────────────────────────────────────────────────────

interface LazyCanvasProps { entry: PresetEntry; active: boolean; }

const LazyCanvas: React.FC<LazyCanvasProps> = ({ entry, active }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<VibeEngine | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        if (active) {
            const rgb = entry.rgbOverride ?? entry.preset.rgb as RGB;
            const engine = new VibeEngine(canvas, {
                spacing: 30, rgb,
                colorPalette: ['#f43f5e', '#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#06b6d4'],
            });
            engine.applyPreset(entry.preset);
            if (entry.rgbOverride) engine.setRgb(entry.rgbOverride);
            engine.start();
            engineRef.current = engine;
        } else {
            if (engineRef.current) {
                engineRef.current.stop();
                engineRef.current = null;
                const ctx = canvas.getContext('2d');
                if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }

        return () => { engineRef.current?.stop(); engineRef.current = null; };
    }, [active, entry]);

    return (
        <canvas
            ref={canvasRef}
            className="card-canvas"
            style={{ opacity: active ? 1 : 0 }}
        />
    );
};

// ─── Full Preview Modal ───────────────────────────────────────────────────────

interface ModalProps { entry: PresetEntry; onClose: () => void; }

const Modal: React.FC<ModalProps> = ({ entry, onClose }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rgb = entry.rgbOverride ?? entry.preset.rgb as RGB;
        const engine = new VibeEngine(canvas, {
            spacing: 36, rgb,
            colorPalette: ['#f43f5e', '#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#06b6d4'],
        });
        engine.applyPreset(entry.preset);
        if (entry.rgbOverride) engine.setRgb(entry.rgbOverride);
        engine.start();
        return () => engine.stop();
    }, [entry]);

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-inner" onClick={e => e.stopPropagation()}>
                <canvas ref={canvasRef} className="modal-canvas" />
                <div className="modal-overlay">
                    <div className="modal-emoji">{entry.emoji}</div>
                    <h2 className="modal-title" style={{ textShadow: `0 0 40px ${entry.accentColor}` }}>
                        {entry.label}
                    </h2>
                    <p className="modal-desc">{entry.description}</p>
                    <div className="modal-pills">
                        {[
                            { icon: '⚙️', label: entry.physics },
                            { icon: '🎨', label: entry.renderer },
                            { icon: '🖱️', label: entry.interaction },
                        ].map(p => (
                            <div key={p.label} className="modal-pill">
                                <span>{p.icon}</span>
                                <code>{p.label}</code>
                            </div>
                        ))}
                    </div>
                </div>
                <button className="modal-close" onClick={onClose} aria-label="Close preview">✕</button>
            </div>
        </div>
    );
};

// ─── Code Block ──────────────────────────────────────────────────────────────

const CodeBlock: React.FC<{ label: string; code: string }> = ({ label, code }) => (
    <div className="code-block">
        <div className="code-header">
            <div className="dot dot-r" /><div className="dot dot-y" /><div className="dot dot-g" />
            <span className="code-label">{label}</span>
        </div>
        <pre>{code}</pre>
    </div>
);

// ─── Showcase ─────────────────────────────────────────────────────────────────

export const Showcase: React.FC = () => {
    const [activeKey, setActiveKey] = useState<string | null>(null);
    const [modalEntry, setModalEntry] = useState<PresetEntry | null>(null);

    return (
        <>
            {/* ── Header ──────────────────────── */}
            <header className="site-header">
                <div className="container">
                    <a className="logo" href="#top">
                        <div className="logo-icon">✦</div>
                        <span className="logo-name">vibe-particles</span>
                        <span className="logo-version">v0.1.0</span>
                    </a>
                    <nav className="nav-links">
                        <a className="nav-link" href="https://github.com/MattOfficial/vibe-particles" target="_blank" rel="noreferrer">GitHub</a>
                        <a className="nav-link npm" href="https://www.npmjs.com/package/vibe-particles" target="_blank" rel="noreferrer">npm i vibe-particles</a>
                    </nav>
                </div>
            </header>

            {/* ── Hero ─────────────────────────── */}
            <section className="hero" id="top">
                <div className="container">
                    <div className="hero-badge">✦ Framework-agnostic · Zero dependencies · Tree-shakeable</div>
                    <h1>Canvas particles,<br />done right.</h1>
                    <p>
                        A plugin-based Canvas 2D engine. Swap physics, renderers, and interactions independently.
                        Works with any JS/TS app.
                    </p>
                    <div className="hero-stats">
                        {[
                            { n: '10', l: 'Physics Plugins' },
                            { n: '10', l: 'Renderer Plugins' },
                            { n: '5', l: 'Interaction Plugins' },
                            { n: '11', l: 'Built-in Presets' },
                        ].map(s => (
                            <div className="stat-card" key={s.l}>
                                <div className="stat-n">{s.n}</div>
                                <div className="stat-l">{s.l}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Gallery ──────────────────────── */}
            <section className="gallery-section">
                <div className="container">
                    <p className="gallery-label">Live Preset Gallery — hover to activate · click for full-screen</p>
                    <div className="gallery-grid">
                        {ENTRIES.map(entry => {
                            const isActive = activeKey === entry.key;
                            return (
                                <div
                                    key={entry.key}
                                    className={`preset-card${isActive ? ' active' : ''}`}
                                    onMouseEnter={() => setActiveKey(entry.key)}
                                    onMouseLeave={() => setActiveKey(null)}
                                    onClick={() => setModalEntry(entry)}
                                >
                                    {/* Static gradient bg */}
                                    <div className="card-bg" style={{ background: `radial-gradient(ellipse at 35% 45%, ${entry.gradFrom}, ${entry.gradTo})` }} />
                                    {/* CSS dot pattern at rest (zero cost) */}
                                    <div className="card-dots" style={{ color: entry.accentColor }} />
                                    {/* Live canvas — starts only on hover */}
                                    <LazyCanvas entry={entry} active={isActive} />
                                    <div className="card-fade" />

                                    {/* Plugin tags */}
                                    <div className="card-tags">
                                        <span className="tag tag-physics">{entry.physics}</span>
                                        <span className="tag tag-renderer">{entry.renderer}</span>
                                        <span className="tag tag-interaction">{entry.interaction}</span>
                                    </div>

                                    {/* Badge */}
                                    {entry.badge && !isActive && (
                                        <span className="tag-badge">{entry.badge}</span>
                                    )}

                                    <span className="maximize-icon">⛶</span>

                                    <div className="card-info">
                                        <div className="card-title">
                                            <span className="card-emoji">{entry.emoji}</span>
                                            <span className="card-name">{entry.label}</span>
                                        </div>
                                        <p className="card-desc">{entry.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── API Examples ─────────────────── */}
            <section className="api-section">
                <div className="container">
                    <h2>Get started in 3 lines</h2>
                    <div className="code-blocks">
                        <CodeBlock label="vanilla JS" code={`import { VibeEngine, PRESETS } from 'vibe-particles';

const engine = new VibeEngine(canvas);
engine.applyPreset(PRESETS.antigravity);
engine.start();`} />
                        <CodeBlock label="Custom Mysterious — createSwarmPhysics factory" code={`import { VibeEngine, createSwarmPhysics, SwarmRenderer, NoInteraction } from 'vibe-particles';

const engine = new VibeEngine(canvas, { rgb: [180, 50, 250] });
engine.setPhysics(createSwarmPhysics({ repelRadius: 150 }));
engine.setRenderer(SwarmRenderer);
engine.setInteraction(NoInteraction);
engine.start();`} />
                        <CodeBlock label="React hook (vibe-particles/react)" code={`import { useVibeEngine } from 'vibe-particles/react';
import { MelancholicPreset } from 'vibe-particles';

const { canvasRef } = useVibeEngine({ preset: MelancholicPreset });
return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0 }} />;`} />
                    </div>
                </div>
            </section>

            {/* ── Footer ───────────────────────── */}
            <footer className="site-footer">
                <div className="container">
                    <p>
                        Built by <a href="https://github.com/MattOfficial">MattOfficial</a> ·{' '}
                        <a href="https://github.com/MattOfficial/vibe-particles">GitHub</a> ·{' '}
                        <a href="https://www.npmjs.com/package/vibe-particles">NPM</a> ·{' '}
                        MIT License
                    </p>
                </div>
            </footer>

            {/* ── Full-screen Modal ─────────────── */}
            {modalEntry && <Modal entry={modalEntry} onClose={() => setModalEntry(null)} />}
        </>
    );
};
