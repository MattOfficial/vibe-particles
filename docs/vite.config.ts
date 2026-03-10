import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
    plugins: [react()],
    // GitHub Pages serves from /vibe-particles/ subdirectory
    base: '/vibe-particles/',
    resolve: {
        alias: {
            // In dev/build: import directly from the package source
            // so changes to ../src are reflected instantly
            'vibe-particles': resolve(__dirname, '../src/index.ts'),
        },
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
    },
});
