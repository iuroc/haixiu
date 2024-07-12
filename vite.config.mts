import { defineConfig } from 'vite'

export default defineConfig({
    build: {
        emptyOutDir: false,
        outDir: 'public',
    },
    publicDir: 'public',
})