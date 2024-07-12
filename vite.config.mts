import { defineConfig } from 'vite'

export default defineConfig({
    build: {
        emptyOutDir: false,
        outDir: 'docs',
    },
    base: './',
    publicDir: 'docs',
})