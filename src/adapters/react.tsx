import { useEffect, useRef } from 'react';
import { VibeEngine } from '../core/Engine';
import type { EngineOptions, Preset } from '../core/types';

export { VibeEngine } from '../core/Engine';
export type { EngineOptions, Preset } from '../core/types';

export interface UseVibeEngineOptions extends EngineOptions {
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
export function useVibeEngine(options: UseVibeEngineOptions = {}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<VibeEngine | null>(null);

    // Initialize engine on mount
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
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Update preset when it changes
    useEffect(() => {
        if (engineRef.current && options.preset) {
            engineRef.current.applyPreset(options.preset);
        }
    }, [options.preset]);

    return { canvasRef, engineRef };
}
