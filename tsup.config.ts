import { defineConfig } from 'tsup';

export default defineConfig([
    // Main entry
    {
        entry: ['src/index.ts'],
        format: ['esm', 'cjs'],
        dts: true,
        sourcemap: true,
        clean: true,
        outDir: 'dist',
    },
    // React adapter (optional)
    {
        entry: ['src/adapters/react.tsx'],
        format: ['esm', 'cjs'],
        dts: true,
        sourcemap: true,
        outDir: 'dist',
        outExtension({ format }) {
            return {
                js: format === 'esm' ? '.js' : '.cjs',
            };
        },
        esbuildOptions(options) {
            options.jsx = 'automatic';
        },
        external: ['react'],
    },
]);
