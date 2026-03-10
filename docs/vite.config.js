"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vite_1 = require("vite");
var plugin_react_1 = require("@vitejs/plugin-react");
var path_1 = require("path");
exports.default = (0, vite_1.defineConfig)({
    plugins: [(0, plugin_react_1.default)()],
    // GitHub Pages serves from /vibe-particles/ subdirectory
    base: '/vibe-particles/',
    resolve: {
        alias: {
            // In dev/build: import directly from the package source
            // so changes to ../src are reflected instantly
            'vibe-particles': (0, path_1.resolve)(__dirname, '../src/index.ts'),
        },
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
    },
});
