import { vi } from 'vitest';

// Lightweight Canvas 2D mock instead of jest-canvas-mock to avoid Jest global errors
HTMLCanvasElement.prototype.getContext = () => {
    return {
        clearRect: vi.fn(),
        beginPath: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        fillRect: vi.fn(),
        stroke: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        scale: vi.fn(),
        translate: vi.fn(),
        rotate: vi.fn(),
        globalCompositeOperation: 'source-over',
        globalAlpha: 1,
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 1,
    } as any;
};

// Mock requestAnimationFrame
globalThis.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16) as any);
globalThis.cancelAnimationFrame = vi.fn((id) => clearTimeout(id as any));
